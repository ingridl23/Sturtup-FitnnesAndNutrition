import DatabaseSetupGuide from "@/components/database-setup-guide"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Base de Datos</h1>
          <p className="mt-2 text-gray-600">
            Ejecuta estos scripts SQL en tu proyecto de Supabase para configurar la base de datos
          </p>
        </div>
        <DatabaseSetupGuide />
      </div>
    </div>
  )
}
