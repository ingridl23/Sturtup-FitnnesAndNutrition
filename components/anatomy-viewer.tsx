"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Dumbbell, Info } from "lucide-react"

interface BodyPart {
  id: string
  name: string
  muscles: string[]
  exercises: Exercise[]
  description: string
}

interface Exercise {
  id: string
  name: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  equipment: string[]
}

interface AnatomyImage {
  id: string
  name: string
  url: string
  view: "front" | "back"
}

export default function AnatomyViewer() {
  const [anatomyImages, setAnatomyImages] = useState<AnatomyImage[]>([])
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(null)
  const [currentView, setCurrentView] = useState<"front" | "back">("front")
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Mock data for body parts - in a real app, this would come from your database
  const bodyPartsData: { [key: string]: BodyPart } = {
    chest: {
      id: "chest",
      name: "Pecho",
      muscles: ["Pectoral Mayor", "Pectoral Menor", "Deltoides Anterior"],
      description:
        "Los músculos del pecho son fundamentales para movimientos de empuje y estabilización del tronco superior.",
      exercises: [
        {
          id: "1",
          name: "Press de Banca",
          description: "Ejercicio básico para desarrollar fuerza y masa muscular en el pecho.",
          difficulty: "intermediate",
          equipment: ["Barra", "Banco", "Discos"],
        },
        {
          id: "2",
          name: "Flexiones",
          description: "Ejercicio de peso corporal excelente para principiantes.",
          difficulty: "beginner",
          equipment: ["Peso corporal"],
        },
        {
          id: "3",
          name: "Press con Mancuernas",
          description: "Permite mayor rango de movimiento y trabajo unilateral.",
          difficulty: "intermediate",
          equipment: ["Mancuernas", "Banco"],
        },
      ],
    },
    shoulders: {
      id: "shoulders",
      name: "Hombros",
      muscles: ["Deltoides Anterior", "Deltoides Medio", "Deltoides Posterior"],
      description: "Los deltoides proporcionan movilidad y estabilidad al hombro en todas las direcciones.",
      exercises: [
        {
          id: "4",
          name: "Press Militar",
          description: "Ejercicio fundamental para desarrollar fuerza en los hombros.",
          difficulty: "intermediate",
          equipment: ["Barra"],
        },
        {
          id: "5",
          name: "Elevaciones Laterales",
          description: "Aísla el deltoides medio para mayor anchura de hombros.",
          difficulty: "beginner",
          equipment: ["Mancuernas"],
        },
        {
          id: "6",
          name: "Pájaros",
          description: "Fortalece el deltoides posterior y mejora la postura.",
          difficulty: "beginner",
          equipment: ["Mancuernas"],
        },
      ],
    },
    arms: {
      id: "arms",
      name: "Brazos",
      muscles: ["Bíceps", "Tríceps", "Braquial", "Braquiorradial"],
      description: "Los músculos de los brazos son esenciales para movimientos de tracción y empuje.",
      exercises: [
        {
          id: "7",
          name: "Curl de Bíceps",
          description: "Ejercicio básico para desarrollar los bíceps.",
          difficulty: "beginner",
          equipment: ["Mancuernas"],
        },
        {
          id: "8",
          name: "Extensiones de Tríceps",
          description: "Aísla los tríceps para mayor definición.",
          difficulty: "beginner",
          equipment: ["Mancuernas"],
        },
        {
          id: "9",
          name: "Dominadas",
          description: "Ejercicio compuesto excelente para bíceps y espalda.",
          difficulty: "advanced",
          equipment: ["Barra de dominadas"],
        },
      ],
    },
    back: {
      id: "back",
      name: "Espalda",
      muscles: ["Latísimo del Dorso", "Romboides", "Trapecio", "Erector Espinal"],
      description: "Los músculos de la espalda son cruciales para la postura y movimientos de tracción.",
      exercises: [
        {
          id: "10",
          name: "Remo con Barra",
          description: "Ejercicio fundamental para desarrollar la espalda media.",
          difficulty: "intermediate",
          equipment: ["Barra", "Discos"],
        },
        {
          id: "11",
          name: "Jalones al Pecho",
          description: "Excelente para desarrollar el latísimo del dorso.",
          difficulty: "beginner",
          equipment: ["Máquina de poleas"],
        },
        {
          id: "12",
          name: "Peso Muerto",
          description: "Ejercicio compuesto que trabaja toda la cadena posterior.",
          difficulty: "advanced",
          equipment: ["Barra", "Discos"],
        },
      ],
    },
    legs: {
      id: "legs",
      name: "Piernas",
      muscles: ["Cuádriceps", "Isquiotibiales", "Glúteos", "Gemelos"],
      description: "Los músculos de las piernas proporcionan la base de fuerza para todo el cuerpo.",
      exercises: [
        {
          id: "13",
          name: "Sentadillas",
          description: "El rey de los ejercicios para piernas.",
          difficulty: "intermediate",
          equipment: ["Barra", "Discos"],
        },
        {
          id: "14",
          name: "Zancadas",
          description: "Ejercicio unilateral excelente para equilibrio y fuerza.",
          difficulty: "beginner",
          equipment: ["Mancuernas"],
        },
        {
          id: "15",
          name: "Peso Muerto Rumano",
          description: "Enfoca el trabajo en isquiotibiales y glúteos.",
          difficulty: "intermediate",
          equipment: ["Barra", "Discos"],
        },
      ],
    },
    abs: {
      id: "abs",
      name: "Abdomen",
      muscles: ["Recto Abdominal", "Oblicuos", "Transverso Abdominal"],
      description: "Los músculos abdominales proporcionan estabilidad al core y protegen la columna.",
      exercises: [
        {
          id: "16",
          name: "Plancha",
          description: "Ejercicio isométrico fundamental para el core.",
          difficulty: "beginner",
          equipment: ["Peso corporal"],
        },
        {
          id: "17",
          name: "Crunches",
          description: "Ejercicio básico para el recto abdominal.",
          difficulty: "beginner",
          equipment: ["Peso corporal"],
        },
        {
          id: "18",
          name: "Plancha Lateral",
          description: "Fortalece los oblicuos y mejora la estabilidad lateral.",
          difficulty: "intermediate",
          equipment: ["Peso corporal"],
        },
      ],
    },
  }

  useEffect(() => {
    fetchAnatomyImages()
  }, [])

  const fetchAnatomyImages = async () => {
    try {
      // List files from the anatomia bucket
      const { data: files, error } = await supabase.storage.from("anatomia").list()

      if (error) {
        console.error("Error fetching anatomy images:", error)
        return
      }

      // Get public URLs for the images
      const images: AnatomyImage[] = files
        .filter((file) => file.name.endsWith(".png") || file.name.endsWith(".jpg") || file.name.endsWith(".jpeg"))
        .map((file) => {
          const { data } = supabase.storage.from("anatomia").getPublicUrl(file.name)
          return {
            id: file.name,
            name: file.name,
            url: data.publicUrl,
            view: file.name.includes("back") ? "back" : "front",
          }
        })

      setAnatomyImages(images)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBodyPartClick = (bodyPartId: string) => {
    const bodyPart = bodyPartsData[bodyPartId]
    if (bodyPart) {
      setSelectedBodyPart(bodyPart)
      setDialogOpen(true)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "Principiante"
      case "intermediate":
        return "Intermedio"
      case "advanced":
        return "Avanzado"
      default:
        return difficulty
    }
  }

  const currentImage = anatomyImages.find((img) => img.view === currentView)

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando anatomía...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Dumbbell className="mr-2 h-5 w-5" />
            Anatomía Interactiva
          </CardTitle>
          <CardDescription>Haz clic en las diferentes partes del cuerpo para ver información detallada</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* View Toggle */}
            <div className="flex justify-center">
              <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as "front" | "back")}>
                <TabsList>
                  <TabsTrigger value="front">Vista Frontal</TabsTrigger>
                  <TabsTrigger value="back">Vista Posterior</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Body Illustration */}
            <div className="relative flex justify-center">
              {currentImage ? (
                <div className="relative">
                  <img
                    src={currentImage.url || "/placeholder.svg"}
                    alt={`Anatomía ${currentView}`}
                    className="max-w-md h-auto"
                    crossOrigin="anonymous"
                  />

                  {/* Clickable Areas - These would be positioned based on your anatomy image */}
                  {currentView === "front" && (
                    <>
                      {/* Chest Area */}
                      <button
                        onClick={() => handleBodyPartClick("chest")}
                        className="absolute top-[25%] left-[42%] w-16 h-12 bg-blue-500 bg-opacity-20 hover:bg-opacity-40 rounded-lg transition-all duration-200 border-2 border-blue-500 border-opacity-50"
                        title="Pecho"
                      />

                      {/* Shoulders */}
                      <button
                        onClick={() => handleBodyPartClick("shoulders")}
                        className="absolute top-[20%] left-[35%] w-8 h-8 bg-green-500 bg-opacity-20 hover:bg-opacity-40 rounded-full transition-all duration-200 border-2 border-green-500 border-opacity-50"
                        title="Hombro Izquierdo"
                      />
                      <button
                        onClick={() => handleBodyPartClick("shoulders")}
                        className="absolute top-[20%] right-[35%] w-8 h-8 bg-green-500 bg-opacity-20 hover:bg-opacity-40 rounded-full transition-all duration-200 border-2 border-green-500 border-opacity-50"
                        title="Hombro Derecho"
                      />

                      {/* Arms */}
                      <button
                        onClick={() => handleBodyPartClick("arms")}
                        className="absolute top-[30%] left-[25%] w-6 h-16 bg-purple-500 bg-opacity-20 hover:bg-opacity-40 rounded-lg transition-all duration-200 border-2 border-purple-500 border-opacity-50"
                        title="Brazo Izquierdo"
                      />
                      <button
                        onClick={() => handleBodyPartClick("arms")}
                        className="absolute top-[30%] right-[25%] w-6 h-16 bg-purple-500 bg-opacity-20 hover:bg-opacity-40 rounded-lg transition-all duration-200 border-2 border-purple-500 border-opacity-50"
                        title="Brazo Derecho"
                      />

                      {/* Abs */}
                      <button
                        onClick={() => handleBodyPartClick("abs")}
                        className="absolute top-[40%] left-[45%] w-10 h-16 bg-orange-500 bg-opacity-20 hover:bg-opacity-40 rounded-lg transition-all duration-200 border-2 border-orange-500 border-opacity-50"
                        title="Abdomen"
                      />

                      {/* Legs */}
                      <button
                        onClick={() => handleBodyPartClick("legs")}
                        className="absolute top-[60%] left-[40%] w-8 h-20 bg-red-500 bg-opacity-20 hover:bg-opacity-40 rounded-lg transition-all duration-200 border-2 border-red-500 border-opacity-50"
                        title="Pierna Izquierda"
                      />
                      <button
                        onClick={() => handleBodyPartClick("legs")}
                        className="absolute top-[60%] right-[40%] w-8 h-20 bg-red-500 bg-opacity-20 hover:bg-opacity-40 rounded-lg transition-all duration-200 border-2 border-red-500 border-opacity-50"
                        title="Pierna Derecha"
                      />
                    </>
                  )}

                  {currentView === "back" && (
                    <>
                      {/* Back */}
                      <button
                        onClick={() => handleBodyPartClick("back")}
                        className="absolute top-[25%] left-[42%] w-16 h-20 bg-indigo-500 bg-opacity-20 hover:bg-opacity-40 rounded-lg transition-all duration-200 border-2 border-indigo-500 border-opacity-50"
                        title="Espalda"
                      />

                      {/* Shoulders Back */}
                      <button
                        onClick={() => handleBodyPartClick("shoulders")}
                        className="absolute top-[20%] left-[35%] w-8 h-8 bg-green-500 bg-opacity-20 hover:bg-opacity-40 rounded-full transition-all duration-200 border-2 border-green-500 border-opacity-50"
                        title="Hombro Izquierdo"
                      />
                      <button
                        onClick={() => handleBodyPartClick("shoulders")}
                        className="absolute top-[20%] right-[35%] w-8 h-8 bg-green-500 bg-opacity-20 hover:bg-opacity-40 rounded-full transition-all duration-200 border-2 border-green-500 border-opacity-50"
                        title="Hombro Derecho"
                      />

                      {/* Legs Back */}
                      <button
                        onClick={() => handleBodyPartClick("legs")}
                        className="absolute top-[60%] left-[40%] w-8 h-20 bg-red-500 bg-opacity-20 hover:bg-opacity-40 rounded-lg transition-all duration-200 border-2 border-red-500 border-opacity-50"
                        title="Pierna Izquierda"
                      />
                      <button
                        onClick={() => handleBodyPartClick("legs")}
                        className="absolute top-[60%] right-[40%] w-8 h-20 bg-red-500 bg-opacity-20 hover:bg-opacity-40 rounded-lg transition-all duration-200 border-2 border-red-500 border-opacity-50"
                        title="Pierna Derecha"
                      />
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-lg">
                  <Info className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay imágenes disponibles</h3>
                  <p className="text-gray-600">
                    Sube imágenes de anatomía al bucket 'anatomia' en Supabase Storage para usar esta funcionalidad.
                  </p>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Áreas disponibles:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.values(bodyPartsData).map((bodyPart) => (
                  <button
                    key={bodyPart.id}
                    onClick={() => handleBodyPartClick(bodyPart.id)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white transition-colors text-left"
                  >
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm text-gray-700">{bodyPart.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Body Part Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedBodyPart && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Dumbbell className="mr-2 h-5 w-5" />
                  {selectedBodyPart.name}
                </DialogTitle>
                <DialogDescription>{selectedBodyPart.description}</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="muscles" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="muscles">Músculos</TabsTrigger>
                  <TabsTrigger value="exercises">Ejercicios</TabsTrigger>
                </TabsList>

                <TabsContent value="muscles" className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Músculos principales:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedBodyPart.muscles.map((muscle, index) => (
                        <Badge key={index} variant="outline">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="exercises" className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Ejercicios recomendados:</h4>
                    <div className="grid gap-4">
                      {selectedBodyPart.exercises.map((exercise) => (
                        <Card key={exercise.id}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-lg">{exercise.name}</CardTitle>
                              <Badge className={getDifficultyColor(exercise.difficulty)}>
                                {getDifficultyLabel(exercise.difficulty)}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 mb-3">{exercise.description}</p>
                            <div>
                              <span className="text-sm font-medium text-gray-700">Equipamiento: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {exercise.equipment.map((item, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
