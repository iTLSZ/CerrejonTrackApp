// Procesamiento y validación de trayectos extraído de page.tsx

export interface ProcessedTrip {
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

// --- Constantes y utilidades ---
export const ALLOWED_LOCATIONS = [
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
];
export const PARQUEADEROS_SOLO_CHANGE_HOUSE = [
  "Parqueadero Uribia",
  "Parqueadero Tomarrazon",
  "Parqueadero Alojamiento",
];
export const LOCATION_NORMALIZATION: Record<string, string> = {
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
  "Cambiadero Annex, Mina-60 Km/h, PCT7-Tajo Tabaco": "Cambiadero Annex",
  "Mina-60 Km/h, PCT7-Tajo Tabaco": "Cambiadero Annex",
  "Cambiadero Change House, Vias Administrativos- 45Km/h": "Cambiadero Change House",
  "Cambiadero Change House, PC20.Administrativo 1, Vias Administrativos- 45Km/h": "Cambiadero Change House",
  "Cambiadero Change House, Parqueadero Administrativo 2, Vias Administrativos- 45Km/h": "Cambiadero Change House",
  "Cambiadero La Puente, Mina-60 Km/h": "Cambiadero La Puente",
  "Cambiadero Patilla, Mina-60 Km/h": "Cambiadero Patilla",
  "Cambiadero Oreganal, Mina-60 Km/h, PCT5.Tajo Oreganal,Tajo100,Tajo Comuneros": "Cambiadero Oreganal",
  "80, 200008 Valledupar, Colombia": "Parqueadero Valledupar",
  "Carrera 22 BIS, 200005 Valledupar, Colombia": "Parqueadero Valledupar",
  "Valledupar Zona Urbana": "Parqueadero Valledupar",
};
export const OUTBOUND_SCHEDULES = {
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
};
export const RETURN_SCHEDULES = {
  "Change House": "19:00:00", // 7:00 PM
  "5x2": "17:00:00", // 5:00 PM
};

export function parseExcelTime(timeStr: string): number | null {
  if (!timeStr || typeof timeStr !== "string") return null;
  const clean = timeStr.trim();
  const format24Match = clean.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (format24Match) {
    const [_, hourStr, minStr, secStr] = format24Match;
    const hour = parseInt(hourStr, 10);
    const min = parseInt(minStr, 10);
    const sec = parseInt(secStr, 10);
    if (hour >= 0 && hour <= 23 && min >= 0 && min <= 59 && sec >= 0 && sec <= 59) {
      return hour * 60 + min + sec / 60;
    }
  }
  const cleanAmPm = clean.replace(/[\.\s]+/g, " ").replace(/([ap]) m/, "$1m");
  const formatAmPmMatch = cleanAmPm.match(/^(\d{1,2}):(\d{2}):(\d{2})\s([ap]m)$/i);
  if (formatAmPmMatch) {
    let [_, hourStr, minStr, secStr, period] = formatAmPmMatch;
    let hour = parseInt(hourStr, 10);
    const min = parseInt(minStr, 10);
    const sec = parseInt(secStr, 10);
    if (period.toLowerCase() === "pm" && hour !== 12) hour += 12;
    if (period.toLowerCase() === "am" && hour === 12) hour = 0;
    return hour * 60 + min + sec / 60;
  }
  return null;
}

// --- Normalización y validación de ubicaciones ---
export function normalizeLocation(location: string): string {
  if (!location || location.trim() === "") return "";
  const trimmedLocation = location.trim();
  for (const [key, value] of Object.entries(LOCATION_NORMALIZATION)) {
    if (trimmedLocation.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  for (const allowedLocation of ALLOWED_LOCATIONS) {
    if (trimmedLocation.toLowerCase().includes(allowedLocation.toLowerCase())) {
      return allowedLocation;
    }
  }
  return "";
}

export function validateLocationExact(location: string) {
  const normalized = normalizeLocation(location);
  if (!normalized || normalized === "") {
    return {
      isValid: false,
      type: "Inválido" as const,
      normalizedName: "",
      reason: `Ubicación "${location}" no reconocida en la lista permitida`,
    };
  }
  if (normalized.startsWith("Parqueadero ")) {
    return {
      isValid: true,
      type: "Parqueadero" as const,
      normalizedName: normalized,
      reason: `Parqueadero "${normalized.replace("Parqueadero ", "")}" validado correctamente`,
    };
  } else if (normalized.startsWith("Cambiadero ")) {
    return {
      isValid: true,
      type: "Cambiadero" as const,
      normalizedName: normalized,
      reason: `Cambiadero "${normalized.replace("Cambiadero ", "")}" validado correctamente`,
    };
  } else {
    return {
      isValid: false,
      type: "Inválido" as const,
      normalizedName: normalized,
      reason: `Ubicación "${normalized}" no cumple con el formato esperado (Parqueadero/Cambiadero + Nombre)`,
    };
  }
}

// --- Restricciones de rutas ---
const ROUTE_RESTRICTIONS = [
  { origin: "Cambiadero Annex", destination: "Parqueadero Fonseca", reason: "❌ Ruta no permitida: Cambiadero Annex no debe conectar con Parqueadero Fonseca" },
  { origin: "Parqueadero Fonseca", destination: "Cambiadero Annex", reason: "❌ Ruta no permitida: Parqueadero Fonseca no debe conectar con Cambiadero Annex" },
  { origin: "Parqueadero Alojamiento", destination: "Cambiadero Annex", reason: "❌ Ruta no permitida: Parqueadero Alojamiento no debe conectar con Cambiadero Annex" },
  { origin: "Cambiadero Annex", destination: "Parqueadero Alojamiento", reason: "❌ Ruta no permitida: Cambiadero Annex no debe conectar con Parqueadero Alojamiento" },
  { origin: "Parqueadero San Juan", destination: "Cambiadero Annex", reason: "❌ Ruta no permitida: Parqueadero San Juan no debe conectar con Cambiadero Annex" },
  { origin: "Cambiadero Annex", destination: "Parqueadero San Juan", reason: "❌ Ruta no permitida: Cambiadero Annex no debe conectar con Parqueadero San Juan" },
  { origin: "Parqueadero Uribia", destination: "Cambiadero 5x2", reason: "❌ Ruta no permitida: Parqueadero Uribia no debe conectar con Cambiadero 5x2" },
  { origin: "Cambiadero 5x2", destination: "Parqueadero Uribia", reason: "❌ Ruta no permitida: Cambiadero 5x2 no debe conectar con Parqueadero Uribia" },
  { origin: "Parqueadero Tomarrazon", destination: "Cambiadero 5x2", reason: "❌ Ruta no permitida: Parqueadero Tomarrazon no debe conectar con Cambiadero 5x2" },
  { origin: "Cambiadero 5x2", destination: "Parqueadero Tomarrazon", reason: "❌ Ruta no permitida: Cambiadero 5x2 no debe conectar con Parqueadero Tomarrazon" },
  { origin: "Parqueadero Alojamiento", destination: "Cambiadero 5x2", reason: "❌ Ruta no permitida: Parqueadero Alojamiento no debe conectar con Cambiadero 5x2" },
  { origin: "Cambiadero 5x2", destination: "Parqueadero Alojamiento", reason: "❌ Ruta no permitida: Cambiadero 5x2 no debe conectar con Parqueadero Alojamiento" },
];

export function checkRouteRestrictions(origin: string, destination: string) {
  for (const restriction of ROUTE_RESTRICTIONS) {
    if (restriction.origin === origin && restriction.destination === destination) {
      return { isRestricted: true, reason: restriction.reason };
    }
  }
  return { isRestricted: false };
}

// --- Validación estricta de trayectos ---
export function isValidParqueaderoCambiaderoStrict(origin: string, destination: string) {
  if (!origin || !destination || origin.trim() === "" || destination.trim() === "") {
    return {
      isValid: false,
      direction: "Inválido" as const,
      reason: "Origen o destino vacío o no definido",
    };
  }
  const originValidation = validateLocationExact(origin);
  const destinationValidation = validateLocationExact(destination);
  if (!originValidation.isValid) {
    return {
      isValid: false,
      direction: "Inválido" as const,
      reason: `Origen inválido: ${originValidation.reason}`,
      originValidation,
      destinationValidation,
    };
  }
  if (!destinationValidation.isValid) {
    return {
      isValid: false,
      direction: "Inválido" as const,
      reason: `Destino inválido: ${destinationValidation.reason}`,
      originValidation,
      destinationValidation,
    };
  }
  if (originValidation.normalizedName === destinationValidation.normalizedName) {
    return {
      isValid: false,
      direction: "Inválido" as const,
      reason: "Origen y destino son la misma ubicación",
      originValidation,
      destinationValidation,
    };
  }
  const restrictionCheck = checkRouteRestrictions(originValidation.normalizedName, destinationValidation.normalizedName);
  if (restrictionCheck.isRestricted) {
    return {
      isValid: false,
      direction: "Inválido" as const,
      reason: restrictionCheck.reason,
      originValidation,
      destinationValidation,
    };
  }
  if (originValidation.type === "Parqueadero" && destinationValidation.type === "Cambiadero") {
    return {
      isValid: true,
      direction: "Ida" as const,
      reason: `✅ Viaje de IDA válido: ${originValidation.normalizedName} → ${destinationValidation.normalizedName}`,
      originValidation,
      destinationValidation,
    };
  }
  if (originValidation.type === "Cambiadero" && destinationValidation.type === "Parqueadero") {
    return {
      isValid: true,
      direction: "Vuelta" as const,
      reason: `✅ Viaje de VUELTA válido: ${originValidation.normalizedName} → ${destinationValidation.normalizedName}`,
      originValidation,
      destinationValidation,
    };
  }
  if (originValidation.type === "Parqueadero" && destinationValidation.type === "Parqueadero") {
    return {
      isValid: false,
      direction: "Inválido" as const,
      reason: `❌ Viaje entre Parqueaderos no permitido: ${originValidation.normalizedName} → ${destinationValidation.normalizedName}`,
      originValidation,
      destinationValidation,
    };
  }
  if (originValidation.type === "Cambiadero" && destinationValidation.type === "Cambiadero") {
    return {
      isValid: false,
      direction: "Inválido" as const,
      reason: `❌ Viaje entre Cambiaderos no permitido: ${originValidation.normalizedName} → ${destinationValidation.normalizedName}`,
      originValidation,
      destinationValidation,
    };
  }
  return {
    isValid: false,
    direction: "Inválido" as const,
    reason: `❌ Tipo de viaje no válido: ${originValidation.type} → ${destinationValidation.type}`,
    originValidation,
    destinationValidation,
  };
}

// --- Annex helpers ---
const ANNEX_FINAL_DEST = "Cambiadero Annex";
const ANNEX_INTERMEDIATE_STOPS = ["Parqueadero San Juan", "Parqueadero Fonseca"];
const ANNEX_ORIGINS = ["Parqueadero Urumita", "Parqueadero Valledupar", "Parqueadero Waya"];
const ANNEX_RETURN_DESTS = ["Parqueadero Urumita", "Parqueadero Valledupar", "Parqueadero Waya"];

export function isAnnexOrigin(location: string) {
  return ANNEX_ORIGINS.includes(location);
}
export function isAnnexIntermediateStop(location: string) {
  return ANNEX_INTERMEDIATE_STOPS.includes(location);
}
export function isAnnexFinalDest(location: string) {
  return location === ANNEX_FINAL_DEST;
}
export function isAnnexReturnDest(location: string) {
  return ANNEX_RETURN_DESTS.includes(location);
}

// --- Fragmented trip helpers ---
export function processFragmentedTripFromOrigin(
  data: string[][],
  asset: string,
  assetRowIndexes: number[],
  startIndex: number,
  origin: string,
  headers: string[],
  columnMappings: { deparfrom: number; arriveat: number; distance: number; departureTime: number },
): ProcessedTrip | null {
  let totalDistance = 0;
  let destination = "";
  let endRowIndex = assetRowIndexes[startIndex];
  const intermediateRows: number[] = [];
  const startRowIndex = assetRowIndexes[startIndex];
  const startRow = data[startRowIndex];
  const startDate = startRow[headers.findIndex((h) => h.toLowerCase().includes("date"))] || undefined;
  const startDriver = startRow[headers.findIndex((h) => h.toLowerCase().includes("driver"))] || undefined;
  const departureTime = startRow[columnMappings.departureTime] || undefined;
  totalDistance += Number.parseFloat(startRow[columnMappings.distance]) || 0;
  for (let i = startIndex + 1; i < assetRowIndexes.length; i++) {
    const currentRowIndex = assetRowIndexes[i];
    const currentRow = data[currentRowIndex];
    const currentArrival = normalizeLocation(currentRow[columnMappings.arriveat]);
    const currentDistance = Number.parseFloat(currentRow[columnMappings.distance]) || 0;
    totalDistance += currentDistance;
    intermediateRows.push(currentRowIndex);
    endRowIndex = currentRowIndex;
    if (isAnnexOrigin(origin)) {
      if (isAnnexIntermediateStop(currentArrival)) {
        continue;
      }
      if (isAnnexFinalDest(currentArrival)) {
        destination = currentArrival;
        break;
      }
    } else {
      if (currentArrival) {
        destination = currentArrival;
        break;
      }
    }
  }
  let finalOrigin = origin;
  let finalDestination = destination;
  let assignedCambiadero = "";
  let cambiaderoReason = "No aplica separación";
  const involvesChangeHouse = destination === "Cambiadero Change House" || origin === "Cambiadero Change House";
  if (involvesChangeHouse && departureTime) {
    const cambiaderoResult = determineCambiadero(origin, destination, departureTime);
    if (cambiaderoResult.isValid && cambiaderoResult.cambiadero) {
      if (origin === "Cambiadero Change House") {
        finalOrigin = cambiaderoResult.cambiadero;
      } else if (destination === "Cambiadero Change House") {
        finalDestination = cambiaderoResult.cambiadero;
      }
      assignedCambiadero = cambiaderoResult.cambiadero;
      cambiaderoReason = cambiaderoResult.reason;
    } else {
      cambiaderoReason = cambiaderoResult.reason;
      assignedCambiadero = destination.startsWith("Cambiadero") ? destination : origin;
    }
  } else if (involvesChangeHouse) {
    cambiaderoReason = "Sin horario disponible para clasificar";
    assignedCambiadero = destination.startsWith("Cambiadero") ? destination : origin;
  }
  const validation = isValidParqueaderoCambiaderoStrict(finalOrigin, finalDestination);
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
    };
  } else {
    return null;
  }
}

export function processFragmentedTripFromDestination(
  data: string[][],
  asset: string,
  assetRowIndexes: number[],
  startIndex: number,
  destination: string,
  headers: string[],
  columnMappings: { deparfrom: number; arriveat: number; distance: number; departureTime: number },
): ProcessedTrip | null {
  let totalDistance = 0;
  let origin = "";
  let startRowIndex = assetRowIndexes[startIndex];
  const intermediateRows: number[] = [];
  const endRowIndex = assetRowIndexes[startIndex];
  const endRow = data[endRowIndex];
  const endDate = endRow[headers.findIndex((h) => h.toLowerCase().includes("date"))] || undefined;
  const endDriver = endRow[headers.findIndex((h) => h.toLowerCase().includes("driver"))] || undefined;
  const departureTime = endRow[columnMappings.departureTime] || undefined;
  totalDistance += Number.parseFloat(endRow[columnMappings.distance]) || 0;
  for (let i = startIndex - 1; i >= 0; i--) {
    const currentRowIndex = assetRowIndexes[i];
    const currentRow = data[currentRowIndex];
    const currentDeparture = normalizeLocation(currentRow[columnMappings.deparfrom]);
    const currentDistance = Number.parseFloat(currentRow[columnMappings.distance]) || 0;
    totalDistance += currentDistance;
    intermediateRows.unshift(currentRowIndex);
    startRowIndex = currentRowIndex;
    if (isAnnexFinalDest(destination)) {
      if (isAnnexIntermediateStop(currentDeparture)) {
        continue;
      }
      if (isAnnexReturnDest(currentDeparture)) {
        origin = currentDeparture;
        break;
      }
    } else {
      if (currentDeparture) {
        origin = currentDeparture;
        break;
      }
    }
  }
  let finalOrigin = origin;
  let finalDestination = destination;
  let assignedCambiadero = "";
  let cambiaderoReason = "No aplica separación";
  const involvesChangeHouse = destination === "Cambiadero Change House" || origin === "Cambiadero Change House";
  if (involvesChangeHouse && departureTime) {
    const cambiaderoResult = determineCambiadero(origin, destination, departureTime);
    if (cambiaderoResult.isValid && cambiaderoResult.cambiadero) {
      if (origin === "Cambiadero Change House") {
        finalOrigin = cambiaderoResult.cambiadero;
      } else if (destination === "Cambiadero Change House") {
        finalDestination = cambiaderoResult.cambiadero;
      }
      assignedCambiadero = cambiaderoResult.cambiadero;
      cambiaderoReason = cambiaderoResult.reason;
    } else {
      cambiaderoReason = cambiaderoResult.reason;
      assignedCambiadero = destination.startsWith("Cambiadero") ? destination : origin;
    }
  } else if (involvesChangeHouse) {
    cambiaderoReason = "Sin horario disponible para clasificar";
    assignedCambiadero = destination.startsWith("Cambiadero") ? destination : origin;
  }
  const validation = isValidParqueaderoCambiaderoStrict(finalOrigin, finalDestination);
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
    };
  } else {
    return null;
  }
}

// --- Procesamiento avanzado de trayectos ---
export function processTripsAdvanced(
  data: string[][],
  headers: string[],
  columnMappings: { assetExtra: number; deparfrom: number; arriveat: number; distance: number; departureTime: number },
  setValidationResults: (results: any) => void,
): ProcessedTrip[] {
  const trips: ProcessedTrip[] = [];
  const assetGroups: Record<string, number[]> = {};
  const rejectedTrips: Array<{ asset: string; reason: string; origin?: string; destination?: string }> = [];
  const acceptedTrips: Array<{ asset: string; route: string; direction: string; type: string; cambiadero?: string }> = [];
  const cambiaderoStats = { changeHouse: 0, fiveX2: 0, unassigned: 0 };
  data.forEach((row, index) => {
    const asset = row[columnMappings.assetExtra] || "Unknown";
    if (!assetGroups[asset]) {
      assetGroups[asset] = [];
    }
    assetGroups[asset].push(index);
  });
  Object.entries(assetGroups).forEach(([asset, rowIndexes]) => {
    let i = 0;
    while (i < rowIndexes.length) {
      const currentRowIndex = rowIndexes[i];
      const currentRow = data[currentRowIndex];
      const departure = normalizeLocation(currentRow[columnMappings.deparfrom]);
      const arrival = normalizeLocation(currentRow[columnMappings.arriveat]);
      const distance = Number.parseFloat(currentRow[columnMappings.distance]) || 0;
      const departureTime = currentRow[columnMappings.departureTime] || "";
      if (departure && arrival && departure !== arrival) {
        let realArrival = arrival;
        const realDeparture = departure;
        if (isAnnexOrigin(departure) && isAnnexIntermediateStop(arrival)) {
          for (let j = i + 1; j < rowIndexes.length; j++) {
            const nextRow = data[rowIndexes[j]];
            const nextArrival = normalizeLocation(nextRow[columnMappings.arriveat]);
            if (isAnnexFinalDest(nextArrival)) {
              realArrival = nextArrival;
              break;
            }
            if (!isAnnexIntermediateStop(nextArrival)) {
              break;
            }
          }
        }
        if (isAnnexFinalDest(departure) && isAnnexIntermediateStop(arrival)) {
          for (let j = i + 1; j < rowIndexes.length; j++) {
            const nextRow = data[rowIndexes[j]];
            const nextArrival = normalizeLocation(nextRow[columnMappings.arriveat]);
            if (isAnnexReturnDest(nextArrival)) {
              realArrival = nextArrival;
              break;
            }
            if (!isAnnexIntermediateStop(nextArrival)) {
              break;
            }
          }
        }
        let finalDeparture = realDeparture;
        let finalArrival = realArrival;
        let assignedCambiadero = "";
        let cambiaderoReason = "No aplica separación";
        const involvesChangeHouse = realArrival === "Cambiadero Change House" || realDeparture === "Cambiadero Change House";
        if (involvesChangeHouse && departureTime) {
          const cambiaderoResult = determineCambiadero(realDeparture, realArrival, departureTime);
          if (cambiaderoResult.isValid && cambiaderoResult.cambiadero) {
            if (realDeparture === "Cambiadero Change House" || realDeparture === "Cambiadero 5x2") {
              finalDeparture = cambiaderoResult.cambiadero;
            } else if (realArrival === "Cambiadero Change House" || realArrival === "Cambiadero 5x2") {
              finalArrival = cambiaderoResult.cambiadero;
            }
            assignedCambiadero = cambiaderoResult.cambiadero;
            cambiaderoReason = cambiaderoResult.reason;
            if (cambiaderoResult.cambiadero === "Cambiadero Change House") {
              cambiaderoStats.changeHouse++;
            } else if (cambiaderoResult.cambiadero === "Cambiadero 5x2") {
              cambiaderoStats.fiveX2++;
            }
          } else {
            cambiaderoStats.unassigned++;
            cambiaderoReason = cambiaderoResult.reason;
            assignedCambiadero = realArrival.startsWith("Cambiadero") ? realArrival : realDeparture;
          }
        } else if (involvesChangeHouse) {
          cambiaderoStats.unassigned++;
          cambiaderoReason = "Sin horario disponible para clasificar";
          assignedCambiadero = realArrival.startsWith("Cambiadero") ? realArrival : realDeparture;
        }
        const validation = isValidParqueaderoCambiaderoStrict(finalDeparture, finalArrival);
        const route = `${finalDeparture} → ${finalArrival}`;
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
          });
          acceptedTrips.push({
            asset,
            route: `${finalDeparture} → ${finalArrival}`,
            direction: validation.direction,
            type: "Completo",
            cambiadero: assignedCambiadero || undefined,
          });
        } else {
          rejectedTrips.push({
            asset,
            reason: validation.reason || "Trayecto no válido",
            origin: realDeparture,
            destination: realArrival,
          });
        }
        i++;
      } else if (departure && !arrival) {
        const fragmentedTrip = processFragmentedTripFromOrigin(data, asset, rowIndexes, i, departure, headers, columnMappings);
        if (fragmentedTrip) {
          trips.push(fragmentedTrip);
          const route = `${fragmentedTrip.origin} → ${fragmentedTrip.destination}`;
          const validation = isValidParqueaderoCambiaderoStrict(fragmentedTrip.origin, fragmentedTrip.destination);
          if (fragmentedTrip.assignedCambiadero === "Cambiadero Change House") {
            cambiaderoStats.changeHouse++;
          } else if (fragmentedTrip.assignedCambiadero === "Cambiadero 5x2") {
            cambiaderoStats.fiveX2++;
          } else if (
            fragmentedTrip.destination === "Cambiadero Change House" ||
            fragmentedTrip.destination === "Cambiadero 5x2"
          ) {
            cambiaderoStats.unassigned++;
          }
          acceptedTrips.push({
            asset,
            route,
            direction: validation.direction,
            type: "Fragmentado (desde origen)",
            cambiadero: fragmentedTrip.assignedCambiadero || undefined,
          });
          i = rowIndexes.findIndex((idx) => idx > (fragmentedTrip.endRowIndex ?? i));
          if (i === -1) break;
        } else {
          rejectedTrips.push({
            asset,
            reason: "Trayecto fragmentado desde origen no válido",
            origin: departure,
          });
          i++;
        }
      } else if (!departure && arrival) {
        const fragmentedTrip = processFragmentedTripFromDestination(data, asset, rowIndexes, i, arrival, headers, columnMappings);
        if (fragmentedTrip) {
          trips.push(fragmentedTrip);
          const route = `${fragmentedTrip.origin} → ${fragmentedTrip.destination}`;
          const validation = isValidParqueaderoCambiaderoStrict(fragmentedTrip.origin, fragmentedTrip.destination);
          if (fragmentedTrip.assignedCambiadero === "Cambiadero Change House") {
            cambiaderoStats.changeHouse++;
          } else if (fragmentedTrip.assignedCambiadero === "Cambiadero 5x2") {
            cambiaderoStats.fiveX2++;
          } else if (
            fragmentedTrip.origin === "Cambiadero Change House" ||
            fragmentedTrip.origin === "Cambiadero 5x2"
          ) {
            cambiaderoStats.unassigned++;
          }
          acceptedTrips.push({
            asset,
            route,
            direction: validation.direction,
            type: "Fragmentado (desde destino)",
            cambiadero: fragmentedTrip.assignedCambiadero || undefined,
          });
          i = rowIndexes.findIndex((idx) => idx > (fragmentedTrip.endRowIndex ?? i));
          if (i === -1) break;
        } else {
          rejectedTrips.push({
            asset,
            reason: "Trayecto fragmentado desde destino no válido",
            destination: arrival,
          });
          i++;
        }
      } else {
        rejectedTrips.push({
          asset,
          reason: "Segmento intermedio sin origen ni destino válidos",
        });
        i++;
      }
    }
  });
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
  });
  return trips;
}

// Busca trayectos entre dos ubicaciones (en ambos sentidos, normalizando)
export function findTripsBetweenLocations(
  trips: ProcessedTrip[],
  locationA: string,
  locationB: string
): ProcessedTrip[] {
  const normA = normalizeLocation(locationA);
  const normB = normalizeLocation(locationB);
  return trips.filter(
    t =>
      (t.origin === normA && t.destination === normB) ||
      (t.origin === normB && t.destination === normA)
  );
} 