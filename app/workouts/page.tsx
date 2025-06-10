"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Video, Play, User, Youtube, FileVideo } from "lucide-react"

interface Workout {
  id: string
  titulo: string
  descripcion: string
  video_url: string
  autor_id: string
  created_at: string
  usuarios: {
    nombre: string
  }
}

export default function WorkoutsPage() {
  const router = useRouter()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    checkAuthAndFetchWorkouts()
  }, [])

  const checkAuthAndFetchWorkouts = async () => {
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

      // Fetch workouts with author information
      const { data, error } = await supabase
        .from("entrenamientos")
        .select(`
          *,
          usuarios (nombre)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching workouts:", error)
        return
      }

      setWorkouts(data || [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const isYouTubeUrl = (url: string): boolean => {
    return url.includes("youtube.com") || url.includes("youtu.be")
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Entrenamientos</h1>
            <p className="mt-2 text-gray-600">Explora los entrenamientos disponibles</p>
          </div>
          {userRole === "entrenador" && (
            <Button onClick={() => router.push("/workouts/upload")}>
              <Plus className="mr-2 h-4 w-4" />
              Subir Entrenamiento
            </Button>
          )}
        </div>

        {workouts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <Video className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay entrenamientos disponibles</h3>
              <p className="text-gray-600 mb-4">Aún no se han subido entrenamientos.</p>
              {userRole === "entrenador" && (
                <Button onClick={() => router.push("/workouts/upload")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Subir el primer entrenamiento
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workouts.map((workout) => (
              <Card key={workout.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="line-clamp-2">{workout.titulo}</span>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      {isYouTubeUrl(workout.video_url) ? (
                        <>
                          <Youtube className="h-3 w-3 mr-1" />
                          YouTube
                        </>
                      ) : (
                        <>
                          <FileVideo className="h-3 w-3 mr-1" />
                          Video
                        </>
                      )}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="line-clamp-3">{workout.descripcion}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>Por: {workout.usuarios.nombre}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Subido: {new Date(workout.created_at).toLocaleDateString("es-ES")}
                    </div>
                    <Button onClick={() => handleWatchVideo(workout.video_url)} className="w-full" variant="outline">
                      <Play className="mr-2 h-4 w-4" />
                      Ver Entrenamiento
                    </Button>
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
