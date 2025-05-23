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
import RouteMap from "./components/route-map"
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

// Mapeo de normalización para unificar parqueaderos similares
const LOCATION_NORMALIZATION: Record<string, string> = {
  // Grupo Fonseca
  "Fonseca Zona Urbana-30 Km/h, Parqueadero Fonseca": "Parqueadero Fonseca",
  "Fonseca Zona Urbana-30 Km/h, Parqueadero Fonseca-MANT": "Parqueadero Fonseca",
  "Fonseca Zona Urbana-30 Km/h, Parqueadero Fonseca Temporal": "Parqueadero Fonseca",
  "Fonseca Zona Urbana-30 Km/h, PC42.In-Out Parqueadero Fonseca Temporal": "Parqueadero Fonseca",
  "Fonseca Zona Urbana-30 Km/h, Parqueadero Fonseca 2": "Parqueadero Fonseca",

  // Grupo San Juan
  "Parqueadero San Juan": "Parqueadero San Juan",
  "Parqueadero San Juan 2": "Parqueadero San Juan",

  // Grupo Mina Buses Blancos
  "Parqueadero Mina Buses Blancos": "Parqueadero Mina Buses Blancos",
  "Parqueadero Mina Buses Blancos, Parqueadero Ruta Urbana": "Parqueadero Mina Buses Blancos",
  "Parqueadero Mina Buses Blancos, PC31.Entrada Parqueadero Ruta Urbana-Fin": "Parqueadero Mina Buses Blancos",

  // Grupo Hato Nuevo
  "Parqueadero Hato Nuevo": "Parqueadero Hato Nuevo",
  "Hato Nuevo Zona Urbana, Parqueadero Hato Nuevo-Antiguo": "Parqueadero Hato Nuevo",
  "Hato Nuevo Zona Urbana, Parqueadero Hato Nuevo-Antiguo, PC44.In-Out Parqueadero Hato Nuevo":
    "Parqueadero Hato Nuevo",

  // Grupo Villanueva
  "Parqueadero Villanueva": "Parqueadero Villanueva",
  "PC40.In-Out Parqueadero Villanueva": "Parqueadero Villanueva",
  "Parqueadero Villanueva, PC40.In-Out Parqueadero Villanueva": "Parqueadero Villanueva",

  // Grupo Urumita
  "Parqueadero Urumita": "Parqueadero Urumita",
  "PC39.In-Out Parqueadero Urumita": "Parqueadero Urumita",
  "Parqueadero Urumita, PC39.In-Out Parqueadero Urumita": "Parqueadero Urumita",

  // Grupo Maicao
  "Parqueadero Maicao": "Parqueadero Maicao",
  "PC43.In-Out Parqueadero Maicao": "Parqueadero Maicao",
}

// Lista unificada de ubicaciones permitidas
const ALLOWED_LOCATIONS = [
  // Parqueaderos unificados
  "Parqueadero Fonseca",
  "Parqueadero Villanueva",
  "Parqueadero Valledupar",
  "Parqueadero Hato Nuevo",
  "Parqueadero San Juan",
  "Parqueadero Barrancas",
  "Parqueadero Mina Buses Blancos",
  "Parqueadero Urumita",
  "Parqueadero Albania",
  "Parqueadero Riohacha",
  "Parqueadero Maicao",
  "Parqueadero Tomarrazon, Tomarrazon",
  "comunidad Soporte a Uribia, Parqueadero Uribia 2",

  // Cambiaderos
  "Cambiadero Patilla, Mina-60 Km/h",
  "Cambiadero Change House, Vias Administrativos- 45Km/h",
  "Cambiadero Change House, PC20.Administrativo 1, Vias Administrativos- 45Km/h",
  "Cambiadero Oreganal, Mina-60 Km/h, PCT5.Tajo Oreganal,Tajo100,Tajo Comuneros",
  "Cambiadero Annex, Mina-60 Km/h, PCT7-Tajo Tabaco",
  "Cambiadero Change House, Estación de Residuos. Changue Hause, Vias Administrativos- 45Km/h",
  "Cambiadero La Puente, Mina-60 Km/h",
  "Mina-60 Km/h, PC47.In-Out Cambiadero La Puente",
]

// Función para normalizar nombres de ubicaciones
const normalizeLocation = (location: string): string => {
  return LOCATION_NORMALIZATION[location] || location
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
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)
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
  } | null>(null)

  // Añadir estado para las ubicaciones filtradas
  const [filteredLocations, setFilteredLocations] = useState<string[]>(ALLOWED_LOCATIONS)
  const [searchTerm, setSearchTerm] = useState<string>("")

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
      .filter((row) => row !== null && row.some((cell) => cell !== ""))

    console.log(`CSV procesado: ${parsedData.length} filas encontradas`)
    setProcessProgress(90)

    if (parsedData.length > 0) {
      if (hasHeaderRow) {
        setHeaders(parsedData[0])
        setCsvData(parsedData.slice(1))
      } else {
        // Si no hay encabezados, crear encabezados genéricos
        const genericHeaders = Array.from({ length: parsedData[0].length }, (_, i) => `Columna ${i + 1}`)
        setHeaders(genericHeaders)
        setCsvData(parsedData)
      }

      // Intentar detectar automáticamente las columnas
      detectColumns(parsedData[0])
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

  const transformData = () => {
    setIsProcessing(true)
    setProcessProgress(0)

    // Usar setTimeout para permitir que la UI se actualice antes de iniciar el procesamiento pesado
    setTimeout(() => {
      const totalRows = csvData.length

      // Crear una copia de los datos originales
      let processed = 0
      const transformed = csvData
        .map((row, index) => {
          // Actualizar progreso durante la transformación
          if (index % 100 === 0 || index === totalRows - 1) {
            const progress = Math.min(95, Math.floor((index / totalRows) * 100))
            setProcessProgress(progress)
          }

          // Verificar que la fila tenga suficientes columnas y datos válidos
          if (
            row.length <=
              Math.max(
                columnMappings.assetExtra,
                columnMappings.deparfrom,
                columnMappings.arriveat,
                columnMappings.distance,
              ) ||
            !row[columnMappings.distance] || // Asegurar que haya un valor de distancia
            isNaN(Number.parseFloat(row[columnMappings.distance])) // Asegurar que la distancia sea un número
          ) {
            return null
          }

          // Normalizar los nombres de origen y destino
          const origin = normalizeLocation(row[columnMappings.deparfrom])
          const destination = normalizeLocation(row[columnMappings.arriveat])

          // Excluir trayectos donde origen y destino son iguales
          if (origin === destination) {
            return null
          }

          // Verificar si el origen y destino normalizados están en la lista de ubicaciones permitidas
          const isOriginAllowed =
            filteredLocations.includes(origin) ||
            Object.keys(LOCATION_NORMALIZATION).some(
              (loc) =>
                LOCATION_NORMALIZATION[loc] === origin && filteredLocations.includes(LOCATION_NORMALIZATION[loc]),
            )

          const isDestinationAllowed =
            filteredLocations.includes(destination) ||
            Object.keys(LOCATION_NORMALIZATION).some(
              (loc) =>
                LOCATION_NORMALIZATION[loc] === destination && filteredLocations.includes(LOCATION_NORMALIZATION[loc]),
            )

          if (!isOriginAllowed || !isDestinationAllowed) {
            return null
          }

          processed++

          // Crear una nueva fila con las columnas mapeadas y los nombres normalizados
          const newRow = []
          newRow[0] = row[columnMappings.assetExtra] // AssetExtra
          newRow[1] = origin // Deparfrom normalizado
          newRow[2] = destination // Arriveat normalizado

          // Asegurar que la distancia sea un número válido
          const distanceValue = Number.parseFloat(row[columnMappings.distance])
          newRow[3] = isNaN(distanceValue) ? "0" : distanceValue.toString() // Distance

          // Copiar otras columnas si existen
          for (let i = 4; i < headers.length; i++) {
            if (i < row.length) {
              newRow[i] = row[i]
            } else {
              newRow[i] = ""
            }
          }

          return newRow
        })
        .filter((row) => row !== null) as string[][]

      console.log(`Datos transformados: ${transformed.length} filas válidas de ${totalRows} (${processed} procesadas)`)
      setProcessProgress(98)

      // Crear nuevos encabezados
      const newHeaders = ["AssetExtra", "Deparfrom", "Arriveat", "Distance", ...headers.slice(4)]

      setHeaders(newHeaders)
      setTransformedData(transformed)
      calculateStats(transformed, newHeaders)

      setTimeout(() => {
        setProcessProgress(100)
        setCsvData(transformed)
        setTransformationComplete(true)
        setActiveTab("data")
        setIsProcessing(false)
      }, 500)
    }, 100)
  }

  const calculateStats = (data: string[][], headers: string[]) => {
    const distanceIndex = headers.findIndex((h) => h.toLowerCase() === "distance")
    const assetIndex = headers.findIndex((h) => h.toLowerCase() === "assetextra")
    const departureIndex = headers.findIndex((h) => h.toLowerCase() === "deparfrom")
    const arrivalIndex = headers.findIndex((h) => h.toLowerCase() === "arriveat")

    if (distanceIndex === -1) return null

    let totalDistance = 0
    let validRows = 0
    let invalidRows = 0
    const origins = new Set<string>()
    const destinations = new Set<string>()
    const routes = new Set<string>()
    const assets = new Set<string>()

    data.forEach((row) => {
      const distance = Number.parseFloat(row[distanceIndex])

      if (!isNaN(distance)) {
        totalDistance += distance
        validRows++

        if (assetIndex !== -1 && row[assetIndex]) {
          assets.add(row[assetIndex])
        }

        if (departureIndex !== -1 && row[departureIndex]) {
          origins.add(row[departureIndex])
        }

        if (arrivalIndex !== -1 && row[arrivalIndex]) {
          destinations.add(row[arrivalIndex])
        }

        if (departureIndex !== -1 && arrivalIndex !== -1 && row[departureIndex] && row[arrivalIndex]) {
          routes.add(`${row[departureIndex]}-${row[arrivalIndex]}`)
        }
      } else {
        invalidRows++
      }
    })

    const stats = {
      totalRows: data.length,
      validRows,
      invalidRows,
      totalDistance,
      averageDistance: validRows > 0 ? totalDistance / validRows : 0,
      uniqueOrigins: origins.size,
      uniqueDestinations: destinations.size,
      uniqueRoutes: routes.size,
      uniqueAssets: assets.size,
    }

    console.log("Estadísticas de datos:", stats)
    setStatistics(stats)
    return stats
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
      // Calculate distance by route (departure-arrival)
      else if (lowerQuery.includes("distance by route") || lowerQuery.includes("distancia por ruta")) {
        const distanceIndex = headers.findIndex((h) => h.toLowerCase() === "distance")
        const departureIndex = headers.findIndex((h) => h.toLowerCase() === "deparfrom")
        const arrivalIndex = headers.findIndex((h) => h.toLowerCase() === "arriveat")

        if (distanceIndex !== -1 && departureIndex !== -1 && arrivalIndex !== -1) {
          const distanceByRoute: Record<string, number> = {}

          csvData.forEach((row) => {
            const departure = row[departureIndex] || "Sin especificar"
            const arrival = row[arrivalIndex] || "Sin especificar"
            const route = `${departure} → ${arrival}`
            const distance = Number.parseFloat(row[distanceIndex]) || 0

            distanceByRoute[route] = (distanceByRoute[route] || 0) + distance
          })

          results = Object.entries(distanceByRoute).map(([route, distance]) => [route, distance.toFixed(2) + " km"])
        }
      }
      // Filter by column value
      else if (lowerQuery.includes("where")) {
        const columnCondition = query.split("where")[1].trim()
        const [columnName, value] = columnCondition.split("=").map((s) => s.trim())
        const cleanValue = value.replace(/['"]/g, "")

        const columnIndex = headers.findIndex((h) => h.toLowerCase() === columnName.toLowerCase())

        if (columnIndex !== -1) {
          results = csvData.filter((row) => row[columnIndex]?.toLowerCase() === cleanValue.toLowerCase())
        }
      }
      // Count by column
      else if (lowerQuery.includes("count") && lowerQuery.includes("group by")) {
        const columnName = query.split("group by")[1].trim()
        const columnIndex = headers.findIndex((h) => h.toLowerCase() === columnName.toLowerCase())

        if (columnIndex !== -1) {
          const counts: Record<string, number> = {}
          csvData.forEach((row) => {
            const value = row[columnIndex] || "N/A"
            counts[value] = (counts[value] || 0) + 1
          })

          results = Object.entries(counts).map(([value, count]) => [value, count.toString()])
        }
      }
      // Show all data
      else if (lowerQuery.includes("select all") || lowerQuery.includes("select *")) {
        results = csvData
      }
      // Default to showing first 10 rows
      else {
        results = csvData.slice(0, 10)
      }

      // Mostrar resultados en la pestaña actual
      setQueryResults(results)
    } catch (error) {
      console.error("Error executing query:", error)
      setQueryResults([["Error executing query"]])
    }
  }

  const calculateRoutes = () => {
    const departureIndex = headers.findIndex((h) => h.toLowerCase() === "deparfrom")
    const arrivalIndex = headers.findIndex((h) => h.toLowerCase() === "arriveat")
    const distanceIndex = headers.findIndex((h) => h.toLowerCase() === "distance")
    const assetIndex = headers.findIndex((h) => h.toLowerCase() === "assetextra")

    // Agrupar por ruta (origen-destino)
    const routeGroups: Record<
      string,
      {
        count: number
        totalDistance: number
        assets: Set<string>
        trips: Array<{ asset: string; distance: number; date?: string }>
      }
    > = {}

    let totalProcessed = 0
    let invalidDistances = 0

    csvData.forEach((row) => {
      totalProcessed++
      const departure = row[departureIndex]
      const arrival = row[arrivalIndex]

      if (!departure || !arrival) {
        console.warn("Fila descartada por falta de origen o destino:", row)
        return
      }

      const routeKey = `${departure} → ${arrival}`
      const distanceStr = row[distanceIndex]
      const distance = Number.parseFloat(distanceStr)

      if (isNaN(distance)) {
        console.warn(`Distancia inválida en fila: ${distanceStr}`, row)
        invalidDistances++
        return
      }

      const asset = assetIndex !== -1 ? row[assetIndex] : "Desconocido"
      const date =
        row[headers.findIndex((h) => h.toLowerCase() === "date")] ||
        row[headers.findIndex((h) => h.toLowerCase().includes("date"))] ||
        ""

      if (!routeGroups[routeKey]) {
        routeGroups[routeKey] = {
          count: 0,
          totalDistance: 0,
          assets: new Set(),
          trips: [],
        }
      }

      routeGroups[routeKey].count += 1
      routeGroups[routeKey].totalDistance += distance
      routeGroups[routeKey].assets.add(asset)
      routeGroups[routeKey].trips.push({
        asset,
        distance,
        date,
      })
    })

    console.log(`Procesamiento de rutas: ${totalProcessed} filas procesadas, ${invalidDistances} distancias inválidas`)
    console.log(`Rutas únicas encontradas: ${Object.keys(routeGroups).length}`)

    // Convertir a array para ordenar
    return Object.entries(routeGroups)
      .map(([route, data]) => ({
        route,
        count: data.count,
        totalDistance: data.totalDistance,
        averageDistance: data.totalDistance / data.count,
        uniqueAssets: data.assets.size,
        assets: Array.from(data.assets),
        trips: data.trips,
      }))
      .sort((a, b) => b.count - a.count)
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

  // Crear datos para el mapa de rutas
  const getRouteMapData = () => {
    const departureIndex = headers.findIndex((h) => h.toLowerCase() === "deparfrom")
    const arrivalIndex = headers.findIndex((h) => h.toLowerCase() === "arriveat")
    const distanceIndex = headers.findIndex((h) => h.toLowerCase() === "distance")

    if (departureIndex === -1 || arrivalIndex === -1 || distanceIndex === -1) return []

    const routeMap: Record<string, { count: number; totalDistance: number }> = {}

    csvData.forEach((row) => {
      const departure = row[departureIndex]
      const arrival = row[arrivalIndex]
      const routeKey = `${departure}-${arrival}`
      const distance = Number.parseFloat(row[distanceIndex]) || 0

      if (!routeMap[routeKey]) {
        routeMap[routeKey] = { count: 0, totalDistance: 0 }
      }

      routeMap[routeKey].count += 1
      routeMap[routeKey].totalDistance += distance
    })

    return Object.entries(routeMap).map(([key, data]) => {
      const [departure, arrival] = key.split("-")
      return {
        departure,
        arrival,
        count: data.count,
        totalDistance: data.totalDistance,
      }
    })
  }

  // Memoizar los cálculos costosos para mejorar el rendimiento
  const locations = useMemo(() => getUniqueLocations(), [csvData, headers])
  const routeMapData = useMemo(() => getRouteMapData(), [csvData, headers])
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

    if (distanceIndex === -1 || assetIndex === -1) return []

    const assetStats: Record<
      string,
      {
        totalDistance: number
        tripCount: number
        averageDistance: number
        uniqueRoutes: Set<string>
      }
    > = {}

    const departureIndex = headers.findIndex((h) => h.toLowerCase() === "deparfrom")
    const arrivalIndex = headers.findIndex((h) => h.toLowerCase() === "arriveat")

    csvData.forEach((row) => {
      const asset = row[assetIndex] || "Sin especificar"
      const distance = Number.parseFloat(row[distanceIndex]) || 0
      const route = departureIndex !== -1 && arrivalIndex !== -1 ? `${row[departureIndex]}-${row[arrivalIndex]}` : ""

      if (!assetStats[asset]) {
        assetStats[asset] = {
          totalDistance: 0,
          tripCount: 0,
          averageDistance: 0,
          uniqueRoutes: new Set(),
        }
      }

      assetStats[asset].totalDistance += distance
      assetStats[asset].tripCount += 1
      if (route) assetStats[asset].uniqueRoutes.add(route)
    })

    // Calcular promedios y transformar a array
    return Object.entries(assetStats)
      .map(([asset, stats]) => ({
        asset,
        totalDistance: stats.totalDistance,
        tripCount: stats.tripCount,
        averageDistance: stats.totalDistance / stats.tripCount,
        uniqueRouteCount: stats.uniqueRoutes.size,
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
          <h1 className="text-3xl font-bold text-center sm:text-left">CerrejónTrack</h1>
          {fileName && !isPreview && (
            <p className="text-sm text-muted-foreground mt-1">
              Archivo actual: <span className="font-medium">{fileName}</span>
            </p>
          )}
          {isPreview && <p className="text-sm text-muted-foreground mt-1">Modo demostración con datos de ejemplo</p>}
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
                    <SheetTitle>Estadísticas del Análisis</SheetTitle>
                    <SheetDescription>Resumen estadístico de los datos procesados</SheetDescription>
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
                            title="Filas Válidas"
                            value={statistics.validRows}
                            icon={<Check className="h-4 w-4" />}
                            percentage={(statistics.validRows / statistics.totalRows) * 100}
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

                        <div className="grid grid-cols-2 gap-4">
                          <StatsCard
                            title="Orígenes"
                            value={statistics.uniqueOrigins}
                            icon={<FileText className="h-4 w-4" />}
                          />
                          <StatsCard
                            title="Destinos"
                            value={statistics.uniqueDestinations}
                            icon={<FileText className="h-4 w-4" />}
                          />
                        </div>

                        {statistics.invalidRows > 0 && (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Advertencia</AlertTitle>
                            <AlertDescription>
                              Se encontraron {statistics.invalidRows} filas con datos inválidos o incompletos.
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
              <span>Procesando datos...</span>
              <span>{processProgress.toFixed(0)}%</span>
            </div>
            <Progress value={processProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {processProgress < 30 && "Leyendo archivo..."}
              {processProgress >= 30 && processProgress < 70 && "Analizando estructura del CSV..."}
              {processProgress >= 70 && processProgress < 90 && "Transformando datos..."}
              {processProgress >= 90 && "Finalizando..."}
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
                  Cargar archivo CSV
                </CardTitle>
                <CardDescription>Selecciona un archivo CSV con datos de rutas para analizarlo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid w-full items-center gap-6">
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
                          <h3 className="text-lg font-semibold mb-2">Vista previa de demostración</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Actualmente estás viendo datos de ejemplo. Carga tu propio archivo CSV para analizar tus
                            datos reales.
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
                  Transformar Datos
                </CardTitle>
                <CardDescription>Configura cómo se deben interpretar las columnas de tu archivo CSV</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Importante</AlertTitle>
                    <AlertDescription>
                      Para analizar correctamente los trayectos, necesitamos identificar las columnas clave en tu
                      archivo. Por favor, selecciona qué columna corresponde a cada campo.
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
                                    {cell}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    {csvData.length > 5 && (
                      <p className="text-sm text-muted-foreground text-center">Mostrando 5 de {csvData.length} filas</p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6">
                <Button variant="outline" onClick={() => setActiveTab("upload")}>
                  Volver
                </Button>
                <Button onClick={transformData} disabled={isProcessing} className="min-w-[150px]">
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Transformar Datos
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
                  transformData()
                }}
              />

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-xl flex items-center">
                      <Database className="mr-2 h-5 w-5 text-primary" />
                      Datos del CSV
                    </CardTitle>
                    <CardDescription>
                      {csvData.length} filas encontradas {isPreview ? "(datos de ejemplo)" : `en ${fileName}`}
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
                                    header.toLowerCase() === "distance"
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
                                    {cell}
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
                        Mostrando 10 de {csvData.length} filas
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <div className="flex w-full items-center justify-between">
                    <Badge variant="outline" className="bg-primary/10">
                      Filtro activo: Solo trayectos específicos
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("routes")} className="ml-auto">
                      Ver análisis de trayectos
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              {csvData.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <StatsCard
                    title="Columnas Clave"
                    value="4"
                    icon={<FileText className="h-4 w-4" />}
                    description={
                      <div className="text-xs text-muted-foreground mt-2">
                        <p>
                          <strong>AssetExtra:</strong> Identificador del activo
                        </p>
                        <p>
                          <strong>Deparfrom:</strong> Lugar de salida
                        </p>
                        <p>
                          <strong>Arriveat:</strong> Lugar de llegada
                        </p>
                        <p>
                          <strong>Distance:</strong> Distancia en kilómetros
                        </p>
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
                        return total.toFixed(2) + " km"
                      }
                      return "N/A"
                    })()}
                    icon={<Map className="h-4 w-4" />}
                  />

                  <StatsCard title="Total de Rutas" value={csvData.length} icon={<ArrowRight className="h-4 w-4" />} />

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
                      Resumen de Distancias por Activo
                    </CardTitle>
                    <CardDescription>Distancia total recorrida por cada activo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-6">
                        {assetStats.map(({ asset, totalDistance, tripCount, averageDistance }) => (
                          <div key={asset} className="space-y-2">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-medium flex items-center">
                                  {asset}
                                  <Badge variant="outline" className="ml-2">
                                    {tripCount} viajes
                                  </Badge>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {averageDistance.toFixed(2)} km promedio por viaje
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">{totalDistance.toFixed(2)} km</p>
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
                        ))}
                      </div>
                    </ScrollArea>
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
                  <h2 className="text-2xl font-bold">Análisis de Trayectos</h2>
                  <p className="text-sm text-muted-foreground">
                    Visualización de rutas, frecuencias y distancias entre ubicaciones
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

              <div className="grid gap-4 lg:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <RouteMap routes={routeMapData} selectedRoute={selectedRoute} onRouteSelect={setSelectedRoute} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Resumen de Trayectos</CardTitle>
                      <CardDescription>Estadísticas generales de los trayectos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border rounded-md p-4 text-center">
                            <p className="text-sm text-muted-foreground">Trayectos Únicos</p>
                            <p className="text-2xl font-bold">{routes.length}</p>
                          </div>
                          <div className="border rounded-md p-4 text-center">
                            <p className="text-sm text-muted-foreground">Total Viajes</p>
                            <p className="text-2xl font-bold">{csvData.length}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Trayectos más frecuentes</h4>
                          <div className="space-y-2">
                            {routes.slice(0, 5).map((route, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-2 border rounded-md hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{route.count}</Badge>
                                  <span className="font-medium">{route.route}</span>
                                </div>
                                <span className="text-sm font-medium">{route.totalDistance.toFixed(2)} km</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Ubicaciones más frecuentes</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {(() => {
                              const locationCounts: Record<string, number> = {}
                              const departureIndex = headers.findIndex((h) => h.toLowerCase() === "deparfrom")
                              const arrivalIndex = headers.findIndex((h) => h.toLowerCase() === "arriveat")

                              if (departureIndex !== -1 && arrivalIndex !== -1) {
                                csvData.forEach((row) => {
                                  const departure = row[departureIndex]
                                  const arrival = row[arrivalIndex]

                                  locationCounts[departure] = (locationCounts[departure] || 0) + 1
                                  locationCounts[arrival] = (locationCounts[arrival] || 0) + 1
                                })

                                return Object.entries(locationCounts)
                                  .sort((a, b) => b[1] - a[1])
                                  .slice(0, 6)
                                  .map(([location, count], index) => (
                                    <div
                                      key={index}
                                      className="flex justify-between items-center p-2 border rounded-md hover:bg-muted/50 transition-colors"
                                    >
                                      <span className="truncate mr-2">{location}</span>
                                      <Badge variant="secondary">{count}</Badge>
                                    </div>
                                  ))
                              }

                              return null
                            })()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Detalle de Trayectos</h3>
                {searchTerm && (
                  <Badge variant="secondary" className="mb-2">
                    Mostrando {filteredRoutes.length} de {routes.length} trayectos
                  </Badge>
                )}
              </div>

              <div className="space-y-6">
                {filteredRoutes.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                      <Search className="h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold">No se encontraron trayectos</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        No se encontraron trayectos que coincidan con tu búsqueda. Intenta con otros términos.
                      </p>
                      <Button variant="outline" onClick={() => setSearchTerm("")}>
                        Mostrar todos los trayectos
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
