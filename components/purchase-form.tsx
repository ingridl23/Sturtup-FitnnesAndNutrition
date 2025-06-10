"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, ShoppingCart, CheckCircle, AlertCircle, CreditCard, Dumbbell, Apple } from "lucide-react"

interface Plan {
  id: string
  titulo: string
  descripcion: string
  autor_id: string
  created_at: string
  usuarios: {
    nombre: string
  }
}

interface UserProfile {
  id: string
  nombre: string
  rol: string
}

export default function PurchaseForm() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedType, setSelectedType] = useState<string>("")
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Mock prices for demonstration
  const getPlanPrice = (planId: string, type: string): number => {
    // In a real app, prices would be stored in the database
    const basePrices = {
      entrenamiento: 29.99,
      nutricion: 24.99,
    }
    return basePrices[type as keyof typeof basePrices] || 19.99
  }

  useEffect(() => {
    checkUserAndLoadData()
  }, [])

  useEffect(() => {
    if (selectedType) {
      fetchPlans()
    } else {
      setPlans([])
      setSelectedPlan("")
    }
  }, [selectedType])

  const checkUserAndLoadData = async () => {
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
      console.error("Error checking user:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error al verificar usuario",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPlans = async () => {
    try {
      let query
      if (selectedType === "entrenamiento") {
        query = supabase
          .from("entrenamientos")
          .select(`
            id,
            titulo,
            descripcion,
            autor_id,
            created_at,
            usuarios (nombre)
          `)
          .order("created_at", { ascending: false })
      } else if (selectedType === "nutricion") {
        query = supabase
          .from("planes_nutricion")
          .select(`
            id,
            titulo,
            descripcion,
            autor_id,
            created_at,
            usuarios (nombre)
          `)
          .order("created_at", { ascending: false })
      }

      if (!query) return

      const { data, error } = await query

      if (error) {
        console.error("Error fetching plans:", error)
        return
      }

      setPlans(data || [])
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handlePurchase = async () => {
    if (!profile || !selectedType || !selectedPlan) {
      setMessage({
        type: "error",
        text: "Por favor, completa todos los campos",
      })
      return
    }

    setPurchasing(true)
    setMessage(null)

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Insert purchase record
      const { error: insertError } = await supabase.from("compras").insert({
        user_id: profile.id,
        tipo: selectedType,
        plan_id: selectedPlan,
      })

      if (insertError) {
        throw new Error(`Error al procesar la compra: ${insertError.message}`)
      }

      // Success
      setMessage({
        type: "success",
        text: "¡Compra realizada exitosamente! Ya puedes acceder a tu plan.",
      })

      // Reset form
      setSelectedType("")
      setSelectedPlan("")
    } catch (error) {
      console.error("Error processing purchase:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error al procesar la compra",
      })
    } finally {
      setPurchasing(false)
    }
  }

  const getSelectedPlan = (): Plan | null => {
    return plans.find((plan) => plan.id === selectedPlan) || null
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "entrenamiento":
        return <Dumbbell className="h-4 w-4" />
      case "nutricion":
        return <Apple className="h-4 w-4" />
      default:
        return <ShoppingCart className="h-4 w-4" />
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
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando...</span>
        </CardContent>
      </Card>
    )
  }

  const selectedPlanData = getSelectedPlan()
  const price = selectedPlanData ? getPlanPrice(selectedPlan, selectedType) : 0

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Comprar Plan
          </CardTitle>
          <CardDescription>Selecciona y compra el plan que mejor se adapte a tus necesidades</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tipo de Plan</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrenamiento">
                  <div className="flex items-center space-x-2">
                    <Dumbbell className="h-4 w-4" />
                    <span>Plan de Entrenamiento</span>
                  </div>
                </SelectItem>
                <SelectItem value="nutricion">
                  <div className="flex items-center space-x-2">
                    <Apple className="h-4 w-4" />
                    <span>Plan de Nutrición</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Plan Selection */}
          {selectedType && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Plan Específico</label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{plan.titulo}</span>
                        <span className="text-xs text-gray-500">Por: {plan.usuarios.nombre}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {plans.length === 0 && selectedType && (
                <p className="text-sm text-gray-500">No hay planes disponibles para este tipo.</p>
              )}
            </div>
          )}

          {/* Plan Details */}
          {selectedPlanData && (
            <Card className="bg-gray-50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{selectedPlanData.titulo}</CardTitle>
                  <Badge className={getTypeColor(selectedType)}>
                    <div className="flex items-center space-x-1">
                      {getTypeIcon(selectedType)}
                      <span>{getTypeLabel(selectedType)}</span>
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{selectedPlanData.descripcion}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Creado por:</span> {selectedPlanData.usuarios.nombre}
                  </div>
                  <div className="text-2xl font-bold text-green-600">${price.toFixed(2)}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Messages */}
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

          {/* Purchase Button */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={handlePurchase}
              disabled={purchasing || !selectedType || !selectedPlan}
              className="w-full"
              size="lg"
            >
              {purchasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando pago...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Comprar por ${price.toFixed(2)}
                </>
              )}
            </Button>
          </div>

          {/* User Info */}
          {profile && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Información de Compra</h4>
              <p className="text-sm text-blue-700">
                <span className="font-medium">Comprador:</span> {profile.nombre}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                La compra se registrará en tu cuenta y tendrás acceso inmediato al contenido.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Simulation Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Simulación de Pago</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Este es un sistema de demostración. No se procesarán pagos reales. La compra se registrará en la base de
                datos para fines de prueba.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
