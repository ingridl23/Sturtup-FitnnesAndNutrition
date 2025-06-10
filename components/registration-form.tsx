"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

type UserRole = "cliente" | "entrenador" | "nutricionista"

interface FormData {
  email: string
  password: string
  fullName: string
  role: UserRole | ""
}

export default function RegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    fullName: "",
    role: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password || !formData.fullName || !formData.role) {
      setMessage({ type: "error", text: "Por favor, completa todos los campos" })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // Step 1: Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error("No se pudo crear el usuario")
      }

      // Step 2: Wait a moment for the auth user to be fully created
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Step 3: Insert user data into usuarios table
      const { error: insertError } = await supabase.from("usuarios").insert({
        id: authData.user.id,
        nombre: formData.fullName,
        rol: formData.role,
        avatar_url: null,
      })

      if (insertError) {
        // If the insert fails, we should clean up the auth user
        console.error("Insert error details:", insertError)

      

        throw new Error(`Error al guardar datos del usuario: ${insertError.message}`)
      }

      setMessage({
        type: "success",
        text: "Registro exitoso. Por favor, verifica tu email para activar tu cuenta.",
      })

      // Reset form
      setFormData({
        email: "",
        password: "",
        fullName: "",
        role: "",
      })
    } catch (error) {
      console.error("Registration error:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error durante el registro",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Crear cuenta</CardTitle>
          <CardDescription className="text-center">Completa el formulario para registrarte</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Ingresa tu nombre completo"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select value={formData.role} onValueChange={(value: UserRole) => handleInputChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="entrenador">Entrenador</SelectItem>
                  <SelectItem value="nutricionista">Nutricionista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {message && (
              <Alert className={message.type === "error" ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"}>
                <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Inicia sesión
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
