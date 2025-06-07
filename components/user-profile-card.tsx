"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, User, Camera } from "lucide-react"

interface UserProfileCardProps {
  userId: string
  initialAvatarUrl?: string | null
  userName?: string
  userEmail?: string
}

export default function UserProfileCard({
  userId,
  initialAvatarUrl,
  userName = "Usuario",
  userEmail = "usuario@ejemplo.com",
}: UserProfileCardProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl || null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialAvatarUrl) {
      setAvatarUrl(initialAvatarUrl)
    }
  }, [initialAvatarUrl])

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from("avatars").getPublicUrl(path)
    return data.publicUrl
  }

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setUploadProgress(0)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Debes seleccionar una imagen para subir.")
      }

      const file = event.target.files[0]

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Por favor selecciona un archivo de imagen válido.")
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("El archivo es demasiado grande. Máximo 5MB.")
      }

      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${Math.random()}.${fileExt}`
      const filePath = fileName

      setUploadProgress(25)

      // First, ensure the user exists in the database
      const { data: existingUser, error: fetchError } = await supabase
        .from("usuarios")
        .select("id")
        .eq("id", userId)
        .single()

      if (fetchError && fetchError.code === "PGRST116") {
        // User doesn't exist, create them
        const { error: insertError } = await supabase.from("usuarios").insert({
          id: userId,
          email: userEmail,
          nombre: userName,
        })

        if (insertError) {
          console.error("Error creating user:", insertError)
          throw new Error("Error al crear el usuario en la base de datos.")
        }
      } else if (fetchError) {
        console.error("Error fetching user:", fetchError)
        throw new Error("Error al verificar el usuario.")
      }

      setUploadProgress(50)

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        console.error("Storage upload error:", uploadError)
        throw new Error(`Error al subir la imagen: ${uploadError.message}`)
      }

      setUploadProgress(75)

      // Get the public URL
      const publicUrl = getPublicUrl(filePath)

      // Update the user's avatar_url in the usuarios table
      const { error: updateError } = await supabase.from("usuarios").update({ avatar_url: publicUrl }).eq("id", userId)

      if (updateError) {
        console.error("Database update error:", updateError)
        throw new Error(`Error al actualizar el perfil: ${updateError.message}`)
      }

      setUploadProgress(100)
      setAvatarUrl(publicUrl)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Show success message
      alert("¡Avatar actualizado correctamente!")
    } catch (error) {
      console.error("Error uploading avatar:", error)
      alert(error instanceof Error ? error.message : "Error al subir la imagen")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold">Perfil de Usuario</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <Avatar
              className="w-32 h-32 cursor-pointer transition-all duration-200 group-hover:opacity-80"
              onClick={handleAvatarClick}
            >
              <AvatarImage src={avatarUrl || undefined} alt="Avatar del usuario" className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>

            {/* Camera overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Subiendo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
            className="hidden"
          />

          {/* Upload button */}
          <Button
            onClick={handleAvatarClick}
            disabled={uploading}
            className="flex items-center space-x-2"
            variant="outline"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? "Subiendo..." : "Cambiar Avatar"}</span>
          </Button>
        </div>

        {/* User Info */}
        <div className="space-y-3 pt-4 border-t">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900">{userName}</h3>
            <p className="text-gray-600">{userEmail}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900">Estado</div>
              <div className="text-green-600">Activo</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900">Miembro desde</div>
              <div className="text-gray-600">2024</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
