"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Camera, Upload, User, AlertCircle } from "lucide-react"

interface UserProfile {
  id: string
  name: string
  rol: string
  avatar_url: string | null
}

export default function UserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      const { data, error } = await supabase.from("usuarios").select("*").eq("id", user.id).single()

      if (error) {
        throw new Error(error.message)
      }

      setProfile(data)
    } catch (error) {
      console.error("Error fetching profile:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error al cargar el perfil",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !profile) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: "Por favor, selecciona un archivo de imagen válido",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "El archivo es demasiado grande. Máximo 5MB permitido",
      })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`

      // Delete old avatar if exists
      if (profile.avatar_url) {
        const oldFileName = profile.avatar_url.split("/").pop()
        if (oldFileName) {
          await supabase.storage.from("avatars").remove([oldFileName])
        }
      }

      // Upload new avatar
      const { data: uploadData, error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName)

      // Update user profile in database
      const { error: updateError } = await supabase
        .from("usuarios")
        .update({ avatar_url: publicUrl })
        .eq("id", profile.id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      // Update local state
      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null))

      setMessage({
        type: "success",
        text: "Avatar actualizado correctamente",
      })
    } catch (error) {
      console.error("Error uploading avatar:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error al subir la imagen",
      })
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "cliente":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "entrenador":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "nutricionista":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case "cliente":
        return "Cliente"
      case "entrenador":
        return "Entrenador"
      case "nutricionista":
        return "Nutricionista"
      default:
        return role
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">No se pudo cargar el perfil</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Perfil de Usuario</CardTitle>
        <CardDescription>Gestiona tu información personal</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <Avatar className="h-24 w-24 cursor-pointer transition-opacity group-hover:opacity-80">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.nombre} />
              <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getInitials(profile.nombre)}
              </AvatarFallback>
            </Avatar>
            <div
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={handleAvatarClick}
            >
              {uploading ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAvatarClick}
            disabled={uploading}
            className="flex items-center space-x-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Subiendo...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Cambiar avatar</span>
              </>
            )}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </div>

        {/* User Info Section */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900">{profile.nombre}</h3>
            <div className="mt-2">
              <Badge className={getRoleColor(profile.rol)}>{getRoleLabel(profile.rol)}</Badge>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Información del perfil</span>
            </div>
            <div className="text-sm text-gray-600">
              <p>
                <span className="font-medium">Nombre:</span> {profile.nombre}
              </p>
              <p>
                <span className="font-medium">Rol:</span> {getRoleLabel(profile.rol)}
              </p>
              <p>
                <span className="font-medium">ID:</span> {profile.id.slice(0, 8)}...
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <Alert className={message.type === "error" ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"}>
            <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
