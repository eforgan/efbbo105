export type DisplayMode = 'glass' | 'nvg-green' | 'cockpit-red' | 'daylight';

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
  type: 'airfield' | 'helideck' | 'costal-entry' | 'hospital' | 'riverbank';
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
}
