"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, FileText, CheckCircle, AlertCircle, Lock } from "lucide-react"

interface FormData {
  titulo: string
  descripcion: string
  file: File | null
}

interface UserProfile {
  id: string
  nombre: string
  rol: string
}

export default function NutritionPlanForm() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    titulo: "",
    descripcion: "",
    file: null,
  })
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    checkUserRole()
  }, [])

  const checkUserRole = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      const { data, error } = await supabase.from("usuarios").select("id, nombre, rol").eq("id", user.id).single()

      if (error) {
        throw new Error(error.message)
      }

      setProfile(data)
    } catch (error) {
      console.error("Error checking user role:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error al verificar permisos",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof Omit<FormData, "file">, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear message when user starts typing
    if (message) setMessage(null)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      setFormData((prev) => ({ ...prev, file: null }))
      return
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      setMessage({
        type: "error",
        text: "Por favor, selecciona un archivo PDF válido",
      })
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "El archivo es demasiado grande. Máximo 10MB permitido",
      })
      return
    }

    setFormData((prev) => ({ ...prev, file }))
    if (message) setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile || profile.rol !== "nutricionista") {
      setMessage({
        type: "error",
        text: "No tienes permisos para realizar esta acción",
      })
      return
    }

    if (!formData.titulo || !formData.descripcion || !formData.file) {
      setMessage({
        type: "error",
        text: "Por favor, completa todos los campos y selecciona un archivo PDF",
      })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      // Generate unique filename
      const fileExt = "pdf"
      const fileName = `plan-${profile.id}-${Date.now()}.${fileExt}`

      // Upload PDF to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("pdfs")
        .upload(fileName, formData.file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        throw new Error(`Error al subir archivo: ${uploadError.message}`)
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("pdfs").getPublicUrl(fileName)

      // Insert record into planes_nutricion table
      const { error: insertError } = await supabase.from("planes_nutricion").insert({
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        pdf_url: publicUrl,
        autor_id: profile.id,
      })

      if (insertError) {
        // If database insert fails, clean up uploaded file
        await supabase.storage.from("pdfs").remove([fileName])
        throw new Error(`Error al guardar plan: ${insertError.message}`)
      }

      // Success - reset form
      setFormData({
        titulo: "",
        descripcion: "",
        file: null,
      })

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      setMessage({
        type: "success",
        text: "Plan de nutrición subido exitosamente",
      })
    } catch (error) {
      console.error("Error uploading nutrition plan:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error al subir el plan de nutrición",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  // Check if user is not a nutricionista
  if (!profile || profile.rol !== "nutricionista") {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Lock className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceso Restringido</h3>
          <p className="text-gray-600 mb-4">
            Esta funcionalidad está disponible únicamente para usuarios con rol de nutricionista.
          </p>
          {profile && (
            <p className="text-sm text-gray-500">
              Tu rol actual: <span className="font-medium">{profile.rol}</span>
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Subir Plan de Nutrición
        </CardTitle>
        <CardDescription>Crea y comparte un nuevo plan de nutrición con tus clientes</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título del Plan</Label>
            <Input
              id="titulo"
              type="text"
              placeholder="Ej: Plan de Alimentación Saludable"
              value={formData.titulo}
              onChange={(e) => handleInputChange("titulo", e.target.value)}
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              placeholder="Describe el contenido y objetivos del plan de nutrición..."
              value={formData.descripcion}
              onChange={(e) => handleInputChange("descripcion", e.target.value)}
              required
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">{formData.descripcion.length}/500 caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdf">Archivo PDF</Label>
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleFileButtonClick}
                disabled={uploading}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Seleccionar PDF</span>
              </Button>
              {formData.file && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span>{formData.file.name}</span>
                  <span className="text-xs">({(formData.file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            <p className="text-xs text-gray-500">Formato: PDF únicamente. Tamaño máximo: 10MB</p>
          </div>

          {message && (
            <Alert className={message.type === "error" ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"}>
              <div className="flex items-center">
                {message.type === "error" ? (
                  <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                )}
                <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
                  {message.text}
                </AlertDescription>
              </div>
            </Alert>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({ titulo: "", descripcion: "", file: null })
                if (fileInputRef.current) fileInputRef.current.value = ""
                setMessage(null)
              }}
              disabled={uploading}
            >
              Limpiar
            </Button>
            <Button type="submit" disabled={uploading || !formData.titulo || !formData.descripcion || !formData.file}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Plan
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Información del Autor</h4>
          <p className="text-sm text-blue-700">
            <span className="font-medium">Nutricionista:</span> {profile.nombre}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
