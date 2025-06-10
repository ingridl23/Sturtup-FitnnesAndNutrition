"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Send, CheckCircle, AlertCircle, Lock, Lightbulb, Youtube } from "lucide-react"

interface FormData {
  titulo: string
  contenido: string
  video_url: string
  categoria: string
}

interface UserProfile {
  id: string
  nombre: string
  rol: string
}

export default function AdviceForm() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    titulo: "",
    contenido: "",
    video_url: "",
    categoria: "",
  })
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear message when user starts typing
    if (message) setMessage(null)
  }

  const isValidYouTubeUrl = (url: string): boolean => {
    if (!url) return true // Optional field
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    return youtubeRegex.test(url)
  }

  const getCategoriesByRole = (role: string): { value: string; label: string }[] => {
    const commonCategories = [
      { value: "general", label: "General" },
      { value: "motivacion", label: "Motivación" },
      { value: "habitos", label: "Hábitos Saludables" },
    ]

    if (role === "entrenador") {
      return [
        ...commonCategories,
        { value: "ejercicio", label: "Ejercicio" },
        { value: "tecnica", label: "Técnica" },
        { value: "recuperacion", label: "Recuperación" },
        { value: "fuerza", label: "Entrenamiento de Fuerza" },
        { value: "cardio", label: "Cardio" },
      ]
    }

    if (role === "nutricionista") {
      return [
        ...commonCategories,
        { value: "nutricion", label: "Nutrición" },
        { value: "dieta", label: "Dieta" },
        { value: "suplementos", label: "Suplementos" },
        { value: "hidratacion", label: "Hidratación" },
        { value: "perdida_peso", label: "Pérdida de Peso" },
        { value: "ganancia_masa", label: "Ganancia de Masa" },
      ]
    }

    return commonCategories
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile || (profile.rol !== "entrenador" && profile.rol !== "nutricionista")) {
      setMessage({
        type: "error",
        text: "No tienes permisos para realizar esta acción",
      })
      return
    }

    if (!formData.titulo || !formData.contenido) {
      setMessage({
        type: "error",
        text: "Por favor, completa el título y el contenido",
      })
      return
    }

    if (formData.video_url && !isValidYouTubeUrl(formData.video_url)) {
      setMessage({
        type: "error",
        text: "Por favor, ingresa una URL válida de YouTube o deja el campo vacío",
      })
      return
    }

    setSubmitting(true)
    setMessage(null)

    try {
      // Insert record into consejos table
      const { error: insertError } = await supabase.from("consejos").insert({
        titulo: formData.titulo,
        contenido: formData.contenido,
        video_url: formData.video_url || null,
        autor_id: profile.id,
        categoria: formData.categoria || null,
      })

      if (insertError) {
        throw new Error(`Error al guardar consejo: ${insertError.message}`)
      }

      // Success - reset form
      setFormData({
        titulo: "",
        contenido: "",
        video_url: "",
        categoria: "",
      })

      setMessage({
        type: "success",
        text: "Consejo publicado exitosamente",
      })
    } catch (error) {
      console.error("Error publishing advice:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error al publicar el consejo",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case "entrenador":
        return "Entrenador"
      case "nutricionista":
        return "Nutricionista"
      default:
        return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "entrenador":
        return "bg-green-50 text-green-700 border-green-200"
      case "nutricionista":
        return "bg-purple-50 text-purple-700 border-purple-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
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

  // Check if user is not an entrenador or nutricionista
  if (!profile || (profile.rol !== "entrenador" && profile.rol !== "nutricionista")) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Lock className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceso Restringido</h3>
          <p className="text-gray-600 mb-4">
            Esta funcionalidad está disponible únicamente para entrenadores y nutricionistas.
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
          <Lightbulb className="mr-2 h-5 w-5" />
          Publicar Consejo
        </CardTitle>
        <CardDescription>Comparte consejos y tips útiles con la comunidad</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título del Consejo</Label>
            <Input
              id="titulo"
              type="text"
              placeholder="Ej: 5 Tips para Mantener la Motivación"
              value={formData.titulo}
              onChange={(e) => handleInputChange("titulo", e.target.value)}
              required
              maxLength={100}
            />
            <p className="text-xs text-gray-500">{formData.titulo.length}/100 caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contenido">Contenido</Label>
            <Textarea
              id="contenido"
              placeholder="Escribe tu consejo aquí. Comparte tu experiencia y conocimientos..."
              value={formData.contenido}
              onChange={(e) => handleInputChange("contenido", e.target.value)}
              required
              rows={8}
              maxLength={2000}
            />
            <p className="text-xs text-gray-500">{formData.contenido.length}/2000 caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría (Opcional)</Label>
            <Select value={formData.categoria} onValueChange={(value) => handleInputChange("categoria", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {getCategoriesByRole(profile.rol).map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">Video de YouTube (Opcional)</Label>
            <div className="relative">
              <Input
                id="video_url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.video_url}
                onChange={(e) => handleInputChange("video_url", e.target.value)}
                className="pl-10"
              />
              <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">Agrega un video de YouTube para complementar tu consejo</p>
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
                setFormData({ titulo: "", contenido: "", video_url: "", categoria: "" })
                setMessage(null)
              }}
              disabled={submitting}
            >
              Limpiar
            </Button>
            <Button type="submit" disabled={submitting || !formData.titulo || !formData.contenido}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Publicar Consejo
                </>
              )}
            </Button>
          </div>
        </form>

        <div className={`mt-6 p-4 rounded-lg border ${getRoleColor(profile.rol)}`}>
          <h4 className="text-sm font-medium mb-2">Información del Autor</h4>
          <p className="text-sm">
            <span className="font-medium">{getRoleLabel(profile.rol)}:</span> {profile.nombre}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
