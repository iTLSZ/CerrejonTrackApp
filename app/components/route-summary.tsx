import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

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
    }>
  }
}

export default function RouteSummary({ routeData }: RouteSummaryProps) {
  // Extraer origen y destino del nombre de la ruta
  const [origin, destination] = routeData.route.split(" → ")

  // Asegurar que los valores numéricos sean precisos
  const totalDistance = Number.parseFloat(routeData.totalDistance.toFixed(2))
  const averageDistance = Number.parseFloat(routeData.averageDistance.toFixed(2))

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {routeData.route}
              <Badge variant="outline">{routeData.count} viajes</Badge>
            </CardTitle>
            <CardDescription>
              {totalDistance.toFixed(2)} km en total | {averageDistance.toFixed(2)} km promedio
            </CardDescription>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium">
              {routeData.uniqueAssets} {routeData.uniqueAssets === 1 ? "activo" : "activos"} diferentes
            </span>
            <div className="text-xs text-muted-foreground">{routeData.assets.join(", ")}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Origen:</span>
            <span className="font-medium">{origin}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Destino:</span>
            <span className="font-medium">{destination}</span>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activo</TableHead>
                  <TableHead>Distancia</TableHead>
                  {routeData.trips[0]?.date && <TableHead>Fecha</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {routeData.trips.slice(0, 5).map((trip, tripIndex) => (
                  <TableRow key={tripIndex}>
                    <TableCell>{trip.asset}</TableCell>
                    <TableCell>
                      {typeof trip.distance === "number" ? trip.distance.toFixed(2) : trip.distance} km
                    </TableCell>
                    {trip.date && <TableCell>{trip.date}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {routeData.trips.length > 5 && (
            <p className="text-xs text-muted-foreground text-center">Mostrando 5 de {routeData.trips.length} viajes</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
