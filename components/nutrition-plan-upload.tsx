"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, Upload } from "lucide-react"

interface User {
  id: string
  email: string
}

interface UserProfile {
  id: string
  rol: string
}

export default function NutritionPlanUpload() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function getUser() {
      try {
        setLoading(true)

        // Get current user
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          throw error
        }

        if (user) {
          setUser(user)

          // Get user profile with role
          const { data: profile, error: profileError } = await supabase
            .from("usuarios")
            .select("id, rol")
            .eq("id", user.id)
            .single()

          if (profileError) {
            throw profileError
          }

          setUserProfile(profile)
        }
      } catch (error) {
        console.error("Error loading user:", error)
        setMessage({
          type: "error",
          text: "Failed to load user information. Please refresh the page.",
        })
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [supabase])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      // Check if file is PDF
      if (selectedFile.type !== "application/pdf") {
        setMessage({ type: "error", text: "Only PDF files are allowed." })
        return
      }

      setFile(selectedFile)
      setMessage(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setMessage({ type: "error", text: "Please select a PDF file." })
      return
    }

    try {
      setUploading(true)
      setMessage(null)

      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${user!.id}/${fileName}`

      const { error: uploadError } = await supabase.storage.from("pdfs").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL for the file
      const { data: publicUrlData } = supabase.storage.from("pdfs").getPublicUrl(filePath)

      const pdfUrl = publicUrlData.publicUrl

      // Insert record into planes_nutricion table
      const { error: insertError } = await supabase.from("planes_nutricion").insert({
        titulo: title,
        descripcion: description,
        pdf_url: pdfUrl,
        autor_id: user!.id,
      })

      if (insertError) {
        throw insertError
      }

      // Clear form
      setTitle("")
      setDescription("")
      setFile(null)

      // Reset file input
      const fileInput = document.getElementById("pdf-upload") as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }

      setMessage({
        type: "success",
        text: "Nutrition plan uploaded successfully!",
      })
    } catch (error) {
      console.error("Error uploading plan:", error)
      setMessage({
        type: "error",
        text: "Failed to upload nutrition plan. Please try again.",
      })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  // If user is not authenticated
  if (!user) {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>You need to be logged in to access this feature.</AlertDescription>
      </Alert>
    )
  }

  // If user is not a nutritionist
  if (userProfile && userProfile.rol !== "nutricionista") {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>Only nutritionists can upload nutrition plans.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Nutrition Plan</CardTitle>
        <CardDescription>Create and upload a new nutrition plan for your clients</CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert variant={message.type === "success" ? "default" : "destructive"} className="mb-6">
            {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{message.type === "success" ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Plan Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter plan title"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Plan Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter plan description"
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="pdf-upload" className="text-sm font-medium">
              PDF Document
            </label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="pdf-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF only ({file ? file.name : "No file selected"})
                  </p>
                </div>
                <Input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={uploading}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Nutrition Plan"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
