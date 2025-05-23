import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Datos de ejemplo del CSV compartido
const PREVIEW_DATA = [
  {
    AssetExtra: "776",
    AssetHostID: "WMT418",
    AssetID: "20156",
    SiteName: "Cerrejon Transporte / Buses Intermunicipal",
    DepartureDate: "19/05/2025",
    AssetName2: "BERMUDEZ MINDIOLA JOSE CONCEPCION _C4-COP",
    AssetExtra2: "84096746",
    FleetNumber: "3G - Movistar",
    DepartureTime: "21:24:03",
    TimeZone1: "COT",
    DepartFrom: "Riohacha Zona Urbana",
    StartLatLong: "11.54309 / -72.9081",
    TripType: "Descalificado",
    DrivingTime: "00:04:18",
    StandingTime: "00:00:57",
    Duration: "00:05:15",
    Distance: "2.38",
    StartOdoMeter: "30,285.24",
    EndOdoMeter: "30,287.62",
    MaxSpeed: "55",
    AvgSpeed: "33.18",
    ArrivalTime: "21:28:21",
    ArrivalDate: "19/05/2025",
    TimeZone2: "COT",
    ArriveAt: "Parqueadero Riohacha",
    EndLatLong: "11.53698 / -72.89134",
    NextDepartureDateTime: "20/05/2025 04:04",
    TimeZone: "COT",
    TimeAtLocation: "06:35:43",
    NrOfVisits: "1",
    TotalFuelUsedMeasured: "0.45",
    CalcFuelConsumption: "18.92",
  },
  {
    AssetExtra: "776",
    AssetHostID: "WMT418",
    AssetID: "20156",
    SiteName: "Cerrejon Transporte / Buses Intermunicipal",
    DepartureDate: "20/05/2025",
    AssetName2: "BERMUDEZ MINDIOLA JOSE CONCEPCION _C4-COP",
    AssetExtra2: "84096746",
    FleetNumber: "3G - Movistar",
    DepartureTime: "04:04:04",
    TimeZone1: "COT",
    DepartFrom: "Parqueadero Riohacha",
    StartLatLong: "11.53698 / -72.89134",
    TripType: "Descalificado",
    DrivingTime: "00:05:22",
    StandingTime: "00:00:00",
    Duration: "00:05:22",
    Distance: "3.12",
    StartOdoMeter: "30,287.62",
    EndOdoMeter: "30,290.74",
    MaxSpeed: "55",
    AvgSpeed: "34.88",
    ArrivalTime: "04:09:26",
    ArrivalDate: "20/05/2025",
    TimeZone2: "COT",
    ArriveAt: "Riohacha Zona Urbana",
    EndLatLong: "11.54309 / -72.9081",
    NextDepartureDateTime: "20/05/2025 04:09",
    TimeZone: "COT",
    TimeAtLocation: "00:00:00",
    NrOfVisits: "1",
    TotalFuelUsedMeasured: "0.59",
    CalcFuelConsumption: "18.92",
  },
  {
    AssetExtra: "776",
    AssetHostID: "WMT418",
    AssetID: "20156",
    SiteName: "Cerrejon Transporte / Buses Intermunicipal",
    DepartureDate: "20/05/2025",
    AssetName2: "BERMUDEZ MINDIOLA JOSE CONCEPCION _C4-COP",
    AssetExtra2: "84096746",
    FleetNumber: "3G - Movistar",
    DepartureTime: "04:09:26",
    TimeZone1: "COT",
    DepartFrom: "Riohacha Zona Urbana",
    StartLatLong: "11.54309 / -72.9081",
    TripType: "Descalificado",
    DrivingTime: "00:00:00",
    StandingTime: "00:00:00",
    Duration: "00:00:00",
    Distance: "0.00",
    StartOdoMeter: "30,290.74",
    EndOdoMeter: "30,290.74",
    MaxSpeed: "0",
    AvgSpeed: "0.00",
    ArrivalTime: "04:09:26",
    ArrivalDate: "20/05/2025",
    TimeZone2: "COT",
    ArriveAt: "Riohacha Zona Urbana",
    EndLatLong: "11.54309 / -72.9081",
    NextDepartureDateTime: "20/05/2025 04:09",
    TimeZone: "COT",
    TimeAtLocation: "00:00:00",
    NrOfVisits: "1",
    TotalFuelUsedMeasured: "0.00",
    CalcFuelConsumption: "0.00",
  },
]

export default function CSVPreview() {
  // Columnas clave para nuestro análisis
  const keyColumns = ["AssetExtra", "DepartFrom", "ArriveAt", "Distance"]

  // Todas las columnas disponibles
  const allColumns = Object.keys(PREVIEW_DATA[0])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Vista Previa del CSV</CardTitle>
        <CardDescription>Mostrando las primeras filas del archivo "Daily Movement Report.csv"</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {allColumns.map((column) => (
                    <TableHead key={column} className={keyColumns.includes(column) ? "bg-primary/10 font-bold" : ""}>
                      {column}
                      {keyColumns.includes(column) && (
                        <Badge className="ml-2" variant="outline">
                          Clave
                        </Badge>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {PREVIEW_DATA.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {allColumns.map((column) => (
                      <TableCell
                        key={`${rowIndex}-${column}`}
                        className={keyColumns.includes(column) ? "bg-primary/5 font-medium" : ""}
                      >
                        {row[column as keyof typeof row]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-2 p-4 border rounded-md bg-muted/20">
            <h3 className="text-sm font-medium">Información del archivo:</h3>
            <ul className="text-sm space-y-1">
              <li>
                <strong>Nombre:</strong> Daily Movement Report.csv
              </li>
              <li>
                <strong>Columnas:</strong> {allColumns.length}
              </li>
              <li>
                <strong>Columnas clave para análisis:</strong> AssetExtra, DepartFrom, ArriveAt, Distance
              </li>
              <li>
                <strong>Formato de fecha:</strong> DD/MM/YYYY
              </li>
              <li>
                <strong>Delimitador:</strong> Coma (,)
              </li>
            </ul>

            <div className="mt-4">
              <h3 className="text-sm font-medium">Notas importantes:</h3>
              <ul className="text-sm space-y-1 mt-2">
                <li>
                  Las columnas <strong>DepartFrom</strong> y <strong>ArriveAt</strong> contienen los nombres de las
                  ubicaciones.
                </li>
                <li>
                  La columna <strong>Distance</strong> muestra la distancia en kilómetros.
                </li>
                <li>
                  La columna <strong>AssetExtra</strong> identifica el vehículo o activo.
                </li>
                <li>El archivo contiene información detallada sobre tiempos, fechas y coordenadas.</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
