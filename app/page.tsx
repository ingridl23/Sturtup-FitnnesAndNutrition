import UserProfileCard from "@/components/user-profile-card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Perfil de Usuario con Supabase</h1>

        <UserProfileCard
          userId="user-123" // Replace with actual user ID
          initialAvatarUrl={null}
          userName="Juan Pérez"
          userEmail="juan.perez@ejemplo.com"
        />

        <div className="mt-8 max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Instrucciones:</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Haz clic en el avatar o en "Cambiar Avatar" para subir una imagen</li>
            <li>• Las imágenes se suben al bucket 'avatars' en Supabase Storage</li>
            <li>• El campo 'avatar_url' se actualiza en la tabla 'usuarios'</li>
            <li>• Formatos soportados: JPG, PNG, GIF (máx. 5MB)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
