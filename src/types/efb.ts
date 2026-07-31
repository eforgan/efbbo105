export type DisplayMode = 'glass' | 'nvg-green' | 'cockpit-red' | 'daylight';

export interface LatLon {
  lat: number;
  lon: number;
}

export interface AerodromeRecord {
  icao: string | null;
  localCode: string | null;
  name: string;
  municipality: string;
  lat: number;
  lon: number;
  elevFt: number | null;
  kind: 'airport' | 'heliport';
}

// Directorio de contactos aeronáuticos: oficinas oficiales (ANAC/EANA/Prefectura),
// teléfonos útiles de emergencia y aeroplantas YPF (combustible de aviación Jet A-1).
export interface OfficialContact {
  id: string;
  name: string;
  category: 'ais-aro' | 'notam' | 'meteorologia' | 'anac' | 'maritimo';
  phone?: string;
  phoneAlt?: string;
  email?: string;
  hours?: string;
  notes?: string;
  source: string;
}

export interface UsefulPhoneNumber {
  id: string;
  label: string;
  phone: string;
  category: 'emergencia-medica' | 'bomberos' | 'policia' | 'maritimo' | 'seguridad-fronteriza';
  notes?: string;
}

export interface YpfAeroplanta {
  icao: string;
  iata: string;
  name: string;
  province: string;
  phone: string;
}

export type MissionType = 
  | 'hems-neuquen-vista'
  | 'hems-rosario-utv'
  | 'hems-same-ba'
  | 'hems-ypf-vmos'
  | 'hems-onshore'
  | 'hems-offshore'
  | 'training';

export interface AircraftSpecs {
  model: string;
  registration: string;
  mtowKg: number; // 2500 kg
  bewKg: number;  // 1460 kg
  bewArmMm: number; // 3250 mm
  maxFuelKg: number; // 450 kg (~570 L)
  fuelArmMm: number; // 3380 mm
  engines: string; // 2x Allison 250-C20B (420 SHP each)
  rotorDiameterM: number; // 9.84 m
  vneKias: number; // 145 KIAS
}

// One real, individually-registered airframe per Modena contract (see BO105_FLEET in
// bo105-specs.ts) — distinct from AircraftSpecs above, which is the type-level spec shared
// by the whole BO105 CBS-4 fleet. PBO (Peso Básico Operativo) is this tail's actual empty
// weight, which differs airframe to airframe with equipment fit-out.
export interface FleetAircraft {
  registration: string; // e.g. "LV-GID"
  bewKg: number; // PBO — Peso Básico Operativo real de esta matrícula
  color: string;
  contract: string;
  base: string;
}

export interface WBStation {
  id: string;
  name: string;
  armMm: number;
  weightKg: number;
  maxWeightKg?: number;
  description: string;
}

export interface WBSummary {
  totalWeightKg: number;
  totalMomentKgM: number;
  cgLocationMm: number;
  isWeightValid: boolean;
  isCgValid: boolean;
  lateralCgMm: number;
  isLateralValid: boolean;
  zeroFuelWeightKg: number;
  zeroFuelCgMm: number;
}

export interface PerformanceInput {
  pressureAltFt: number;
  tempC: number;
  qnhHpa: number;
  windSpeedKt: number;
  windDirDeg: number;
  runwayHeadingDeg: number;
  takeoffWeightKg: number;
}

export interface PerformanceResult {
  isaDevC: number;
  densityAltFt: number;
  higeMaxWeightKg: number;
  hogeMaxWeightKg: number;
  canHoge: boolean;
  oeiClimbRateFpm: number;
  adjustedVneKias: number;
  headwindKt: number;
  crosswindKt: number;
  isCrosswindSafe: boolean;
}

export interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  altFt: number;
  isOverwater: boolean;
  type: 'airfield' | 'helideck' | 'costal-entry' | 'hospital' | 'riverbank' | 'buoy';
}

export interface RouteLeg {
  from: Waypoint;
  to: Waypoint;
  distanceNm: number;
  magneticHeadingDeg: number;
  flightTimeMin: number;
  fuelBurnKg: number;
  isOverwater: boolean;
}

export interface OxygenCalculation {
  cylinderVolumeL: number;
  pressureBar: number;
  flowRateLpm: number;
  durationMinutes: number;
  usableDurationMinutes: number;
}

export interface RiskFactor {
  id: string;
  name: string;
  category: 'weather' | 'terrain' | 'crew' | 'aircraft' | 'patient';
  severity: 1 | 2 | 3 | 4 | 5;
  probability: 1 | 2 | 3 | 4 | 5;
  mitigation: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  detail?: string;
  isMandatory: boolean;
  completed: boolean;
  response?: string;
}

export interface ChecklistCategory {
  id: string;
  title: string;
  categoryType: 'normal' | 'modena' | 'emergency';
  items: ChecklistItem[];
}

export interface MetarStationInfo {
  icao: string;
  name: string;
  rawMetar: string;
  tempC: number;
  dewPointC: number;
  windDirDeg: number;
  windSpeedKt: number;
  visibilityKm: number;
  qnhHpa: number;
  flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
  cloudCover: string;
}

export interface SeaStateInfo {
  location: string;
  douglasScale: number;
  douglasName: string;
  waveHeightM: number;
  swellPeriodSec: number;
  waterTempC: number;
  ditchingStatus: 'APTO' | 'PRECAUCION' | 'RIESGO_ALTO';
}

// Cached locally and synced with the shared Neon table behind /api/flight-logs, same
// pattern as CrewProfile above: client-generated `id`, `updatedAt` absent until first sync.
export interface FlightLogEntry {
  id: string;
  date: string;
  missionType: MissionType;
  departurePoint: string;
  destinationPoint: string;
  flightTimeHours: number;
  fuelUsedKg: number;
  picName: string;
  sicName?: string;
  landingsCount: number;
  notes: string;
  updatedAt?: string;
}

export type CrewRole = 'PIC' | 'SIC' | 'medico' | 'despachante';

export type PilotLicenseType = 'PCH' | 'PLH' | 'PPH' | 'INST' | 'OTRO';

// The one crew roster: cached locally (localStorage) for instant, offline-capable reads,
// and synced with the shared Neon table behind /api/crew when a PIN + connectivity are
// available (see EfbDataContext's sync engine). `id` is always client-generated so a record
// created offline never needs remapping once it reaches the server. `updatedAt` drives
// last-write-wins conflict resolution during sync.
export interface CrewProfile {
  id: string;
  fullName: string;
  role: CrewRole;
  licenseType?: PilotLicenseType;
  licenseNumber: string;
  email: string;
  phone: string;
  whatsapp?: string;
  licenseExpiry?: string; // ISO date (yyyy-mm-dd)
  medicalExpiry?: string; // ISO date (yyyy-mm-dd)
  updatedAt?: string; // ISO datetime — absent until first synced
}

export interface RoutePoint {
  id: string;
  code: string;
  name: string;
  lat: number;
  lon: number;
  isAlternate: boolean;
  isManual: boolean;
}

// Synced with the shared Neon table behind /api/route-plans — same pattern as CrewProfile.
export interface SavedRoutePlan {
  id: string;
  name: string;
  savedAtIso: string;
  points: RoutePoint[];
  updatedAt?: string;
}

// Synced with the shared Neon table behind /api/risk-log — same pattern as CrewProfile.
// Append-only in practice (SMS audit trail): the UI only ever creates new entries.
export interface RiskLogEntry {
  id: string;
  savedAtIso: string;
  mission: MissionType;
  routeSummary: string;
  verdict: 'GO' | 'PRECAUCION' | 'NO-GO';
  blockers: string[];
  cautions: string[];
  updatedAt?: string;
}
