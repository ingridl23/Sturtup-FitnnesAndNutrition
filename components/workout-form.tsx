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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Upload, Video, CheckCircle, AlertCircle, Lock, Youtube, FileVideo } from "lucide-react"

interface FormData {
  titulo: string
  descripcion: string
  videoUrl: string
  videoFile: File | null
  videoType: "url" | "file"
}

interface UserProfile {
  id: string
  nombre: string
  rol: string
}

export default function WorkoutForm() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    titulo: "",
    descripcion: "",
    videoUrl: "",
    videoFile: null,
    videoType: "url",
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

  const handleInputChange = (field: keyof Omit<FormData, "videoFile">, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear message when user starts typing
    if (message) setMessage(null)
  }

  const handleVideoTypeChange = (type: "url" | "file") => {
    setFormData((prev) => ({
      ...prev,
      videoType: type,
      videoUrl: "",
      videoFile: null,
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (message) setMessage(null)
  }

  const isValidYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    return youtubeRegex.test(url)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      setFormData((prev) => ({ ...prev, videoFile: null }))
      return
    }

    // Validate file type
    if (!file.type.startsWith("video/")) {
      setMessage({
        type: "error",
        text: "Por favor, selecciona un archivo de video válido",
      })
      return
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "El archivo es demasiado grande. Máximo 100MB permitido",
      })
      return
    }

    setFormData((prev) => ({ ...prev, videoFile: file }))
    if (message) setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile || profile.rol !== "entrenador") {
      setMessage({
        type: "error",
        text: "No tienes permisos para realizar esta acción",
      })
      return
    }

    if (!formData.titulo || !formData.descripcion) {
      setMessage({
        type: "error",
        text: "Por favor, completa el título y la descripción",
      })
      return
    }

    // Validate video input based on type
    if (formData.videoType === "url") {
      if (!formData.videoUrl) {
        setMessage({
          type: "error",
          text: "Por favor, ingresa una URL de YouTube",
        })
        return
      }
      if (!isValidYouTubeUrl(formData.videoUrl)) {
        setMessage({
          type: "error",
          text: "Por favor, ingresa una URL válida de YouTube",
        })
        return
      }
    } else {
      if (!formData.videoFile) {
        setMessage({
          type: "error",
          text: "Por favor, selecciona un archivo de video",
        })
        return
      }
    }

    setUploading(true)
    setMessage(null)

    try {
      let videoUrl = ""

      if (formData.videoType === "url") {
        // Use YouTube URL directly
        videoUrl = formData.videoUrl
      } else {
        // Upload video file to Supabase Storage
        const fileExt = formData.videoFile!.name.split(".").pop()
        const fileName = `workout-${profile.id}-${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("videos")
          .upload(fileName, formData.videoFile!, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          throw new Error(`Error al subir video: ${uploadError.message}`)
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("videos").getPublicUrl(fileName)

        videoUrl = publicUrl
      }

      // Insert record into entrenamientos table
      const { error: insertError } = await supabase.from("entrenamientos").insert({
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        video_url: videoUrl,
        autor_id: profile.id,
      })

      if (insertError) {
        // If database insert fails and we uploaded a file, clean it up
        if (formData.videoType === "file") {
          const fileName = videoUrl.split("/").pop()
          if (fileName) {
            await supabase.storage.from("videos").remove([fileName])
          }
        }
        throw new Error(`Error al guardar entrenamiento: ${insertError.message}`)
      }

      // Success - reset form
      setFormData({
        titulo: "",
        descripcion: "",
        videoUrl: "",
        videoFile: null,
        videoType: "url",
      })

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      setMessage({
        type: "success",
        text: "Entrenamiento subido exitosamente",
      })
    } catch (error) {
      console.error("Error uploading workout:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error al subir el entrenamiento",
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

  // Check if user is not an entrenador
  if (!profile || profile.rol !== "entrenador") {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Lock className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceso Restringido</h3>
          <p className="text-gray-600 mb-4">
            Esta funcionalidad está disponible únicamente para usuarios con rol de entrenador.
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
          <Video className="mr-2 h-5 w-5" />
          Subir Entrenamiento
        </CardTitle>
        <CardDescription>Crea y comparte un nuevo entrenamiento con tus clientes</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título del Entrenamiento</Label>
            <Input
              id="titulo"
              type="text"
              placeholder="Ej: Rutina de Cardio Intenso"
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
              placeholder="Describe el entrenamiento, objetivos, duración, etc..."
              value={formData.descripcion}
              onChange={(e) => handleInputChange("descripcion", e.target.value)}
              required
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">{formData.descripcion.length}/500 caracteres</p>
          </div>

          <div className="space-y-4">
            <Label>Video del Entrenamiento</Label>
            <Tabs value={formData.videoType} onValueChange={(value) => handleVideoTypeChange(value as "url" | "file")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url" className="flex items-center space-x-2">
                  <Youtube className="h-4 w-4" />
                  <span>YouTube URL</span>
                </TabsTrigger>
                <TabsTrigger value="file" className="flex items-center space-x-2">
                  <FileVideo className="h-4 w-4" />
                  <span>Subir Video</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="url" className="space-y-2">
                <Input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.videoUrl}
                  onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                  required={formData.videoType === "url"}
                />
                <p className="text-xs text-gray-500">Ingresa una URL válida de YouTube</p>
              </TabsContent>

              <TabsContent value="file" className="space-y-2">
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFileButtonClick}
                    disabled={uploading}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Seleccionar Video</span>
                  </Button>
                  {formData.videoFile && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <FileVideo className="h-4 w-4" />
                      <span>{formData.videoFile.name}</span>
                      <span className="text-xs">({(formData.videoFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500">Formatos: MP4, MOV, AVI, etc. Tamaño máximo: 100MB</p>
              </TabsContent>
            </Tabs>
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
                setFormData({
                  titulo: "",
                  descripcion: "",
                  videoUrl: "",
                  videoFile: null,
                  videoType: "url",
                })
                if (fileInputRef.current) fileInputRef.current.value = ""
                setMessage(null)
              }}
              disabled={uploading}
            >
              Limpiar
            </Button>
            <Button
              type="submit"
              disabled={
                uploading ||
                !formData.titulo ||
                !formData.descripcion ||
                (formData.videoType === "url" ? !formData.videoUrl : !formData.videoFile)
              }
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Entrenamiento
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h4 className="text-sm font-medium text-green-900 mb-2">Información del Entrenador</h4>
          <p className="text-sm text-green-700">
            <span className="font-medium">Entrenador:</span> {profile.nombre}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
