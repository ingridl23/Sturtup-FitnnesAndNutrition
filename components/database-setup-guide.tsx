"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Database, CheckCircle, AlertCircle } from "lucide-react"

export default function DatabaseSetupGuide() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Configuración de Base de Datos
          </CardTitle>
          <CardDescription>Guía para configurar las tablas necesarias en Supabase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Ejecuta estos scripts SQL en el orden indicado en tu panel de Supabase.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">1. Tabla de Usuarios</h3>
                <Badge variant="outline">01-create-usuarios-table.sql</Badge>
              </div>
              <p className="text-sm text-gray-600">
                Crea la tabla principal de usuarios con roles y información de perfil.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">2. Planes de Nutrición</h3>
                <Badge variant="outline">02-create-planes-nutricion-table.sql</Badge>
              </div>
              <p className="text-sm text-gray-600">
                Tabla para almacenar planes de nutrición creados por nutricionistas.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">3. Entrenamientos</h3>
                <Badge variant="outline">03-create-entrenamientos-table.sql</Badge>
              </div>
              <p className="text-sm text-gray-600">Tabla para almacenar entrenamientos creados por entrenadores.</p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">4. Consejos</h3>
                <Badge variant="outline">04-create-consejos-table.sql</Badge>
              </div>
              <p className="text-sm text-gray-600">Tabla para consejos y tips publicados por profesionales.</p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">5. Compras</h3>
                <Badge variant="outline">05-create-compras-table.sql</Badge>
              </div>
              <p className="text-sm text-gray-600">
                Tabla para registrar las compras de planes por parte de los clientes.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">6. Storage Buckets</h3>
                <Badge variant="outline">06-create-storage-buckets.sql</Badge>
              </div>
              <p className="text-sm text-gray-600">
                Configura los buckets de almacenamiento para avatares, PDFs, videos y anatomía.
              </p>
            </div>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Verificación:</strong> Después de ejecutar todos los scripts, verifica que las tablas se hayan
              creado correctamente en el panel de Supabase.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
