"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter, MapPin, Truck, Search, FilterX, Check, ChevronsUpDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { motion, AnimatePresence } from "framer-motion"

interface LocationFilterProps {
  onFilterChange: (locations: string[]) => void
}

// Actualizar las listas de ubicaciones en el componente LocationFilter

// Lista de ubicaciones permitidas actualizada
const PARQUEADEROS = [
  "Parqueadero Urumita",
  "Parqueadero Villanueva",
  "Parqueadero San Juan",
  "Parqueadero Valledupar",
  "Parqueadero Fonseca",
  "Parqueadero Barrancas",
  "Parqueadero Hatonuevo",
  "Parqueadero Albania",
  "Parqueadero Maicao",
  "Parqueadero Riohacha",
  "Parqueadero Alojamiento",
  "Parqueadero Waya",
  "Parqueadero Uribia",
  "Parqueadero Tomarrazon",
]

const CAMBIADEROS = [
  "Cambiadero Oreganal",
  "Cambiadero Patilla",
  "Cambiadero Annex",
  "Cambiadero La Puente",
  "Cambiadero Change House",
]

// Actualizar el mapeo de normalización para que coincida con la macro
const LOCATION_NORMALIZATION: Record<string, string> = {
  "Hotel Waya": "Parqueadero Waya",
  "Parqueadero San Juan 2": "Parqueadero San Juan",
  "Fonseca Zona Urbana-30 Km/h, Parqueadero Fonseca Temporal": "Parqueadero Fonseca",
  "PC42.In-Out Parqueadero Fonseca Temporal": "Parqueadero Fonseca",
  "Fonseca Zona Urbana-30 Km/h, Parqueadero Fonseca": "Parqueadero Fonseca",
  "Fonseca Zona Urbana-30 Km/h, Parqueadero Fonseca-MANT": "Parqueadero Fonseca",
  "Paqueadero Hato Nuevo": "Parqueadero Hatonuevo",
  "PC43.In-Out Parqueadero Maicao": "Parqueadero Maicao",
  "Alojamiento, Area De Servicios Varios (ASV)- 40 Km/h": "Parqueadero Alojamiento",
  Lavalin: "Parqueadero Alojamiento",
  "comunidad Soporte a Uribia": "Parqueadero Uribia",
  "Parqueadero Uribia 2": "Parqueadero Uribia",
  "Parqueadero Tomarrazon": "Parqueadero Tomarrazon",
  Tomarrazon: "Parqueadero Tomarrazon",
}

export default function LocationFilter({ onFilterChange }: LocationFilterProps) {
  // Lista de ubicaciones permitidas unificadas
  // const PARQUEADEROS = [
  //   "Parqueadero Fonseca",
  //   "Parqueadero Villanueva",
  //   "Parqueadero Valledupar",
  //   "Parqueadero Hato Nuevo",
  //   "Parqueadero San Juan",
  //   "Parqueadero Barrancas",
  //   "Parqueadero Mina Buses Blancos",
  //   "Parqueadero Urumita",
  //   "Parqueadero Albania",
  //   "Parqueadero Riohacha",
  //   "Parqueadero Maicao",
  //   "Parqueadero Tomarrazon, Tomarrazon",
  //   "comunidad Soporte a Uribia, Parqueadero Uribia 2",
  // ]

  // const CAMBIADEROS = [
  //   "Cambiadero Patilla, Mina-60 Km/h",
  //   "Cambiadero Change House, Vias Administrativos- 45Km/h",
  //   "Cambiadero Change House, PC20.Administrativo 1, Vias Administrativos- 45Km/h",
  //   "Cambiadero Oreganal, Mina-60 Km/h, PCT5.Tajo Oreganal,Tajo100,Tajo Comuneros",
  //   "Cambiadero Annex, Mina-60 Km/h, PCT7-Tajo Tabaco",
  //   "Cambiadero Change House, Estación de Residuos. Changue Hause, Vias Administrativos- 45Km/h",
  //   "Cambiadero La Puente, Mina-60 Km/h",
  //   "Mina-60 Km/h, PC47.In-Out Cambiadero La Puente",
  // ]

  // Estado para los filtros
  const [selectedLocations, setSelectedLocations] = useState<string[]>([...PARQUEADEROS, ...CAMBIADEROS])
  const [filterType, setFilterType] = useState<"all" | "parqueaderos" | "cambiaderos" | "custom">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isCollapsed, setIsCollapsed] = useState(true)

  // Filtrar ubicaciones basado en el término de búsqueda
  const filteredParqueaderos = PARQUEADEROS.filter((location) =>
    location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredCambiaderos = CAMBIADEROS.filter((location) =>
    location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Función para manejar cambios en los filtros
  const handleFilterChange = (type: "all" | "parqueaderos" | "cambiaderos" | "custom") => {
    let newLocations: string[] = []

    switch (type) {
      case "all":
        newLocations = [...PARQUEADEROS, ...CAMBIADEROS]
        break
      case "parqueaderos":
        newLocations = [...PARQUEADEROS]
        break
      case "cambiaderos":
        newLocations = [...CAMBIADEROS]
        break
      case "custom":
        // Mantener la selección actual
        return
    }

    setSelectedLocations(newLocations)
    setFilterType(type)
    onFilterChange(newLocations)
  }

  // Función para manejar cambios en ubicaciones individuales
  const handleLocationToggle = (location: string) => {
    let newLocations: string[]

    if (selectedLocations.includes(location)) {
      newLocations = selectedLocations.filter((loc) => loc !== location)
    } else {
      newLocations = [...selectedLocations, location]
    }

    setSelectedLocations(newLocations)
    setFilterType("custom")
    onFilterChange(newLocations)
  }

  return (
    <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader className="pb-2">
          <CollapsibleTrigger asChild>
            <div className="flex w-full justify-between items-center cursor-pointer">
              <CardTitle className="flex items-center gap-2 cursor-pointer">
                <Filter className="h-5 w-5 text-primary" />
                Filtro de Ubicaciones
                <Badge className="ml-2">{selectedLocations.length}</Badge>
              </CardTitle>
              <ChevronsUpDown
                className="h-4 w-4 text-muted-foreground transition-transform duration-200"
                style={{ transform: isCollapsed ? "rotate(0deg)" : "rotate(180deg)" }}
              />
            </div>
          </CollapsibleTrigger>
          <CardDescription>Selecciona las ubicaciones que deseas incluir en el análisis</CardDescription>
        </CardHeader>

        <CollapsibleContent>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("all")}
                  className="transition-all"
                >
                  <Check className={`mr-2 h-4 w-4 ${filterType === "all" ? "opacity-100" : "opacity-0"}`} />
                  Todas las ubicaciones
                </Button>
                <Button
                  variant={filterType === "parqueaderos" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("parqueaderos")}
                  className="flex items-center gap-1 transition-all"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Solo Parqueaderos
                </Button>
                <Button
                  variant={filterType === "cambiaderos" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("cambiaderos")}
                  className="flex items-center gap-1 transition-all"
                >
                  <Truck className="h-3.5 w-3.5" />
                  Solo Cambiaderos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedLocations([])
                    setFilterType("custom")
                    onFilterChange([])
                  }}
                  className="ml-auto text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  <FilterX className="mr-2 h-3.5 w-3.5" />
                  Desmarcar todo
                </Button>
              </div>

              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar ubicaciones..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-primary" />
                      Parqueaderos
                    </h4>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="ml-1">
                        {filteredParqueaderos.length}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => {
                            const allSelected = filteredParqueaderos.every((p) => selectedLocations.includes(p))
                            const newLocations = allSelected
                              ? selectedLocations.filter((loc) => !PARQUEADEROS.includes(loc))
                              : [...new Set([...selectedLocations, ...filteredParqueaderos])]

                            setSelectedLocations(newLocations)
                            setFilterType("custom")
                            onFilterChange(newLocations)
                          }}
                        >
                          {filteredParqueaderos.every((p) => selectedLocations.includes(p))
                            ? "Desmarcar todos"
                            : "Marcar todos"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <ScrollArea className="h-[200px] rounded-md border p-2">
                        {filteredParqueaderos.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center p-4">
                            <Search className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              No se encontraron parqueaderos con ese nombre
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {filteredParqueaderos.map((location, index) => (
                              <motion.div
                                key={location}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="flex items-center space-x-2 hover:bg-muted/50 p-1.5 rounded transition-colors"
                              >
                                <Checkbox
                                  id={`loc-${location}`}
                                  checked={selectedLocations.includes(location)}
                                  onCheckedChange={() => handleLocationToggle(location)}
                                  className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                />
                                <Label
                                  htmlFor={`loc-${location}`}
                                  className="text-sm leading-none cursor-pointer w-full truncate"
                                >
                                  {location}
                                </Label>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium flex items-center gap-1">
                      <Truck className="h-4 w-4 text-primary" />
                      Cambiaderos
                    </h4>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="ml-1">
                        {filteredCambiaderos.length}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => {
                            const allSelected = filteredCambiaderos.every((c) => selectedLocations.includes(c))
                            const newLocations = allSelected
                              ? selectedLocations.filter((loc) => !CAMBIADEROS.includes(loc))
                              : [...new Set([...selectedLocations, ...filteredCambiaderos])]

                            setSelectedLocations(newLocations)
                            setFilterType("custom")
                            onFilterChange(newLocations)
                          }}
                        >
                          {filteredCambiaderos.every((c) => selectedLocations.includes(c))
                            ? "Desmarcar todos"
                            : "Marcar todos"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <ScrollArea className="h-[200px] rounded-md border p-2">
                        {filteredCambiaderos.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center p-4">
                            <Search className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              No se encontraron cambiaderos con ese nombre
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {filteredCambiaderos.map((location, index) => (
                              <motion.div
                                key={location}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="flex items-center space-x-2 hover:bg-muted/50 p-1.5 rounded transition-colors"
                              >
                                <Checkbox
                                  id={`loc-${location}`}
                                  checked={selectedLocations.includes(location)}
                                  onCheckedChange={() => handleLocationToggle(location)}
                                  className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                />
                                <Label
                                  htmlFor={`loc-${location}`}
                                  className="text-sm leading-none cursor-pointer w-full truncate"
                                >
                                  {location}
                                </Label>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 pt-0 border-t">
            <div className="flex items-center justify-between w-full pt-4">
              <div className="text-sm text-muted-foreground">{selectedLocations.length} ubicaciones seleccionadas</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedLocations([...PARQUEADEROS, ...CAMBIADEROS])
                  setFilterType("all")
                  onFilterChange([...PARQUEADEROS, ...CAMBIADEROS])
                }}
              >
                Restablecer todo
              </Button>
            </div>

            {selectedLocations.length > 0 && selectedLocations.length < PARQUEADEROS.length + CAMBIADEROS.length && (
              <div className="p-2 bg-muted rounded-md text-sm">
                <p className="font-medium">Trayectos filtrados:</p>
                <p className="text-muted-foreground">
                  Solo se mostrarán trayectos donde el origen y destino estén entre las {selectedLocations.length}{" "}
                  ubicaciones seleccionadas.
                </p>
              </div>
            )}

            {selectedLocations.length === 0 && (
              <div className="p-2 bg-destructive/10 text-destructive rounded-md text-sm">
                <p className="font-medium">¡Atención! No hay ubicaciones seleccionadas</p>
                <p>No se mostrarán trayectos. Selecciona al menos una ubicación para ver datos.</p>
              </div>
            )}
          </CardFooter>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
