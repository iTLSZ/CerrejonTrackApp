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
  FileText,
  Check,
  AlertTriangle,
  Info,
  Download,
  ChevronRight,
  Search,
  Loader2,
  ExternalLink,
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
import LocationFilter from "./components/location-filter"
import RouteSummary from "./components/route-summary"
// import RouteMap from "./components/route-map"
import StatsCard from "./components/stats-card"

// Datos de ejemplo para el preview
const SAMPLE_HEADERS = ["AssetExtra", "Deparfrom", "Arriveat", "Distance", "Date", "Driver"]
const SAMPLE_DATA = [
  ["CAM001", "Madrid", "Barcelona", "621.5", "2023-05-10", "Juan Pérez"],
  ["CAM001", "Barcelona", "Valencia", "351.2", "2023-05-11", "Juan Pérez"],
  ["CAM002", "Valencia", "Sevilla", "662.8", "2023-05-10", "Ana García"],
  ["CAM003", "Madrid", "Bilbao", "401.7", "2023-05-12", "Carlos López"],
  ["CAM002", "Sevilla", "Madrid", "534.6", "2023-05-11", "Ana García"],
  ["CAM001", "Valencia", "Madrid", "357.9", "2023-05-12", "Juan Pérez"],
  ["CAM003", "Bilbao", "Barcelona", "620.3", "2023-05-13", "Carlos López"],
  ["CAM004", "Barcelona", "Sevilla", "998.2", "2023-05-14", "María Rodríguez"],
  ["CAM002", "Madrid", "Valencia", "357.9", "2023-05-13", "Ana García"],
  ["CAM004", "Sevilla", "Madrid", "534.6", "2023-05-15", "María Rodríguez"],
  ["CAM001", "Madrid", "Valencia", "357.9", "2023-05-13", "Juan Pérez"],
  ["CAM003", "Barcelona", "Madrid", "621.5", "2023-05-14", "Carlos López"],
  // Añadir más trayectos repetidos para mostrar la agrupación
  ["CAM005", "Madrid", "Barcelona", "621.5", "2023-05-16", "Pedro Sánchez"],
  ["CAM002", "Madrid", "Barcelona", "621.5", "2023-05-17", "Ana García"],
  ["CAM001", "Madrid", "Barcelona", "621.5", "2023-05-18", "Juan Pérez"],
  ["CAM003", "Madrid", "Valencia", "357.9", "2023-05-19", "Carlos López"],
  ["CAM005", "Madrid", "Valencia", "357.9", "2023-05-20", "Pedro Sánchez"],
]

// Lista válida de ubicaciones permitidas (exacta de la macro)
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
]

// Diccionario de reemplazos específicos (exacto de la macro)
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
const validateLocationExact = (location: string): { 
  isValid: boolean; 
  type: "Parqueadero" | "Cambiadero" | "Inválido"; 
  normalizedName: string;
  reason?: string 
} => {
  const normalized = normalizeLocation(location)
  
  if (!normalized || normalized === "") {
    return {
      isValid: false,
      type: "Inválido",
      normalizedName: "",
      reason: `Ubicación "${location}" no reconocida en la lista permitida`
    }
  }

  // Verificar tipo exacto
  if (normalized.startsWith("Parqueadero ")) {
    const parkingName = normalized.replace("Parqueadero ", "")
    return {
      isValid: true,
      type: "Parqueadero",
      normalizedName: normalized,
      reason: `Parqueadero "${parkingName}" validado correctamente`
    }
  } else if (normalized.startsWith("Cambiadero ")) {
    const changeName = normalized.replace("Cambiadero ", "")
    return {
      isValid: true,
      type: "Cambiadero", 
      normalizedName: normalized,
      reason: `Cambiadero "${changeName}" validado correctamente`
    }
  } else {
    return {
      isValid: false,
      type: "Inválido",
      normalizedName: normalized,
      reason: `Ubicación "${normalized}" no cumple con el formato esperado (Parqueadero/Cambiadero + Nombre)`
    }
  }
}

// Lista de restricciones específicas de rutas no permitidas
const ROUTE_RESTRICTIONS = [
  {
    origin: "Cambiadero Annex",
    destination: "Parqueadero Fonseca",
    reason: "❌ Ruta no permitida: Cambiadero Annex no debe conectar con Parqueadero Fonseca"
  },
  {
    origin: "Parqueadero Fonseca", 
    destination: "Cambiadero Annex",
    reason: "❌ Ruta no permitida: Parqueadero Fonseca no debe conectar con Cambiadero Annex"
  }
]

// Función para verificar restricciones específicas de rutas
const checkRouteRestrictions = (origin: string, destination: string): { 
  isRestricted: boolean; 
  reason?: string 
} => {
  for (const restriction of ROUTE_RESTRICTIONS) {
    if (restriction.origin === origin && restriction.destination === destination) {
      return {
        isRestricted: true,
        reason: restriction.reason
      }
    }
  }
  return { isRestricted: false }
}

// Función mejorada y más estricta para validar rutas Parqueadero ↔ Cambiadero
const isValidParqueaderoCambiaderoStrict = (origin: string, destination: string): { 
  isValid: boolean; 
  direction: "Ida" | "Vuelta" | "Inválido"; 
  reason?: string;
  originValidation?: ReturnType<typeof validateLocationExact>;
  destinationValidation?: ReturnType<typeof validateLocationExact>;
} => {
  // Verificar que ambas ubicaciones estén definidas y no vacías
  if (!origin || !destination || origin.trim() === "" || destination.trim() === "") {
    return { 
      isValid: false, 
      direction: "Inválido", 
      reason: "Origen o destino vacío o no definido" 
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
      destinationValidation
    }
  }

  if (!destinationValidation.isValid) {
    return {
      isValid: false,
      direction: "Inválido", 
      reason: `Destino inválido: ${destinationValidation.reason}`,
      originValidation,
      destinationValidation
    }
  }

  // Verificar que origen y destino sean diferentes
  if (originValidation.normalizedName === destinationValidation.normalizedName) {
    return { 
      isValid: false, 
      direction: "Inválido", 
      reason: "Origen y destino son la misma ubicación",
      originValidation,
      destinationValidation
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
      destinationValidation
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
      destinationValidation
    }
  }

  // CASO 2: Viaje de VUELTA - Cambiadero → Parqueadero (ULTRA ESTRICTO)  
  if (originValidation.type === "Cambiadero" && destinationValidation.type === "Parqueadero") {
    return { 
      isValid: true, 
      direction: "Vuelta",
      reason: `✅ Viaje de VUELTA válido: ${originValidation.normalizedName} → ${destinationValidation.normalizedName}`,
      originValidation,
      destinationValidation
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
      destinationValidation
    }
  }

  // Cambiadero → Cambiadero
  if (originValidation.type === "Cambiadero" && destinationValidation.type === "Cambiadero") {
    return { 
      isValid: false, 
      direction: "Inválido", 
      reason: `❌ Viaje entre Cambiaderos no permitido: ${originValidation.normalizedName} → ${destinationValidation.normalizedName}`,
      originValidation,
      destinationValidation
    }
  }

  // Cualquier otro caso no contemplado
  return { 
    isValid: false, 
    direction: "Inválido", 
    reason: `❌ Tipo de viaje no válido: ${originValidation.type} → ${destinationValidation.type}`,
    originValidation,
    destinationValidation
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
  const [isPreview, setIsPreview] = useState(true)
  // const [selectedRoute, setSelectedRoute] = useState<string | null>(null)
  const [delimiter, setDelimiter] = useState<string>(",")
  const [hasHeaderRow, setHasHeaderRow] = useState<boolean>(true)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [processProgress, setProcessProgress] = useState<number>(0)
  const [columnMappings, setColumnMappings] = useState<{
    assetExtra: number
    deparfrom: number
    arriveat: number
    distance: number
  }>({
    assetExtra: 0,
    deparfrom: 1,
    arriveat: 2,
    distance: 3,
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
  } | null>(null)

  // Añadir estado para las ubicaciones filtradas
  const [filteredLocations, setFilteredLocations] = useState<string[]>(ALLOWED_LOCATIONS)
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Nuevo estado para rastrear validaciones y rechazos
  const [validationResults, setValidationResults] = useState<{
    acceptedTrips: Array<{ asset: string; route: string; direction: string; type: string }>
    rejectedTrips: Array<{ asset: string; route: string; reason: string; type: string }>
    totalProcessed: number
  }>({
    acceptedTrips: [],
    rejectedTrips: [],
    totalProcessed: 0
  })

  // Cargar datos de ejemplo para el preview
  useEffect(() => {
    if (isPreview) {
      setHeaders(SAMPLE_HEADERS)
      setCsvData(SAMPLE_DATA)
      setTransformedData(SAMPLE_DATA)
      setTransformationComplete(true)
    }
  }, [isPreview])

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
      }
    })

    setColumnMappings(mapping)
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

      // Si encontramos un destino válido, terminar el trayecto
      if (currentArrival) {
        destination = currentArrival
        break
      }
    }

    // Verificar si el trayecto es válido usando la función estricta
    const validation = isValidParqueaderoCambiaderoStrict(origin, destination)
    if (validation.isValid) {
      return {
        asset,
        origin,
        destination,
        totalDistance,
        startRowIndex,
        endRowIndex,
        date: startDate,
        driver: startDriver,
        intermediateRows,
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

      // Si encontramos un origen válido, terminar el trayecto
      if (currentDeparture) {
        origin = currentDeparture
        break
      }
    }

    // Verificar si el trayecto es válido usando la función estricta
    const validation = isValidParqueaderoCambiaderoStrict(origin, destination)
    if (validation.isValid) {
      return {
        asset,
        origin,
        destination,
        totalDistance,
        startRowIndex,
        endRowIndex,
        date: endDate,
        driver: endDriver,
        intermediateRows,
      }
    } else {
      console.log(`Trayecto fragmentado rechazado para ${asset}: ${validation.reason}`)
      return null
    }
  }

  // Nueva función para procesar trayectos completos y fragmentados (MEJORADA CON VALIDACIÓN ESTRICTA)
  const processTripsAdvanced = (data: string[][]): ProcessedTrip[] => {
    const trips: ProcessedTrip[] = []
    const assetGroups: Record<string, number[]> = {}
    const rejectedTrips: Array<{ asset: string; reason: string; origin?: string; destination?: string }> = []
    const acceptedTrips: Array<{ asset: string; route: string; direction: string; type: string }> = []

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

        // Caso 1: Trayecto completo en una sola fila
        if (departure && arrival && departure !== arrival) {
          const validation = isValidParqueaderoCambiaderoStrict(departure, arrival)
          const route = `${departure} → ${arrival}`

          if (validation.isValid) {
            trips.push({
              asset,
              origin: departure,
              destination: arrival,
              totalDistance: distance,
              startRowIndex: currentRowIndex,
              endRowIndex: currentRowIndex,
              date: currentRow[headers.findIndex((h) => h.toLowerCase().includes("date"))] || undefined,
              driver: currentRow[headers.findIndex((h) => h.toLowerCase().includes("driver"))] || undefined,
              intermediateRows: [],
            })
            
            acceptedTrips.push({
              asset,
              route,
              direction: validation.direction,
              type: "Completo"
            })
            
            console.log(`✅ Trayecto completo aceptado para ${asset}: ${departure} → ${arrival} (${validation.direction})`)
          } else {
            rejectedTrips.push({
              asset,
              reason: validation.reason || "Trayecto no válido",
              origin: departure,
              destination: arrival
            })
            console.log(`❌ Trayecto completo rechazado para ${asset}: ${departure} → ${arrival} - ${validation.reason}`)
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
            
            acceptedTrips.push({
              asset,
              route,
              direction: validation.direction,
              type: "Fragmentado (desde origen)"
            })
            
            console.log(`✅ Trayecto fragmentado (desde origen) aceptado para ${asset}: ${fragmentedTrip.origin} → ${fragmentedTrip.destination}`)
            // Avanzar al siguiente segmento no procesado
            i = rowIndexes.findIndex((idx) => idx > fragmentedTrip.endRowIndex)
            if (i === -1) break
          } else {
            rejectedTrips.push({
              asset,
              reason: "Trayecto fragmentado desde origen no válido",
              origin: departure
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
            
            acceptedTrips.push({
              asset,
              route,
              direction: validation.direction,
              type: "Fragmentado (desde destino)"
            })
            
            console.log(`✅ Trayecto fragmentado (desde destino) aceptado para ${asset}: ${fragmentedTrip.origin} → ${fragmentedTrip.destination}`)
            // Avanzar al siguiente segmento no procesado
            i = rowIndexes.findIndex((idx) => idx > fragmentedTrip.endRowIndex)
            if (i === -1) break
          } else {
            rejectedTrips.push({
              asset,
              reason: "Trayecto fragmentado desde destino no válido",
              destination: arrival
            })
            console.log(`❌ Trayecto fragmentado rechazado para ${asset}: destino ${arrival}`)
            i++
          }
        }
        // Caso 4: Segmento intermedio (ni origen ni destino definidos)
        else {
          rejectedTrips.push({
            asset,
            reason: "Segmento intermedio sin origen ni destino válidos"
          })
          console.log(`⚠️ Segmento intermedio ignorado para ${asset}`)
          i++
        }
      }
    })

    // Actualizar el estado de validación para mostrar en UI
    setValidationResults({
      acceptedTrips,
      rejectedTrips: rejectedTrips.map(trip => ({
        asset: trip.asset,
        route: trip.origin && trip.destination ? `${trip.origin} → ${trip.destination}` : 
               trip.origin ? `Origen: ${trip.origin}` : 
               trip.destination ? `Destino: ${trip.destination}` : "Segmento incompleto",
        reason: trip.reason,
        type: "Rechazado"
      })),
      totalProcessed: acceptedTrips.length + rejectedTrips.length
    })

    // Mostrar resumen de validación
    console.log(`=== RESUMEN DE VALIDACIÓN ESTRICTA ===`)
    console.log(`✅ Trayectos aceptados: ${trips.length}`)
    console.log(`❌ Trayectos rechazados: ${rejectedTrips.length}`)
    console.log(`📊 Total procesado: ${acceptedTrips.length + rejectedTrips.length}`)
    console.log(`📈 Tasa de éxito: ${((trips.length / (acceptedTrips.length + rejectedTrips.length)) * 100).toFixed(2)}%`)
    
    if (rejectedTrips.length > 0) {
      console.log(`📋 Razones de rechazo:`)
      const rejectionReasons = rejectedTrips.reduce((acc, trip) => {
        acc[trip.reason] = (acc[trip.reason] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      Object.entries(rejectionReasons).forEach(([reason, count]) => {
        console.log(`  - ${reason}: ${count} casos`)
      })
    }

    return trips
  }

  // Función mejorada para determinar dirección del viaje con validación estricta
  const getTripDirectionStrict = (departure: string, arrival: string): { 
    direction: "Ida" | "Vuelta" | "Inválido"; 
    isValid: boolean; 
    reason?: string 
  } => {
    const validation = isValidParqueaderoCambiaderoStrict(departure, arrival)
    return {
      direction: validation.direction,
      isValid: validation.isValid,
      reason: validation.reason
    }
  }

  // Función para formatear números en formato colombiano
  const formatColombianNumber = (number: number, decimals = 2): string => {
    return number.toLocaleString("es-CO", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
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
        }>
        completeTrips: number
        fragmentedTrips: number
        outboundTrips: number // Parqueadero → Cambiadero
        returnTrips: number // Cambiadero → Parqueadero
        outboundDistance: number
        returnDistance: number
        validTrips: number
        invalidTrips: number
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
      })

      // Actualizar contadores por tipo de trayecto
      if (tripType === "Completo") {
        route.completeTrips += 1
      } else if (tripType === "Fragmentado") {
        route.fragmentedTrips += 1
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
      }))
      .sort((a, b) => b.count - a.count)
  }

  const generateConsolidatedSummaryData = () => {
    const departureIndex = headers.findIndex((h) => h.toLowerCase() === "deparfrom")
    const arrivalIndex = headers.findIndex((h) => h.toLowerCase() === "arriveat")
    const distanceIndex = headers.findIndex((h) => h.toLowerCase() === "distance")
    const typeIndex = headers.findIndex((h) => h.toLowerCase() === "tipotrayecto")

    if (departureIndex === -1 || arrivalIndex === -1 || distanceIndex === -1) {
      return {
        parqueaderoToCambiadero: { trips: 0, distance: 0, completeTrips: 0, fragmentedTrips: 0 },
        cambiaderoToParqueadero: { trips: 0, distance: 0, completeTrips: 0, fragmentedTrips: 0 },
        total: { trips: 0, distance: 0, completeTrips: 0, fragmentedTrips: 0 },
        invalidTrips: 0,
        validationRate: 0
      }
    }

    // Inicializar contadores
    const summary = {
      parqueaderoToCambiadero: { trips: 0, distance: 0, completeTrips: 0, fragmentedTrips: 0 },
      cambiaderoToParqueadero: { trips: 0, distance: 0, completeTrips: 0, fragmentedTrips: 0 },
      total: { trips: 0, distance: 0, completeTrips: 0, fragmentedTrips: 0 },
      invalidTrips: 0,
      validationRate: 0
    }

    let totalProcessed = 0

    // Procesar cada fila con validación estricta
    csvData.forEach((row) => {
      totalProcessed++
      const departure = row[departureIndex]
      const arrival = row[arrivalIndex]
      const distance = Number.parseFloat(row[distanceIndex]) || 0
      const tripType = typeIndex !== -1 ? row[typeIndex] : "Desconocido"

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
      } else if (validation.direction === "Vuelta") {
        // Cambiadero → Parqueadero
        summary.cambiaderoToParqueadero.trips += 1
        summary.cambiaderoToParqueadero.distance += distance
        if (tripType === "Completo") {
          summary.cambiaderoToParqueadero.completeTrips += 1
        } else if (tripType === "Fragmentado") {
          summary.cambiaderoToParqueadero.fragmentedTrips += 1
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
    })

    // Calcular tasa de validación
    summary.validationRate = totalProcessed > 0 ? ((summary.total.trips / totalProcessed) * 100) : 0

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
        `${trip.startRowIndex + 1}-${trip.endRowIndex + 1}`, // Referencia a filas originales
        trip.intermediateRows.length > 0 ? "Fragmentado" : "Completo",
      ])

      // Crear nuevos encabezados incluyendo información de procesamiento
      const newHeaders = [
        "AssetExtra",
        "Deparfrom",
        "Arriveat",
        "Distance",
        "Date",
        "Driver",
        "FilasOriginales",
        "TipoTrayecto",
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
      }
    > = {}

    const departureIndex = headers.findIndex((h) => h.toLowerCase() === "deparfrom")
    const arrivalIndex = headers.findIndex((h) => h.toLowerCase() === "arriveat")

    csvData.forEach((row) => {
      const asset = row[assetIndex] || "Sin especificar"
      const distance = Number.parseFloat(row[distanceIndex]) || 0
      const route = departureIndex !== -1 && arrivalIndex !== -1 ? `${row[departureIndex]}-${row[arrivalIndex]}` : ""
      const tripType = typeIndex !== -1 ? row[typeIndex] : "Desconocido"

      if (!assetStats[asset]) {
        assetStats[asset] = {
          totalDistance: 0,
          tripCount: 0,
          averageDistance: 0,
          uniqueRoutes: new Set(),
          completeTrips: 0,
          fragmentedTrips: 0,
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
          <h1 className="text-3xl font-bold text-center sm:text-left">CerrejonTrackApp - Análisis Avanzado de Trayectos Intermunicipales</h1>
          {fileName && !isPreview && (
            <p className="text-sm text-muted-foreground mt-1">
              Archivo actual: <span className="font-medium">{fileName}</span>
            </p>
          )}
          {isPreview && (
            <p className="text-sm text-muted-foreground mt-1">
              Modo demostración con datos de ejemplo (incluye trayectos fragmentados)
            </p>
          )}
        </motion.div>

        <div className="flex flex-wrap gap-2">
          {transformationComplete && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9" onClick={exportToCSV}>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar CSV
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Exportar datos procesados a CSV</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Info className="mr-2 h-4 w-4" />
                    Estadísticas
                  </Button>
                </SheetTrigger>
                <SheetContent className="sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Estadísticas del Análisis Avanzado</SheetTitle>
                    <SheetDescription>Resumen estadístico incluyendo trayectos fragmentados</SheetDescription>
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
                            title="Rutas Únicas"
                            value={statistics.uniqueRoutes}
                            icon={<ArrowRight className="h-4 w-4" />}
                          />
                        </div>

                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertTitle>Procesamiento Avanzado</AlertTitle>
                          <AlertDescription>
                            El sistema ahora procesa tanto trayectos completos como fragmentados, manteniendo el orden
                            de registros original y sumando distancias parciales hasta completar cada trayecto.
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
              <span>Procesando datos avanzados...</span>
              <span>{processProgress.toFixed(0)}%</span>
            </div>
            <Progress value={processProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {processProgress < 30 && "Leyendo archivo..."}
              {processProgress >= 30 && processProgress < 70 && "Analizando estructura del CSV..."}
              {processProgress >= 70 && processProgress < 90 && "Procesando trayectos completos y fragmentados..."}
              {processProgress >= 90 && "Calculando estadísticas avanzadas..."}
            </p>
          </div>
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
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
                  Cargar archivo CSV para análisis avanzado
                </CardTitle>
                <CardDescription>
                  Selecciona un archivo CSV con datos de rutas. El sistema procesará tanto trayectos completos como
                  fragmentados automáticamente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid w-full items-center gap-6">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Procesamiento Avanzado</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>
                          <strong>Trayectos Completos:</strong> Procesa viajes definidos en una sola fila
                        </li>
                        <li>
                          <strong>Trayectos Fragmentados:</strong> Suma distancias de múltiples filas consecutivas hasta
                          completar el viaje
                        </li>
                        <li>
                          <strong>Orden Preservado:</strong> Mantiene el orden original de los registros
                        </li>
                        <li>
                          <strong>Filtrado Inteligente:</strong> Solo considera trayectos válidos Parqueadero ↔
                          Cambiadero
                        </li>
                      </ul>
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

                  <div className="flex flex-col md:flex-row gap-4 border-t pt-4">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="hasHeader" className="text-base font-medium">
                        Opciones de configuración
                      </Label>
                      <div className="flex items-center space-x-2">
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

                      <div className="space-y-1.5 mt-4">
                        <Label htmlFor="delimiter">Delimitador</Label>
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

                    <div className="flex-1">
                      {isPreview && (
                        <div className="p-4 bg-muted rounded-md h-full flex flex-col justify-center">
                          <h3 className="text-lg font-semibold mb-2">Vista previa con trayectos fragmentados</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Los datos de ejemplo incluyen tanto trayectos completos como fragmentados para demostrar las
                            nuevas capacidades de procesamiento.
                          </p>
                          <Button variant="secondary" className="w-full" onClick={() => setActiveTab("data")}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Ver datos de ejemplo
                          </Button>
                        </div>
                      )}
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
                  Transformar Datos - Procesamiento Avanzado
                </CardTitle>
                <CardDescription>
                  Configura las columnas para el procesamiento avanzado que manejará tanto trayectos completos como
                  fragmentados automáticamente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Procesamiento Inteligente</AlertTitle>
                    <AlertDescription>
                      El sistema identificará automáticamente:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Trayectos completos (origen y destino en la misma fila)</li>
                        <li>
                          Trayectos fragmentados iniciados con origen (suma hacia adelante hasta encontrar destino)
                        </li>
                        <li>Trayectos fragmentados iniciados con destino (suma hacia atrás hasta encontrar origen)</li>
                        <li>Suma automática de distancias parciales para todos los tipos de trayectos fragmentados</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <Alert className="mt-4">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Filtrado de Trayectos Válidos</AlertTitle>
                    <AlertDescription>
                      Solo se procesarán trayectos válidos entre:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>
                          <strong>Parqueadero → Cambiadero</strong> (Ida)
                        </li>
                        <li>
                          <strong>Cambiadero → Parqueadero</strong> (Vuelta)
                        </li>
                      </ul>
                      Cualquier otro tipo de trayecto será ignorado. Esto aplica tanto para trayectos completos como
                      fragmentados.
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="assetColumn">Columna de Activo/Bus</Label>
                        <Select
                          value={columnMappings.assetExtra.toString()}
                          onValueChange={(value) =>
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
                          onValueChange={(value) =>
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
                          onValueChange={(value) =>
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
                          onValueChange={(value) =>
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
                                    index === columnMappings.distance
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
                                      cellIndex === columnMappings.distance
                                        ? "bg-primary/5 font-medium"
                                        : ""
                                    }
                                  >
                                    {cell || (
                                      <span className="text-muted-foreground italic">
                                        {cellIndex === columnMappings.deparfrom
                                          ? "(origen vacío)"
                                          : cellIndex === columnMappings.arriveat
                                            ? "(destino vacío)"
                                            : cell}
                                      </span>
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
                        Mostrando 5 de {csvData.length} filas - Nota: las celdas vacías en origen/destino indican
                        trayectos fragmentados
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
                      Procesar Trayectos
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

              {/* Añadir el componente de resumen consolidado en la pestaña "data" */}
              {/* Reemplazar el componente Card existente en la pestaña "data" con este nuevo componente */}
              {/* Buscar la sección que comienza con <Card> después de <LocationFilter> en la pestaña "data" */}
              {/* y reemplazarla con el siguiente código: */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-xl flex items-center">
                      <Database className="mr-2 h-5 w-5 text-primary" />
                      Trayectos Procesados (Completos y Fragmentados)
                    </CardTitle>
                    <CardDescription>
                      {csvData.length} trayectos válidos encontrados{" "}
                      {isPreview ? "(datos de ejemplo)" : `en ${fileName}`}
                      {statistics && (
                        <span className="ml-2">
                          • {statistics.completeTrips} completos • {statistics.fragmentedTrips} fragmentados
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
                    <Button variant="outline" size="sm" className="h-9" onClick={exportToCSV}>
                      <Download className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:ml-2">Exportar</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Resumen Consolidado */}
                  {csvData.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Resumen Consolidado de Trayectos (Validación Estricta)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Parqueadero → Cambiadero */}
                        <Card className="border-2 border-green-200">
                          <CardHeader className="py-3">
                            <CardTitle className="text-base flex items-center">
                              <ArrowRight className="mr-2 h-4 w-4 text-green-600" />
                              Parqueadero → Cambiadero
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">Trayectos</p>
                                <p className="text-xl font-bold text-green-600">
                                  {generateConsolidatedSummaryData().parqueaderoToCambiadero.trips}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">Distancia</p>
                                <p className="text-xl font-bold text-green-600">
                                  {formatColombianNumber(
                                    generateConsolidatedSummaryData().parqueaderoToCambiadero.distance,
                                  )}{" "}
                                  km
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                              <span>
                                {generateConsolidatedSummaryData().parqueaderoToCambiadero.completeTrips} completos
                              </span>
                              <span>
                                {generateConsolidatedSummaryData().parqueaderoToCambiadero.fragmentedTrips} fragmentados
                              </span>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Cambiadero → Parqueadero */}
                        <Card className="border-2 border-blue-200">
                          <CardHeader className="py-3">
                            <CardTitle className="text-base flex items-center">
                              <ArrowRight className="mr-2 h-4 w-4 text-blue-600" />
                              Cambiadero → Parqueadero
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">Trayectos</p>
                                <p className="text-xl font-bold text-blue-600">
                                  {generateConsolidatedSummaryData().cambiaderoToParqueadero.trips}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">Distancia</p>
                                <p className="text-xl font-bold text-blue-600">
                                  {formatColombianNumber(
                                    generateConsolidatedSummaryData().cambiaderoToParqueadero.distance,
                                  )}{" "}
                                  km
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                              <span>
                                {generateConsolidatedSummaryData().cambiaderoToParqueadero.completeTrips} completos
                              </span>
                              <span>
                                {generateConsolidatedSummaryData().cambiaderoToParqueadero.fragmentedTrips} fragmentados
                              </span>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Total */}
                        <Card className="border-2 border-primary/20">
                          <CardHeader className="py-3">
                            <CardTitle className="text-base flex items-center">
                              <BarChart3 className="mr-2 h-4 w-4 text-primary" />
                              Total Consolidado
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">Trayectos</p>
                                <p className="text-xl font-bold text-primary">
                                  {generateConsolidatedSummaryData().total.trips}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">Distancia</p>
                                <p className="text-xl font-bold text-primary">
                                  {formatColombianNumber(generateConsolidatedSummaryData().total.distance)} km
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                              <span>{generateConsolidatedSummaryData().total.completeTrips} completos</span>
                              <span>{generateConsolidatedSummaryData().total.fragmentedTrips} fragmentados</span>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Validación Estricta */}
                        <Card className="border-2 border-orange-200">
                          <CardHeader className="py-3">
                            <CardTitle className="text-base flex items-center">
                              <Check className="mr-2 h-4 w-4 text-orange-600" />
                              Validación Estricta
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="grid grid-cols-1 gap-2">
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">Tasa de Éxito</p>
                                <p className="text-xl font-bold text-orange-600">
                                  {generateConsolidatedSummaryData().validationRate.toFixed(1)}%
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">Rechazados</p>
                                <p className="text-lg font-bold text-red-600">
                                  {generateConsolidatedSummaryData().invalidTrips}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 text-center">
                              <Badge 
                                variant={generateConsolidatedSummaryData().validationRate >= 80 ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {generateConsolidatedSummaryData().validationRate >= 80 ? "✅ Excelente" : "⚠️ Revisar"}
                              </Badge>
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
                                    header.toLowerCase() === "tipotrayecto"
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
                                      headers[cellIndex]?.toLowerCase() === "distance"
                                        ? "bg-primary/5 font-medium"
                                        : ""
                                    }
                                  >
                                    {headers[cellIndex]?.toLowerCase() === "tipotrayecto" ? (
                                      <Badge variant={cell === "Fragmentado" ? "secondary" : "outline"}>{cell}</Badge>
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
                        Mostrando 10 de {csvData.length} trayectos procesados
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <div className="flex w-full items-center justify-between">
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-primary/10">
                        Procesamiento avanzado activo
                      </Badge>
                      <Badge variant="secondary">Trayectos fragmentados incluidos</Badge>
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
                    title="Procesamiento"
                    value="Avanzado"
                    icon={<FileText className="h-4 w-4" />}
                    description={
                      <div className="text-xs text-muted-foreground mt-2">
                        <p>✓ Trayectos completos</p>
                        <p>✓ Trayectos fragmentados</p>
                        <p>✓ Suma de distancias parciales</p>
                        <p>✓ Orden de registros preservado</p>
                      </div>
                    }
                  />

                  <StatsCard
                    title="Distancia Total"
                    value={(() => {
                      const distanceIndex = headers.findIndex((h) => h.toLowerCase() === "distance")
                      if (distanceIndex !== -1) {
                        const total = csvData.reduce(
                          (sum, row) => sum + (Number.parseFloat(row[distanceIndex]) || 0),
                          0,
                        )
                        return formatColombianNumber(total) + " km"
                      }
                      return "N/A"
                    })()}
                    icon={<Map className="h-4 w-4" />}
                  />

                  <StatsCard
                    title="Total de Trayectos"
                    value={csvData.length}
                    icon={<ArrowRight className="h-4 w-4" />}
                  />

                  <StatsCard
                    title="Activos Únicos"
                    value={(() => {
                      const assetIndex = headers.findIndex((h) => h.toLowerCase() === "assetextra")
                      if (assetIndex !== -1) {
                        const uniqueAssets = new Set(csvData.map((row) => row[assetIndex]))
                        return uniqueAssets.size
                      }
                      return "N/A"
                    })()}
                    icon={<FileSpreadsheet className="h-4 w-4" />}
                  />
                </div>
              )}

              {csvData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Resumen por Activo (Incluyendo Trayectos Fragmentados)
                    </CardTitle>
                    <CardDescription>
                      Análisis detallado por activo con diferenciación de tipos de trayecto
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-6">
                        {assetStats.map(
                          ({ asset, totalDistance, tripCount, averageDistance, completeTrips, fragmentedTrips }) => (
                            <div key={asset} className="space-y-3">
                              <div className="flex justify-between">
                                <div>
                                  <h4 className="font-medium flex items-center gap-2">
                                    {asset}
                                    <Badge variant="outline">{tripCount} trayectos total</Badge>
                                  </h4>
                                  <div className="flex gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {completeTrips} completos
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {fragmentedTrips} fragmentados
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {averageDistance.toFixed(2)} km promedio por trayecto
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold">{totalDistance.toFixed(2)} km</p>
                                  <p className="text-xs text-muted-foreground">
                                    {((fragmentedTrips / tripCount) * 100).toFixed(1)}% fragmentados
                                  </p>
                                </div>
                              </div>

                              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                                <div
                                  className="bg-primary h-2.5 rounded-full transition-all"
                                  style={{
                                    width: `${(totalDistance / assetStats[0].totalDistance) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Panel de Validación Estricta */}
              {validationResults.totalProcessed > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      Panel de Validación Estricta en Tiempo Real
                    </CardTitle>
                    <CardDescription>
                      Resultado detallado del procesamiento con validaciones estrictas Parqueadero ↔ Cambiadero
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Métricas de validación */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="border-2 border-green-200 bg-green-50">
                          <CardContent className="p-4 text-center">
                            <p className="text-sm text-muted-foreground">Trayectos Aceptados</p>
                            <p className="text-2xl font-bold text-green-600">{validationResults.acceptedTrips.length}</p>
                            <p className="text-xs text-green-700">
                              {((validationResults.acceptedTrips.length / validationResults.totalProcessed) * 100).toFixed(1)}% del total
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-red-200 bg-red-50">
                          <CardContent className="p-4 text-center">
                            <p className="text-sm text-muted-foreground">Trayectos Rechazados</p>
                            <p className="text-2xl font-bold text-red-600">{validationResults.rejectedTrips.length}</p>
                            <p className="text-xs text-red-700">
                              {((validationResults.rejectedTrips.length / validationResults.totalProcessed) * 100).toFixed(1)}% del total
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-blue-200 bg-blue-50">
                          <CardContent className="p-4 text-center">
                            <p className="text-sm text-muted-foreground">Viajes de Ida</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {validationResults.acceptedTrips.filter(trip => trip.direction === "Ida").length}
                            </p>
                            <p className="text-xs text-blue-700">Parqueadero → Cambiadero</p>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-purple-200 bg-purple-50">
                          <CardContent className="p-4 text-center">
                            <p className="text-sm text-muted-foreground">Viajes de Vuelta</p>
                            <p className="text-2xl font-bold text-purple-600">
                              {validationResults.acceptedTrips.filter(trip => trip.direction === "Vuelta").length}
                            </p>
                            <p className="text-xs text-purple-700">Cambiadero → Parqueadero</p>
                          </CardContent>
                        </Card>
                      </div>

                      <Tabs defaultValue="accepted" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="accepted" className="flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            Aceptados ({validationResults.acceptedTrips.length})
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
                                <div key={index} className="flex items-center justify-between p-3 border rounded-md bg-green-50 border-green-200">
                                  <div className="flex items-center gap-3">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <div>
                                      <p className="font-medium text-sm">{trip.asset}</p>
                                      <p className="text-xs text-muted-foreground">{trip.route}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Badge variant={trip.direction === "Ida" ? "default" : "secondary"}>
                                      {trip.direction === "Ida" ? "🚛 Ida" : "🔄 Vuelta"}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {trip.type}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                              {validationResults.acceptedTrips.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                  No hay trayectos aceptados aún
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="rejected" className="mt-4">
                          <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-2">
                              {validationResults.rejectedTrips.map((trip, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-md bg-red-50 border-red-200">
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
                                  ¡Excelente! Todos los trayectos fueron aceptados
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </TabsContent>
                      </Tabs>

                      {/* Resumen de razones de rechazo */}
                      {validationResults.rejectedTrips.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-3">Razones principales de rechazo:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {Object.entries(
                              validationResults.rejectedTrips.reduce((acc, trip) => {
                                acc[trip.reason] = (acc[trip.reason] || 0) + 1
                                return acc
                              }, {} as Record<string, number>)
                            ).map(([reason, count]) => (
                              <div key={reason} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                                <span className="text-muted-foreground">{reason}</span>
                                <Badge variant="outline">{count}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Validación Estricta Activa</AlertTitle>
                        <AlertDescription>
                          El sistema aplica validaciones estrictas que solo aceptan trayectos válidos entre:
                          <br />• <strong>Parqueadero → Cambiadero</strong> (Ida)
                          <br />• <strong>Cambiadero → Parqueadero</strong> (Vuelta)
                          <br />Cualquier otro tipo de trayecto es automáticamente rechazado.
                        </AlertDescription>
                      </Alert>

                      {/* Sección de Restricciones Específicas */}
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Restricciones Específicas de Rutas</AlertTitle>
                        <AlertDescription>
                          <p className="mb-2">Las siguientes rutas están específicamente prohibidas:</p>
                          <div className="space-y-1 text-sm">
                            {ROUTE_RESTRICTIONS.map((restriction, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded border-l-4 border-red-400">
                                <span className="text-red-600">🚫</span>
                                <span className="font-mono text-xs">
                                  {restriction.origin} → {restriction.destination}
                                </span>
                              </div>
                            ))}
                          </div>
                          <p className="mt-2 text-xs opacity-75">
                            Estas restricciones se aplican independientemente del tipo de ubicación.
                          </p>
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="routes">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="grid gap-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Análisis Avanzado de Trayectos</h2>
                  <p className="text-sm text-muted-foreground">
                    Análisis completo incluyendo trayectos fragmentados entre Parqueaderos y Cambiaderos
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
                {/* Map visualization removed */}

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Resumen Avanzado de Trayectos</CardTitle>
                      <CardDescription>Estadísticas incluyendo procesamiento de trayectos fragmentados</CardDescription>
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
                          <div className="grid grid-cols-2 gap-4">
                            <div className="border rounded-md p-4 text-center bg-green-50">
                              <p className="text-sm text-muted-foreground">Completos</p>
                              <p className="text-xl font-bold text-green-600">{statistics.completeTrips}</p>
                            </div>
                            <div className="border rounded-md p-4 text-center bg-blue-50">
                              <p className="text-sm text-muted-foreground">Fragmentados</p>
                              <p className="text-xl font-bold text-blue-600">{statistics.fragmentedTrips}</p>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Rutas más frecuentes</h4>
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
                                    </div>
                                  </div>
                                </div>
                                <span className="text-sm font-medium">
                                  {formatColombianNumber(route.totalDistance)} km
                                </span>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">C = Completos, F = Fragmentados</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Detalle de Rutas con Información de Procesamiento</h3>
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
