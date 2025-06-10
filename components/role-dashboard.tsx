"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  User,
  Dumbbell,
  Apple,
  ShoppingBag,
  Plus,
  Calendar,
  FileText,
  Download,
  Play,
  Eye,
  BarChart3,
} from "lucide-react"
import type { JSX } from "react"

interface UserProfile {
  id: string
  nombre: string
  rol: string
  avatar_url: string | null
}

interface Purchase {
  id: string
  tipo: string
  plan_id: string
  created_at: string
  plan_details?: {
    titulo: string
    descripcion: string
    autor_nombre: string
  }
}

interface UploadedContent {
  id: string
  titulo: string
  descripcion: string
  created_at: string
  tipo: "entrenamiento" | "nutricion"
  video_url?: string
  pdf_url?: string
}

export default function RoleDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [uploadedContent, setUploadedContent] = useState<UploadedContent[]>([])
  const [stats, setStats] = useState({ totalPurchases: 0, totalUploads: 0, recentActivity: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from("usuarios")
        .select("id, nombre, rol, avatar_url")
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error("Error fetching profile:", profileError)
        return
      }

      setProfile(profileData)

      // Load role-specific data
      if (profileData.rol === "cliente") {
        await loadClientData(user.id)
      } else if (profileData.rol === "entrenador" || profileData.rol === "nutricionista") {
        await loadProfessionalData(user.id, profileData.rol)
      }
    } catch (error) {
      console.error("Error loading dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadClientData = async (userId: string) => {
    try {
      // Fetch purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from("compras")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (purchasesError) {
        console.error("Error fetching purchases:", purchasesError)
        return
      }

      // Get plan details for each purchase
      const purchasesWithDetails = await Promise.all(
        (purchasesData || []).map(async (purchase) => {
          let planDetails = null

          if (purchase.tipo === "entrenamiento") {
            const { data } = await supabase
              .from("entrenamientos")
              .select(`
                titulo,
                descripcion,
                usuarios (nombre)
              `)
              .eq("id", purchase.plan_id)
              .single()

            if (data) {
              planDetails = {
                titulo: data.titulo,
                descripcion: data.descripcion,
                autor_nombre: data.usuarios?.nombre || "Autor desconocido",
              }
            }
          } else if (purchase.tipo === "nutricion") {
            const { data } = await supabase
              .from("planes_nutricion")
              .select(`
                titulo,
                descripcion,
                usuarios (nombre)
              `)
              .eq("id", purchase.plan_id)
              .single()

            if (data) {
              planDetails = {
                titulo: data.titulo,
                descripcion: data.descripcion,
                autor_nombre: data.usuarios?.nombre || "Autor desconocido",
              }
            }
          }

          return {
            ...purchase,
            plan_details: planDetails,
          }
        }),
      )

      setPurchases(purchasesWithDetails)
      setStats((prev) => ({ ...prev, totalPurchases: purchasesWithDetails.length }))
    } catch (error) {
      console.error("Error loading client data:", error)
    }
  }

  const loadProfessionalData = async (userId: string, role: string) => {
    try {
      const content: UploadedContent[] = []

      // Fetch workouts if entrenador
      if (role === "entrenador") {
        const { data: workouts, error: workoutsError } = await supabase
          .from("entrenamientos")
          .select("id, titulo, descripcion, video_url, created_at")
          .eq("autor_id", userId)
          .order("created_at", { ascending: false })

        if (!workoutsError && workouts) {
          content.push(
            ...workouts.map((workout) => ({
              ...workout,
              tipo: "entrenamiento" as const,
            })),
          )
        }
      }

      // Fetch nutrition plans if nutricionista
      if (role === "nutricionista") {
        const { data: nutritionPlans, error: nutritionError } = await supabase
          .from("planes_nutricion")
          .select("id, titulo, descripcion, pdf_url, created_at")
          .eq("autor_id", userId)
          .order("created_at", { ascending: false })

        if (!nutritionError && nutritionPlans) {
          content.push(
            ...nutritionPlans.map((plan) => ({
              ...plan,
              tipo: "nutricion" as const,
            })),
          )
        }
      }

      // Sort all content by creation date
      content.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setUploadedContent(content)
      setStats((prev) => ({
        ...prev,
        totalUploads: content.length,
        recentActivity: content.filter((item) => {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return new Date(item.created_at) > weekAgo
        }).length,
      }))
    } catch (error) {
      console.error("Error loading professional data:", error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "entrenamiento":
        return <Dumbbell className="h-4 w-4" />
      case "nutricion":
        return <Apple className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "entrenamiento":
        return "bg-green-100 text-green-800"
      case "nutricion":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "entrenamiento":
        return "Entrenamiento"
      case "nutricion":
        return "Nutrición"
      default:
        return type
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando dashboard...</span>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Error al cargar el perfil</h2>
          <Button onClick={() => router.push("/login")} className="mt-4">
            Volver al login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Bienvenido, {profile.nombre} - {getRoleLabel(profile.rol)}
            </p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Cerrar sesión
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {profile.rol === "cliente" ? "Planes Comprados" : "Contenido Subido"}
              </CardTitle>
              {profile.rol === "cliente" ? (
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              ) : (
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile.rol === "cliente" ? stats.totalPurchases : stats.totalUploads}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actividad Reciente</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentActivity}</div>
              <p className="text-xs text-muted-foreground">Últimos 7 días</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mi Rol</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getRoleLabel(profile.rol)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Role-specific Content */}
        {profile.rol === "cliente" ? (
          <ClientDashboard purchases={purchases} />
        ) : (
          <ProfessionalDashboard
            content={uploadedContent}
            role={profile.rol}
            getTypeIcon={getTypeIcon}
            getTypeColor={getTypeColor}
            getTypeLabel={getTypeLabel}
          />
        )}
      </div>
    </div>
  )
}

// Client Dashboard Component
function ClientDashboard({ purchases }: { purchases: Purchase[] }) {
  const router = useRouter()

  const workoutPlans = purchases.filter((p) => p.tipo === "entrenamiento")
  const nutritionPlans = purchases.filter((p) => p.tipo === "nutricion")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mis Planes</h2>
        <Button onClick={() => router.push("/purchase")}>
          <Plus className="mr-2 h-4 w-4" />
          Comprar Más Planes
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Todos ({purchases.length})</TabsTrigger>
          <TabsTrigger value="workouts">Entrenamientos ({workoutPlans.length})</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrición ({nutritionPlans.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <PurchasesList purchases={purchases} />
        </TabsContent>

        <TabsContent value="workouts" className="space-y-4">
          <PurchasesList purchases={workoutPlans} />
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <PurchasesList purchases={nutritionPlans} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Professional Dashboard Component
function ProfessionalDashboard({
  content,
  role,
  getTypeIcon,
  getTypeColor,
  getTypeLabel,
}: {
  content: UploadedContent[]
  role: string
  getTypeIcon: (type: string) => JSX.Element
  getTypeColor: (type: string) => string
  getTypeLabel: (type: string) => string
}) {
  const router = useRouter()

  const getUploadUrl = () => {
    if (role === "entrenador") return "/workouts/upload"
    if (role === "nutricionista") return "/nutrition-plans/upload"
    return "/advice/publish"
  }

  const getUploadLabel = () => {
    if (role === "entrenador") return "Subir Entrenamiento"
    if (role === "nutricionista") return "Subir Plan de Nutrición"
    return "Publicar Consejo"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mi Contenido</h2>
        <Button onClick={() => router.push(getUploadUrl())}>
          <Plus className="mr-2 h-4 w-4" />
          {getUploadLabel()}
        </Button>
      </div>

      {content.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No has subido contenido</h3>
            <p className="text-gray-600 mb-4">Comienza creando tu primer plan o entrenamiento.</p>
            <Button onClick={() => router.push(getUploadUrl())}>
              <Plus className="mr-2 h-4 w-4" />
              {getUploadLabel()}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {content.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="line-clamp-2 text-lg">{item.titulo}</CardTitle>
                  <Badge className={getTypeColor(item.tipo)}>
                    <div className="flex items-center space-x-1">
                      {getTypeIcon(item.tipo)}
                      <span>{getTypeLabel(item.tipo)}</span>
                    </div>
                  </Badge>
                </div>
                <CardDescription className="line-clamp-3">{item.descripcion}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Creado: {new Date(item.created_at).toLocaleDateString("es-ES")}</span>
                  </div>

                  <div className="flex space-x-2">
                    {item.video_url && (
                      <Button size="sm" variant="outline" onClick={() => window.open(item.video_url, "_blank")}>
                        <Play className="mr-2 h-3 w-3" />
                        Ver Video
                      </Button>
                    )}
                    {item.pdf_url && (
                      <Button size="sm" variant="outline" onClick={() => window.open(item.pdf_url, "_blank")}>
                        <Download className="mr-2 h-3 w-3" />
                        Descargar PDF
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Purchases List Component
function PurchasesList({ purchases }: { purchases: Purchase[] }) {
  if (purchases.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes planes en esta categoría</h3>
          <p className="text-gray-600">Explora nuestros planes disponibles.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {purchases.map((purchase) => (
        <Card key={purchase.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="line-clamp-2">{purchase.plan_details?.titulo || "Plan no encontrado"}</CardTitle>
              <Badge
                className={
                  purchase.tipo === "entrenamiento" ? "bg-green-100 text-green-800" : "bg-purple-100 text-purple-800"
                }
              >
                <div className="flex items-center space-x-1">
                  {purchase.tipo === "entrenamiento" ? <Dumbbell className="h-3 w-3" /> : <Apple className="h-3 w-3" />}
                  <span>{purchase.tipo === "entrenamiento" ? "Entrenamiento" : "Nutrición"}</span>
                </div>
              </Badge>
            </div>
            <CardDescription className="line-clamp-3">
              {purchase.plan_details?.descripcion || "Descripción no disponible"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Autor:</span> {purchase.plan_details?.autor_nombre || "Desconocido"}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Comprado: {new Date(purchase.created_at).toLocaleDateString("es-ES")}</span>
              </div>
              <Button size="sm" className="w-full mt-3">
                <Eye className="mr-2 h-3 w-3" />
                Ver Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
