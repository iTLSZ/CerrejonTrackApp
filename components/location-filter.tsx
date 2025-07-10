"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter, MapPin, Truck, Search, FilterX, Check, ChevronsUpDown, AlertTriangle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { motion, AnimatePresence } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface LocationFilterProps {
  onFilterChange: (locations: string[]) => void
  selectedCambiadero?: string // Nuevo prop para restricciones
}

// Lista de ubicaciones permitidas actualizada con los nuevos cambiaderos
const PARQUEADEROS = [
  "Parqueadero Urumita",
  "Parqueadero Villanueva",
  "Parqueadero San Juan",
  "Parqueadero Valledupar",
  "Parqueadero Fonseca",
  "Parqueadero Barrancas",
  "Parqueadero HatoNuevo",
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
  "Cambiadero 5x2",
]

// RESTRICCIONES DE PARQUEADEROS POR CAMBIADERO
const PARQUEADEROS_SOLO_CHANGE_HOUSE = [
  "Parqueadero Uribia",
  "Parqueadero Tomarrazon", 
  "Parqueadero Alojamiento"
]

const PARQUEADEROS_AMBOS_CAMBIADEROS = [
  "Parqueadero Urumita",
  "Parqueadero Villanueva", 
  "Parqueadero San Juan",
  "Parqueadero Valledupar",
  "Parqueadero Fonseca",
  "Parqueadero Barrancas",
  "Parqueadero HatoNuevo",
  "Parqueadero Albania",
  "Parqueadero Maicao",
  "Parqueadero Riohacha"
]

// Función para obtener parqueaderos permitidos según el cambiadero
const getParqueaderosForCambiadero = (cambiadero?: string): string[] => {
  if (cambiadero === "Cambiadero 5x2") {
    return PARQUEADEROS_AMBOS_CAMBIADEROS
  } else if (cambiadero === "Cambiadero Change House") {
    return [...PARQUEADEROS_AMBOS_CAMBIADEROS, ...PARQUEADEROS_SOLO_CHANGE_HOUSE]
  } else {
    // Para otros cambiaderos o sin selección, permitir todos los parqueaderos
    return PARQUEADEROS
  }
}

// Función para verificar si un parqueadero puede usar un cambiadero específico
const canParqueaderoUseCambiadero = (parqueadero: string, cambiadero?: string): boolean => {
  if (cambiadero === "Cambiadero 5x2") {
    return !PARQUEADEROS_SOLO_CHANGE_HOUSE.includes(parqueadero)
  }
  return true // Otros cambiaderos permiten todos los parqueaderos
}

export default function LocationFilter({ onFilterChange, selectedCambiadero }: LocationFilterProps) {
  // Obtener parqueaderos permitidos basado en el cambiadero seleccionado
  const allowedParqueaderos = getParqueaderosForCambiadero(selectedCambiadero)
  
  // Estado para los filtros
  const [selectedLocations, setSelectedLocations] = useState<string[]>([...allowedParqueaderos, ...CAMBIADEROS])
  const [filterType, setFilterType] = useState<"all" | "parqueaderos" | "cambiaderos" | "custom">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isCollapsed, setIsCollapsed] = useState(true)

  // Efecto para actualizar ubicaciones seleccionadas cuando cambia el cambiadero
  useEffect(() => {
    const newAllowedParqueaderos = getParqueaderosForCambiadero(selectedCambiadero)
    
    // Filtrar ubicaciones seleccionadas para mantener solo las permitidas
    const filteredSelectedLocations = selectedLocations.filter(location => 
      newAllowedParqueaderos.includes(location) || CAMBIADEROS.includes(location)
    )
    
    // Si hay ubicaciones que fueron filtradas, actualizar el estado
    if (filteredSelectedLocations.length !== selectedLocations.length) {
      setSelectedLocations(filteredSelectedLocations)
      onFilterChange(filteredSelectedLocations)
    }
  }, [selectedCambiadero])

  // Filtrar ubicaciones basado en el término de búsqueda y restricciones
  const filteredParqueaderos = allowedParqueaderos.filter((location) =>
    location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCambiaderos = CAMBIADEROS.filter((location) =>
    location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Función para manejar cambios en los filtros
  const handleFilterChange = (type: "all" | "parqueaderos" | "cambiaderos" | "custom") => {
    let newLocations: string[] = []

    switch (type) {
      case "all":
        newLocations = [...allowedParqueaderos, ...CAMBIADEROS]
        break
      case "parqueaderos":
        newLocations = [...allowedParqueaderos]
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

  // Obtener parqueaderos restringidos para mostrar información
  const restrictedParqueaderos = selectedCambiadero === "Cambiadero 5x2" ? PARQUEADEROS_SOLO_CHANGE_HOUSE : []

  return (
    <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardHeader className="pb-2">
          <CollapsibleTrigger asChild>
            <div className="flex w-full justify-between items-center cursor-pointer">
              <CardTitle className="flex items-center gap-2 cursor-pointer">
                <Filter className="h-5 w-5 text-primary" />
                Filtro de Ubicaciones (Incluye Change House y 5x2)
                <Badge className="ml-2">{selectedLocations.length}</Badge>
                {restrictedParqueaderos.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {restrictedParqueaderos.length} restringidos
                  </Badge>
                )}
              </CardTitle>
              <ChevronsUpDown
                className="h-4 w-4 text-muted-foreground transition-transform duration-200"
                style={{ transform: isCollapsed ? "rotate(0deg)" : "rotate(180deg)" }}
              />
            </div>
          </CollapsibleTrigger>
          <CardDescription>
            Selecciona las ubicaciones que deseas incluir en el análisis con separación de cambiaderos
            {selectedCambiadero && ` - Filtrado para: ${selectedCambiadero}`}
          </CardDescription>
        </CardHeader>

        <CollapsibleContent>
          <CardContent>
            <div className="space-y-4">
              {/* Alerta de restricciones cuando se selecciona 5x2 */}
              {restrictedParqueaderos.length > 0 && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="text-orange-800">Restricciones Activas para {selectedCambiadero}</AlertTitle>
                  <AlertDescription className="text-orange-700">
                    Los siguientes parqueaderos están restringidos y no aparecen en la lista: {restrictedParqueaderos.join(", ")}. 
                    Estos parqueaderos solo pueden usar "Cambiadero Change House".
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("all")}
                  className="transition-all"
                >
                  <Check className={`mr-2 h-4 w-4 ${filterType === "all" ? "opacity-100" : "opacity-0"}`} />
                  Todas las ubicaciones permitidas
                </Button>
                <Button
                  variant={filterType === "parqueaderos" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("parqueaderos")}
                  className="flex items-center gap-1 transition-all"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Solo Parqueaderos ({allowedParqueaderos.length})
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
                      Parqueaderos Permitidos
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
                              ? selectedLocations.filter((loc) => !allowedParqueaderos.includes(loc))
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
                                  {selectedCambiadero === "Cambiadero 5x2" && PARQUEADEROS_AMBOS_CAMBIADEROS.includes(location) && (
                                    <Badge variant="outline" className="ml-1 text-xs">
                                      ✓ Permitido
                                    </Badge>
                                  )}
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
                                  {location === "Cambiadero Change House" && (
                                    <Badge variant="outline" className="ml-1 text-xs">
                                      7PM
                                    </Badge>
                                  )}
                                  {location === "Cambiadero 5x2" && (
                                    <Badge variant="secondary" className="ml-1 text-xs">
                                      5PM
                                    </Badge>
                                  )}
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
              <div className="text-sm text-muted-foreground">
                {selectedLocations.length} ubicaciones seleccionadas
                {restrictedParqueaderos.length > 0 && (
                  <span className="text-orange-600 ml-2">
                    ({restrictedParqueaderos.length} restringidos para {selectedCambiadero})
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedLocations([...allowedParqueaderos, ...CAMBIADEROS])
                  setFilterType("all")
                  onFilterChange([...allowedParqueaderos, ...CAMBIADEROS])
                }}
              >
                Restablecer todo
              </Button>
            </div>

            {selectedLocations.length > 0 && selectedLocations.length < allowedParqueaderos.length + CAMBIADEROS.length && (
              <div className="p-2 bg-muted rounded-md text-sm">
                <p className="font-medium">Trayectos filtrados con separación de cambiaderos:</p>
                <p className="text-muted-foreground">
                  Solo se mostrarán trayectos donde el origen y destino estén entre las {selectedLocations.length}{" "}
                  ubicaciones seleccionadas. La separación Change House/5x2 se aplicará automáticamente.
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
