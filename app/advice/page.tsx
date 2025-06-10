"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Lightbulb, User, Youtube, Calendar } from "lucide-react"

interface Advice {
  id: string
  titulo: string
  contenido: string
  video_url: string | null
  categoria: string | null
  autor_id: string
  created_at: string
  usuarios: {
    nombre: string
    rol: string
  }
}

export default function AdvicePage() {
  const router = useRouter()
  const [advice, setAdvice] = useState<Advice[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    checkAuthAndFetchAdvice()
  }, [])

  const checkAuthAndFetchAdvice = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      // Get user role
      const { data: userData } = await supabase.from("usuarios").select("rol").eq("id", user.id).single()

      setUserRole(userData?.rol || null)

      // Fetch advice with author information
      const { data, error } = await supabase
        .from("consejos")
        .select(`
          *,
          usuarios (nombre, rol)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching advice:", error)
        return
      }

      setAdvice(data || [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryLabel = (category: string | null): string => {
    if (!category) return "General"

    const categoryLabels: { [key: string]: string } = {
      general: "General",
      motivacion: "Motivación",
      habitos: "Hábitos Saludables",
      ejercicio: "Ejercicio",
      tecnica: "Técnica",
      recuperacion: "Recuperación",
      fuerza: "Entrenamiento de Fuerza",
      cardio: "Cardio",
      nutricion: "Nutrición",
      dieta: "Dieta",
      suplementos: "Suplementos",
      hidratacion: "Hidratación",
      perdida_peso: "Pérdida de Peso",
      ganancia_masa: "Ganancia de Masa",
    }

    return categoryLabels[category] || category
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "entrenador":
        return "bg-green-100 text-green-800"
      case "nutricionista":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  const handleWatchVideo = (videoUrl: string) => {
    window.open(videoUrl, "_blank")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const canPublish = userRole === "entrenador" || userRole === "nutricionista"

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consejos y Tips</h1>
            <p className="mt-2 text-gray-600">Descubre consejos útiles de nuestros expertos</p>
          </div>
          {canPublish && (
            <Button onClick={() => router.push("/advice/publish")}>
              <Plus className="mr-2 h-4 w-4" />
              Publicar Consejo
            </Button>
          )}
        </div>

        {advice.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <Lightbulb className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay consejos disponibles</h3>
              <p className="text-gray-600 mb-4">Aún no se han publicado consejos.</p>
              {canPublish && (
                <Button onClick={() => router.push("/advice/publish")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Publicar el primer consejo
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {advice.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="line-clamp-2 text-lg">{item.titulo}</CardTitle>
                    {item.categoria && (
                      <Badge variant="outline" className="ml-2 shrink-0 text-xs">
                        {getCategoryLabel(item.categoria)}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-4 text-sm">{item.contenido}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <span>{item.usuarios.nombre}</span>
                      </div>
                      <Badge className={getRoleColor(item.usuarios.rol)} variant="secondary">
                        {getRoleLabel(item.usuarios.rol)}
                      </Badge>
                    </div>

                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{new Date(item.created_at).toLocaleDateString("es-ES")}</span>
                    </div>

                    {item.video_url && (
                      <Button
                        onClick={() => handleWatchVideo(item.video_url!)}
                        className="w-full"
                        variant="outline"
                        size="sm"
                      >
                        <Youtube className="mr-2 h-4 w-4" />
                        Ver Video
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
