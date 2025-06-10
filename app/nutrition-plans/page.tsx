"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, FileText, Download, User } from "lucide-react"

interface NutritionPlan {
  id: string
  titulo: string
  descripcion: string
  pdf_url: string
  autor_id: string
  created_at: string
  usuarios: {
    nombre: string
  }
}

export default function NutritionPlansPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<NutritionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    checkAuthAndFetchPlans()
  }, [])

  const checkAuthAndFetchPlans = async () => {
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

      // Fetch nutrition plans with author information
      const { data, error } = await supabase
        .from("planes_nutricion")
        .select(`
          *,
          usuarios (nombre)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching plans:", error)
        return
      }

      setPlans(data || [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (pdfUrl: string, titulo: string) => {
    const link = document.createElement("a")
    link.href = pdfUrl
    link.download = `${titulo}.pdf`
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
            <h1 className="text-3xl font-bold text-gray-900">Planes de Nutrición</h1>
            <p className="mt-2 text-gray-600">Explora los planes de nutrición disponibles</p>
          </div>
          {userRole === "nutricionista" && (
            <Button onClick={() => router.push("/nutrition-plans/upload")}>
              <Plus className="mr-2 h-4 w-4" />
              Subir Plan
            </Button>
          )}
        </div>

        {plans.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay planes disponibles</h3>
              <p className="text-gray-600 mb-4">Aún no se han subido planes de nutrición.</p>
              {userRole === "nutricionista" && (
                <Button onClick={() => router.push("/nutrition-plans/upload")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Subir el primer plan
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="line-clamp-2">{plan.titulo}</span>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      <FileText className="h-3 w-3 mr-1" />
                      PDF
                    </Badge>
                  </CardTitle>
                  <CardDescription className="line-clamp-3">{plan.descripcion}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>Por: {plan.usuarios.nombre}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Subido: {new Date(plan.created_at).toLocaleDateString("es-ES")}
                    </div>
                    <Button
                      onClick={() => handleDownload(plan.pdf_url, plan.titulo)}
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Descargar PDF
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
