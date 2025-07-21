"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Upload,
  FileSpreadsheet,
  BarChart3,
  Map,
  ArrowRight,
  FileCheck,
  Database,
  Check,
  AlertTriangle,
  Info,
  Download,
  ChevronRight,
  Search,
  Loader2,
  ExternalLink,
  Clock,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

// Importar componentes
import LocationFilter from "../components/location-filter"
import RouteSummary from "../components/route-summary"
import StatsCard from "../components/stats-card"



// Lista válida de ubicaciones permitidas (actualizada con los nuevos cambiaderos)
const ALLOWED_LOCATIONS = [
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
  "Cambiadero Oreganal",
  "Cambiadero Patilla",
  "Cambiadero Annex",
  "Cambiadero La Puente",
  "Cambiadero Change House",
  "Cambiadero 5x2",
]

// RESTRICCIONES DE PARQUEADEROS POR CAMBIADERO
// Parqueaderos que NO pueden usar el cambiadero 5x2 (solo Change House)
const PARQUEADEROS_SOLO_CHANGE_HOUSE = [
  "Parqueadero Uribia",
  "Parqueadero Tomarrazon", 
  "Parqueadero Alojamiento"
]

// Parqueaderos que pueden usar tanto Change House como 5x2
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
const getParqueaderosForCambiadero = (cambiadero: string): string[] => {
  if (cambiadero === "Cambiadero 5x2") {
    // 5x2 SOLO puede ser usado por parqueaderos que NO están en la lista de restringidos
    return PARQUEADEROS_AMBOS_CAMBIADEROS
  } else if (cambiadero === "Cambiadero Change House") {
    // Change House puede ser usado por TODOS los parqueaderos
    return [...PARQUEADEROS_AMBOS_CAMBIADEROS, ...PARQUEADEROS_SOLO_CHANGE_HOUSE]
  } else {
    // Para otros cambiaderos, permitir todos los parqueaderos
    return ALLOWED_LOCATIONS.filter(loc => loc.startsWith("Parqueadero"))
  }
}

// Función para verificar si un parqueadero puede usar un cambiadero específico
const canParqueaderoUseCambiadero = (parqueadero: string, cambiadero: string): boolean => {
  // Los parqueaderos restringidos SOLO pueden usar Change House
  if (PARQUEADEROS_SOLO_CHANGE_HOUSE.includes(parqueadero)) {
    return cambiadero === "Cambiadero Change House"
  }
  
  // Para cambiadero 5x2, verificar que no esté en la lista de restringidos
  if (cambiadero === "Cambiadero 5x2") {
    return !PARQUEADEROS_SOLO_CHANGE_HOUSE.includes(parqueadero)
  }
  
  return true // Otros cambiaderos permiten todos los parqueaderos
}

// Diccionario de reemplazos específicos (actualizado)
const LOCATION_NORMALIZATION: Record<string, string> = {
  "Hotel Waya": "Parqueadero Waya",
  "Parqueadero San Juan 2": "Parqueadero San Juan",
  "Fonseca Zona Urbana-30 Km/h, Parqueadero Fonseca Temporal": "Parqueadero Fonseca",
  "PC42.In-Out Parqueadero Fonseca Temporal": "Parqueadero Fonseca",
  "Fonseca Zona Urbana-30 Km/h, Parqueadero Fonseca": "Parqueadero Fonseca",
  "Fonseca Zona Urbana-30 Km/h, Parqueadero Fonseca-MANT": "Parqueadero Fonseca",
  "Parqueadero Hato Nuevo": "Parqueadero HatoNuevo",
  "PC43.In-Out Parqueadero Maicao": "Parqueadero Maicao",
  "Parqueadero Maicao": "Parqueadero Maicao",
  "Alojamiento, Area De Servicios Varios (ASV)- 40 Km/h": "Parqueadero Alojamiento",
  Lavalin: "Parqueadero Alojamiento",
  "comunidad Soporte a Uribia": "Parqueadero Uribia",
  "Parqueadero Uribia 2": "Parqueadero Uribia",
  "Parqueadero Tomarrazon": "Parqueadero Tomarrazon",
  Tomarrazon: "Parqueadero Tomarrazon",

  // Nuevos reemplazos para Cambiaderos
  "Cambiadero Annex, Mina-60 Km/h, PCT7-Tajo Tabaco": "Cambiadero Annex",
  "Mina-60 Km/h, PCT7-Tajo Tabaco": "Cambiadero Annex",

  "Cambiadero Change House, Vias Administrativos- 45Km/h": "Cambiadero Change House",
  "Cambiadero Change House, PC20.Administrativo 1, Vias Administrativos- 45Km/h": "Cambiadero Change House",
  "Cambiadero Change House, Parqueadero Administrativo 2, Vias Administrativos- 45Km/h": "Cambiadero Change House",

  "Cambiadero La Puente, Mina-60 Km/h": "Cambiadero La Puente",
  "Cambiadero Patilla, Mina-60 Km/h": "Cambiadero Patilla",
  "Cambiadero Oreganal, Mina-60 Km/h, PCT5.Tajo Oreganal,Tajo100,Tajo Comuneros": "Cambiadero Oreganal",

  // Reemplazos para Valledupar
  "80, 200008 Valledupar, Colombia": "Parqueadero Valledupar",
  "Carrera 22 BIS, 200005 Valledupar, Colombia": "Parqueadero Valledupar",
  "Valledupar Zona Urbana": "Parqueadero Valledupar",
}

// HORARIOS DE REFERENCIA PARA SEPARACIÓN DE CAMBIADEROS

// Horarios de ida (población → cambiadero) - Formato 24h
const OUTBOUND_SCHEDULES = {
  "Parqueadero Urumita": { "Change House": "04:10:00", "5x2": "05:05:00" },
  "Parqueadero Villanueva": { "Change House": "04:15:00", "5x2": "05:10:00" },
  "Parqueadero San Juan": { "Change House": "04:35:00", "5x2": "05:35:00" },
  "Parqueadero Valledupar": { "Change House": "03:45:00", "5x2": "04:45:00" },
  "Parqueadero Fonseca": { "Change House": "05:00:00", "5x2": "06:00:00" },
  "Parqueadero Barrancas": { "Change House": "05:10:00", "5x2": "06:10:00" },
  "Parqueadero HatoNuevo": { "Change House": "05:20:00", "5x2": "06:20:00" },
  "Parqueadero Riohacha": { "Change House": "04:30:00", "5x2": "05:20:00" },
  "Parqueadero Maicao": { "Change House": "05:00:00", "5x2": "05:50:00" },
  "Parqueadero Uribia": { "Change House": "04:20:00", "5x2": null },
  "Parqueadero Tomarrazon": { "Change House": "04:40:00", "5x2": null },
  "Parqueadero Albania": { "Change House": "05:30:00", "5x2": "06:40:00" },
  "Parqueadero Alojamiento": { "Change House": "05:40:00", "5x2": null },
}

// Horarios de vuelta (cambiadero → población) - Formato 24h
const RETURN_SCHEDULES = {
  "Change House": "19:00:00", // 7:00 PM
  "5x2": "17:00:00", // 5:00 PM
}

// Función para parsear hora del CSV (actualizada para formato 24h)
function parseExcelTime(timeStr: string): number | null {
  if (!timeStr || typeof timeStr !== "string") return null
  
  const clean = timeStr.trim()
  
  // Primero intentar formato 24 horas: HH:mm:ss (ej: 06:08:27, 15:38:30)
  const format24Match = clean.match(/^(\d{1,2}):(\d{2}):(\d{2})$/)
  if (format24Match) {
    const [_, hourStr, minStr, secStr] = format24Match
    const hour = parseInt(hourStr, 10)
    const min = parseInt(minStr, 10)
    const sec = parseInt(secStr, 10)
    
    // Validar rangos
    if (hour >= 0 && hour <= 23 && min >= 0 && min <= 59 && sec >= 0 && sec <= 59) {
      const result = hour * 60 + min + sec / 60 // minutos decimales
      console.log(`✅ Hora parseada (24h): "${timeStr}" -> ${hour}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')} = ${result} minutos`)
      return result
    }
  }
  
  // Fallback: formato AM/PM para compatibilidad (ej: "4:10:00 a. m.")
  const cleanAmPm = clean.replace(/[\.\s]+/g, " ").replace(/([ap]) m/, "$1m")
  const formatAmPmMatch = cleanAmPm.match(/^(\d{1,2}):(\d{2}):(\d{2})\s([ap]m)$/i)
  if (formatAmPmMatch) {
    let [_, hourStr, minStr, secStr, period] = formatAmPmMatch
    const hourNum = parseInt(hourStr, 10)
    const minNum = parseInt(minStr, 10)
    const secNum = parseInt(secStr, 10)
    let hour = hourNum
    if (period.toLowerCase() === "pm" && hour !== 12) hour += 12
    if (period.toLowerCase() === "am" && hour === 12) hour = 0
    const result = hour * 60 + minNum + secNum / 60 // minutos decimales
    console.log(`✅ Hora parseada (AM/PM): "${timeStr}" -> ${hour}:${minNum}:${secNum} ${period} = ${result} minutos`)
    return result
  }
  
  console.log(`❌ No se pudo parsear la hora: "${timeStr}" (formatos soportados: HH:mm:ss o h:mm:ss a.m./p.m.)`)
  return null
}

// Función para parsear hora de referencia (usa la misma lógica que parseExcelTime)
function parseReferenceTime(timeStr: string): number {
  return parseExcelTime(timeStr) ?? 0
}

// Función mejorada para determinar el cambiadero basado en horario según especificaciones exactas
function determineCambiadero(
  origin: string,
  destination: string,
  departureTime: string,
): { cambiadero: string | null; reason: string; isValid: boolean; category: string } {
  console.log(`🔍 Analizando separación: ${origin} → ${destination} a las ${departureTime}`)
  
  // PASO 1: Validar que el horario esté disponible
  if (!departureTime || departureTime.trim() === "") {
    return {
      cambiadero: null,
      reason: "Sin horario para clasificar",
      isValid: false,
      category: "sin_horario"
    }
  }

  const parsedTime = parseExcelTime(departureTime)
  if (parsedTime === null) {
    return {
      cambiadero: null,
      reason: `Formato de hora inválido: ${departureTime}`,
      isValid: false,
      category: "formato_invalido"
    }
  }

  // PASO 2: Verificar restricciones de parqueaderos para 5x2 ANTES de cualquier análisis
  const involvedParqueadero = origin.startsWith("Parqueadero") ? origin : destination.startsWith("Parqueadero") ? destination : null
  
  if (involvedParqueadero && PARQUEADEROS_SOLO_CHANGE_HOUSE.includes(involvedParqueadero)) {
    // Estos parqueaderos SOLO pueden usar Change House, nunca 5x2
    if (destination === "Cambiadero 5x2" || origin === "Cambiadero 5x2") {
      return {
        cambiadero: null,
        reason: `❌ ${involvedParqueadero} no puede usar Cambiadero 5x2 (restringido)`,
        isValid: false,
        category: "parqueadero_restringido_5x2"
      }
    }
    // Si es hacia/desde Change House, forzar asignación a Change House
    if (destination === "Cambiadero Change House" || origin === "Cambiadero Change House") {
      return {
        cambiadero: "Cambiadero Change House",
        reason: `✅ ${involvedParqueadero} asignado a Change House (único cambiadero permitido)`,
        isValid: true,
        category: "parqueadero_forzado_change_house"
      }
    }
  }

  // PASO 3: Identificar si es un trayecto que involucra Change House (aplicar criterios de aplicación)
  const isOutboundToChangeHouse = origin.startsWith("Parqueadero") && 
    (destination === "Cambiadero Change House" || destination === "Cambiadero 5x2")
  const isReturnFromChangeHouse = 
    (origin === "Cambiadero Change House" || origin === "Cambiadero 5x2") && 
    destination.startsWith("Parqueadero")

  const isRelevant = isOutboundToChangeHouse || isReturnFromChangeHouse

  if (!isRelevant) {
    return {
      cambiadero: null,
      reason: "No aplica separación por horario (no es Change House ni 5x2)",
      isValid: true,
      category: "no_aplica"
    }
  }

  // PASO 4: Aplicar algoritmo de clasificación según especificaciones
  if (isOutboundToChangeHouse) {
    // VIAJES DE IDA: Población → Cambiadero
    // Fuente: Horario de salida desde la POBLACIÓN (origen)
    // Tolerancia: ±15 minutos
    
    const populationSchedules = OUTBOUND_SCHEDULES[origin as keyof typeof OUTBOUND_SCHEDULES]
    if (!populationSchedules) {
      return {
        cambiadero: null,
        reason: `Sin horarios definidos para ${origin}`,
        isValid: false,
        category: "sin_horarios_poblacion"
      }
    }

    const tolerance = 15 // ±15 minutos para viajes de ida 
    let matches: { cambiadero: string; diff: number; refHour: string }[] = []

    // Verificar Change House
    if (populationSchedules["Change House"]) {
      const refTime = parseExcelTime(populationSchedules["Change House"])
      if (refTime !== null) {
        const diff = Math.abs(parsedTime - refTime)
        matches.push({ 
          cambiadero: "Cambiadero Change House", 
          diff, 
          refHour: populationSchedules["Change House"] 
        })
      }
    }

    // Verificar 5x2 (solo si está definido para esa población Y no está restringido)
    if (populationSchedules["5x2"] && !PARQUEADEROS_SOLO_CHANGE_HOUSE.includes(origin)) {
      const refTime = parseExcelTime(populationSchedules["5x2"])
      if (refTime !== null) {
        const diff = Math.abs(parsedTime - refTime)
        matches.push({ 
          cambiadero: "Cambiadero 5x2", 
          diff, 
          refHour: populationSchedules["5x2"] 
        })
      }
    }

    // Buscar coincidencias dentro de tolerancia
    const inRange = matches.filter((m) => m.diff <= tolerance)
    
    if (inRange.length === 1) {
      // Verificación final: asegurar que parqueaderos restringidos no sean asignados a 5x2
      if (inRange[0].cambiadero === "Cambiadero 5x2" && PARQUEADEROS_SOLO_CHANGE_HOUSE.includes(origin)) {
        return {
          cambiadero: "Cambiadero Change House",
          reason: `❌ ${origin} no puede usar 5x2 - forzado a Change House`,
          isValid: true,
          category: "ida_forzado_change_house"
        }
      }
      
      return {
        cambiadero: inRange[0].cambiadero,
        reason: `Clasificado como ${inRange[0].cambiadero} por horario ${departureTime} desde ${origin} (±${tolerance} min de ${inRange[0].refHour})`,
        isValid: true,
        category: "ida_asignado"
      }
    } else if (inRange.length > 1) {
      // Resolución de conflictos: asignar al más cercano, pero verificar restricciones
      let best = inRange.reduce((a, b) => (a.diff < b.diff ? a : b))
      
      // Si el mejor candidato es 5x2 pero el parqueadero está restringido, usar Change House
      if (best.cambiadero === "Cambiadero 5x2" && PARQUEADEROS_SOLO_CHANGE_HOUSE.includes(origin)) {
        const changeHouseOption = inRange.find(option => option.cambiadero === "Cambiadero Change House")
        if (changeHouseOption) {
          best = changeHouseOption
          return {
            cambiadero: best.cambiadero,
            reason: `❌ ${origin} no puede usar 5x2 - asignado a Change House por restricción`,
            isValid: true,
            category: "ida_forzado_por_restriccion"
          }
        }
      }
      
      return {
        cambiadero: best.cambiadero,
        reason: `Clasificado como ${best.cambiadero} por proximidad temporal desde ${origin} (diferencia: ${best.diff.toFixed(1)} min)`,
        isValid: true,
        category: "ida_conflicto_resuelto"
      }
    } else {
      return {
        cambiadero: null,
        reason: `Horario ${departureTime} desde ${origin} fuera de rango (±${tolerance} min)`,
        isValid: false,
        category: "ida_fuera_rango"
      }
    }
    
  } else if (isReturnFromChangeHouse) {
    // VIAJES DE VUELTA: Cambiadero → Población
    // Fuente: Horario de salida desde el CAMBIADERO (origen)
    // Tolerancia: ±15 minutos
    
    const tolerance = 15 // ±15 minutos para viajes de vuelta
    let matches: { cambiadero: string; diff: number; refHour: string }[] = []

    // Verificar Change House (7:00 PM)
    const refCH = parseExcelTime(RETURN_SCHEDULES["Change House"])
    if (refCH !== null) {
      const diff = Math.abs(parsedTime - refCH)
      matches.push({ 
        cambiadero: "Cambiadero Change House", 
        diff, 
        refHour: RETURN_SCHEDULES["Change House"] 
      })
    }

    // Verificar 5x2 (5:00 PM) - Solo si el destino no está restringido
    if (!PARQUEADEROS_SOLO_CHANGE_HOUSE.includes(destination)) {
      const ref5x2 = parseExcelTime(RETURN_SCHEDULES["5x2"])
      if (ref5x2 !== null) {
        const diff = Math.abs(parsedTime - ref5x2)
        matches.push({ 
          cambiadero: "Cambiadero 5x2", 
          diff, 
          refHour: RETURN_SCHEDULES["5x2"] 
        })
      }
    }

    const inRange = matches.filter((m) => m.diff <= tolerance)
    
    if (inRange.length === 1) {
      // Verificación final: asegurar que parqueaderos restringidos no sean asignados a 5x2
      if (inRange[0].cambiadero === "Cambiadero 5x2" && PARQUEADEROS_SOLO_CHANGE_HOUSE.includes(destination)) {
        return {
          cambiadero: "Cambiadero Change House",
          reason: `❌ ${destination} no puede usar 5x2 - forzado a Change House`,
          isValid: true,
          category: "vuelta_forzado_change_house"
        }
      }
      
      return {
        cambiadero: inRange[0].cambiadero,
        reason: `Clasificado como ${inRange[0].cambiadero} por horario de salida ${departureTime} (±${tolerance} min de ${inRange[0].refHour})`,
        isValid: true,
        category: "vuelta_asignado"
      }
    } else if (inRange.length > 1) {
      // Resolución de conflictos: asignar al más cercano, pero verificar restricciones
      let best = inRange.reduce((a, b) => (a.diff < b.diff ? a : b))
      
      // Si el mejor candidato es 5x2 pero el destino está restringido, usar Change House
      if (best.cambiadero === "Cambiadero 5x2" && PARQUEADEROS_SOLO_CHANGE_HOUSE.includes(destination)) {
        const changeHouseOption = inRange.find(option => option.cambiadero === "Cambiadero Change House")
        if (changeHouseOption) {
          best = changeHouseOption
          return {
            cambiadero: best.cambiadero,
            reason: `❌ ${destination} no puede usar 5x2 - asignado a Change House por restricción`,
            isValid: true,
            category: "vuelta_forzado_por_restriccion"
          }
        }
      }
      
      return {
        cambiadero: best.cambiadero,
        reason: `Clasificado como ${best.cambiadero} por proximidad temporal (diferencia: ${best.diff.toFixed(1)} min)`,
        isValid: true,
        category: "vuelta_conflicto_resuelto"
      }
    } else {
      return {
        cambiadero: null,
        reason: `Horario ${departureTime} fuera de rango para cambiaderos (±${tolerance} min)`,
        isValid: false,
        category: "vuelta_fuera_rango"
      }
    }
  }

  // Caso no contemplado
  return {
    cambiadero: null,
    reason: "Tipo de trayecto no reconocido para separación por horario",
    isValid: false,
    category: "no_reconocido"
  }
}

// Función para normalizar nombres de ubicaciones siguiendo la lógica de la macro
const normalizeLocation = (location: string): string => {
  if (!location || location.trim() === "") return ""

  const trimmedLocation = location.trim()

  // Primero revisar reemplazos específicos
  for (const [key, value] of Object.entries(LOCATION_NORMALIZATION)) {
    if (trimmedLocation.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }

  // Si no se encontró en reemplazos específicos, verificar en lista permitida
  for (const allowedLocation of ALLOWED_LOCATIONS) {
    if (trimmedLocation.toLowerCase().includes(allowedLocation.toLowerCase())) {
      return allowedLocation
    }
  }

  // Si no se encontró coincidencia, retornar cadena vacía (equivalente a ClearContents)
  return ""
}

// Función ultra-estricta para validar ubicaciones específicas
const validateLocationExact = (
  location: string,
): {
  isValid: boolean
  type: "Parqueadero" | "Cambiadero" | "Inválido"
  normalizedName: string
  reason?: string
} => {
  const normalized = normalizeLocation(location)

  if (!normalized || normalized === "") {
    return {
      isValid: false,
      type: "Inválido",
      normalizedName: "",
      reason: `Ubicación "${location}" no reconocida en la lista permitida`,
    }
  }

  // Verificar tipo exacto
  if (normalized.startsWith("Parqueadero ")) {
    const parkingName = normalized.replace("Parqueadero ", "")
    return {
      isValid: true,
      type: "Parqueadero",
      normalizedName: normalized,
      reason: `Parqueadero "${parkingName}" validado correctamente`,
    }
  } else if (normalized.startsWith("Cambiadero ")) {
    const changeName = normalized.replace("Cambiadero ", "")
    return {
      isValid: true,
      type: "Cambiadero",
      normalizedName: normalized,
      reason: `Cambiadero "${changeName}" validado correctamente`,
    }
  } else {
    return {
      isValid: false,
      type: "Inválido",
      normalizedName: normalized,
      reason: `Ubicación "${normalized}" no cumple con el formato esperado (Parqueadero/Cambiadero + Nombre)`,
    }
  }
}

// Lista de restricciones específicas de rutas no permitidas
const ROUTE_RESTRICTIONS = [
  {
    origin: "Cambiadero Annex",
    destination: "Parqueadero Fonseca",
    reason: "❌ Ruta no permitida: Cambiadero Annex no debe conectar con Parqueadero Fonseca",
  },
  
  {
    origin: "Parqueadero Fonseca",
    destination: "Cambiadero Annex",
    reason: "❌ Ruta no permitida: Parqueadero Fonseca no debe conectar con Cambiadero Annex",
  },
  {
    origin: "Parqueadero Alojamiento",
    destination: "Cambiadero Annex",
    reason: "❌ Ruta no permitida: Parqueadero Alojamiento no debe conectar con Cambiadero Annex",
  },
  {
    origin: "Cambiadero Annex",
    destination: "Parqueadero Alojamiento",
    reason: "❌ Ruta no permitida: Cambiadero Annex no debe conectar con Parqueadero Alojamiento",
  },
  {
    origin: "Parqueadero San Juan",
    destination: "Cambiadero Annex",
    reason: "❌ Ruta no permitida: Parqueadero San Juan no debe conectar con Cambiadero Annex",
  },
  {
    origin: "Cambiadero Annex",
    destination: "Parqueadero San Juan",
    reason: "❌ Ruta no permitida: Cambiadero Annex no debe conectar con Parqueadero San Juan",
  },
  {
    origin: "Parqueadero Uribia",
    destination: "Cambiadero 5x2",
    reason: "❌ Ruta no permitida: Parqueadero Uribia no debe conectar con Cambiadero 5x2",
  },
  {
    origin: "Cambiadero 5x2",
    destination: "Parqueadero Uribia",
    reason: "❌ Ruta no permitida: Cambiadero 5x2 no debe conectar con Parqueadero Uribia",
  },
  {
    origin: "Parqueadero Tomarrazon",
    destination: "Cambiadero 5x2",
    reason: "❌ Ruta no permitida: Parqueadero Tomarrazon no debe conectar con Cambiadero 5x2",
  },
  {
    origin: "Cambiadero 5x2",
    destination: "Parqueadero Tomarrazon",
    reason: "❌ Ruta no permitida: Cambiadero 5x2 no debe conectar con Parqueadero Tomarrazon",
  },
  {
    origin: "Parqueadero Alojamiento",
    destination: "Cambiadero 5x2",
    reason: "❌ Ruta no permitida: Parqueadero Alojamiento no debe conectar con Cambiadero 5x2",
  },
  {
    origin: "Cambiadero 5x2",
    destination: "Parqueadero Alojamiento",
    reason: "❌ Ruta no permitida: Cambiadero 5x2 no debe conectar con Parqueadero Alojamiento",
  },
  
  
  
]

// Función para verificar restricciones específicas de rutas
const checkRouteRestrictions = (
  origin: string,
  destination: string,
): {
  isRestricted: boolean
  reason?: string
} => {
  for (const restriction of ROUTE_RESTRICTIONS) {
    if (restriction.origin === origin && restriction.destination === destination) {
      return {
        isRestricted: true,
        reason: restriction.reason,
      }
    }
  }
  return { isRestricted: false }
}

// Función mejorada y más estricta para validar rutas Parqueadero ↔ Cambiadero
const isValidParqueaderoCambiaderoStrict = (
  origin: string,
  destination: string,
): {
  isValid: boolean
  direction: "Ida" | "Vuelta" | "Inválido"
  reason?: string
  originValidation?: ReturnType<typeof validateLocationExact>
  destinationValidation?: ReturnType<typeof validateLocationExact>
} => {
  // Verificar que ambas ubicaciones estén definidas y no vacías
  if (!origin || !destination || origin.trim() === "" || destination.trim() === "") {
    return {
      isValid: false,
      direction: "Inválido",
      reason: "Origen o destino vacío o no definido",
    }
  }

  // Validación ultra-estricta de ubicaciones individuales
  const originValidation = validateLocationExact(origin)
  const destinationValidation = validateLocationExact(destination)

  if (!originValidation.isValid) {
    return {
      isValid: false,
      direction: "Inválido",
      reason: `Origen inválido: ${originValidation.reason}`,
      originValidation,
      destinationValidation,
    }
  }

  if (!destinationValidation.isValid) {
    return {
      isValid: false,
      direction: "Inválido",
      reason: `Destino inválido: ${destinationValidation.reason}`,
      originValidation,
      destinationValidation,
    }
  }

  // Verificar que origen y destino sean diferentes
  if (originValidation.normalizedName === destinationValidation.normalizedName) {
    return {
      isValid: false,
      direction: "Inválido",
      reason: "Origen y destino son la misma ubicación",
      originValidation,
      destinationValidation,
    }
  }

  // VERIFICAR RESTRICCIONES ESPECÍFICAS DE RUTAS
  const restrictionCheck = checkRouteRestrictions(originValidation.normalizedName, destinationValidation.normalizedName)
  if (restrictionCheck.isRestricted) {
    return {
      isValid: false,
      direction: "Inválido",
      reason: restrictionCheck.reason,
      originValidation,
      destinationValidation,
    }
  }

  // VALIDACIÓN ESTRICTA DE TIPOS Y DIRECCIONES

  // CASO 1: Viaje de IDA - Parqueadero → Cambiadero (ULTRA ESTRICTO)
  if (originValidation.type === "Parqueadero" && destinationValidation.type === "Cambiadero") {
    return {
      isValid: true,
      direction: "Ida",
      reason: `✅ Viaje de IDA válido: ${originValidation.normalizedName} → ${destinationValidation.normalizedName}`,
      originValidation,
      destinationValidation,
    }
  }

  // CASO 2: Viaje de VUELTA - Cambiadero → Parqueadero (ULTRA ESTRICTO)
  if (originValidation.type === "Cambiadero" && destinationValidation.type === "Parqueadero") {
    return {
      isValid: true,
      direction: "Vuelta",
      reason: `✅ Viaje de VUELTA válido: ${originValidation.normalizedName} → ${destinationValidation.normalizedName}`,
      originValidation,
      destinationValidation,
    }
  }

  // CASOS INVÁLIDOS ESPECÍFICOS:

  // Parqueadero → Parqueadero
  if (originValidation.type === "Parqueadero" && destinationValidation.type === "Parqueadero") {
    return {
      isValid: false,
      direction: "Inválido",
      reason: `❌ Viaje entre Parqueaderos no permitido: ${originValidation.normalizedName} → ${destinationValidation.normalizedName}`,
      originValidation,
      destinationValidation,
    }
  }

  // Cambiadero → Cambiadero
  if (originValidation.type === "Cambiadero" && destinationValidation.type === "Cambiadero") {
    return {
      isValid: false,
      direction: "Inválido",
      reason: `❌ Viaje entre Cambiaderos no permitido: ${originValidation.normalizedName} → ${destinationValidation.normalizedName}`,
      originValidation,
      destinationValidation,
    }
  }

  // Cualquier otro caso no contemplado
  return {
    isValid: false,
    direction: "Inválido",
    reason: `❌ Tipo de viaje no válido: ${originValidation.type} → ${destinationValidation.type}`,
    originValidation,
    destinationValidation,
  }
}

// Tipo para representar un trayecto procesado
interface ProcessedTrip {
  asset: string
  origin: string
  destination: string
  totalDistance: number
  startRowIndex: number
  endRowIndex: number
  date?: string
  driver?: string
  intermediateRows: number[]
  departureTime?: string
  assignedCambiadero?: string
  cambiaderoReason?: string
}

// Función para formatear números en formato colombiano
const formatColombianNumber = (number: number, decimals = 2): string => {
  return number.toLocaleString("es-CO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export default function CSVAnalyzer() {
  const [csvData, setCsvData] = useState<string[][]>([])
  const [rawData, setRawData] = useState<string>("")
  const [headers, setHeaders] = useState<string[]>([])
  const [fileName, setFileName] = useState<string>("")
  const [query, setQuery] = useState<string>("")
  const [queryResults, setQueryResults] = useState<string[][]>([])
  const [activeTab, setActiveTab] = useState<string>("upload")
  const [isPreview, setIsPreview] = useState(false)
  const [delimiter, setDelimiter] = useState<string>(",")
  const [hasHeaderRow, setHasHeaderRow] = useState<boolean>(true)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [processProgress, setProcessProgress] = useState<number>(0)
  const [columnMappings, setColumnMappings] = useState<{
    assetExtra: number
    deparfrom: number
    arriveat: number
    distance: number
    departureTime: number
  }>({
    assetExtra: 0,
    deparfrom: 1,
    arriveat: 2,
    distance: 3,
    departureTime: 6,
  })
  const [transformedData, setTransformedData] = useState<string[][]>([])
  const [transformationComplete, setTransformationComplete] = useState<boolean>(false)
  const [processedTrips, setProcessedTrips] = useState<ProcessedTrip[]>([])
  const [statistics, setStatistics] = useState<{
    totalRows: number
    validRows: number
    invalidRows: number
    totalDistance: number
    averageDistance: number
    uniqueOrigins: number
    uniqueDestinations: number
    uniqueRoutes: number
    uniqueAssets: number
    completeTrips: number
    fragmentedTrips: number
    changeHouseTrips: number
    fiveX2Trips: number
    unassignedTrips: number
  } | null>(null)

  // Añadir estado para las ubicaciones filtradas
  const [filteredLocations, setFilteredLocations] = useState<string[]>(ALLOWED_LOCATIONS)
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Nuevo estado para rastrear validaciones y rechazos
  const [validationResults, setValidationResults] = useState<{
    acceptedTrips: Array<{ asset: string; route: string; direction: string; type: string; cambiadero?: string }>
    rejectedTrips: Array<{ asset: string; route: string; reason: string; type: string }>
    totalProcessed: number
    cambiaderoAssignments: {
      changeHouse: number
      fiveX2: number
      unassigned: number
    }
  }>({
    acceptedTrips: [],
    rejectedTrips: [],
    totalProcessed: 0,
    cambiaderoAssignments: {
      changeHouse: 0,
      fiveX2: 0,
      unassigned: 0,
    },
  })

  // Nuevo estado para el Sistema de Separación de Cambiaderos
  const [classificationResults, setClassificationResults] = useState<{
    changeHouseDataset: string[][]
    fiveX2Dataset: string[][]
    unassignedDataset: string[][]
    statistics: {
      totalProcessed: number
      changeHouseCount: number
      fiveX2Count: number
      unassignedCount: number
      successRate: number
      errorsByCategory: Record<string, number>
      distributionByPopulation: Record<string, { changeHouse: number; fiveX2: number; unassigned: number }>
    }
    detailedLog: Array<{
      asset: string
      route: string
      departureTime: string
      assignedTo: string
      reason: string
      category: string
    }>
  }>({
    changeHouseDataset: [],
    fiveX2Dataset: [],
    unassignedDataset: [],
    statistics: {
      totalProcessed: 0,
      changeHouseCount: 0,
      fiveX2Count: 0,
      unassignedCount: 0,
      successRate: 0,
      errorsByCategory: {},
      distributionByPopulation: {},
    },
    detailedLog: [],
  })

  // Cargar datos de ejemplo para el preview (deshabilitado por defecto)
  useEffect(() => {
    if (isPreview) {
      // Preview deshabilitado - las constantes SAMPLE_HEADERS y SAMPLE_DATA fueron removidas
      console.log("Preview mode disabled - no sample data available")
      setTransformationComplete(false)
    }
  }, [isPreview])

  // Efectuar procesamiento automático de datos de ejemplo después de que todo esté listo (deshabilitado por defecto)
  // useEffect(() => {
  //   if (isPreview && csvData.length > 0 && !transformationComplete) {
  //     setTimeout(() => {
  //       console.log("Iniciando procesamiento automático de datos de ejemplo con separación de cambiaderos...")
  //       transformDataAdvanced()
  //     }, 500)
  //   }
  // }, [isPreview, csvData, transformationComplete])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsPreview(false)
    setTransformationComplete(false)
    setIsProcessing(true)
    setProcessProgress(10)

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setRawData(text)
      setProcessProgress(30)

      // Detectar automáticamente el delimitador
      const firstLine = text.split("\n")[0]
      const commaCount = (firstLine.match(/,/g) || []).length
      const semicolonCount = (firstLine.match(/;/g) || []).length
      const tabCount = (firstLine.match(/\t/g) || []).length

      let detectedDelimiter = ","
      if (semicolonCount > commaCount && semicolonCount > tabCount) {
        detectedDelimiter = ";"
      } else if (tabCount > commaCount && tabCount > semicolonCount) {
        detectedDelimiter = "\t"
      }

      setDelimiter(detectedDelimiter)
      setProcessProgress(50)

      // Procesar los datos con el delimitador detectado
      parseCSV(text, detectedDelimiter)
    }
    reader.readAsText(file)
  }

  const parseCSV = (text: string, delimiter: string) => {
    // Normalizar finales de línea para manejar diferentes formatos de archivo
    const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
    const lines = normalizedText.split("\n")
    setProcessProgress(70)

    const parsedData = lines
      .map((line, i) => {
        // Actualizar progreso durante el procesamiento
        if (i % 1000 === 0) {
          const progress = 70 + Math.min(20, (i / lines.length) * 20)
          setProcessProgress(progress)
        }

        // Ignorar líneas vacías
        if (!line.trim()) return null

        // Manejar correctamente las comas dentro de comillas
        const result = []
        let current = ""
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
          const char = line[i]

          if (char === '"' && (i === 0 || line[i - 1] !== "\\")) {
            inQuotes = !inQuotes
          } else if (char === delimiter && !inQuotes) {
            result.push(current.trim())
            current = ""
          } else {
            current += char
          }
        }

        if (current) {
          result.push(current.trim())
        }

        return result
      })
      .filter((row): row is string[] => row !== null && row.some((cell) => cell !== ""))

    console.log(`CSV procesado: ${parsedData.length} filas encontradas`)
    setProcessProgress(90)

    if (parsedData.length > 0) {
      if (hasHeaderRow && parsedData[0]) {
        setHeaders(parsedData[0])
        setCsvData(parsedData.slice(1))
      } else {
        // Si no hay encabezados, crear encabezados genéricos
        const firstRow = parsedData[0]
        if (firstRow) {
          const genericHeaders = Array.from({ length: firstRow.length }, (_, i) => `Columna ${i + 1}`)
          setHeaders(genericHeaders)
          setCsvData(parsedData)
        }
      }

      // Intentar detectar automáticamente las columnas
      const firstRow = parsedData[0]
      if (firstRow) {
        detectColumns(firstRow)
      }
      setProcessProgress(100)

      setTimeout(() => {
        setIsProcessing(false)
        setActiveTab("transform")
      }, 500)
    } else {
      setIsProcessing(false)
    }
  }

  const detectColumns = (headerRow: string[]) => {
    const mapping = { ...columnMappings }

    headerRow.forEach((header, index) => {
      const lowerHeader = header.toLowerCase()

      if (lowerHeader.includes("asset") || lowerHeader.includes("bus") || lowerHeader.includes("vehicle")) {
        mapping.assetExtra = index
      } else if (lowerHeader.includes("depar") || lowerHeader.includes("origin") || lowerHeader.includes("from")) {
        mapping.deparfrom = index
      } else if (lowerHeader.includes("arriv") || lowerHeader.includes("dest") || lowerHeader.includes("to")) {
        mapping.arriveat = index
      } else if (lowerHeader.includes("dist") || lowerHeader.includes("km")) {
        mapping.distance = index
      } else if (lowerHeader.includes("departure") || lowerHeader.includes("time") || lowerHeader.includes("hora")) {
        mapping.departureTime = index
      }
    })

    setColumnMappings(mapping)
  }

  // Helpers para lógica de Annex y vuelta
  const ANNEX_FINAL_DEST = "Cambiadero Annex"
  const ANNEX_INTERMEDIATE_STOPS = ["Parqueadero San Juan", "Parqueadero Fonseca", "Parqueadero Urumita"]
  const ANNEX_ORIGINS = ["Parqueadero Valledupar", "Parqueadero Waya"]
  const ANNEX_RETURN_DESTS = ["Parqueadero Valledupar", "Parqueadero Waya"]

  function isAnnexOrigin(location: string) {
    return ANNEX_ORIGINS.includes(location)
  }
  function isAnnexIntermediateStop(location: string) {
    return ANNEX_INTERMEDIATE_STOPS.includes(location)
  }
  function isAnnexFinalDest(location: string) {
    return location === ANNEX_FINAL_DEST
  }
  function isAnnexReturnDest(location: string) {
    return ANNEX_RETURN_DESTS.includes(location)
  }

  // Función auxiliar para procesar trayectos fragmentados que inician con origen (MEJORADA)
  const processFragmentedTripFromOrigin = (
    data: string[][],
    asset: string,
    assetRowIndexes: number[],
    startIndex: number,
    origin: string,
  ): ProcessedTrip | null => {
    let totalDistance = 0
    let destination = ""
    let endRowIndex = assetRowIndexes[startIndex]
    const intermediateRows: number[] = []
    const startRowIndex = assetRowIndexes[startIndex]

    // Obtener datos de la fila inicial
    const startRow = data[startRowIndex]
    const startDate = startRow[headers.findIndex((h) => h.toLowerCase().includes("date"))] || undefined
    const startDriver = startRow[headers.findIndex((h) => h.toLowerCase().includes("driver"))] || undefined
    const departureTime = startRow[columnMappings.departureTime] || undefined

    // Sumar distancia de la fila inicial
    totalDistance += Number.parseFloat(startRow[columnMappings.distance]) || 0

    // Buscar hacia adelante hasta encontrar el destino
    for (let i = startIndex + 1; i < assetRowIndexes.length; i++) {
      const currentRowIndex = assetRowIndexes[i]
      const currentRow = data[currentRowIndex]
      const currentArrival = normalizeLocation(currentRow[columnMappings.arriveat])
      const currentDistance = Number.parseFloat(currentRow[columnMappings.distance]) || 0

      totalDistance += currentDistance
      intermediateRows.push(currentRowIndex)
      endRowIndex = currentRowIndex

      // Lógica especial para trayectos hacia Annex
      if (isAnnexOrigin(origin)) {
        if (isAnnexIntermediateStop(currentArrival)) {
          // Ignorar como destino final, continuar buscando
          continue
        }
        if (isAnnexFinalDest(currentArrival)) {
          destination = currentArrival
          break
        }
      } else {
        // Lógica normal: si encontramos un destino válido, terminar el trayecto
        if (currentArrival) {
          destination = currentArrival
          break
        }
      }
    }

    // Aplicar lógica de separación de cambiaderos ANTES de la validación final
    let finalOrigin = origin
    let finalDestination = destination
    let assignedCambiadero = ""
    let cambiaderoReason = "No aplica separación"

    // Solo si involucra el cambiadero Change House (que debe ser separado), aplicar separación por horario
    const involvesChangeHouse = 
      destination === "Cambiadero Change House" || 
      origin === "Cambiadero Change House"

    if (involvesChangeHouse && departureTime) {
      const cambiaderoResult = determineCambiadero(origin, destination, departureTime)
      if (cambiaderoResult.isValid && cambiaderoResult.cambiadero) {
        // Reemplazar el cambiadero genérico con el específico
        if (origin === "Cambiadero Change House") {
          finalOrigin = cambiaderoResult.cambiadero
        } else if (destination === "Cambiadero Change House") {
          finalDestination = cambiaderoResult.cambiadero
        }
        assignedCambiadero = cambiaderoResult.cambiadero
        cambiaderoReason = cambiaderoResult.reason
      } else {
        // Si no se puede clasificar por horario, mantener genérico pero marcar como no asignado
        cambiaderoReason = cambiaderoResult.reason
        assignedCambiadero = destination.startsWith("Cambiadero") ? destination : origin
      }
    } else if (involvesChangeHouse) {
      // Si involucra cambiaderos pero no hay horario
      cambiaderoReason = "Sin horario disponible para clasificar"
      assignedCambiadero = destination.startsWith("Cambiadero") ? destination : origin
    }

    // Verificar si el trayecto es válido usando la función estricta
    const validation = isValidParqueaderoCambiaderoStrict(finalOrigin, finalDestination)
    if (validation.isValid) {
      return {
        asset,
        origin: finalOrigin,
        destination: finalDestination,
        totalDistance,
        startRowIndex,
        endRowIndex,
        date: startDate,
        driver: startDriver,
        intermediateRows,
        departureTime,
        assignedCambiadero,
        cambiaderoReason,
      }
    } else {
      console.log(`Trayecto fragmentado rechazado para ${asset}: ${validation.reason}`)
      return null
    }
  }

  // Función auxiliar para procesar trayectos fragmentados que inician con destino (MEJORADA)
  const processFragmentedTripFromDestination = (
    data: string[][],
    asset: string,
    assetRowIndexes: number[],
    startIndex: number,
    destination: string,
  ): ProcessedTrip | null => {
    let totalDistance = 0
    let origin = ""
    let startRowIndex = assetRowIndexes[startIndex]
    const intermediateRows: number[] = []
    const endRowIndex = assetRowIndexes[startIndex]

    // Obtener datos de la fila inicial
    const endRow = data[endRowIndex]
    const endDate = endRow[headers.findIndex((h) => h.toLowerCase().includes("date"))] || undefined
    const endDriver = endRow[headers.findIndex((h) => h.toLowerCase().includes("driver"))] || undefined
    const departureTime = endRow[columnMappings.departureTime] || undefined

    // Sumar distancia de la fila inicial
    totalDistance += Number.parseFloat(endRow[columnMappings.distance]) || 0

    // Buscar hacia atrás hasta encontrar el origen
    for (let i = startIndex - 1; i >= 0; i--) {
      const currentRowIndex = assetRowIndexes[i]
      const currentRow = data[currentRowIndex]
      const currentDeparture = normalizeLocation(currentRow[columnMappings.deparfrom])
      const currentDistance = Number.parseFloat(currentRow[columnMappings.distance]) || 0

      totalDistance += currentDistance
      intermediateRows.unshift(currentRowIndex) // Agregar al inicio para mantener orden
      startRowIndex = currentRowIndex

      // Lógica especial para trayectos de vuelta desde Annex
      if (isAnnexFinalDest(destination)) {
        if (isAnnexReturnDest(currentDeparture)) {
          // Si encontramos un destino de retorno válido, lo asignamos y terminamos.
          origin = currentDeparture
          break
        }
        // Si es una parada intermedia, la ignoramos y continuamos buscando hacia atrás.
      } else {
        // Lógica normal: si encontramos un origen válido, terminar el trayecto
        if (currentDeparture) {
          origin = currentDeparture
          break
        }
      }
    }

    // Aplicar lógica de separación de cambiaderos ANTES de la validación final
    let finalOrigin = origin
    let finalDestination = destination
    let assignedCambiadero = ""
    let cambiaderoReason = "No aplica separación"

    // Solo si involucra el cambiadero Change House (que debe ser separado), aplicar separación por horario
    const involvesChangeHouse = 
      destination === "Cambiadero Change House" || 
      origin === "Cambiadero Change House"

    if (involvesChangeHouse && departureTime) {
      const cambiaderoResult = determineCambiadero(origin, destination, departureTime)
      if (cambiaderoResult.isValid && cambiaderoResult.cambiadero) {
        // Reemplazar el cambiadero genérico con el específico
        if (origin === "Cambiadero Change House") {
          finalOrigin = cambiaderoResult.cambiadero
        } else if (destination === "Cambiadero Change House") {
          finalDestination = cambiaderoResult.cambiadero
        }
        assignedCambiadero = cambiaderoResult.cambiadero
        cambiaderoReason = cambiaderoResult.reason
      } else {
        // Si no se puede clasificar por horario, mantener genérico pero marcar como no asignado
        cambiaderoReason = cambiaderoResult.reason
        assignedCambiadero = destination.startsWith("Cambiadero") ? destination : origin
      }
    } else if (involvesChangeHouse) {
      // Si involucra cambiaderos pero no hay horario
      cambiaderoReason = "Sin horario disponible para clasificar"
      assignedCambiadero = destination.startsWith("Cambiadero") ? destination : origin
    }

    // Verificar si el trayecto es válido usando la función estricta
    const validation = isValidParqueaderoCambiaderoStrict(finalOrigin, finalDestination)
    if (validation.isValid) {
      return {
        asset,
        origin: finalOrigin,
        destination: finalDestination,
        totalDistance,
        startRowIndex,
        endRowIndex,
        date: endDate,
        driver: endDriver,
        intermediateRows,
        departureTime,
        assignedCambiadero,
        cambiaderoReason,
      }
    } else {
      console.log(`Trayecto fragmentado rechazado para ${asset}: ${validation.reason}`)
      return null
    }
  }

  // Nueva función para procesar trayectos completos y fragmentados (MEJORADA CON SEPARACIÓN DE CAMBIADEROS)
  const processTripsAdvanced = (data: string[][]): ProcessedTrip[] => {
    const trips: ProcessedTrip[] = []
    const assetGroups: Record<string, number[]> = {}
    const rejectedTrips: Array<{ asset: string; reason: string; origin?: string; destination?: string }> = []
    const acceptedTrips: Array<{ asset: string; route: string; direction: string; type: string; cambiadero?: string }> =
      []
    const cambiaderoStats = { changeHouse: 0, fiveX2: 0, unassigned: 0 }

    // Agrupar filas por activo manteniendo el orden
    data.forEach((row, index) => {
      const asset = row[columnMappings.assetExtra] || "Unknown"
      if (!assetGroups[asset]) {
        assetGroups[asset] = []
      }
      assetGroups[asset].push(index)
    })

    // Procesar cada activo individualmente
    Object.entries(assetGroups).forEach(([asset, rowIndexes]) => {
      let i = 0

      while (i < rowIndexes.length) {
        const currentRowIndex = rowIndexes[i]
        const currentRow = data[currentRowIndex]

        const departure = normalizeLocation(currentRow[columnMappings.deparfrom])
        const arrival = normalizeLocation(currentRow[columnMappings.arriveat])
        const distance = Number.parseFloat(currentRow[columnMappings.distance]) || 0
        const departureTime = currentRow[columnMappings.departureTime] || ""

        // Caso 1: Trayecto completo en una sola fila
        if (departure && arrival && departure !== arrival) {
          let realArrival = arrival
          const realDeparture = departure

          // Lógica especial para trayectos directos a Annex
          if (isAnnexOrigin(departure) && isAnnexIntermediateStop(arrival)) {
            for (let j = i + 1; j < rowIndexes.length; j++) {
              const nextRow = data[rowIndexes[j]]
              const nextArrival = normalizeLocation(nextRow[columnMappings.arriveat])
              if (isAnnexFinalDest(nextArrival)) {
                realArrival = nextArrival
                break
              }
              if (!isAnnexIntermediateStop(nextArrival)) {
                break
              }
            }
          }
          // Lógica especial para trayectos de vuelta desde Annex
          if (isAnnexFinalDest(departure) && isAnnexIntermediateStop(arrival)) {
            for (let j = i + 1; j < rowIndexes.length; j++) {
              const nextRow = data[rowIndexes[j]]
              const nextArrival = normalizeLocation(nextRow[columnMappings.arriveat])
              if (isAnnexReturnDest(nextArrival)) {
                realArrival = nextArrival
                break
              }
              if (!isAnnexIntermediateStop(nextArrival)) {
                break
              }
            }
          }

          // Aplicar lógica de separación de cambiaderos ANTES de la validación final
          let finalDeparture = realDeparture
          let finalArrival = realArrival
          let assignedCambiadero = ""
          let cambiaderoReason = "No aplica separación"

          // Solo si involucra el cambiadero Change House (que debe ser separado), aplicar separación por horario
          const involvesChangeHouse = 
            realArrival === "Cambiadero Change House" || 
            realDeparture === "Cambiadero Change House"

          if (involvesChangeHouse && departureTime) {
            const cambiaderoResult = determineCambiadero(realDeparture, realArrival, departureTime)
            if (cambiaderoResult.isValid && cambiaderoResult.cambiadero) {
              // Reemplazar el cambiadero genérico con el específico
              if (realDeparture === "Cambiadero Change House" || realDeparture === "Cambiadero 5x2") {
                finalDeparture = cambiaderoResult.cambiadero
              } else if (realArrival === "Cambiadero Change House" || realArrival === "Cambiadero 5x2") {
                finalArrival = cambiaderoResult.cambiadero
              }
              assignedCambiadero = cambiaderoResult.cambiadero
              cambiaderoReason = cambiaderoResult.reason

              // Actualizar estadísticas
              if (cambiaderoResult.cambiadero === "Cambiadero Change House") {
                cambiaderoStats.changeHouse++
              } else if (cambiaderoResult.cambiadero === "Cambiadero 5x2") {
                cambiaderoStats.fiveX2++
              }
            } else {
              // Si no se puede clasificar por horario, dejar el trayecto como inválido o sin asignar
              cambiaderoStats.unassigned++
              cambiaderoReason = cambiaderoResult.reason
              // Mantener el cambiadero genérico pero marcar como no asignado
              assignedCambiadero = realArrival.startsWith("Cambiadero") ? realArrival : realDeparture
            }
          } else if (involvesChangeHouse) {
            // Si involucra cambiaderos pero no hay horario
            cambiaderoStats.unassigned++
            cambiaderoReason = "Sin horario disponible para clasificar"
            assignedCambiadero = realArrival.startsWith("Cambiadero") ? realArrival : realDeparture
          }

          // Ahora validar el trayecto con los cambiaderos ya clasificados
          const validation = isValidParqueaderoCambiaderoStrict(finalDeparture, finalArrival)
          const route = `${finalDeparture} → ${finalArrival}`

          if (validation.isValid) {

            trips.push({
              asset,
              origin: finalDeparture,
              destination: finalArrival,
              totalDistance: distance,
              startRowIndex: currentRowIndex,
              endRowIndex: currentRowIndex,
              date: currentRow[headers.findIndex((h) => h.toLowerCase().includes("date"))] || undefined,
              driver: currentRow[headers.findIndex((h) => h.toLowerCase().includes("driver"))] || undefined,
              intermediateRows: [],
              departureTime,
              assignedCambiadero,
              cambiaderoReason,
            })

            acceptedTrips.push({
              asset,
              route: `${finalDeparture} → ${finalArrival}`,
              direction: validation.direction,
              type: "Completo",
              cambiadero: assignedCambiadero || undefined,
            })

            console.log(
              `✅ Trayecto completo aceptado para ${asset}: ${finalDeparture} → ${finalArrival} (${validation.direction})${assignedCambiadero ? ` - Asignado a: ${assignedCambiadero}` : ""}`,
            )
          } else {
            rejectedTrips.push({
              asset,
              reason: validation.reason || "Trayecto no válido",
              origin: realDeparture,
              destination: realArrival,
            })
            console.log(
              `❌ Trayecto completo rechazado para ${asset}: ${realDeparture} → ${realArrival} - ${validation.reason}`,
            )
          }
          i++
        }
        // Caso 2: Inicio de trayecto fragmentado (solo origen, sin destino)
        else if (departure && !arrival) {
          const fragmentedTrip = processFragmentedTripFromOrigin(data, asset, rowIndexes, i, departure)
          if (fragmentedTrip) {
            trips.push(fragmentedTrip)
            const route = `${fragmentedTrip.origin} → ${fragmentedTrip.destination}`
            const validation = isValidParqueaderoCambiaderoStrict(fragmentedTrip.origin, fragmentedTrip.destination)

            // Actualizar estadísticas de cambiaderos
            if (fragmentedTrip.assignedCambiadero === "Cambiadero Change House") {
              cambiaderoStats.changeHouse++
            } else if (fragmentedTrip.assignedCambiadero === "Cambiadero 5x2") {
              cambiaderoStats.fiveX2++
            } else if (
              fragmentedTrip.destination === "Cambiadero Change House" ||
              fragmentedTrip.destination === "Cambiadero 5x2"
            ) {
              cambiaderoStats.unassigned++
            }

            acceptedTrips.push({
              asset,
              route,
              direction: validation.direction,
              type: "Fragmentado (desde origen)",
              cambiadero: fragmentedTrip.assignedCambiadero || undefined,
            })

            console.log(
              `✅ Trayecto fragmentado (desde origen) aceptado para ${asset}: ${fragmentedTrip.origin} → ${fragmentedTrip.destination}${fragmentedTrip.assignedCambiadero ? ` - Asignado a: ${fragmentedTrip.assignedCambiadero}` : ""}`,
            )
            // Avanzar al siguiente segmento no procesado
            i = rowIndexes.findIndex((idx) => idx > fragmentedTrip.endRowIndex)
            if (i === -1) break
          } else {
            rejectedTrips.push({
              asset,
              reason: "Trayecto fragmentado desde origen no válido",
              origin: departure,
            })
            console.log(`❌ Trayecto fragmentado rechazado para ${asset}: origen ${departure}`)
            i++
          }
        }
        // Caso 3: Inicio de trayecto fragmentado (solo destino, sin origen)
        else if (!departure && arrival) {
          const fragmentedTrip = processFragmentedTripFromDestination(data, asset, rowIndexes, i, arrival)
          if (fragmentedTrip) {
            trips.push(fragmentedTrip)
            const route = `${fragmentedTrip.origin} → ${fragmentedTrip.destination}`
            const validation = isValidParqueaderoCambiaderoStrict(fragmentedTrip.origin, fragmentedTrip.destination)

            // Actualizar estadísticas de cambiaderos
            if (fragmentedTrip.assignedCambiadero === "Cambiadero Change House") {
              cambiaderoStats.changeHouse++
            } else if (fragmentedTrip.assignedCambiadero === "Cambiadero 5x2") {
              cambiaderoStats.fiveX2++
            } else if (
              fragmentedTrip.origin === "Cambiadero Change House" ||
              fragmentedTrip.origin === "Cambiadero 5x2"
            ) {
              cambiaderoStats.unassigned++
            }

            acceptedTrips.push({
              asset,
              route,
              direction: validation.direction,
              type: "Fragmentado (desde destino)",
              cambiadero: fragmentedTrip.assignedCambiadero || undefined,
            })

            console.log(
              `✅ Trayecto fragmentado (desde destino) aceptado para ${asset}: ${fragmentedTrip.origin} → ${fragmentedTrip.destination}${fragmentedTrip.assignedCambiadero ? ` - Asignado a: ${fragmentedTrip.assignedCambiadero}` : ""}`,
            )
            // Avanzar al siguiente segmento no procesado
            i = rowIndexes.findIndex((idx) => idx > fragmentedTrip.endRowIndex)
            if (i === -1) break
          } else {
            rejectedTrips.push({
              asset,
              reason: "Trayecto fragmentado desde destino no válido",
              destination: arrival,
            })
            console.log(`❌ Trayecto fragmentado rechazado para ${asset}: destino ${arrival}`)
            i++
          }
        }
        // Caso 4: Segmento intermedio (ni origen ni destino definidos)
        else {
          rejectedTrips.push({
            asset,
            reason: "Segmento intermedio sin origen ni destino válidos",
          })
          console.log(`⚠️ Segmento intermedio ignorado para ${asset}`)
          i++
        }
      }
    })

    // Actualizar el estado de validación para mostrar en UI
    setValidationResults({
      acceptedTrips,
      rejectedTrips: rejectedTrips.map((trip) => ({
        asset: trip.asset,
        route:
          trip.origin && trip.destination
            ? `${trip.origin} → ${trip.destination}`
            : trip.origin
              ? `Origen: ${trip.origin}`
              : trip.destination
                ? `Destino: ${trip.destination}`
                : "Segmento incompleto",
        reason: trip.reason,
        type: "Rechazado",
      })),
      totalProcessed: acceptedTrips.length + rejectedTrips.length,
      cambiaderoAssignments: cambiaderoStats,
    })

    // Mostrar resumen de validación
    console.log(`=== RESUMEN DE VALIDACIÓN CON SEPARACIÓN DE CAMBIADEROS ===`)
    console.log(`✅ Trayectos aceptados: ${trips.length}`)
    console.log(`❌ Trayectos rechazados: ${rejectedTrips.length}`)
    console.log(`📊 Total procesado: ${acceptedTrips.length + rejectedTrips.length}`)
    console.log(
      `📈 Tasa de éxito: ${((trips.length / (acceptedTrips.length + rejectedTrips.length)) * 100).toFixed(2)}%`,
    )
    console.log(`🏢 Change House asignados: ${cambiaderoStats.changeHouse}`)
    console.log(`🔄 5x2 asignados: ${cambiaderoStats.fiveX2}`)
    console.log(`❓ Sin asignar: ${cambiaderoStats.unassigned}`)

    if (rejectedTrips.length > 0) {
      console.log(`📋 Razones de rechazo:`)
      const rejectionReasons = rejectedTrips.reduce(
        (acc, trip) => {
          acc[trip.reason] = (acc[trip.reason] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      Object.entries(rejectionReasons).forEach(([reason, count]) => {
        console.log(`  - ${reason}: ${count} casos`)
      })
    }

    return trips
  }

  // Función mejorada para determinar dirección del viaje con validación estricta
  const getTripDirectionStrict = (
    departure: string,
    arrival: string,
  ): {
    direction: "Ida" | "Vuelta" | "Inválido"
    isValid: boolean
    reason?: string
  } => {
    const validation = isValidParqueaderoCambiaderoStrict(departure, arrival)
    return {
      direction: validation.direction,
      isValid: validation.isValid,
      reason: validation.reason,
    }
  }

  // Función para crear clave unificada de ruta (MEJORADA)
  const createUnifiedRouteKey = (departure: string, arrival: string): string => {
    // Primero validar que sea una ruta válida
    const validation = isValidParqueaderoCambiaderoStrict(departure, arrival)
    if (!validation.isValid) {
      return `INVÁLIDO: ${departure} → ${arrival}`
    }

    // Extraer nombres base sin "Parqueadero" o "Cambiadero"
    const depBase = departure.replace(/^(Parqueadero|Cambiadero)\s+/, "")
    const arrBase = arrival.replace(/^(Parqueadero|Cambiadero)\s+/, "")

    // Ordenar alfabéticamente para unificar rutas bidireccionales
    const [first, second] = [depBase, arrBase].sort()
    return `${first} ↔ ${second}`
  }

  // Define calculateRoutes function (MEJORADA CON VALIDACIÓN ESTRICTA)
  function calculateRoutes() {
    const departureIndex = headers.findIndex((h) => h.toLowerCase() === "deparfrom")
    const arrivalIndex = headers.findIndex((h) => h.toLowerCase() === "arriveat")
    const distanceIndex = headers.findIndex((h) => h.toLowerCase() === "distance")
    const assetIndex = headers.findIndex((h) => h.toLowerCase() === "assetextra")
    const typeIndex = headers.findIndex((h) => h.toLowerCase() === "tipotrayecto")

    if (departureIndex === -1 || arrivalIndex === -1 || distanceIndex === -1) {
      return []
    }

    const unifiedRoutes: Record<
      string,
      {
        count: number
        totalDistance: number
        assets: Set<string>
        trips: Array<{
          asset: string
          distance: number
          date?: string
          type: string
          originalRows?: string
          direction: string
          fullRoute: string
          cambiadero?: string
        }>
        completeTrips: number
        fragmentedTrips: number
        outboundTrips: number // Parqueadero → Cambiadero
        returnTrips: number // Cambiadero → Parqueadero
        outboundDistance: number
        returnDistance: number
        validTrips: number
        invalidTrips: number
        changeHouseTrips: number
        fiveX2Trips: number
      }
    > = {}

    let totalValidTrips = 0
    let totalInvalidTrips = 0

    csvData.forEach((row) => {
      const departure = row[departureIndex]
      const arrival = row[arrivalIndex]
      const asset = assetIndex !== -1 ? row[assetIndex] : "Desconocido"
      const date = row[headers.findIndex((h) => h.toLowerCase().includes("date"))] || undefined
      const distance = Number.parseFloat(row[distanceIndex]) || 0
      const tripType = typeIndex !== -1 ? row[typeIndex] : "Desconocido"
      const originalRows = row[headers.findIndex((h) => h.toLowerCase().includes("filas"))] || ""
      const cambiadero = row[headers.findIndex((h) => h.toLowerCase().includes("cambiadero"))] || ""

      // Validación estricta del viaje
      const validation = getTripDirectionStrict(departure, arrival)
      const fullRoute = `${departure} → ${arrival}`

      if (!validation.isValid) {
        totalInvalidTrips++
        console.log(`Viaje rechazado: ${fullRoute} - ${validation.reason}`)
        return // Skip invalid trips
      }

      totalValidTrips++
      const direction = validation.direction
      const unifiedKey = createUnifiedRouteKey(departure, arrival)

      if (!unifiedRoutes[unifiedKey]) {
        unifiedRoutes[unifiedKey] = {
          count: 0,
          totalDistance: 0,
          assets: new Set(),
          trips: [],
          completeTrips: 0,
          fragmentedTrips: 0,
          outboundTrips: 0,
          returnTrips: 0,
          outboundDistance: 0,
          returnDistance: 0,
          validTrips: 0,
          invalidTrips: 0,
          changeHouseTrips: 0,
          fiveX2Trips: 0,
        }
      }

      const route = unifiedRoutes[unifiedKey]

      // Actualizar contadores generales
      route.count += 1
      route.totalDistance += distance
      route.assets.add(asset)
      route.validTrips += 1
      route.trips.push({
        asset,
        distance,
        date,
        type: tripType,
        originalRows,
        direction,
        fullRoute,
        cambiadero,
      })

      // Actualizar contadores por tipo de trayecto
      if (tripType === "Completo") {
        route.completeTrips += 1
      } else if (tripType === "Fragmentado") {
        route.fragmentedTrips += 1
      }

      // Actualizar contadores por cambiadero
      if (cambiadero === "Cambiadero Change House") {
        route.changeHouseTrips += 1
      } else if (cambiadero === "Cambiadero 5x2") {
        route.fiveX2Trips += 1
      }

      // Actualizar contadores por dirección (validación estricta garantiza que direction sea "Ida" o "Vuelta")
      if (direction === "Ida") {
        route.outboundTrips += 1
        route.outboundDistance += distance
      } else if (direction === "Vuelta") {
        route.returnTrips += 1
        route.returnDistance += distance
      }
    })

    console.log(`=== RESUMEN DE ANÁLISIS DE RUTAS ===`)
    console.log(`Total viajes válidos procesados: ${totalValidTrips}`)
    console.log(`Total viajes inválidos rechazados: ${totalInvalidTrips}`)
    console.log(`Rutas únicas válidas encontradas: ${Object.keys(unifiedRoutes).length}`)

    // Convertir a array y ordenar por frecuencia
    return Object.entries(unifiedRoutes)
      .filter(([route]) => !route.startsWith("INVÁLIDO")) // Filtrar rutas inválidas
      .map(([route, data]) => ({
        route,
        count: data.count,
        totalDistance: data.totalDistance,
        averageDistance: data.totalDistance / data.count,
        uniqueAssets: data.assets.size,
        assets: Array.from(data.assets),
        trips: data.trips,
        completeTrips: data.completeTrips,
        fragmentedTrips: data.fragmentedTrips,
        outboundTrips: data.outboundTrips,
        returnTrips: data.returnTrips,
        outboundDistance: data.outboundDistance,
        returnDistance: data.returnDistance,
        changeHouseTrips: data.changeHouseTrips,
        fiveX2Trips: data.fiveX2Trips,
      }))
      .sort((a, b) => b.count - a.count)
  }

  const generateConsolidatedSummaryData = () => {
    const departureIndex = headers.findIndex((h) => h.toLowerCase() === "deparfrom")
    const arrivalIndex = headers.findIndex((h) => h.toLowerCase() === "arriveat")
    const distanceIndex = headers.findIndex((h) => h.toLowerCase() === "distance")
    const typeIndex = headers.findIndex((h) => h.toLowerCase() === "tipotrayecto")
    const cambiaderoIndex = headers.findIndex((h) => h.toLowerCase().includes("cambiadero"))

    if (departureIndex === -1 || arrivalIndex === -1 || distanceIndex === -1) {
      return {
        parqueaderoToCambiadero: {
          trips: 0,
          distance: 0,
          completeTrips: 0,
          fragmentedTrips: 0,
          changeHouse: 0,
          fiveX2: 0,
        },
        cambiaderoToParqueadero: {
          trips: 0,
          distance: 0,
          completeTrips: 0,
          fragmentedTrips: 0,
          changeHouse: 0,
          fiveX2: 0,
        },
        total: { trips: 0, distance: 0, completeTrips: 0, fragmentedTrips: 0, changeHouse: 0, fiveX2: 0 },
        invalidTrips: 0,
        validationRate: 0,
      }
    }

    // Inicializar contadores
    const summary = {
      parqueaderoToCambiadero: {
        trips: 0,
        distance: 0,
        completeTrips: 0,
        fragmentedTrips: 0,
        changeHouse: 0,
        fiveX2: 0,
      },
      cambiaderoToParqueadero: {
        trips: 0,
        distance: 0,
        completeTrips: 0,
        fragmentedTrips: 0,
        changeHouse: 0,
        fiveX2: 0,
      },
      total: { trips: 0, distance: 0, completeTrips: 0, fragmentedTrips: 0, changeHouse: 0, fiveX2: 0 },
      invalidTrips: 0,
      validationRate: 0,
    }

    let totalProcessed = 0

    // Procesar cada fila con validación estricta
    csvData.forEach((row) => {
      totalProcessed++
      const departure = row[departureIndex]
      const arrival = row[arrivalIndex]
      const distance = Number.parseFloat(row[distanceIndex]) || 0
      const tripType = typeIndex !== -1 ? row[typeIndex] : "Desconocido"
      const cambiadero = cambiaderoIndex !== -1 ? row[cambiaderoIndex] : ""

      // Aplicar validación estricta
      const validation = getTripDirectionStrict(departure, arrival)

      if (!validation.isValid) {
        summary.invalidTrips++
        return // Skip invalid trips
      }

      // Clasificar según dirección validada estrictamente
      if (validation.direction === "Ida") {
        // Parqueadero → Cambiadero
        summary.parqueaderoToCambiadero.trips += 1
        summary.parqueaderoToCambiadero.distance += distance
        if (tripType === "Completo") {
          summary.parqueaderoToCambiadero.completeTrips += 1
        } else if (tripType === "Fragmentado") {
          summary.parqueaderoToCambiadero.fragmentedTrips += 1
        }

        // Contar por cambiadero
        if (cambiadero === "Cambiadero Change House" || arrival === "Cambiadero Change House") {
          summary.parqueaderoToCambiadero.changeHouse += 1
        } else if (cambiadero === "Cambiadero 5x2" || arrival === "Cambiadero 5x2") {
          summary.parqueaderoToCambiadero.fiveX2 += 1
        }
      } else if (validation.direction === "Vuelta") {
        // Cambiadero → Parqueadero
        summary.cambiaderoToParqueadero.trips += 1
        summary.cambiaderoToParqueadero.distance += distance
        if (tripType === "Completo") {
          summary.cambiaderoToParqueadero.completeTrips += 1
        } else if (tripType === "Fragmentado") {
          summary.cambiaderoToParqueadero.fragmentedTrips += 1
        }

        // Contar por cambiadero
        if (cambiadero === "Cambiadero Change House" || departure === "Cambiadero Change House") {
          summary.cambiaderoToParqueadero.changeHouse += 1
        } else if (cambiadero === "Cambiadero 5x2" || departure === "Cambiadero 5x2") {
          summary.cambiaderoToParqueadero.fiveX2 += 1
        }
      }

      // Actualizar totales
      summary.total.trips += 1
      summary.total.distance += distance
      if (tripType === "Completo") {
        summary.total.completeTrips += 1
      } else if (tripType === "Fragmentado") {
        summary.total.fragmentedTrips += 1
      }

      // Totales por cambiadero
      if (
        cambiadero === "Cambiadero Change House" ||
        departure === "Cambiadero Change House" ||
        arrival === "Cambiadero Change House"
      ) {
        summary.total.changeHouse += 1
      } else if (cambiadero === "Cambiadero 5x2" || departure === "Cambiadero 5x2" || arrival === "Cambiadero 5x2") {
        summary.total.fiveX2 += 1
      }
    })

    // Calcular tasa de validación
    summary.validationRate = totalProcessed > 0 ? (summary.total.trips / totalProcessed) * 100 : 0

    return summary
  }

  // Función transformData actualizada para manejar trayectos fragmentados
  const transformDataAdvanced = () => {
    setIsProcessing(true)
    setProcessProgress(0)

    setTimeout(() => {
      const totalRows = csvData.length
      console.log(`Iniciando procesamiento de ${totalRows} filas...`)

      // Procesar todos los trayectos (completos y fragmentados)
      const trips = processTripsAdvanced(csvData)

      console.log(`Trayectos procesados: ${trips.length} trayectos válidos encontrados`)

      // Convertir trayectos procesados a formato de tabla
      const transformed = trips.map((trip) => [
        trip.asset,
        trip.origin,
        trip.destination,
        trip.totalDistance.toString(),
        trip.date || "",
        trip.driver || "",
        trip.departureTime || "",
        `${trip.startRowIndex + 1}-${trip.endRowIndex + 1}`, // Referencia a filas originales
        trip.intermediateRows.length > 0 ? "Fragmentado" : "Completo",
        trip.assignedCambiadero || trip.destination,
        trip.cambiaderoReason || "N/A",
      ])

      // Crear nuevos encabezados incluyendo información de procesamiento
      const newHeaders = [
        "AssetExtra",
        "Deparfrom",
        "Arriveat",
        "Distance",
        "Date",
        "Driver",
        "DepartureTime",
        "FilasOriginales",
        "TipoTrayecto",
        "CambiaderoAsignado",
        "RazonAsignacion",
      ]

      setHeaders(newHeaders)
      setTransformedData(transformed)
      setProcessedTrips(trips)
      calculateAdvancedStatsData(trips, totalRows)

      setProcessProgress(98)

      setTimeout(() => {
        setProcessProgress(100)
        setCsvData(transformed)
        setTransformationComplete(true)
        
        // Generar datasets separados automáticamente después de la transformación
        setTimeout(() => {
          console.log("🔄 Generando datasets separados automáticamente...")
          // Usar los datos transformados para generar los datasets
          const generateDatasets = () => {
            const changeHouseData: string[][] = []
            const fiveX2Data: string[][] = []
            const unassignedData: string[][] = []
            
            const stats = {
              totalProcessed: 0,
              changeHouseCount: 0,
              fiveX2Count: 0,
              unassignedCount: 0,
              successRate: 0,
              errorsByCategory: {} as Record<string, number>,
              distributionByPopulation: {} as Record<string, { changeHouse: number; fiveX2: number; unassigned: number }>,
            }
            
            const detailedLog: Array<{
              asset: string
              route: string
              departureTime: string
              assignedTo: string
              reason: string
              category: string
            }> = []

            // Usar los datos transformados
            transformed.forEach((row) => {
              const cambiaderoAsignado = row[newHeaders.findIndex(h => h === "CambiaderoAsignado")]
              const razonAsignacion = row[newHeaders.findIndex(h => h === "RazonAsignacion")]
              const asset = row[0]
              const deparfrom = row[1]
              const arriveat = row[2]
              const departureTime = row[6]
              
              stats.totalProcessed++
              
              // Extraer población para distribución
              const population = deparfrom.startsWith("Parqueadero") ? deparfrom : arriveat.startsWith("Parqueadero") ? arriveat : "Desconocido"
              if (!stats.distributionByPopulation[population]) {
                stats.distributionByPopulation[population] = { changeHouse: 0, fiveX2: 0, unassigned: 0 }
              }
              
              // Clasificar por cambiadero asignado
              if (cambiaderoAsignado === "Cambiadero Change House") {
                changeHouseData.push(row)
                stats.changeHouseCount++
                stats.distributionByPopulation[population].changeHouse++
                detailedLog.push({
                  asset,
                  route: `${deparfrom} → ${arriveat}`,
                  departureTime,
                  assignedTo: "Change House",
                  reason: razonAsignacion,
                  category: "change_house_asignado"
                })
              } else if (cambiaderoAsignado === "Cambiadero 5x2") {
                fiveX2Data.push(row)
                stats.fiveX2Count++
                stats.distributionByPopulation[population].fiveX2++
                detailedLog.push({
                  asset,
                  route: `${deparfrom} → ${arriveat}`,
                  departureTime,
                  assignedTo: "5x2",
                  reason: razonAsignacion,
                  category: "fiveX2_asignado"
                })
              } else {
                unassignedData.push(row)
                stats.unassignedCount++
                stats.distributionByPopulation[population].unassigned++
                detailedLog.push({
                  asset,
                  route: `${deparfrom} → ${arriveat}`,
                  departureTime,
                  assignedTo: "Sin Asignar",
                  reason: razonAsignacion,
                  category: "sin_asignar"
                })
              }
            })
            
            // Calcular tasa de éxito
            const assignedCount = stats.changeHouseCount + stats.fiveX2Count
            stats.successRate = stats.totalProcessed > 0 ? (assignedCount / stats.totalProcessed) * 100 : 0
            
            // Actualizar estado
            setClassificationResults({
              changeHouseDataset: changeHouseData,
              fiveX2Dataset: fiveX2Data,
              unassignedDataset: unassignedData,
              statistics: stats,
              detailedLog,
            })
            
            console.log("✅ Datasets generados automáticamente:")
            console.log(`📊 Total procesado: ${stats.totalProcessed}`)
            console.log(`🏢 Change House: ${stats.changeHouseCount}`)
            console.log(`🔄 5x2: ${stats.fiveX2Count}`)
            console.log(`❓ Sin asignar: ${stats.unassignedCount}`)
            console.log(`📈 Tasa de éxito: ${stats.successRate.toFixed(2)}%`)
          }
          
          generateDatasets()
        }, 100)
        
        setActiveTab("data")
        setIsProcessing(false)
      }, 500)
    }, 100)
  }

  // Función actualizada para calcular estadísticas avanzadas
  const calculateAdvancedStatsData = (trips: ProcessedTrip[], totalRows: number) => {
    let totalDistance = 0
    let completeTrips = 0
    let fragmentedTrips = 0
    let changeHouseTrips = 0
    let fiveX2Trips = 0
    let unassignedTrips = 0
    const origins = new Set<string>()
    const destinations = new Set<string>()
    const routes = new Set<string>()
    const assets = new Set<string>()

    trips.forEach((trip) => {
      totalDistance += trip.totalDistance
      assets.add(trip.asset)
      origins.add(trip.origin)
      destinations.add(trip.destination)
      routes.add(`${trip.origin}-${trip.destination}`)

      if (trip.intermediateRows.length > 0) {
        fragmentedTrips++
      } else {
        completeTrips++
      }

      // Contar asignaciones de cambiaderos
      if (trip.assignedCambiadero === "Cambiadero Change House") {
        changeHouseTrips++
      } else if (trip.assignedCambiadero === "Cambiadero 5x2") {
        fiveX2Trips++
      } else if (
        trip.destination === "Cambiadero Change House" ||
        trip.destination === "Cambiadero 5x2" ||
        trip.origin === "Cambiadero Change House" ||
        trip.origin === "Cambiadero 5x2"
      ) {
        unassignedTrips++
      }
    })

    const stats = {
      totalRows,
      validRows: trips.length,
      invalidRows: totalRows - trips.length,
      totalDistance,
      averageDistance: trips.length > 0 ? totalDistance / trips.length : 0,
      uniqueOrigins: origins.size,
      uniqueDestinations: destinations.size,
      uniqueRoutes: routes.size,
      uniqueAssets: assets.size,
      completeTrips,
      fragmentedTrips,
      changeHouseTrips,
      fiveX2Trips,
      unassignedTrips,
    }

    console.log("Estadísticas avanzadas:", stats)
    setStatistics(stats)
  }

  const executeQuery = () => {
    if (!query.trim() || csvData.length === 0) return

    try {
      // Simple query parser
      const lowerQuery = query.toLowerCase()
      let results: string[][] = []

      // Calculate total distance
      if (lowerQuery.includes("total distance") || lowerQuery.includes("distancia total")) {
        const distanceIndex = headers.findIndex((h) => h.toLowerCase() === "distance")

        if (distanceIndex !== -1) {
          let totalDistance = 0
          csvData.forEach((row) => {
            const distance = Number.parseFloat(row[distanceIndex]) || 0
            totalDistance += distance
          })

          results = [["Distancia Total (km)", totalDistance.toFixed(2)]]
        }
      }
      // Calculate distance by asset
      else if (
        (lowerQuery.includes("distance by") || lowerQuery.includes("distancia por")) &&
        lowerQuery.includes("asset")
      ) {
        const distanceIndex = headers.findIndex((h) => h.toLowerCase() === "distance")
        const assetIndex = headers.findIndex((h) => h.toLowerCase() === "assetextra")

        if (distanceIndex !== -1 && assetIndex !== -1) {
          const distanceByAsset: Record<string, number> = {}

          csvData.forEach((row) => {
            const asset = row[assetIndex] || "Sin especificar"
            const distance = Number.parseFloat(row[distanceIndex]) || 0

            distanceByAsset[asset] = (distanceByAsset[asset] || 0) + distance
          })

          results = Object.entries(distanceByAsset).map(([asset, distance]) => [asset, distance.toFixed(2) + " km"])
        }
      }
      // Show fragmented trips
      else if (lowerQuery.includes("fragmented") || lowerQuery.includes("fragmentado")) {
        const typeIndex = headers.findIndex((h) => h.toLowerCase() === "tipotrayecto")
        if (typeIndex !== -1) {
          results = csvData.filter((row) => row[typeIndex] === "Fragmentado")
        }
      }
      // Show complete trips
      else if (lowerQuery.includes("complete") || lowerQuery.includes("completo")) {
        const typeIndex = headers.findIndex((h) => h.toLowerCase() === "tipotrayecto")
        if (typeIndex !== -1) {
          results = csvData.filter((row) => row[typeIndex] === "Completo")
        }
      }
      // Show Change House trips
      else if (lowerQuery.includes("change house")) {
        const cambiaderoIndex = headers.findIndex((h) => h.toLowerCase().includes("cambiadero"))
        if (cambiaderoIndex !== -1) {
          results = csvData.filter((row) => row[cambiaderoIndex] === "Cambiadero Change House")
        }
      }
      // Show 5x2 trips
      else if (lowerQuery.includes("5x2")) {
        const cambiaderoIndex = headers.findIndex((h) => h.toLowerCase().includes("cambiadero"))
        if (cambiaderoIndex !== -1) {
          results = csvData.filter((row) => row[cambiaderoIndex] === "Cambiadero 5x2")
        }
      }
      // Default to showing first 10 rows
      else {
        results = csvData.slice(0, 10)
      }

      setQueryResults(results)
    } catch (error) {
      console.error("Error executing query:", error)
      setQueryResults([["Error executing query"]])
    }
  }

  // Extraer ubicaciones únicas para el mapa
  const getUniqueLocations = () => {
    const departureIndex = headers.findIndex((h) => h.toLowerCase() === "deparfrom")
    const arrivalIndex = headers.findIndex((h) => h.toLowerCase() === "arriveat")

    if (departureIndex === -1 || arrivalIndex === -1) return []

    const locations = new Set<string>()
    csvData.forEach((row) => {
      locations.add(row[departureIndex])
      locations.add(row[arrivalIndex])
    })

    return Array.from(locations).sort()
  }

  // Memoizar los cálculos costosos para mejorar el rendimiento
  const locations = useMemo(() => getUniqueLocations(), [csvData, headers])
  const routes = useMemo(() => calculateRoutes(), [csvData, headers])

  // Función para generar datasets separados según especificaciones
  const generateSeparatedDatasets = () => {
    console.log("🚀 Iniciando generación de datasets separados...")
    
    const changeHouseData: string[][] = []
    const fiveX2Data: string[][] = []
    const unassignedData: string[][] = []
    
    const statistics = {
      totalProcessed: 0,
      changeHouseCount: 0,
      fiveX2Count: 0,
      unassignedCount: 0,
      successRate: 0,
      errorsByCategory: {} as Record<string, number>,
      distributionByPopulation: {} as Record<string, { changeHouse: number; fiveX2: number; unassigned: number }>,
    }
    
    const detailedLog: Array<{
      asset: string
      route: string
      departureTime: string
      assignedTo: string
      reason: string
      category: string
    }> = []

    // Procesar cada fila de datos procesados
    csvData.forEach((row) => {
      const deparfrom = row[headers.findIndex((h) => h.toLowerCase() === "deparfrom")]
      const arriveat = row[headers.findIndex((h) => h.toLowerCase() === "arriveat")]
      const asset = row[headers.findIndex((h) => h.toLowerCase() === "assetextra")]
      const departureTime = row[headers.findIndex((h) => h.toLowerCase() === "departuretime")]
      
      statistics.totalProcessed++
      
      // Aplicar lógica de separación
      const classificationResult = determineCambiadero(deparfrom, arriveat, departureTime)
      
      // Contar errores por categoría
      if (!statistics.errorsByCategory[classificationResult.category]) {
        statistics.errorsByCategory[classificationResult.category] = 0
      }
      statistics.errorsByCategory[classificationResult.category]++
      
      // Extraer población para distribución
      const population = deparfrom.startsWith("Parqueadero") ? deparfrom : arriveat.startsWith("Parqueadero") ? arriveat : "Desconocido"
      if (!statistics.distributionByPopulation[population]) {
        statistics.distributionByPopulation[population] = { changeHouse: 0, fiveX2: 0, unassigned: 0 }
      }
      
      // Clasificar en dataset correspondiente
      if (classificationResult.isValid && classificationResult.cambiadero === "Cambiadero Change House") {
        changeHouseData.push(row)
        statistics.changeHouseCount++
        statistics.distributionByPopulation[population].changeHouse++
        detailedLog.push({
          asset,
          route: `${deparfrom} → ${arriveat}`,
          departureTime,
          assignedTo: "Change House",
          reason: classificationResult.reason,
          category: classificationResult.category
        })
      } else if (classificationResult.isValid && classificationResult.cambiadero === "Cambiadero 5x2") {
        fiveX2Data.push(row)
        statistics.fiveX2Count++
        statistics.distributionByPopulation[population].fiveX2++
        detailedLog.push({
          asset,
          route: `${deparfrom} → ${arriveat}`,
          departureTime,
          assignedTo: "5x2",
          reason: classificationResult.reason,
          category: classificationResult.category
        })
      } else {
        unassignedData.push(row)
        statistics.unassignedCount++
        statistics.distributionByPopulation[population].unassigned++
        detailedLog.push({
          asset,
          route: `${deparfrom} → ${arriveat}`,
          departureTime,
          assignedTo: "Sin Asignar",
          reason: classificationResult.reason,
          category: classificationResult.category
        })
      }
    })
    
    // Calcular tasa de éxito
    const assignedCount = statistics.changeHouseCount + statistics.fiveX2Count
    statistics.successRate = statistics.totalProcessed > 0 ? (assignedCount / statistics.totalProcessed) * 100 : 0
    
    // Actualizar estado
    setClassificationResults({
      changeHouseDataset: changeHouseData,
      fiveX2Dataset: fiveX2Data,
      unassignedDataset: unassignedData,
      statistics,
      detailedLog,
    })
    
    console.log("✅ Datasets generados:")
    console.log(`📊 Total procesado: ${statistics.totalProcessed}`)
    console.log(`🏢 Change House: ${statistics.changeHouseCount}`)
    console.log(`🔄 5x2: ${statistics.fiveX2Count}`)
    console.log(`❓ Sin asignar: ${statistics.unassignedCount}`)
    console.log(`📈 Tasa de éxito: ${statistics.successRate.toFixed(2)}%`)
  }

  // Función para exportar datos a CSV
  const exportToCSV = () => {
    if (csvData.length === 0) return

    const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${fileName.replace(".csv", "")}_processed.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Función para exportar datasets separados
  const exportSeparatedDatasets = () => {
    if (classificationResults.changeHouseDataset.length === 0 && 
        classificationResults.fiveX2Dataset.length === 0 && 
        classificationResults.unassignedDataset.length === 0) {
      console.log("No hay datasets para exportar")
      return
    }

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
    
    // Dataset Change House
    if (classificationResults.changeHouseDataset.length > 0) {
      const csvContent = [headers.join(","), ...classificationResults.changeHouseDataset.map((row) => row.join(","))].join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `Dataset_Change_House_${timestamp}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    
    // Dataset 5x2
    if (classificationResults.fiveX2Dataset.length > 0) {
      const csvContent = [headers.join(","), ...classificationResults.fiveX2Dataset.map((row) => row.join(","))].join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `Dataset_5x2_${timestamp}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    
    // Dataset Sin Asignar
    if (classificationResults.unassignedDataset.length > 0) {
      const csvContent = [headers.join(","), ...classificationResults.unassignedDataset.map((row) => row.join(","))].join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `Dataset_Sin_Asignar_${timestamp}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    
    // Resumen estadístico
    const summaryData = [
      ["Métrica", "Valor"],
      ["Total Procesado", classificationResults.statistics.totalProcessed.toString()],
      ["Change House", classificationResults.statistics.changeHouseCount.toString()],
      ["5x2", classificationResults.statistics.fiveX2Count.toString()],
      ["Sin Asignar", classificationResults.statistics.unassignedCount.toString()],
      ["Tasa de Éxito (%)", classificationResults.statistics.successRate.toFixed(2)],
      ["", ""],
      ["Errores por Categoría", ""],
      ...Object.entries(classificationResults.statistics.errorsByCategory).map(([cat, count]) => [cat, count.toString()]),
      ["", ""],
      ["Distribución por Población", ""],
      ...Object.entries(classificationResults.statistics.distributionByPopulation).map(([pop, dist]) => 
        [pop, `CH:${dist.changeHouse} | 5x2:${dist.fiveX2} | SA:${dist.unassigned}`]
      ),
    ]
    
    const summaryContent = summaryData.map(row => row.join(",")).join("\n")
    const blob = new Blob([summaryContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `Resumen_Clasificacion_${timestamp}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log("✅ Datasets exportados exitosamente")
  }

  // Función para filtrar las rutas según el término de búsqueda
  const filteredRoutes = useMemo(() => {
    if (!searchTerm) return routes

    return routes.filter(
      (route) =>
        route.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.assets.some((asset) => asset.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [routes, searchTerm])

  // Función para generar estadísticas de los datos por activo
  const getAssetStats = () => {
    const distanceIndex = headers.findIndex((h) => h.toLowerCase() === "distance")
    const assetIndex = headers.findIndex((h) => h.toLowerCase() === "assetextra")
    const typeIndex = headers.findIndex((h) => h.toLowerCase() === "tipotrayecto")
    const cambiaderoIndex = headers.findIndex((h) => h.toLowerCase().includes("cambiadero"))

    if (distanceIndex === -1 || assetIndex === -1) return []

    const assetStats: Record<
      string,
      {
        totalDistance: number
        tripCount: number
        averageDistance: number
        uniqueRoutes: Set<string>
        completeTrips: number
        fragmentedTrips: number
        changeHouseTrips: number
        fiveX2Trips: number
      }
    > = {}

    const departureIndex = headers.findIndex((h) => h.toLowerCase() === "deparfrom")
    const arrivalIndex = headers.findIndex((h) => h.toLowerCase() === "arriveat")

    csvData.forEach((row) => {
      const asset = row[assetIndex] || "Sin especificar"
      const distance = Number.parseFloat(row[distanceIndex]) || 0
      const route = departureIndex !== -1 && arrivalIndex !== -1 ? `${row[departureIndex]}-${row[arrivalIndex]}` : ""
      const tripType = typeIndex !== -1 ? row[typeIndex] : "Desconocido"
      const cambiadero = cambiaderoIndex !== -1 ? row[cambiaderoIndex] : ""

      if (!assetStats[asset]) {
        assetStats[asset] = {
          totalDistance: 0,
          tripCount: 0,
          averageDistance: 0,
          uniqueRoutes: new Set(),
          completeTrips: 0,
          fragmentedTrips: 0,
          changeHouseTrips: 0,
          fiveX2Trips: 0,
        }
      }

      assetStats[asset].totalDistance += distance
      assetStats[asset].tripCount += 1
      if (route) assetStats[asset].uniqueRoutes.add(route)

      if (tripType === "Completo") {
        assetStats[asset].completeTrips += 1
      } else if (tripType === "Fragmentado") {
        assetStats[asset].fragmentedTrips += 1
      }

      if (cambiadero === "Cambiadero Change House") {
        assetStats[asset].changeHouseTrips += 1
      } else if (cambiadero === "Cambiadero 5x2") {
        assetStats[asset].fiveX2Trips += 1
      }
    })

    // Calcular promedios y transformar a array
    return Object.entries(assetStats)
      .map(([asset, stats]) => ({
        asset,
        totalDistance: stats.totalDistance,
        tripCount: stats.tripCount,
        averageDistance: stats.totalDistance / stats.tripCount,
        uniqueRouteCount: stats.uniqueRoutes.size,
        completeTrips: stats.completeTrips,
        fragmentedTrips: stats.fragmentedTrips,
        changeHouseTrips: stats.changeHouseTrips,
        fiveX2Trips: stats.fiveX2Trips,
      }))
      .sort((a, b) => b.totalDistance - a.totalDistance)
  }

  const assetStats = useMemo(() => getAssetStats(), [csvData, headers])

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Barra superior con título y acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col"
        >
          <h1 className="text-3xl font-bold text-center sm:text-left">
            CerreTrack Analytics
          </h1>
          {fileName && !isPreview && (
            <p className="text-sm text-muted-foreground mt-1">
              Archivo actual: <span className="font-medium">{fileName}</span>
            </p>
          )}
          {isPreview && (
            <p className="text-sm text-muted-foreground mt-1">
              Modo demostración con separación automática Change House vs 5x2
            </p>
          )}
          {!isPreview && !fileName && (
            <p className="text-sm text-muted-foreground mt-1">
              Sistema de separación de cambiaderos por horarios - Carga tu archivo CSV para comenzar
            </p>
          )}
        </motion.div>

        <div className="flex flex-wrap gap-2">
          {transformationComplete && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 bg-transparent" 
                      onClick={() => setActiveTab("classification")}
                      disabled={!transformationComplete}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Ver Clasificación
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ver sistema de separación de cambiaderos por horarios</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 bg-transparent" onClick={exportToCSV}>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar CSV
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Exportar datos procesados con separación de cambiaderos</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 bg-transparent">
                    <Info className="mr-2 h-4 w-4" />
                    Estadísticas
                  </Button>
                </SheetTrigger>
                <SheetContent className="sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Estadísticas con Separación de Cambiaderos</SheetTitle>
                    <SheetDescription>Resumen incluyendo asignación automática por horarios</SheetDescription>
                  </SheetHeader>
                  <div className="py-4">
                    {statistics ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <StatsCard
                            title="Total de Filas"
                            value={statistics.totalRows}
                            icon={<Database className="h-4 w-4" />}
                          />
                          <StatsCard
                            title="Trayectos Válidos"
                            value={statistics.validRows}
                            icon={<Check className="h-4 w-4" />}
                            percentage={(statistics.validRows / statistics.totalRows) * 100}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <StatsCard
                            title="Change House"
                            value={statistics.changeHouseTrips}
                            icon={<Clock className="h-4 w-4" />}
                            description="Asignados por horario"
                          />
                          <StatsCard
                            title="5x2"
                            value={statistics.fiveX2Trips}
                            icon={<Clock className="h-4 w-4" />}
                            description="Asignados por horario"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <StatsCard
                            title="Trayectos Completos"
                            value={statistics.completeTrips}
                            icon={<FileCheck className="h-4 w-4" />}
                            description="En una sola fila"
                          />
                          <StatsCard
                            title="Trayectos Fragmentados"
                            value={statistics.fragmentedTrips}
                            icon={<FileSpreadsheet className="h-4 w-4" />}
                            description="Múltiples filas"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <StatsCard
                            title="Dist. Total"
                            value={`${statistics.totalDistance.toFixed(2)} km`}
                            icon={<Map className="h-4 w-4" />}
                          />
                          <StatsCard
                            title="Dist. Promedio"
                            value={`${statistics.averageDistance.toFixed(2)} km`}
                            icon={<BarChart3 className="h-4 w-4" />}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <StatsCard
                            title="Activos"
                            value={statistics.uniqueAssets}
                            icon={<FileSpreadsheet className="h-4 w-4" />}
                          />
                          <StatsCard
                            title="Sin Asignar"
                            value={statistics.unassignedTrips}
                            icon={<AlertTriangle className="h-4 w-4" />}
                          />
                        </div>

                        <Alert>
                          <Clock className="h-4 w-4" />
                          <AlertTitle>Procesamiento Avanzado con Separación por Horarios</AlertTitle>
                          <AlertDescription>
                            <div className="space-y-2">
                              <p>El sistema procesa automáticamente:</p>
                              <ul className="text-xs space-y-1 mt-2">
                                <li>• <strong>Trayectos Completos:</strong> Viajes definidos en una sola fila</li>
                                <li>• <strong>Trayectos Fragmentados:</strong> Suma múltiples filas consecutivas hasta completar el viaje</li>
                                <li>• <strong>Separación por Horarios:</strong> Solo para "Change House" → "Change House" vs "5x2"</li>
                                <li>• <strong>Filtrado Inteligente:</strong> Solo trayectos válidos Parqueadero ↔ Cambiadero</li>
                                <li>• <strong>Tolerancia:</strong> ±15 minutos (ida) / ±15 minutos (vuelta)</li>
                              </ul>
                            </div>
                          </AlertDescription>
                        </Alert>

                        {statistics.invalidRows > 0 && (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Registros no procesados</AlertTitle>
                            <AlertDescription>
                              Se encontraron {statistics.invalidRows} registros que no pudieron formar trayectos válidos
                              Parqueadero ↔ Cambiadero.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Skeleton className="h-16 w-full" />
                        <p className="text-sm text-muted-foreground mt-4">No hay estadísticas disponibles</p>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}

          <Button
            className="bg-primary hover:bg-primary/90 h-9"
            onClick={() => {
              if (activeTab === "upload") {
                document.getElementById("csv-file")?.click()
              } else {
                // Resetear el estado para nuevo análisis
                setCsvData([])
                setRawData("")
                setHeaders([])
                setFileName("")
                setQuery("")
                setQueryResults([])
                setIsPreview(false)
                setTransformationComplete(false)
                setProcessedTrips([])
                setStatistics(null)
                setValidationResults({
                  acceptedTrips: [],
                  rejectedTrips: [],
                  totalProcessed: 0,
                  cambiaderoAssignments: { changeHouse: 0, fiveX2: 0, unassigned: 0 }
                })
                setClassificationResults({
                  changeHouseDataset: [],
                  fiveX2Dataset: [],
                  unassignedDataset: [],
                  statistics: {
                    totalProcessed: 0,
                    changeHouseCount: 0,
                    fiveX2Count: 0,
                    unassignedCount: 0,
                    successRate: 0,
                    errorsByCategory: {},
                    distributionByPopulation: {}
                  },
                  detailedLog: []
                })
                setTransformedData([])
                setActiveTab("upload")
                // Limpiar el input de archivo
                const fileInput = document.getElementById("csv-file") as HTMLInputElement
                if (fileInput) {
                  fileInput.value = ""
                }
              }
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            {activeTab === "upload" ? "Cargar Archivo" : "Nuevo Análisis"}
          </Button>
        </div>
      </div>

      {/* Indicador de procesamiento */}
      {isProcessing && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Procesando con separación de cambiaderos...</span>
              <span>{processProgress.toFixed(0)}%</span>
            </div>
            <Progress value={processProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {processProgress < 30 && "Leyendo archivo..."}
              {processProgress >= 30 && processProgress < 70 && "Analizando estructura del CSV..."}
              {processProgress >= 70 && processProgress < 90 && "Aplicando separación por horarios..."}
              {processProgress >= 90 && "Calculando estadísticas con cambiaderos..."}
            </p>
          </div>
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger
            value="upload"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Cargar CSV</span>
            <span className="sm:hidden">Cargar</span>
          </TabsTrigger>
          <TabsTrigger
            value="transform"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            disabled={csvData.length === 0}
          >
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Transformar</span>
            <span className="sm:hidden">Transf.</span>
          </TabsTrigger>
          <TabsTrigger
            value="data"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            disabled={!transformationComplete}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Ver Datos</span>
            <span className="sm:hidden">Datos</span>
          </TabsTrigger>
          <TabsTrigger
            value="classification"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            disabled={!transformationComplete}
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Clasificación</span>
            <span className="sm:hidden">Clasif.</span>
          </TabsTrigger>
          <TabsTrigger
            value="routes"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            disabled={!transformationComplete}
          >
            <Map className="h-4 w-4" />
            <span className="hidden sm:inline">Trayectos</span>
            <span className="sm:hidden">Trayectos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-5 w-5 text-primary" />
                  Cargar archivo CSV con separación automática de cambiaderos
                </CardTitle>
                <CardDescription>
                  Selecciona un archivo CSV con datos de rutas. 
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid w-full items-center gap-6">
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertTitle>Separación Automática por Horarios (Solo Change House)</AlertTitle>
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-medium text-sm">🎯 Aplica únicamente cuando el destino es "Cambiadero Change House"</p>
                        <p className="font-medium text-sm text-red-600">🚫 RESTRICCIÓN: Tomarrazon, Uribia y Alojamiento NO pueden usar 5x2</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>
                            <strong>Trayectos Completos:</strong> Procesa viajes definidos en una sola fila
                          </li>
                          <li>
                            <strong>Trayectos Fragmentados:</strong> Suma distancias de múltiples filas consecutivas hasta completar el viaje
                          </li>
                          <li>
                            <strong>Orden Preservado:</strong> Mantiene el orden original de los registros
                          </li>
                          <li>
                            <strong>Filtrado Inteligente:</strong> Solo considera trayectos válidos Parqueadero ↔ Cambiadero
                          </li>
                          <li>
                            <strong>Horarios de Ida:</strong> Compara con horarios de salida desde cada población (±15 min)
                          </li>
                          <li>
                            <strong>Horarios de Vuelta:</strong> Change House (7:00 PM) vs 5x2 (5:00 PM) (±15 min)
                          </li>
                          <li>
                            <strong>Formato de Hora:</strong> Soporta formato 24h "HH:mm:ss" (ej: 06:08:27, 15:38:30)
                          </li>
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <div className="flex flex-col space-y-4">
                    <div
                      className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => document.getElementById("csv-file")?.click()}
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="rounded-full bg-primary/10 p-4">
                          <FileSpreadsheet className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium mb-1">Arrastra y suelta tu archivo CSV aquí</p>
                          <p className="text-sm text-muted-foreground">o haz clic para seleccionar un archivo</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="csv-file" className="sr-only">
                        Archivo CSV
                      </Label>
                      <Input
                        id="csv-file"
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="flex justify-center border-t pt-4">
                    <div className="max-w-md space-y-4">
                      <Label className="text-base font-medium text-center block">
                        Opciones de configuración
                      </Label>
                      <div className="flex items-center justify-center space-x-2">
                        <Checkbox
                          id="hasHeader"
                          checked={hasHeaderRow}
                          onCheckedChange={(checked) => setHasHeaderRow(checked as boolean)}
                        />
                        <label
                          htmlFor="hasHeader"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          El archivo tiene fila de encabezados
                        </label>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="delimiter" className="text-center block">Delimitador</Label>
                        <Select value={delimiter} onValueChange={setDelimiter}>
                          <SelectTrigger id="delimiter" className="w-full">
                            <SelectValue placeholder="Selecciona un delimitador" />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            <SelectItem value=",">Coma (,)</SelectItem>
                            <SelectItem value=";">Punto y coma (;)</SelectItem>
                            <SelectItem value="\t">Tabulación</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6">
                <div className="text-sm text-muted-foreground">Formatos soportados: .csv, .txt</div>
                <Button
                  disabled={!(isPreview || fileName)}
                  onClick={() => {
                    if (isPreview) {
                      setActiveTab("data")
                    } else {
                      setActiveTab("transform")
                    }
                  }}
                >
                  {isPreview ? "Ver Datos de Ejemplo" : "Continuar"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="transform">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileCheck className="mr-2 h-5 w-5 text-primary" />
                  Configurar Columnas - Separación de Cambiaderos por Horario
                </CardTitle>
                <CardDescription>
                  Configura las columnas incluyendo la columna de horario de salida para la separación automática de
                  cambiaderos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                                      <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertTitle>Lógica de Separación por Horarios (Solo Change House)</AlertTitle>
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-medium text-sm">🎯 La separación por horarios se aplica únicamente cuando el trayecto involucra "Cambiadero Change House"</p>
                          <p>El sistema utilizará la columna DepartureTime para:</p>
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Validar que el trayecto sea Parqueadero ↔ Cambiadero</li>
                            <li>Si es Change House → comparar con horarios específicos por población (ida: ±15 min)</li>
                            <li>Si es Change House → comparar con horarios de vuelta: CH (19:00) vs 5x2 (17:00) (±15 min)</li>
                            <li>Procesar trayectos completos y fragmentados preservando el orden</li>
                            <li>Asignar automáticamente al cambiadero virtual correspondiente</li>
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>

                  <Alert className="mt-4">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Procesamiento Avanzado</AlertTitle>
                    <AlertDescription>
                      <div className="mt-2 space-y-3">
                        <div>
                          <p className="font-medium text-sm">📋 Procesamiento:</p>
                          <ul className="text-xs space-y-1 mt-1">
                            <li>• <strong>Trayectos Completos:</strong> Procesa viajes definidos en una sola fila</li>
                            <li>• <strong>Trayectos Fragmentados:</strong> Suma distancias de múltiples filas consecutivas hasta completar el viaje</li>
                            <li>• <strong>Orden Preservado:</strong> Mantiene el orden original de los registros</li>
                            <li>• <strong>Filtrado Inteligente:</strong> Solo considera trayectos válidos Parqueadero ↔ Cambiadero</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-sm">⏰ Horarios de Ida (solo Change House):</p>
                          <ul className="text-xs space-y-1 mt-1">
                            <li>• Urumita: Change House (04:10) vs 5x2 (05:05)</li>
                            <li>• Villanueva: Change House (04:15) vs 5x2 (05:10)</li>
                            <li>• Valledupar: Change House (03:45) vs 5x2 (04:45)</li>
                            <li>• Fonseca: Change House (05:00) vs 5x2 (06:00)</li>
                            <li>• Barrancas: Change House (05:10) vs 5x2 (06:10)</li>
                            <li>• HatoNuevo: Change House (05:20) vs 5x2 (06:20)</li>
                            <li>• Riohacha: Change House (04:30) vs 5x2 (05:20)</li>
                            <li>• Maicao: Change House (05:00) vs 5x2 (05:50)</li>
                            <li>• Albania: Change House (05:30) vs 5x2 (06:40)</li>
                            <li>• Uribia: Change House (04:20) - <strong>🚫 RESTRINGIDO para 5x2</strong></li>
                            <li>• Tomarrazon: Change House (04:40) - <strong>🚫 RESTRINGIDO para 5x2</strong></li>
                            <li>• Alojamiento: Change House (05:40) - <strong>🚫 RESTRINGIDO para 5x2</strong></li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-sm">🔄 Horarios de Vuelta (solo Change House):</p>
                          <ul className="text-xs space-y-1 mt-1">
                            <li>• Change House: 19:00 (7:00 PM) ±15 min</li>
                            <li>• 5x2: 17:00 (5:00 PM) ±15 min</li>
                          </ul>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="assetColumn">Columna de Activo/Bus</Label>
                        <Select
                          value={columnMappings.assetExtra.toString()}
                          onValueChange={(value: string) =>
                            setColumnMappings({ ...columnMappings, assetExtra: Number.parseInt(value) })
                          }
                        >
                          <SelectTrigger id="assetColumn">
                            <SelectValue placeholder="Selecciona la columna" />
                          </SelectTrigger>
                          <SelectContent>
                            {headers.map((header, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {index + 1}: {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="departureColumn">Columna de Origen (Deparfrom)</Label>
                        <Select
                          value={columnMappings.deparfrom.toString()}
                          onValueChange={(value: string) =>
                            setColumnMappings({ ...columnMappings, deparfrom: Number.parseInt(value) })
                          }
                        >
                          <SelectTrigger id="departureColumn">
                            <SelectValue placeholder="Selecciona la columna" />
                          </SelectTrigger>
                          <SelectContent>
                            {headers.map((header, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {index + 1}: {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="arrivalColumn">Columna de Destino (Arriveat)</Label>
                        <Select
                          value={columnMappings.arriveat.toString()}
                          onValueChange={(value: string) =>
                            setColumnMappings({ ...columnMappings, arriveat: Number.parseInt(value) })
                          }
                        >
                          <SelectTrigger id="arrivalColumn">
                            <SelectValue placeholder="Selecciona la columna" />
                          </SelectTrigger>
                          <SelectContent>
                            {headers.map((header, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {index + 1}: {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="distanceColumn">Columna de Distancia</Label>
                        <Select
                          value={columnMappings.distance.toString()}
                          onValueChange={(value: string) =>
                            setColumnMappings({ ...columnMappings, distance: Number.parseInt(value) })
                          }
                        >
                          <SelectTrigger id="distanceColumn">
                            <SelectValue placeholder="Selecciona la columna" />
                          </SelectTrigger>
                          <SelectContent>
                            {headers.map((header, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {index + 1}: {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="departureTimeColumn" className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Columna de Horario de Salida
                        </Label>
                        <Select
                          value={columnMappings.departureTime.toString()}
                          onValueChange={(value: string) =>
                            setColumnMappings({ ...columnMappings, departureTime: Number.parseInt(value) })
                          }
                        >
                          <SelectTrigger id="departureTimeColumn">
                            <SelectValue placeholder="Selecciona la columna" />
                          </SelectTrigger>
                          <SelectContent>
                            {headers.map((header, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {index + 1}: {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Formato esperado: "HH:mm:ss" en formato 24 horas (ej: 06:08:27, 15:38:30)
                        </p>
                      </div>
                    </div>

                    <div className="rounded-md border overflow-hidden">
                      <div className="relative overflow-auto max-h-[400px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {headers.map((header, index) => (
                                <TableHead
                                  key={index}
                                  className={
                                    index === columnMappings.assetExtra ||
                                    index === columnMappings.deparfrom ||
                                    index === columnMappings.arriveat ||
                                    index === columnMappings.distance ||
                                    index === columnMappings.departureTime
                                      ? "bg-primary/10 sticky top-0 z-10"
                                      : "sticky top-0 z-10"
                                  }
                                >
                                  <div className="flex flex-col gap-1">
                                    <span>{header}</span>
                                    {index === columnMappings.assetExtra && (
                                      <Badge className="self-start" variant="outline">
                                        Activo
                                      </Badge>
                                    )}
                                    {index === columnMappings.deparfrom && (
                                      <Badge className="self-start" variant="outline">
                                        Origen
                                      </Badge>
                                    )}
                                    {index === columnMappings.arriveat && (
                                      <Badge className="self-start" variant="outline">
                                        Destino
                                      </Badge>
                                    )}
                                    {index === columnMappings.distance && (
                                      <Badge className="self-start" variant="outline">
                                        Distancia
                                      </Badge>
                                    )}
                                    {index === columnMappings.departureTime && (
                                      <Badge className="self-start" variant="outline">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Horario
                                      </Badge>
                                    )}
                                  </div>
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {csvData.slice(0, 5).map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                  <TableCell
                                    key={cellIndex}
                                    className={
                                      cellIndex === columnMappings.assetExtra ||
                                      cellIndex === columnMappings.deparfrom ||
                                      cellIndex === columnMappings.arriveat ||
                                      cellIndex === columnMappings.distance ||
                                      cellIndex === columnMappings.departureTime
                                        ? "bg-primary/5 font-medium"
                                        : ""
                                    }
                                  >
                                    {cellIndex === columnMappings.departureTime && cell ? (
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3 text-primary" />
                                        <span className="text-xs">{cell}</span>
                                      </div>
                                    ) : (
                                      cell || (
                                        <span className="text-muted-foreground italic">
                                          {cellIndex === columnMappings.deparfrom
                                            ? "(origen vacío)"
                                            : cellIndex === columnMappings.arriveat
                                              ? "(destino vacío)"
                                              : cellIndex === columnMappings.departureTime
                                                ? "(sin horario)"
                                                : cell}
                                        </span>
                                      )
                                    )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    {csvData.length > 5 && (
                      <p className="text-sm text-muted-foreground text-center">
                        Mostrando 5 de {csvData.length} filas - La columna de horario es esencial para la separación de
                        cambiaderos
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6">
                <Button variant="outline" onClick={() => setActiveTab("upload")}>
                  Volver
                </Button>
                <Button onClick={transformDataAdvanced} disabled={isProcessing} className="min-w-[150px]">
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Procesar con Separación
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="data">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="grid gap-6">
              <LocationFilter
                onFilterChange={(locations) => {
                  setFilteredLocations(locations)
                  // Re-aplicar el filtro a los datos
                  transformDataAdvanced()
                }}
              />

              {/* Resumen consolidado con separación de cambiaderos */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-xl flex items-center">
                      <Database className="mr-2 h-5 w-5 text-primary" />
                      Trayectos con Separación Automática de Cambiaderos
                    </CardTitle>
                    <CardDescription>
                      {csvData.length} trayectos procesados {isPreview ? "(datos de ejemplo)" : `en ${fileName}`}
                      {statistics && (
                        <span className="ml-2">
                          • {statistics.changeHouseTrips} Change House • {statistics.fiveX2Trips} 5x2 •{" "}
                          {statistics.unassignedTrips} sin asignar
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-full max-w-sm">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Buscar en los datos..."
                        className="pl-8 w-[180px] sm:w-[250px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="sm" className="h-9 bg-transparent" onClick={exportToCSV}>
                      <Download className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:ml-2">Exportar</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Resumen Consolidado con Separación de Cambiaderos */}
                  {csvData.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Resumen con Separación Automática por Horarios</h3>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Parqueadero → Change House */}
                        <Card className="border-2 border-green-200">
                          <CardHeader className="py-3">
                            <CardTitle className="text-base flex items-center">
                              <ArrowRight className="mr-2 h-4 w-4 text-green-600" />→ Change House
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">
                                {generateConsolidatedSummaryData().parqueaderoToCambiadero.changeHouse +
                                  generateConsolidatedSummaryData().cambiaderoToParqueadero.changeHouse}
                              </p>
                              <p className="text-xs text-muted-foreground">Total trayectos</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Parqueadero → 5x2 */}
                        <Card className="border-2 border-blue-200">
                          <CardHeader className="py-3">
                            <CardTitle className="text-base flex items-center">
                              <ArrowRight className="mr-2 h-4 w-4 text-blue-600" />→ 5x2
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600">
                                {generateConsolidatedSummaryData().parqueaderoToCambiadero.fiveX2 +
                                  generateConsolidatedSummaryData().cambiaderoToParqueadero.fiveX2}
                              </p>
                              <p className="text-xs text-muted-foreground">Total trayectos</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Total Ida */}
                        <Card className="border-2 border-purple-200">
                          <CardHeader className="py-3">
                            <CardTitle className="text-base flex items-center">
                              <ArrowRight className="mr-2 h-4 w-4 text-purple-600" />
                              Total Ida
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-purple-600">
                                {generateConsolidatedSummaryData().parqueaderoToCambiadero.trips}
                              </p>
                              <p className="text-xs text-muted-foreground">Parqueadero → Cambiadero</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Total Vuelta */}
                        <Card className="border-2 border-orange-200">
                          <CardHeader className="py-3">
                            <CardTitle className="text-base flex items-center">
                              <ArrowRight className="mr-2 h-4 w-4 text-orange-600 rotate-180" />
                              Total Vuelta
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-orange-600">
                                {generateConsolidatedSummaryData().cambiaderoToParqueadero.trips}
                              </p>
                              <p className="text-xs text-muted-foreground">Cambiadero → Parqueadero</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Tasa de Asignación */}
                        <Card className="border-2 border-primary/20">
                          <CardHeader className="py-3">
                            <CardTitle className="text-base flex items-center">
                              <Clock className="mr-2 h-4 w-4 text-primary" />
                              Tasa Asignación
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-primary">
                                {(() => {
                                  const total = generateConsolidatedSummaryData().total.trips
                                  const assigned =
                                    generateConsolidatedSummaryData().total.changeHouse +
                                    generateConsolidatedSummaryData().total.fiveX2
                                  return total > 0 ? ((assigned / total) * 100).toFixed(0) : 0
                                })()}%
                              </p>
                              <p className="text-xs text-muted-foreground">Asignados por horario</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-6">
                    <div className="rounded-md border">
                      <div className="relative w-full overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {headers.map((header, index) => (
                                <TableHead
                                  key={index}
                                  className={
                                    header.toLowerCase() === "assetextra" ||
                                    header.toLowerCase() === "deparfrom" ||
                                    header.toLowerCase() === "arriveat" ||
                                    header.toLowerCase() === "distance" ||
                                    header.toLowerCase() === "departuretime" ||
                                    header.toLowerCase() === "tipotrayecto" ||
                                    header.toLowerCase().includes("cambiadero")
                                      ? "bg-primary/10 font-bold"
                                      : ""
                                  }
                                >
                                  {header}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {csvData.slice(0, 10).map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                  <TableCell
                                    key={cellIndex}
                                    className={
                                      headers[cellIndex]?.toLowerCase() === "assetextra" ||
                                      headers[cellIndex]?.toLowerCase() === "deparfrom" ||
                                      headers[cellIndex]?.toLowerCase() === "arriveat" ||
                                      headers[cellIndex]?.toLowerCase() === "distance" ||
                                      headers[cellIndex]?.toLowerCase() === "departuretime" ||
                                      headers[cellIndex]?.toLowerCase().includes("camb")
                                        ? "bg-primary/5 font-medium"
                                        : ""
                                    }
                                  >
                                    {headers[cellIndex]?.toLowerCase() === "tipotrayecto" ? (
                                      <Badge variant={cell === "Fragmentado" ? "secondary" : "outline"}>{cell}</Badge>
                                    ) : headers[cellIndex]?.toLowerCase().includes("cambiadero") ? (
                                      <Badge
                                        variant={
                                          cell === "Cambiadero Change House"
                                            ? "default"
                                            : cell === "Cambiadero 5x2"
                                              ? "secondary"
                                              : "outline"
                                        }
                                      >
                                        {cell === "Cambiadero Change House"
                                          ? "🏢 Change House"
                                          : cell === "Cambiadero 5x2"
                                            ? "🔄 5x2"
                                            : cell}
                                      </Badge>
                                    ) : headers[cellIndex]?.toLowerCase() === "departuretime" ? (
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3 text-primary" />
                                        <span className="text-xs font-mono">{cell}</span>
                                      </div>
                                    ) : (
                                      cell
                                    )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {csvData.length > 10 && (
                      <p className="text-sm text-muted-foreground text-center">
                        Mostrando 10 de {csvData.length} trayectos procesados con separación de cambiaderos
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <div className="flex w-full items-center justify-between">
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-primary/10">
                        <Clock className="mr-1 h-3 w-3" />
                        Separación por horarios activa
                      </Badge>
                      <Badge variant="secondary">Tolerancia ±15 minutos</Badge>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("routes")} className="ml-auto">
                      Ver análisis detallado
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              {csvData.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <StatsCard
                    title="Separación Automática"
                    value="Activa"
                    icon={<Clock className="h-4 w-4" />}
                    description={
                      <div className="text-xs text-muted-foreground mt-2">
                        <p>✓ Horarios de ida por población</p>
                        <p>✓ Horarios de vuelta unificados</p>
                        <p>✓ Tolerancia ±15 minutos</p>
                        <p>✓ Asignación automática</p>
                      </div>
                    }
                  />

                  <StatsCard
                    title="Change House"
                    value={statistics?.changeHouseTrips || 0}
                    icon={<ArrowRight className="h-4 w-4" />}
                    description="Asignados por horario"
                  />

                  <StatsCard
                    title="5x2"
                    value={statistics?.fiveX2Trips || 0}
                    icon={<ArrowRight className="h-4 w-4" />}
                    description="Asignados por horario"
                  />

                  <StatsCard
                    title="Sin Asignar"
                    value={statistics?.unassignedTrips || 0}
                    icon={<AlertTriangle className="h-4 w-4" />}
                    description="Fuera de rangos horarios"
                  />
                </div>
              )}

              {/* Panel de Validación con Separación de Cambiaderos */}
              {validationResults.totalProcessed > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Panel de Separación de Cambiaderos por Horarios
                    </CardTitle>
                    <CardDescription>
                      Resultado detallado de la separación automática entre "Change House" y "5x2" basada en horarios de
                      salida
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Métricas de separación */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="border-2 border-green-200 bg-green-50">
                          <CardContent className="p-4 text-center">
                            <p className="text-sm text-muted-foreground">Change House</p>
                            <p className="text-2xl font-bold text-green-600">
                              {validationResults.cambiaderoAssignments.changeHouse}
                            </p>
                            <p className="text-xs text-green-700">Asignados por horario</p>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-blue-200 bg-blue-50">
                          <CardContent className="p-4 text-center">
                            <p className="text-sm text-muted-foreground">5x2</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {validationResults.cambiaderoAssignments.fiveX2}
                            </p>
                            <p className="text-xs text-blue-700">Asignados por horario</p>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-orange-200 bg-orange-50">
                          <CardContent className="p-4 text-center">
                            <p className="text-sm text-muted-foreground">Sin Asignar</p>
                            <p className="text-2xl font-bold text-orange-600">
                              {validationResults.cambiaderoAssignments.unassigned}
                            </p>
                            <p className="text-xs text-orange-700">Fuera de rangos</p>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-primary/20 bg-primary/5">
                          <CardContent className="p-4 text-center">
                            <p className="text-sm text-muted-foreground">Tasa de Éxito</p>
                            <p className="text-2xl font-bold text-primary">
                              {(() => {
                                const total =
                                  validationResults.cambiaderoAssignments.changeHouse +
                                  validationResults.cambiaderoAssignments.fiveX2 +
                                  validationResults.cambiaderoAssignments.unassigned
                                const assigned =
                                  validationResults.cambiaderoAssignments.changeHouse +
                                  validationResults.cambiaderoAssignments.fiveX2
                                return total > 0 ? ((assigned / total) * 100).toFixed(1) : 0
                              })()}%
                            </p>
                            <p className="text-xs text-primary">Separación exitosa</p>
                          </CardContent>
                        </Card>
                      </div>

                      <Tabs defaultValue="accepted" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="accepted" className="flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            Procesados ({validationResults.acceptedTrips.length})
                          </TabsTrigger>
                          <TabsTrigger value="rejected" className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Rechazados ({validationResults.rejectedTrips.length})
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="accepted" className="mt-4">
                          <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-2">
                              {validationResults.acceptedTrips.map((trip, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 border rounded-md bg-green-50 border-green-200"
                                >
                                  <div className="flex items-center gap-3">
                                    <Clock className="h-4 w-4 text-green-600" />
                                    <div>
                                      <p className="font-medium text-sm">{trip.asset}</p>
                                      <p className="text-xs text-muted-foreground">{trip.route}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Badge variant={trip.direction === "Ida" ? "default" : "secondary"}>
                                      {trip.direction === "Ida" ? "🚛 Ida" : "🔄 Vuelta"}
                                    </Badge>
                                    {trip.cambiadero && (
                                      <Badge
                                        variant={
                                          trip.cambiadero === "Cambiadero Change House" ? "default" : "secondary"
                                        }
                                      >
                                        {trip.cambiadero === "Cambiadero Change House" ? "🏢 CH" : "🔄 5x2"}
                                      </Badge>
                                    )}
                                    <Badge variant="outline" className="text-xs">
                                      {trip.type}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                              {validationResults.acceptedTrips.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                  No hay trayectos procesados aún
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="rejected" className="mt-4">
                          <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-2">
                              {validationResults.rejectedTrips.map((trip, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 border rounded-md bg-red-50 border-red-200"
                                >
                                  <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <div>
                                      <p className="font-medium text-sm">{trip.asset}</p>
                                      <p className="text-xs text-muted-foreground">{trip.route}</p>
                                      <p className="text-xs text-red-600 mt-1">{trip.reason}</p>
                                    </div>
                                  </div>
                                  <Badge variant="destructive" className="text-xs">
                                    {trip.type}
                                  </Badge>
                                </div>
                              ))}
                              {validationResults.rejectedTrips.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                  ¡Excelente! Todos los trayectos fueron procesados exitosamente
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </TabsContent>
                      </Tabs>

                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertTitle>Procesamiento Avanzado con Separación por Horarios (Solo Change House)</AlertTitle>
                        <AlertDescription>
                          <div className="space-y-2">
                            <p className="font-medium">🎯 Aplicación: Solo cuando el trayecto involucra "Cambiadero Change House"</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div>
                                <p className="font-medium">📋 Procesamiento:</p>
                                <ul className="space-y-1 mt-1">
                                  <li>• Trayectos completos y fragmentados</li>
                                  <li>• Orden original preservado</li>
                                  <li>• Filtrado Parqueadero ↔ Cambiadero</li>
                                </ul>
                              </div>
                              <div>
                                <p className="font-medium">⏰ Separación por Horarios:</p>
                                <ul className="space-y-1 mt-1">
                                  <li>• Ida: Por población (±15 min)</li>
                                  <li>• Vuelta: CH (19:00) vs 5x2 (17:00) (±15 min)</li>
                                  <li>• Formato: "HH:mm:ss" (24h)</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="classification">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="grid gap-6">
              {/* Header de la pestaña */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Clock className="h-6 w-6 text-primary" />
                    Sistema de Separación de Cambiaderos por Horarios
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Clasificación automática de "Change House" en dos cambiaderos virtuales según horarios de salida
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={generateSeparatedDatasets} variant="outline" size="sm">
                    <Clock className="h-4 w-4 mr-2" />
                    Regenerar Clasificación
                  </Button>
                  <Button 
                    onClick={exportSeparatedDatasets} 
                    disabled={classificationResults.statistics.totalProcessed === 0}
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Datasets
                  </Button>
                </div>
              </div>

              {/* Resumen estadístico principal */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Resumen de Clasificación por Horarios
                  </CardTitle>
                  <CardDescription>
                    Resultados de la separación automática según horarios de referencia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="border-2 border-gray-200 bg-gray-50">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">Total Procesado</p>
                        <p className="text-2xl font-bold text-gray-700">
                          {classificationResults.statistics.totalProcessed}
                        </p>
                        <p className="text-xs text-gray-600">Registros analizados</p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-green-200 bg-green-50">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">Change House</p>
                        <p className="text-2xl font-bold text-green-600">
                          {classificationResults.statistics.changeHouseCount}
                        </p>
                        <p className="text-xs text-green-700">Horario temprano</p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-blue-200 bg-blue-50">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">5x2</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {classificationResults.statistics.fiveX2Count}
                        </p>
                        <p className="text-xs text-blue-700">Horario tardío</p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-orange-200 bg-orange-50">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">Sin Asignar</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {classificationResults.statistics.unassignedCount}
                        </p>
                        <p className="text-xs text-orange-700">Fuera de rangos</p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-primary/20 bg-primary/5">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">Tasa de Éxito</p>
                        <p className="text-2xl font-bold text-primary">
                          {classificationResults.statistics.successRate.toFixed(1)}%
                        </p>
                        <p className="text-xs text-primary">Asignación exitosa</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Análisis de errores por categoría */}
              {Object.keys(classificationResults.statistics.errorsByCategory).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Análisis de Errores por Categoría
                    </CardTitle>
                    <CardDescription>
                      Desglose detallado de los tipos de errores y casos especiales encontrados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(classificationResults.statistics.errorsByCategory).map(([category, count]) => (
                        <div key={category} className="border rounded-md p-3 text-center">
                          <p className="text-xs text-muted-foreground capitalize">{category.replace(/_/g, ' ')}</p>
                          <p className="text-lg font-bold">{count}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Distribución por población */}
              {Object.keys(classificationResults.statistics.distributionByPopulation).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Map className="h-5 w-5 text-blue-500" />
                      Distribución por Población
                    </CardTitle>
                    <CardDescription>
                      Análisis de asignaciones por cada población con horarios específicos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {Object.entries(classificationResults.statistics.distributionByPopulation)
                          .sort(([,a], [,b]) => (a.changeHouse + a.fiveX2 + a.unassigned) - (b.changeHouse + b.fiveX2 + b.unassigned))
                          .reverse()
                          .map(([population, distribution]) => {
                            const total = distribution.changeHouse + distribution.fiveX2 + distribution.unassigned
                            return (
                              <div key={population} className="border rounded-md p-4">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-medium text-sm">{population}</h4>
                                  <Badge variant="outline">{total} total</Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div className="text-center p-2 bg-green-50 rounded border">
                                    <p className="font-medium text-green-700">Change House</p>
                                    <p className="text-green-600">{distribution.changeHouse}</p>
                                  </div>
                                  <div className="text-center p-2 bg-blue-50 rounded border">
                                    <p className="font-medium text-blue-700">5x2</p>
                                    <p className="text-blue-600">{distribution.fiveX2}</p>
                                  </div>
                                  <div className="text-center p-2 bg-orange-50 rounded border">
                                    <p className="font-medium text-orange-700">Sin Asignar</p>
                                    <p className="text-orange-600">{distribution.unassigned}</p>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Log detallado de clasificación */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-500" />
                    Log Detallado de Clasificación
                  </CardTitle>
                  <CardDescription>
                    Registro completo de decisiones de clasificación con razones detalladas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {classificationResults.detailedLog.length > 0 ? (
                        classificationResults.detailedLog.map((entry, index) => (
                          <div
                            key={index}
                            className={`border rounded-md p-3 ${
                              entry.assignedTo === "Change House"
                                ? "bg-green-50 border-green-200"
                                : entry.assignedTo === "5x2"
                                ? "bg-blue-50 border-blue-200"
                                : "bg-orange-50 border-orange-200"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {entry.asset}
                                </Badge>
                                <Badge
                                  variant={
                                    entry.assignedTo === "Change House"
                                      ? "default"
                                      : entry.assignedTo === "5x2"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                  className="text-xs"
                                >
                                  {entry.assignedTo}
                                </Badge>
                              </div>
                              <span className="text-xs text-muted-foreground font-mono">
                                {entry.departureTime}
                              </span>
                            </div>
                            <p className="text-sm font-medium mb-1">{entry.route}</p>
                            <p className="text-xs text-muted-foreground">{entry.reason}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="h-8 w-8 mx-auto mb-2" />
                          <p>No hay datos de clasificación disponibles</p>
                          <p className="text-xs">Genera la clasificación para ver el log detallado</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Información del algoritmo */}
                                            <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>🚫 RESTRICCIONES ACTIVAS para Cambiadero 5x2</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-2 text-sm">
                    <p><strong>Los siguientes parqueaderos están RESTRINGIDOS y NO pueden usar el cambiadero 5x2:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li><strong>Parqueadero Tomarrazon</strong> - Solo Change House</li>
                      <li><strong>Parqueadero Uribia</strong> - Solo Change House</li>
                      <li><strong>Parqueadero Alojamiento</strong> - Solo Change House</li>
                    </ul>
                    <p className="font-medium text-red-700">Estos parqueaderos serán automáticamente asignados a "Change House" sin importar el horario.</p>
                  </div>
                </AlertDescription>
              </Alert>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>Algoritmo de Procesamiento Avanzado con Separación por Horarios</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-3 text-sm">
                    <div>
                      <p className="font-medium">📋 Procesamiento General:</p>
                      <p><strong>PASO 1:</strong> Validación de lógica general (Parqueadero ↔ Cambiadero válidos)</p>
                      <p><strong>PASO 2:</strong> Verificación de restricciones de parqueaderos para 5x2</p>
                      <p><strong>PASO 3:</strong> Procesamiento de trayectos completos y fragmentados</p>
                      <p><strong>PASO 4:</strong> Preservación del orden original de registros</p>
                      <p><strong>PASO 5:</strong> Filtrado inteligente de trayectos válidos</p>
                    </div>
                    <div>
                      <p className="font-medium">⏰ Separación por Horarios (Solo Change House):</p>
                      <p><strong>PASO 6:</strong> Si involucra "Cambiadero Change House" → aplicar clasificación por horario</p>
                      <p><strong>PASO 7:</strong> Asignar al cambiadero virtual correspondiente (Change House vs 5x2)</p>
                      <p><strong>PASO 8:</strong> Verificación final de restricciones antes de asignar</p>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="font-medium">Viajes de Ida (Población → Change House):</p>
                        <p>• Fuente: Horario desde población</p>
                        <p>• Tolerancia: ±15 minutos</p>
                        <p>• 10 poblaciones permitidas para 5x2</p>
                        <p>• 3 poblaciones restringidas (solo Change House)</p>
                      </div>
                      <div>
                        <p className="font-medium">Viajes de Vuelta (Change House → Población):</p>
                        <p>• Fuente: Horario desde cambiadero</p>
                        <p>• Change House: 19:00 (±15 min)</p>
                        <p>• 5x2: 17:00 (±15 min) - verificando restricciones</p>
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="routes">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="grid gap-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Análisis de Trayectos con Separación de Cambiaderos</h2>
                  <p className="text-sm text-muted-foreground">
                    Análisis completo con separación automática entre "Change House" y "5x2" por horarios
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar trayectos..."
                      className="pl-8 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={exportToCSV}>
                    <Download className="h-4 w-4" />
                    <span className="sr-only md:not-sr-only md:ml-2">Exportar</span>
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Resumen con Separación de Cambiaderos</CardTitle>
                      <CardDescription>
                        Estadísticas incluyendo asignación automática por horarios de salida
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border rounded-md p-4 text-center">
                            <p className="text-sm text-muted-foreground">Rutas Únicas</p>
                            <p className="text-2xl font-bold">{routes.length}</p>
                          </div>
                          <div className="border rounded-md p-4 text-center">
                            <p className="text-sm text-muted-foreground">Total Trayectos</p>
                            <p className="text-2xl font-bold">{csvData.length}</p>
                          </div>
                        </div>

                        {statistics && (
                          <div className="grid grid-cols-3 gap-4">
                            <div className="border rounded-md p-4 text-center bg-green-50">
                              <p className="text-sm text-muted-foreground">Change House</p>
                              <p className="text-xl font-bold text-green-600">{statistics.changeHouseTrips}</p>
                            </div>
                            <div className="border rounded-md p-4 text-center bg-blue-50">
                              <p className="text-sm text-muted-foreground">5x2</p>
                              <p className="text-xl font-bold text-blue-600">{statistics.fiveX2Trips}</p>
                            </div>
                            <div className="border rounded-md p-4 text-center bg-orange-50">
                              <p className="text-sm text-muted-foreground">Sin Asignar</p>
                              <p className="text-xl font-bold text-orange-600">{statistics.unassignedTrips}</p>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Rutas más frecuentes con separación</h4>
                          <div className="space-y-2">
                            {routes.slice(0, 5).map((route, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{route.count}</Badge>
                                  <div>
                                    <span className="font-medium text-sm">{route.route}</span>
                                    <div className="flex gap-1 mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        {route.completeTrips}C
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        {route.fragmentedTrips}F
                                      </Badge>
                                      {route.changeHouseTrips > 0 && (
                                        <Badge variant="default" className="text-xs">
                                          {route.changeHouseTrips}CH
                                        </Badge>
                                      )}
                                      {route.fiveX2Trips > 0 && (
                                        <Badge variant="secondary" className="text-xs">
                                          {route.fiveX2Trips}5x2
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-sm font-medium">
                                  {formatColombianNumber(route.totalDistance)} km
                                </span>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            C = Completos, F = Fragmentados, CH = Change House, 5x2 = Cambiadero 5x2
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Detalle de Rutas con Separación de Cambiaderos</h3>
                {searchTerm && (
                  <Badge variant="secondary" className="mb-2">
                    Mostrando {filteredRoutes.length} de {routes.length} rutas
                  </Badge>
                )}
              </div>

              <div className="space-y-6">
                {filteredRoutes.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                      <Search className="h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold">No se encontraron rutas</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        No se encontraron rutas que coincidan con tu búsqueda. Intenta con otros términos.
                      </p>
                      <Button variant="outline" onClick={() => setSearchTerm("")}>
                        Mostrar todas las rutas
                      </Button>
                    </div>
                  </Card>
                ) : (
                  filteredRoutes.map((routeData, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index < 5 ? index * 0.1 : 0.5 }}
                    >
                      <RouteSummary routeData={routeData} />
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
