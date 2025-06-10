import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dumbbell, Apple, Users, Zap, Target, Heart, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <div className="space-y-8">
            {/* Logo/Brand */}
            <div className="flex justify-center items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
                <Dumbbell className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                GymFlow
              </h1>
            </div>

            {/* Tagline */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Entrenamiento y nutrición personalizada en un solo lugar
            </p>

            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Conecta con entrenadores y nutricionistas profesionales. Accede a planes personalizados, entrenamientos
              efectivos y consejos nutricionales para alcanzar tus objetivos de fitness.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Comenzar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 hover:border-blue-500 px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-200"
                >
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para tu transformación
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre nuestras herramientas diseñadas para llevarte al siguiente nivel
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Entrenamientos */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:scale-105">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Dumbbell className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Entrenamientos</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 leading-relaxed">
                  Rutinas personalizadas creadas por entrenadores certificados. Videos explicativos y seguimiento de
                  progreso.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Nutrición */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 hover:scale-105">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-gradient-to-r from-purple-500 to-violet-600 p-4 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Apple className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Nutrición</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 leading-relaxed">
                  Planes alimenticios balanceados diseñados por nutricionistas. Recetas saludables y guías
                  nutricionales.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Anatomía */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 hover:scale-105">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-gradient-to-r from-blue-500 to-cyan-600 p-4 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Anatomía</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 leading-relaxed">
                  Explora la anatomía humana de forma interactiva. Aprende sobre músculos y ejercicios específicos.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Comunidad */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50 hover:scale-105">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-gradient-to-r from-orange-500 to-red-600 p-4 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Comunidad</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 leading-relaxed">
                  Conecta con otros usuarios, comparte experiencias y encuentra motivación en nuestra comunidad.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">¿Por qué elegir GymFlow?</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              La plataforma más completa para tu bienestar físico y nutricional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl w-fit mx-auto mb-6">
                <Zap className="h-8 w-8 text-yellow-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Resultados Rápidos</h3>
              <p className="text-blue-100">
                Planes optimizados y seguimiento personalizado para alcanzar tus metas más rápido.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl w-fit mx-auto mb-6">
                <Heart className="h-8 w-8 text-red-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Profesionales Certificados</h3>
              <p className="text-blue-100">
                Trabaja con entrenadores y nutricionistas verificados y con experiencia comprobada.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl w-fit mx-auto mb-6">
                <Target className="h-8 w-8 text-green-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Personalización Total</h3>
              <p className="text-blue-100">
                Cada plan se adapta a tus objetivos, nivel de experiencia y preferencias personales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">¿Listo para comenzar tu transformación?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Únete a miles de usuarios que ya están alcanzando sus objetivos con GymFlow. Tu mejor versión te está
            esperando.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Crear cuenta gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 hover:border-blue-500 px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-200"
              >
                Iniciar sesión
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">GymFlow</h3>
            </div>
            <p className="text-gray-400 mb-6">Entrenamiento y nutrición personalizada en un solo lugar</p>
            <div className="border-t border-gray-800 pt-6">
              <p className="text-gray-500 text-sm">© 2024 GymFlow. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
