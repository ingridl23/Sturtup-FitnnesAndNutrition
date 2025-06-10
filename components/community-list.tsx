"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Users, Search, MapPin, Dumbbell, Apple, User } from "lucide-react"

interface CommunityUser {
  id: string
  nombre: string
  rol: string
  avatar_url: string | null
  bio?: string | null
  gimnasio?: string | null
  ciudad?: string | null
  created_at: string
}

export default function CommunityList() {
  const [users, setUsers] = useState<CommunityUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<CommunityUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("id, nombre, rol, avatar_url, bio, gimnasio, ciudad, created_at")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching users:", error)
        return
      }

      // Add mock data for demonstration since bio, gimnasio, ciudad might not exist in your table
      const usersWithMockData = (data || []).map((user) => ({
        ...user,
        bio: user.bio || generateMockBio(user.rol),
        gimnasio: user.gimnasio || generateMockGym(),
        ciudad: user.ciudad || generateMockCity(),
      }))

      setUsers(usersWithMockData)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockBio = (rol: string): string => {
    const bios = {
      cliente: [
        "Apasionado por el fitness y la vida saludable. Siempre buscando nuevos desafíos.",
        "Comenzando mi journey fitness. ¡Motivado para alcanzar mis metas!",
        "Amante del deporte y la nutrición balanceada. Aquí para aprender y crecer.",
        "Enfocado en mejorar mi salud y bienestar general cada día.",
      ],
      entrenador: [
        "Entrenador certificado con 5+ años de experiencia. Especializado en fuerza y acondicionamiento.",
        "Ayudo a las personas a alcanzar sus objetivos fitness de manera segura y efectiva.",
        "Passionate about transforming lives through fitness. Let's achieve your goals together!",
        "Entrenador personal especializado en pérdida de peso y ganancia muscular.",
      ],
      nutricionista: [
        "Nutricionista certificada. Especializada en planes de alimentación personalizados.",
        "Ayudo a crear hábitos alimenticios saludables y sostenibles a largo plazo.",
        "Experta en nutrición deportiva y suplementación. Aquí para guiarte.",
        "Nutricionista clínica con enfoque en bienestar integral y prevención.",
      ],
    }

    const roleBios = bios[rol as keyof typeof bios] || bios.cliente
    return roleBios[Math.floor(Math.random() * roleBios.length)]
  }

  const generateMockGym = (): string => {
    const gyms = [
      "Fitness Center Elite",
      "Iron Paradise Gym",
      "Wellness Club Premium",
      "SportLife Fitness",
      "Muscle Factory",
      "Healthy Life Gym",
      "Power House Fitness",
      "Body & Soul Wellness",
    ]
    return gyms[Math.floor(Math.random() * gyms.length)]
  }

  const generateMockCity = (): string => {
    const cities = [
      "Madrid",
      "Barcelona",
      "Valencia",
      "Sevilla",
      "Bilbao",
      "Málaga",
      "Zaragoza",
      "Murcia",
      "Palma",
      "Las Palmas",
    ]
    return cities[Math.floor(Math.random() * cities.length)]
  }

  const filterUsers = () => {
    let filtered = users

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.gimnasio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.ciudad?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.rol === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case "entrenador":
        return <Dumbbell className="h-4 w-4" />
      case "nutricionista":
        return <Apple className="h-4 w-4" />
      case "cliente":
        return <User className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "entrenador":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "nutricionista":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "cliente":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case "entrenador":
        return "Entrenador"
      case "nutricionista":
        return "Nutricionista"
      case "cliente":
        return "Cliente"
      default:
        return role
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleStats = () => {
    const stats = users.reduce(
      (acc, user) => {
        acc[user.rol] = (acc[user.rol] || 0) + 1
        acc.total += 1
        return acc
      },
      { total: 0 } as { [key: string]: number },
    )
    return stats
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando comunidad...</span>
      </div>
    )
  }

  const stats = getRoleStats()

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Nuestra Comunidad</h2>
            <p className="text-blue-100">Conecta con otros miembros de la comunidad fitness</p>
          </div>
          <Users className="h-12 w-12 text-blue-200" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-blue-200">Total Miembros</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.cliente || 0}</div>
            <div className="text-sm text-blue-200">Clientes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.entrenador || 0}</div>
            <div className="text-sm text-blue-200">Entrenadores</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.nutricionista || 0}</div>
            <div className="text-sm text-blue-200">Nutricionistas</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Encuentra miembros específicos de la comunidad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, gimnasio o ciudad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="cliente">Clientes</SelectItem>
                  <SelectItem value="entrenador">Entrenadores</SelectItem>
                  <SelectItem value="nutricionista">Nutricionistas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Mostrando {filteredUsers.length} de {users.length} miembros
      </div>

      {/* User Grid */}
      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron miembros</h3>
            <p className="text-gray-600">Intenta ajustar los filtros de búsqueda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar_url || undefined} alt={user.nombre} />
                    <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(user.nombre)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-lg">{user.nombre}</CardTitle>
                <div className="flex justify-center">
                  <Badge className={`${getRoleColor(user.rol)} flex items-center space-x-1`}>
                    {getRoleIcon(user.rol)}
                    <span>{getRoleLabel(user.rol)}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-3">{user.bio}</p>

                {user.gimnasio && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Dumbbell className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">{user.gimnasio}</span>
                  </div>
                )}

                {user.ciudad && (
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2 shrink-0" />
                    <span>{user.ciudad}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-400">
                    Miembro desde{" "}
                    {new Date(user.created_at).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
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
