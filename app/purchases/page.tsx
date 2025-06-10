"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ShoppingBag, ArrowLeft, Calendar, Dumbbell, Apple } from "lucide-react"

interface Purchase {
  id: string
  tipo: string
  plan_id: string
  created_at: string
  plan_details?: {
    titulo: string
    descripcion: string
  }
}

export default function PurchasesPage() {
  const router = useRouter()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthAndFetchPurchases()
  }, [])

  const checkAuthAndFetchPurchases = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      // Fetch user's purchases
      const { data: purchasesData, error } = await supabase
        .from("compras")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching purchases:", error)
        return
      }

      // Fetch plan details for each purchase
      const purchasesWithDetails = await Promise.all(
        (purchasesData || []).map(async (purchase) => {
          let planDetails = null

          if (purchase.tipo === "entrenamiento") {
            const { data } = await supabase
              .from("entrenamientos")
              .select("titulo, descripcion")
              .eq("id", purchase.plan_id)
              .single()
            planDetails = data
          } else if (purchase.tipo === "nutricion") {
            const { data } = await supabase
              .from("planes_nutricion")
              .select("titulo, descripcion")
              .eq("id", purchase.plan_id)
              .single()
            planDetails = data
          }

          return {
            ...purchase,
            plan_details: planDetails,
          }
        }),
      )

      setPurchases(purchasesWithDetails)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "entrenamiento":
        return <Dumbbell className="h-4 w-4" />
      case "nutricion":
        return <Apple className="h-4 w-4" />
      default:
        return <ShoppingBag className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "entrenamiento":
        return "Plan de Entrenamiento"
      case "nutricion":
        return "Plan de Nutrición"
      default:
        return type
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Mis Compras</h1>
          <p className="mt-2 text-gray-600">Historial de planes adquiridos</p>
        </div>

        {purchases.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes compras</h3>
              <p className="text-gray-600 mb-4">Aún no has adquirido ningún plan.</p>
              <Button onClick={() => router.push("/purchase")}>Explorar Planes</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <Card key={purchase.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        {getTypeIcon(purchase.tipo)}
                        <span>{purchase.plan_details?.titulo || "Plan no encontrado"}</span>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {purchase.plan_details?.descripcion || "Descripción no disponible"}
                      </CardDescription>
                    </div>
                    <Badge className={getTypeColor(purchase.tipo)}>{getTypeLabel(purchase.tipo)}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Comprado el {new Date(purchase.created_at).toLocaleDateString("es-ES")}</span>
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
