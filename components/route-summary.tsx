"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ArrowRight, ArrowLeft, TrendingUp, Users, RotateCcw, ChevronUp } from "lucide-react"
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
      cambiadero?: string
    }>
    completeTrips: number
    fragmentedTrips: number
    outboundTrips: number
    returnTrips: number
    outboundDistance: number
    returnDistance: number
    changeHouseTrips?: number
    fiveX2Trips?: number
  }
}

// Función para formatear números en formato colombiano
const formatColombianNumber = (number: number, decimals = 2): string => {
  return number.toLocaleString("es-CO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
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
    changeHouseTrips = 0,
    fiveX2Trips = 0,
  } = routeData

  // Detectar si es una ruta que involucra Change House o 5x2
  const isChangeHouse5x2Route =
    route.includes("Change House") ||
    route.includes("5x2") ||
    trips.some(
      (trip) =>
        trip.cambiadero === "Cambiadero Change House" ||
        trip.cambiadero === "Cambiadero 5x2" ||
        trip.fullRoute.includes("Change House") ||
        trip.fullRoute.includes("5x2"),
    )

  // Separar viajes por cambiadero
  const changeHouseOutbound = trips.filter(
    (t) =>
      t.direction === "Ida" && (t.cambiadero === "Cambiadero Change House" || t.fullRoute.includes("Change House")),
  )
  const changeHouseReturn = trips.filter(
    (t) =>
      t.direction === "Vuelta" && (t.cambiadero === "Cambiadero Change House" || t.fullRoute.includes("Change House")),
  )
  const fiveX2Outbound = trips.filter(
    (t) => t.direction === "Ida" && (t.cambiadero === "Cambiadero 5x2" || t.fullRoute.includes("5x2")),
  )
  const fiveX2Return = trips.filter(
    (t) => t.direction === "Vuelta" && (t.cambiadero === "Cambiadero 5x2" || t.fullRoute.includes("5x2")),
  )

  const changeHouseOutboundDistance = changeHouseOutbound.reduce((sum, t) => sum + t.distance, 0)
  const changeHouseReturnDistance = changeHouseReturn.reduce((sum, t) => sum + t.distance, 0)
  const fiveX2OutboundDistance = fiveX2Outbound.reduce((sum, t) => sum + t.distance, 0)
  const fiveX2ReturnDistance = fiveX2Return.reduce((sum, t) => sum + t.distance, 0)

  const changeHouseTotalTrips = changeHouseOutbound.length + changeHouseReturn.length
  const changeHouseTotalDistance = changeHouseOutboundDistance + changeHouseReturnDistance
  const fiveX2TotalTrips = fiveX2Outbound.length + fiveX2Return.length
  const fiveX2TotalDistance = fiveX2OutboundDistance + fiveX2ReturnDistance

  return (
    <Card className="w-full border-2">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-600">
              <RotateCcw className="h-5 w-5" />
              Ruta Unificada: {route}
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              Análisis bidireccional completo - {count} viajes totales por {formatColombianNumber(totalDistance)} km
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-sm font-medium">{formatColombianNumber(totalDistance)} km total</div>
            <div className="text-xs text-muted-foreground">{uniqueAssets} activos</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Resumen principal bidireccional */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Viajes de Ida */}
          <div className="border rounded-lg p-4 bg-green-50 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRight className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Viajes de Ida</span>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{outboundTrips}</p>
              <p className="text-sm text-green-700 mt-1">{formatColombianNumber(outboundDistance)} km</p>
              <p className="text-xs text-green-600 mt-1">
                Promedio: {outboundTrips > 0 ? formatColombianNumber(outboundDistance / outboundTrips) : "0,00"} km
              </p>
            </div>
          </div>

          {/* Viajes de Vuelta */}
          <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <ArrowLeft className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Viajes de Vuelta</span>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{returnTrips}</p>
              <p className="text-sm text-blue-700 mt-1">{formatColombianNumber(returnDistance)} km</p>
              <p className="text-xs text-blue-600 mt-1">
                Promedio: {returnTrips > 0 ? formatColombianNumber(returnDistance / returnTrips) : "0,00"} km
              </p>
            </div>
          </div>

          {/* Total Unificado */}
          <div className="border rounded-lg p-4 bg-purple-50 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-800">Total Unificado</span>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{count}</p>
              <p className="text-sm text-purple-700 mt-1">{formatColombianNumber(totalDistance)} km</p>
              <p className="text-xs text-purple-600 mt-1">Promedio: {formatColombianNumber(averageDistance)} km</p>
            </div>
          </div>
        </div>

        {/* Separación por Cambiaderos - SOLO para Change House/5x2 */}
        {isChangeHouse5x2Route && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Change House */}
            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-blue-800">Change House</h4>
                <Badge variant="outline" className="bg-blue-100">
                  {changeHouseTotalTrips} viajes
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-center mb-3">
                  <p className="text-2xl font-bold text-blue-600">{changeHouseTotalTrips} viajes</p>
                  <p className="text-sm text-blue-700">{formatColombianNumber(changeHouseTotalDistance)} km</p>
                  <p className="text-xs text-blue-600">
                    Promedio:{" "}
                    {changeHouseTotalTrips > 0
                      ? formatColombianNumber(changeHouseTotalDistance / changeHouseTotalTrips)
                      : "0,00"}{" "}
                    km
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Ida: {changeHouseOutbound.length}</span>
                    <br />
                    <span className="text-muted-foreground">
                      {formatColombianNumber(changeHouseOutboundDistance)} km
                    </span>
                    <br />
                    <span className="text-muted-foreground">
                      Prom:{" "}
                      {changeHouseOutbound.length > 0
                        ? formatColombianNumber(changeHouseOutboundDistance / changeHouseOutbound.length)
                        : "0,00"}{" "}
                      km
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vuelta: {changeHouseReturn.length}</span>
                    <br />
                    <span className="text-muted-foreground">{formatColombianNumber(changeHouseReturnDistance)} km</span>
                    <br />
                    <span className="text-muted-foreground">
                      Prom:{" "}
                      {changeHouseReturn.length > 0
                        ? formatColombianNumber(changeHouseReturnDistance / changeHouseReturn.length)
                        : "0,00"}{" "}
                      km
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5x2 */}
            <div className="border rounded-lg p-4 bg-green-50 border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-green-800">5x2</h4>
                <Badge variant="outline" className="bg-green-100">
                  {fiveX2TotalTrips} viajes
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-center mb-3">
                  <p className="text-2xl font-bold text-green-600">{fiveX2TotalTrips} viajes</p>
                  <p className="text-sm text-green-700">{formatColombianNumber(fiveX2TotalDistance)} km</p>
                  <p className="text-xs text-green-600">
                    Promedio:{" "}
                    {fiveX2TotalTrips > 0 ? formatColombianNumber(fiveX2TotalDistance / fiveX2TotalTrips) : "0,00"} km
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Ida: {fiveX2Outbound.length}</span>
                    <br />
                    <span className="text-muted-foreground">{formatColombianNumber(fiveX2OutboundDistance)} km</span>
                    <br />
                    <span className="text-muted-foreground">
                      Prom:{" "}
                      {fiveX2Outbound.length > 0
                        ? formatColombianNumber(fiveX2OutboundDistance / fiveX2Outbound.length)
                        : "0,00"}{" "}
                      km
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vuelta: {fiveX2Return.length}</span>
                    <br />
                    <span className="text-muted-foreground">{formatColombianNumber(fiveX2ReturnDistance)} km</span>
                    <br />
                    <span className="text-muted-foreground">
                      Prom:{" "}
                      {fiveX2Return.length > 0
                        ? formatColombianNumber(fiveX2ReturnDistance / fiveX2Return.length)
                        : "0,00"}{" "}
                      km
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Diseño simple para otros cambiaderos */}
        {!isChangeHouse5x2Route && (
          <div className="text-center py-4 border rounded-lg bg-gray-50">
            <p className="text-sm text-muted-foreground">Cambiadero estándar - No requiere separación especial</p>
            <div className="flex justify-center gap-4 mt-2">
              <Badge variant="outline">{completeTrips} Completos</Badge>
              <Badge variant="outline">{fragmentedTrips} Fragmentados</Badge>
            </div>
          </div>
        )}

        {/* Estadísticas de procesamiento */}
        <div className="flex flex-wrap gap-2 justify-center py-2 border-t border-b">
          <Badge variant="outline" className="bg-blue-50">
            {completeTrips} Completos
          </Badge>
          <Badge variant="outline" className="bg-green-50">
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
            <Button variant="outline" className="w-full bg-transparent border-blue-200 hover:bg-blue-50">
              <span>{isExpanded ? "Ocultar" : "Ver"} detalles de viajes</span>
              {isExpanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Activo</TableHead>
                    <TableHead className="font-semibold">Ruta Completa</TableHead>
                    <TableHead className="font-semibold">Dirección</TableHead>
                    <TableHead className="font-semibold">Distancia</TableHead>
                    <TableHead className="font-semibold">Tipo</TableHead>
                    <TableHead className="font-semibold">Fecha</TableHead>
                    <TableHead className="font-semibold">Filas Orig.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trips.map((trip, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{trip.asset}</TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate" title={trip.fullRoute}>
                        {trip.fullRoute}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={trip.direction === "Ida" ? "default" : "secondary"}
                          className={
                            trip.direction === "Ida" ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-500 hover:bg-gray-600"
                          }
                        >
                          {trip.direction === "Ida" ? (
                            <>
                              <ArrowRight className="h-3 w-3 mr-1" />
                              Ida
                            </>
                          ) : (
                            <>
                              <ArrowLeft className="h-3 w-3 mr-1" />
                              Vuelta
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{formatColombianNumber(trip.distance)} km</TableCell>
                      <TableCell>
                        <Badge variant={trip.type === "Fragmentado" ? "outline" : "secondary"}>{trip.type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{trip.date || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs bg-gray-100">
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
