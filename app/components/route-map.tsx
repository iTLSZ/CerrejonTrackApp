"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Maximize, Minimize, ZoomIn, ZoomOut } from "lucide-react"

interface RouteMapProps {
  routes: Array<{
    departure: string
    arrival: string
    count: number
    totalDistance: number
  }>
  selectedRoute: string | null
  onRouteSelect: (route: string | null) => void
}

// Colores más profesionales para las rutas
const ROUTE_COLORS = [
  "rgba(59, 130, 246, 0.8)", // Azul
  "rgba(16, 185, 129, 0.8)", // Verde
  "rgba(239, 68, 68, 0.8)", // Rojo
  "rgba(245, 158, 11, 0.8)", // Ámbar
  "rgba(139, 92, 246, 0.8)", // Violeta
]

export default function RouteMap({ routes, selectedRoute, onRouteSelect }: RouteMapProps) {
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Extraer ubicaciones únicas
  const locations = Array.from(new Set(routes.flatMap((route) => [route.departure, route.arrival]))).sort()

  // Función para posicionar las ubicaciones en una cuadrícula circular
  const getLocationPosition = (location: string, index: number, total: number) => {
    const radius = 180 * zoom
    const angle = (index / total) * 2 * Math.PI
    const x = radius * Math.cos(angle) + 200 * zoom
    const y = radius * Math.sin(angle) + 200 * zoom
    return { x, y, name: location }
  }

  // Posicionar las ubicaciones
  const locationPositions = locations.map((loc, i) => getLocationPosition(loc, i, locations.length))

  // Manejar zoom
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5))

  // Manejar fullscreen
  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return

    if (!isFullscreen) {
      if (mapContainerRef.current.requestFullscreen) {
        mapContainerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Agrupar rutas por importancia (frecuencia)
  const routesByImportance = [...routes].sort((a, b) => b.count - a.count)
  const topRoutes = routesByImportance.slice(0, 5)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              Mapa de Trayectos
              {selectedRoute && (
                <Badge variant="outline" className="ml-2">
                  Ruta seleccionada
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Visualización interactiva de las rutas entre ubicaciones</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={handleZoomOut} className="h-8 w-8">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleZoomIn} className="h-8 w-8">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={toggleFullscreen} className="h-8 w-8">
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={mapContainerRef} className="relative w-full h-[400px] border rounded-md bg-muted/20 overflow-hidden">
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${400 * zoom} ${400 * zoom}`}
            style={{
              transformOrigin: "center",
              transition: "all 0.3s ease",
            }}
          >
            {/* Conexiones entre ubicaciones */}
            {routes.map((conn, i) => {
              const fromPos = locationPositions.find((p) => p.name === conn.departure)
              const toPos = locationPositions.find((p) => p.name === conn.arrival)

              if (!fromPos || !toPos) return null

              const isSelected = selectedRoute === `${conn.departure}-${conn.arrival}`
              const isTopRoute = topRoutes.includes(conn)

              // Calcular color y grosor basado en la frecuencia de la ruta
              const routeIndex = routesByImportance.indexOf(conn)
              const colorIndex = Math.min(routeIndex, ROUTE_COLORS.length - 1)
              const color = isSelected
                ? "var(--primary)"
                : isTopRoute
                  ? ROUTE_COLORS[colorIndex]
                  : "var(--muted-foreground)"

              const maxCount = Math.max(...routes.map((r) => r.count))
              const normalizedCount = conn.count / maxCount
              const strokeWidth = Math.max(1, Math.min(8, normalizedCount * 6))

              return (
                <g key={i}>
                  <line
                    x1={fromPos.x}
                    y1={fromPos.y}
                    x2={toPos.x}
                    y2={toPos.y}
                    stroke={color}
                    strokeWidth={isSelected ? strokeWidth + 2 : strokeWidth}
                    strokeOpacity={isSelected ? 0.9 : isTopRoute ? 0.7 : 0.3}
                    onClick={() => onRouteSelect(isSelected ? null : `${conn.departure}-${conn.arrival}`)}
                    style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                  />

                  {/* Flecha para indicar dirección */}
                  <polygon
                    points="0,-5 10,0 0,5"
                    fill={color}
                    opacity={isSelected ? 0.9 : isTopRoute ? 0.7 : 0.3}
                    transform={`translate(${(fromPos.x + toPos.x) / 2}, ${(fromPos.y + toPos.y) / 2}) 
                              rotate(${(Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x) * 180) / Math.PI})`}
                    style={{ transition: "all 0.3s ease" }}
                  />

                  {/* Etiqueta de frecuencia para rutas seleccionadas */}
                  {isSelected && (
                    <g>
                      <rect
                        x={(fromPos.x + toPos.x) / 2 - 20}
                        y={(fromPos.y + toPos.y) / 2 - 10}
                        width="40"
                        height="20"
                        rx="4"
                        fill="var(--background)"
                        stroke="var(--primary)"
                        strokeWidth="1"
                      />
                      <text
                        x={(fromPos.x + toPos.x) / 2}
                        y={(fromPos.y + toPos.y) / 2 + 5}
                        textAnchor="middle"
                        fontSize="10"
                        fill="var(--foreground)"
                      >
                        {conn.count}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}

            {/* Ubicaciones */}
            {locationPositions.map((pos, i) => (
              <g key={i}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={10}
                  fill="var(--background)"
                  stroke="var(--border)"
                  strokeWidth="2"
                  className="hover:stroke-primary transition-colors"
                />
                <text
                  x={pos.x}
                  y={pos.y + 25}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="500"
                  fill="currentColor"
                  style={{
                    textShadow: "0 0 3px var(--background), 0 0 3px var(--background), 0 0 3px var(--background)",
                  }}
                >
                  {pos.name}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="mt-4 grid gap-2">
          <h4 className="text-sm font-medium">Trayectos principales</h4>
          <div className="flex flex-wrap gap-2">
            {topRoutes.map((route, i) => (
              <Button
                key={i}
                variant={selectedRoute === `${route.departure}-${route.arrival}` ? "default" : "outline"}
                size="sm"
                className="h-auto py-1 transition-all"
                onClick={() =>
                  onRouteSelect(
                    selectedRoute === `${route.departure}-${route.arrival}`
                      ? null
                      : `${route.departure}-${route.arrival}`,
                  )
                }
              >
                <span className="flex items-center gap-1 text-xs">
                  {route.departure} <ArrowRight className="h-3 w-3" /> {route.arrival}
                  <Badge variant="secondary" className="ml-1">
                    {route.count}
                  </Badge>
                </span>
              </Button>
            ))}
          </div>

          {selectedRoute &&
            (() => {
              const [from, to] = selectedRoute.split("-")
              const route = routes.find((r) => r.departure === from && r.arrival === to)

              if (!route) return null

              return (
                <div className="mt-4 p-4 border rounded-md bg-muted/20 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {route.departure} <ArrowRight className="h-4 w-4 text-muted-foreground" /> {route.arrival}
                      </h4>
                      <p className="text-sm text-muted-foreground">{route.count} viajes realizados</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{route.totalDistance.toFixed(2)} km</p>
                      <p className="text-sm text-muted-foreground">
                        {(route.totalDistance / route.count).toFixed(2)} km promedio
                      </p>
                    </div>
                  </div>
                </div>
              )
            })()}
        </div>
      </CardContent>
    </Card>
  )
}
