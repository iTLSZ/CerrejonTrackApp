import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ArrowRight, ArrowLeft, TrendingUp, Users, RotateCcw } from 'lucide-react'
import { useState } from "react"

interface RouteSummaryProps {
  routeData: {
    route: string
    count: number
    totalDistance: number
    averageDistance: number
    uniqueAssets: number
    assets: string[]
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
    outboundTrips: number
    returnTrips: number
    outboundDistance: number
    returnDistance: number
  }
}

// Función para formatear números en formato colombiano
const formatColombianNumber = (number: number, decimals = 2): string => {
  return number.toLocaleString('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

export default function RouteSummary({ routeData }: RouteSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const {
    route,
    count,
    totalDistance,
    averageDistance,
    uniqueAssets,
    assets,
    trips,
    completeTrips,
    fragmentedTrips,
    outboundTrips,
    returnTrips,
    outboundDistance,
    returnDistance,
  } = routeData

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-primary" />
              Ruta Unificada: {route}
            </CardTitle>
            <CardDescription className="mt-2">
              Análisis bidireccional completo - {count} viajes totales por {formatColombianNumber(totalDistance)} km
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-primary/10">
              {formatColombianNumber(totalDistance)} km total
            </Badge>
            <Badge variant="secondary">
              {uniqueAssets} {uniqueAssets === 1 ? "activo" : "activos"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Resumen bidireccional */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Viajes de Ida */}
          <div className="border rounded-lg p-4 bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRight className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Viajes de Ida</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-green-600">{outboundTrips}</p>
              <p className="text-sm text-green-700">{formatColombianNumber(outboundDistance)} km</p>
              <p className="text-xs text-green-600">
                Promedio: {outboundTrips > 0 ? formatColombianNumber(outboundDistance / outboundTrips) : "0"} km
              </p>
            </div>
          </div>

          {/* Viajes de Vuelta */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <ArrowLeft className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Viajes de Vuelta</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-blue-600">{returnTrips}</p>
              <p className="text-sm text-blue-700">{formatColombianNumber(returnDistance)} km</p>
              <p className="text-xs text-blue-600">
                Promedio: {returnTrips > 0 ? formatColombianNumber(returnDistance / returnTrips) : "0"} km
              </p>
            </div>
          </div>

          {/* Total Unificado */}
          <div className="border rounded-lg p-4 bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-medium text-primary">Total Unificado</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary">{count}</p>
              <p className="text-sm text-primary">{formatColombianNumber(totalDistance)} km</p>
              <p className="text-xs text-primary">
                Promedio: {formatColombianNumber(averageDistance)} km
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas de procesamiento */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge variant="outline" className="bg-green-50">
            {completeTrips} Completos
          </Badge>
          <Badge variant="outline" className="bg-blue-50">
            {fragmentedTrips} Fragmentados
          </Badge>
          <Badge variant="outline" className="bg-gray-50">
            <Users className="h-3 w-3 mr-1" />
            {assets.join(", ")}
          </Badge>
        </div>

        {/* Sección expandible con detalles */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full">
              <span>{isExpanded ? "Ocultar" : "Ver"} detalles de viajes</span>
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activo</TableHead>
                    <TableHead>Ruta Completa</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Distancia</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Filas Orig.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trips.map((trip, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{trip.asset}</TableCell>
                      <TableCell className="text-xs">{trip.fullRoute}</TableCell>
                      <TableCell>
                        <Badge variant={trip.direction === "Ida" ? "default" : "secondary"}>
                          {trip.direction === "Ida" ? (
                            <ArrowRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowLeft className="h-3 w-3 mr-1" />
                          )}
                          {trip.direction}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatColombianNumber(trip.distance)} km</TableCell>
                      <TableCell>
                        <Badge variant={trip.type === "Fragmentado" ? "outline" : "secondary"}>
                          {trip.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{trip.date || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {trip.originalRows || "N/A"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}