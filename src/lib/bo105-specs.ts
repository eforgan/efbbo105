import { AircraftSpecs, WBStation, Waypoint, RiskFactor, MetarStationInfo, SeaStateInfo } from '../types/efb';

export const BO105_SPECS: AircraftSpecs = {
  model: 'MBB Bölkow BO 105 CBS-4 Stretched',
  registration: 'Modena Air Service',
  mtowKg: 2500,
  bewKg: 1460,
  bewArmMm: 3250,
  maxFuelKg: 450,
  fuelArmMm: 3380,
  engines: '2x Rolls-Royce (Allison) 250-C20B Turboshaft (420 SHP ea)',
  rotorDiameterM: 9.84,
  vneKias: 145,
};

// Longitudinal CG Envelope for BO 105 CBS-4 (Station mm vs Weight kg)
export const CG_ENVELOPE_POINTS = [
  { weight: 1400, fwdArm: 3080, aftArm: 3420 },
  { weight: 2000, fwdArm: 3080, aftArm: 3420 },
  { weight: 2400, fwdArm: 3120, aftArm: 3420 },
  { weight: 2500, fwdArm: 3180, aftArm: 3420 },
];

// Official Modena HEMS Configuration Stations: Piloto + Copiloto + Médico Aeroevacuador + 1 Paciente en Camilla
export const INITIAL_STATIONS: WBStation[] = [
  { id: 'front-crew', name: 'Piloto (PIC) + Copiloto (SIC)', armMm: 1800, weightKg: 170, maxWeightKg: 220, description: 'Cabina de mando delantera (85 kg cada uno)' },
  { id: 'medical-doctor', name: 'Médico Aeroevacuador HEMS', armMm: 2750, weightKg: 85, maxWeightKg: 110, description: 'Asiento sanitario trasero con acceso a cabecera camilla' },
  { id: 'patient-stretcher', name: '1 Paciente en Camilla HEMS Longitudinal', armMm: 2650, weightKg: 85, maxWeightKg: 130, description: 'Anclaje longitudinal de 4 puntos de seguridad' },
  { id: 'medical-equipment', name: 'Equipamiento Médico & Tanque LOX', armMm: 3100, weightKg: 45, maxWeightKg: 80, description: 'Desfibrilador, monitor, respirador, LOX O2' },
  { id: 'baggage', name: 'Balsa 6 Pax / Kit Emergencia / Equipaje', armMm: 4150, weightKg: 25, maxWeightKg: 150, description: 'Bodega trasera de carga' },
  { id: 'fuel-main', name: 'Combustible Usable JET A-1 (Principal + Aux)', armMm: 3380, weightKg: 350, maxWeightKg: 450, description: 'Tanques principales ~570 Litros' },
];

// Sea State Report for Punta Colorada Offshore (YPF VMOS / Golfo San Matías)
export const PUNTA_COLORADA_SEA_STATE: SeaStateInfo = {
  location: 'Punta Colorada / Golfo San Matías (YPF VMOS Offshore)',
  douglasScale: 3,
  douglasName: 'Escala Douglas 3 • Marejadilla (Olas 0.5m - 1.25m)',
  waveHeightM: 0.9,
  swellPeriodSec: 7,
  waterTempC: 13,
  ditchingStatus: 'APTO',
};

// Modena Air Service Operational Waypoints
export const MODENA_WAYPOINTS: Record<string, Waypoint[]> = {
  'hems-neuquen-vista': [
    { id: 'sazn', name: 'SAZN - Aeropuerto Neuquén (Base)', lat: -38.9489, lon: -68.1558, altFt: 890, isOverwater: false, type: 'airfield' },
    { id: 'anl', name: 'ANL - Helipuerto Añelo (Vaca Muerta)', lat: -38.3556, lon: -68.7889, altFt: 1350, isOverwater: false, type: 'helideck' },
    { id: 'rds', name: 'RDS - Rincón de los Sauces (Vista Energy)', lat: -37.3872, lon: -68.9042, altFt: 1820, isOverwater: false, type: 'airfield' },
    { id: 'cut', name: 'CUT - Cutral Có (YPF VMOS)', lat: -38.9397, lon: -69.2642, altFt: 2160, isOverwater: false, type: 'airfield' },
  ],
  'hems-rosario-utv': [
    { id: 'saar', name: 'SAAR - Aeropuerto Rosario (Base UTV)', lat: -32.9036, lon: -60.7844, altFt: 85, isOverwater: false, type: 'airfield' },
    { id: 'hsp', name: 'HSP - Helipuerto Sanatorio Parque', lat: -32.9467, lon: -60.6550, altFt: 120, isOverwater: false, type: 'hospital' },
    { id: 'prn', name: 'PRN - Corredor Fluvial Río Paraná', lat: -32.8800, lon: -60.6700, altFt: 30, isOverwater: true, type: 'riverbank' },
    { id: 'vic', name: 'VIC - Helipuerto Victoria (Entre Ríos)', lat: -32.6200, lon: -60.1600, altFt: 60, isOverwater: false, type: 'helideck' },
  ],
  'hems-same-ba': [
    { id: 'sabe', name: 'SABE - Aeroparque Buenos Aires (Base SAME)', lat: -34.5592, lon: -58.4156, altFt: 18, isOverwater: false, type: 'airfield' },
    { id: 'hbr', name: 'HBR - Helipuerto SAME Ruiz (Base Operativa)', lat: -34.6200, lon: -58.3700, altFt: 50, isOverwater: false, type: 'hospital' },
    { id: 'hsan', name: 'HSAN - Hospital Santojanni (Mataderos)', lat: -34.6510, lon: -58.5080, altFt: 80, isOverwater: false, type: 'hospital' },
    { id: 'sadf', name: 'SADF - San Fernando (Mantenimiento Modena)', lat: -34.4533, lon: -58.5897, altFt: 10, isOverwater: false, type: 'airfield' },
  ],
  'hems-ypf-vmos': [
    { id: 'sahr', name: 'SAHR - General Roca (Inicio Traza Gasoducto)', lat: -39.0007, lon: -67.6205, altFt: 852, isOverwater: false, type: 'airfield' },
    { id: 'pc', name: 'PC - Punta Colorada (Entrada Mar)', lat: -41.6967, lon: -65.0233, altFt: 50, isOverwater: false, type: 'costal-entry' },
    { id: 'boya7', name: 'Boya 7 - Punto de Retorno Offshore (7 km E Punta Colorada)', lat: -41.6968, lon: -64.9391, altFt: 0, isOverwater: true, type: 'buoy' },
  ],
};

export const DEFAULT_WAYPOINTS: Waypoint[] = MODENA_WAYPOINTS['hems-neuquen-vista'];

export const OACI_RISK_FACTORS: RiskFactor[] = [
  { id: 'r1', name: 'Ráfagas Viento Patagónico > 35 kt en Añelo / Vaca Muerta', category: 'weather', severity: 4, probability: 4, mitigation: 'Alineación estricta de proa al despegue/aterrizaje y monitoreo de torque dual.' },
  { id: 'r2', name: 'Operaciones Nocturnas VFR en Helipuertos Urbanos SAME', category: 'terrain', severity: 4, probability: 3, mitigation: 'Uso de faro de búsqueda LED, NVG Green mode y verificación de cables de alta tensión.' },
  { id: 'r3', name: 'Niebla de Advección sobre Río Paraná (Bases UTV Rosario)', category: 'weather', severity: 4, probability: 3, mitigation: 'Mínimos VFR UTV: Visibilidad > 4 km, Techo > 800 ft. Monitoreo altímetro de radar.' },
  { id: 'r4', name: 'Embarque Hot Loading con Paciente Crítico NEWS2 > 5', category: 'patient', severity: 4, probability: 3, mitigation: 'Camilla bloqueada en 4 puntos, médico en intercom continuo con PIC.' },
  { id: 'r5', name: 'OEI sobre Agua en Vuelo YPF VMOS Offshore (Punta Colorada)', category: 'aircraft', severity: 5, probability: 1, mitigation: 'Exposición < 5 min, Dry Suit 13°C, EBS Air Pocket Plus, balsa 6 pax y Douglas Scale 3 OK.' },
  { id: 'r6', name: 'Polvo / Suspensión de Arena (Vaca Muerta Ground Dust)', category: 'weather', severity: 3, probability: 3, mitigation: 'Técnica de aproximación de alto ángulo sin efecto suelo turbulento.' },
];

export const INITIAL_METAR_STATIONS: MetarStationInfo[] = [
  {
    icao: 'SAZN',
    name: 'Neuquén (Base Vaca Muerta / Vista)',
    rawMetar: 'SAZN 231100Z 27018G28KT 9999 FEW040 22/04 Q1013',
    tempC: 22,
    dewPointC: 4,
    windDirDeg: 270,
    windSpeedKt: 18,
    visibilityKm: 10,
    qnhHpa: 1013,
    flightCategory: 'VFR',
    cloudCover: 'FEW040'
  },
  {
    icao: 'SAAR',
    name: 'Rosario (Base UTV HEMS / Sanatorio Parque)',
    rawMetar: 'SAAR 231100Z 12008KT 8000 BKN015 17/12 Q1015',
    tempC: 17,
    dewPointC: 12,
    windDirDeg: 120,
    windSpeedKt: 8,
    visibilityKm: 8,
    qnhHpa: 1015,
    flightCategory: 'VFR',
    cloudCover: 'BKN015'
  },
  {
    icao: 'SABE',
    name: 'Aeroparque Buenos Aires (Base SAME AÉREO)',
    rawMetar: 'SABE 231100Z 10012KT 9999 SCT025 20/11 Q1016',
    tempC: 20,
    dewPointC: 11,
    windDirDeg: 100,
    windSpeedKt: 12,
    visibilityKm: 10,
    qnhHpa: 1016,
    flightCategory: 'VFR',
    cloudCover: 'SCT025'
  },
  {
    icao: 'SADF',
    name: 'San Fernando (Mantenimiento Modena)',
    rawMetar: 'SADF 231100Z 09010KT 9999 FEW030 19/10 Q1016',
    tempC: 19,
    dewPointC: 10,
    windDirDeg: 90,
    windSpeedKt: 10,
    visibilityKm: 10,
    qnhHpa: 1016,
    flightCategory: 'VFR',
    cloudCover: 'FEW030'
  }
];
