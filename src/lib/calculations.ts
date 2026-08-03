import { WBStation, WBSummary, PerformanceInput, PerformanceResult, Waypoint, RouteLeg, OxygenCalculation, LatLon } from '../types/efb';
import { BO105_SPECS, FWD_CG_ENVELOPE_POINTS, AFT_CG_ENVELOPE_POINTS } from './bo105-specs';

// Piecewise-linear interpolation over a CG envelope curve's vertices (FWD_CG_ENVELOPE_POINTS /
// AFT_CG_ENVELOPE_POINTS in bo105-specs.ts), clamped to the first/last vertex outside the
// defined weight range.
function interpolateCgLimit(weightKg: number, points: { weightKg: number; armMm: number }[]): number {
  if (weightKg <= points[0].weightKg) return points[0].armMm;
  const last = points[points.length - 1];
  if (weightKg >= last.weightKg) return last.armMm;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (weightKg >= a.weightKg && weightKg <= b.weightKg) {
      const t = (weightKg - a.weightKg) / (b.weightKg - a.weightKg);
      return a.armMm + (b.armMm - a.armMm) * t;
    }
  }
  return last.armMm;
}

// bewKg/bewArmMm default to the generic type spec, but callers with a real assigned tail
// (see getFleetAircraft in bo105-specs.ts) should pass that airframe's actual BEW — empty
// weight varies airframe to airframe with equipment fit-out.
export function calculateWB(stations: WBStation[], bewKg: number = BO105_SPECS.bewKg, bewArmMm: number = BO105_SPECS.bewArmMm): WBSummary {
  let payloadWeight = 0;
  let payloadMoment = 0;
  let fuelWeight = 0;
  let fuelMoment = 0;

  stations.forEach(st => {
    const moment = (st.weightKg * st.armMm) / 1000;
    if (st.id === 'fuel-main') {
      fuelWeight += st.weightKg;
      fuelMoment += moment;
    } else {
      payloadWeight += st.weightKg;
      payloadMoment += moment;
    }
  });

  const bewMoment = (bewKg * bewArmMm) / 1000;
  const zeroFuelWeightKg = bewKg + payloadWeight;
  const zeroFuelMomentKgM = bewMoment + payloadMoment;
  const zeroFuelCgMm = zeroFuelWeightKg > 0 ? (zeroFuelMomentKgM * 1000) / zeroFuelWeightKg : 0;

  const totalWeightKg = zeroFuelWeightKg + fuelWeight;
  const totalMomentKgM = zeroFuelMomentKgM + fuelMoment;
  const cgLocationMm = totalWeightKg > 0 ? (totalMomentKgM * 1000) / totalWeightKg : 0;

  // Envelope checks — forward/aft CG limits from the real CBS-4/CDN-BS-4 envelope (RFM Fig.
  // 6-2), each interpolated independently since they don't share weight breakpoints.
  const isWeightValid = totalWeightKg <= BO105_SPECS.mtowKg;
  const fwdLimit = interpolateCgLimit(totalWeightKg, FWD_CG_ENVELOPE_POINTS);
  const aftLimit = interpolateCgLimit(totalWeightKg, AFT_CG_ENVELOPE_POINTS);
  const isCgValid = cgLocationMm >= fwdLimit && cgLocationMm <= aftLimit;

  // Lateral CG estimate (stretcher is offset ~150mm right)
  const patientStretcher = stations.find(s => s.id === 'patient-stretcher');
  const patientWeight = patientStretcher ? patientStretcher.weightKg : 0;
  const lateralArmMm = patientWeight > 0 ? 150 : 0;
  const lateralCgMm = totalWeightKg > 0 ? (patientWeight * lateralArmMm) / totalWeightKg : 0;
  const isLateralValid = Math.abs(lateralCgMm) <= 80;

  return {
    totalWeightKg,
    totalMomentKgM,
    cgLocationMm,
    isWeightValid,
    isCgValid,
    fwdLimitMm: fwdLimit,
    aftLimitMm: aftLimit,
    lateralCgMm,
    isLateralValid,
    zeroFuelWeightKg,
    zeroFuelCgMm
  };
}

export function calculatePerformance(input: PerformanceInput): PerformanceResult {
  const isaTemp = 15 - (input.pressureAltFt / 1000) * 2;
  const isaDevC = input.tempC - isaTemp;
  const densityAltFt = input.pressureAltFt + 120 * isaDevC + (1013.25 - input.qnhHpa) * 30;

  // BO105 CBS-4 Hover Ceilings. HIGE: baseline unchanged (2500kg holds to 8,200ft density
  // altitude) but the falloff past it is recalibrated against a real RFM Fig. 5-7 worked
  // example — PA 8,000ft/OAT +8°C (DA≈9,080ft by this same formula) gives max GM hover IGE
  // (AEO, TAKEOFF power) = 2,265kg; the old slope (0.08) gave ~2,430kg there, ~165kg (7%) too
  // permissive. HOGE: Fig. 5-9 has no single worked numeric example to anchor to the way HIGE
  // does, but it qualitatively shows the "2500kg holds" flat zone ending well before 5,400ft —
  // only in a cold/low-altitude corner — and max HOGE weight well below MTOW by the time
  // conditions approach ISA. Baseline/slope below are a rough tightening toward that shape,
  // not a precisely anchored figure like HIGE; treat with more caution until a numeric Fig.
  // 5-9 data point is available.
  const higeMaxWeightKg = Math.max(1800, Math.min(2500, 2500 - (densityAltFt - 8200) * 0.267));
  const hogeMaxWeightKg = Math.max(1700, Math.min(2500, 2500 - (densityAltFt - 2000) * 0.3));
  const canHoge = input.takeoffWeightKg <= hogeMaxWeightKg;

  // Single engine climb rate (OEI): baseline (450fpm sea-level ISA @ MTOW) unchanged, but the
  // altitude/weight sensitivity is recalibrated against a real RFM Fig. 5-13 worked example —
  // PA 8,500ft/OAT 0°C/GM 1,750kg (EPWR, emergency power) gives ROC ≈ 200fpm; the old
  // coefficients (0.05 alt, 0.4 weight) gave ~313fpm there, ~55% too optimistic. Both
  // coefficients are scaled by the same factor so the altitude-vs-weight sensitivity ratio the
  // original author picked is preserved, only the overall magnitude is corrected to match the
  // one real data point available.
  const weightFactor = (2500 - input.takeoffWeightKg) * 0.73;
  const oeiClimbRateFpm = Math.max(0, Math.round(450 - densityAltFt * 0.0912 + weightFactor));

  // VNE adjustment: 145 KIAS base, minus 3 KIAS per 1,000 ft DA above 3,000 ft
  let adjustedVneKias = BO105_SPECS.vneKias;
  if (densityAltFt > 3000) {
    adjustedVneKias -= Math.round(((densityAltFt - 3000) / 1000) * 3);
  }

  // Wind components
  const angleRad = ((input.windDirDeg - input.runwayHeadingDeg) * Math.PI) / 180;
  const headwindKt = Math.round(input.windSpeedKt * Math.cos(angleRad));
  const crosswindKt = Math.round(Math.abs(input.windSpeedKt * Math.sin(angleRad)));
  const isCrosswindSafe = crosswindKt <= 25;

  return {
    isaDevC,
    densityAltFt: Math.round(densityAltFt),
    higeMaxWeightKg: Math.round(higeMaxWeightKg),
    hogeMaxWeightKg: Math.round(hogeMaxWeightKg),
    canHoge,
    oeiClimbRateFpm,
    adjustedVneKias,
    headwindKt,
    crosswindKt,
    isCrosswindSafe
  };
}

export interface PowerCurvePoint {
  speedKt: number;
  inducedPowerKw: number;
  parasitePowerKw: number;
  totalPowerKw: number;
}

export interface PowerCurveResult {
  points: PowerCurvePoint[];
  minPowerSpeedKt: number; // "velocidad de mínima resistencia" — bottom of the curve, best endurance
  minPowerKw: number;
  bestRangeSpeedKt: number; // tangent from the origin (min power/speed ratio) — best range, always > minPowerSpeedKt
  bestRangePowerKw: number;
  availablePowerKw: number;
}

const ROTOR_DISK_AREA_M2 = Math.PI * (BO105_SPECS.rotorDiameterM / 2) ** 2;
// Equivalent flat-plate parasite drag area for an airframe this size — an assumed
// representative value for this training model, not measured against the RFM.
const FLAT_PLATE_AREA_M2 = 1.5;
const SEA_LEVEL_DENSITY_KGM3 = 1.225;
const GRAVITY_MS2 = 9.81;
const KT_TO_MS = 0.514444;

function round1(x: number): number {
  return Math.round(x * 10) / 10;
}

// Converts density altitude (same quantity calculatePerformance derives for HIGE/HOGE/VNE)
// into an actual air density via the standard density-ratio (sigma) relation, so this curve
// stays consistent with the rest of the module's atmospheric model instead of introducing a
// second one.
function airDensityKgM3(densityAltFt: number): number {
  const sigma = Math.max(0.05, (1 - densityAltFt * 6.87535e-6) ** 4.2561);
  return SEA_LEVEL_DENSITY_KGM3 * sigma;
}

// Power-required curve (induced + parasite power vs. airspeed), the classic diagram used to
// read off two reference speeds: minimum power required ("mínima resistencia" / best
// endurance, the bottom of the curve) and best range (the speed that minimizes power/speed —
// equivalently, where a line from the origin is tangent to the curve). Profile, tail-rotor,
// and accessory power aren't modeled, so totalPowerKw understates real shaft power required;
// the plotted range starts above ~20kt because the induced-power approximation used here
// (P_i ≈ P_hover · v_ih/V) only holds once forward speed is well above the hover induced
// velocity — it isn't a hover power model.
export function calculatePowerCurve(
  input: Pick<PerformanceInput, 'pressureAltFt' | 'tempC' | 'qnhHpa' | 'takeoffWeightKg'>,
  minSpeedKt: number = 20,
  maxSpeedKt: number = 130
): PowerCurveResult {
  const isaTemp = 15 - (input.pressureAltFt / 1000) * 2;
  const isaDevC = input.tempC - isaTemp;
  const densityAltFt = input.pressureAltFt + 120 * isaDevC + (1013.25 - input.qnhHpa) * 30;
  const rho = airDensityKgM3(densityAltFt);

  const weightN = input.takeoffWeightKg * GRAVITY_MS2;
  const hoverInducedVelocityMs = Math.sqrt(weightN / (2 * rho * ROTOR_DISK_AREA_M2));
  const hoverInducedPowerW = weightN * hoverInducedVelocityMs;

  const points: PowerCurvePoint[] = [];
  let minPowerKw = Infinity;
  let minPowerSpeedKt = minSpeedKt;
  let bestRatio = Infinity;
  let bestRangeSpeedKt = minSpeedKt;
  let bestRangePowerKw = 0;

  for (let speedKt = minSpeedKt; speedKt <= maxSpeedKt; speedKt += 1) {
    const speedMs = speedKt * KT_TO_MS;
    const inducedPowerKw = round1((hoverInducedPowerW * (hoverInducedVelocityMs / speedMs)) / 1000);
    const parasitePowerKw = round1((0.5 * rho * speedMs ** 3 * FLAT_PLATE_AREA_M2) / 1000);
    const totalPowerKw = round1(inducedPowerKw + parasitePowerKw);

    points.push({ speedKt, inducedPowerKw, parasitePowerKw, totalPowerKw });

    if (totalPowerKw < minPowerKw) {
      minPowerKw = totalPowerKw;
      minPowerSpeedKt = speedKt;
    }
    const ratio = totalPowerKw / speedKt; // minimizing power/speed maximizes specific range
    if (ratio < bestRatio) {
      bestRatio = ratio;
      bestRangeSpeedKt = speedKt;
      bestRangePowerKw = totalPowerKw;
    }
  }

  // Two Rolls-Royce (Allison) 250-C20B, 420 SHP each, converted to kW — installed power, no
  // transmission/accessory loss subtracted (not modeled).
  const availablePowerKw = round1(2 * 420 * 0.7457);

  return { points, minPowerSpeedKt, minPowerKw, bestRangeSpeedKt, bestRangePowerKw, availablePowerKw };
}

export function calculateDistanceNm(w1: LatLon, w2: LatLon): number {
  const R = 3440.065; // Earth radius in NM
  const dLat = ((w2.lat - w1.lat) * Math.PI) / 180;
  const dLon = ((w2.lon - w1.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((w1.lat * Math.PI) / 180) *
      Math.cos((w2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Great-circle midpoint between two waypoints — used to search for a refueling stop when a
// leg exceeds the aircraft's range, since a valid stop must sit roughly between both points.
export function calculateMidpoint(w1: LatLon, w2: LatLon): LatLon {
  const lat1 = (w1.lat * Math.PI) / 180;
  const lon1 = (w1.lon * Math.PI) / 180;
  const lat2 = (w2.lat * Math.PI) / 180;
  const dLon = ((w2.lon - w1.lon) * Math.PI) / 180;

  const bx = Math.cos(lat2) * Math.cos(dLon);
  const by = Math.cos(lat2) * Math.sin(dLon);
  const lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + bx) ** 2 + by ** 2));
  const lon3 = lon1 + Math.atan2(by, Math.cos(lat1) + bx);

  return { lat: (lat3 * 180) / Math.PI, lon: (((lon3 * 180) / Math.PI + 540) % 360) - 180 };
}

export function calculateHeadingDeg(w1: LatLon, w2: LatLon): number {
  const y = Math.sin(((w2.lon - w1.lon) * Math.PI) / 180) * Math.cos((w2.lat * Math.PI) / 180);
  const x =
    Math.cos((w1.lat * Math.PI) / 180) * Math.sin((w2.lat * Math.PI) / 180) -
    Math.sin((w1.lat * Math.PI) / 180) *
      Math.cos((w2.lat * Math.PI) / 180) *
      Math.cos(((w2.lon - w1.lon) * Math.PI) / 180);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((brng + 360) % 360);
}

export interface VfrCruisingLevel {
  altitudeFt: number;
  formatted: string; // ICAO Casilla 15 format, e.g. "A045" = 4,500 ft
  parity: 'IMPAR' | 'PAR';
  isMandatory: boolean; // AIP Argentina GEN 3.3 / Reglamento de Vuelos N.91: obligatorio a partir de 3,000 ft
}

// Semicircular (hemispheric) cruising altitude rule for uncontrolled VFR flights, per AIP
// Argentina GEN 3.3 and Reglamento de Vuelos N° 91: track 000-179° -> odd thousand of feet,
// track 180-359° -> even thousand of feet, +500 ft when uncontrolled. Mandatory only above
// 3,000 ft; below that a specific level need not be filed (item 15 can read "VFR").
export function calculateVfrCruisingLevel(trackDeg: number, desiredAltFt: number): VfrCruisingLevel {
  const normalizedTrack = ((trackDeg % 360) + 360) % 360;
  const needsOdd = normalizedTrack < 180;

  let thousands = Math.max(3, Math.round(desiredAltFt / 1000));
  if ((thousands % 2 === 1) !== needsOdd) {
    const down = thousands - 1;
    const up = thousands + 1;
    thousands = Math.abs(desiredAltFt - down * 1000) <= Math.abs(desiredAltFt - up * 1000) ? down : up;
  }

  const altitudeFt = thousands * 1000 + 500;
  return {
    altitudeFt,
    formatted: `A${String(Math.round(altitudeFt / 100)).padStart(3, '0')}`,
    parity: needsOdd ? 'IMPAR' : 'PAR',
    isMandatory: desiredAltFt >= 3000
  };
}

export function buildRouteLegs(waypoints: Waypoint[], cruiseSpeedKt: number = 110, fuelBurnKgH: number = 180): RouteLeg[] {
  const legs: RouteLeg[] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i];
    const to = waypoints[i + 1];
    const distanceNm = calculateDistanceNm(from, to);
    const magneticHeadingDeg = calculateHeadingDeg(from, to);
    const flightTimeMin = Math.round((distanceNm / cruiseSpeedKt) * 60 * 10) / 10;
    const fuelBurnKg = Math.round((flightTimeMin / 60) * fuelBurnKgH);
    const isOverwater = from.isOverwater || to.isOverwater;

    legs.push({
      from,
      to,
      distanceNm,
      magneticHeadingDeg,
      flightTimeMin,
      fuelBurnKg,
      isOverwater
    });
  }
  return legs;
}

export function calculateOxygen(cylinderVolumeL: number, pressureBar: number, flowRateLpm: number): OxygenCalculation {
  const totalLiters = cylinderVolumeL * pressureBar;
  const durationMinutes = flowRateLpm > 0 ? Math.round(totalLiters / flowRateLpm) : 0;
  const usableDurationMinutes = Math.round(durationMinutes * 0.8); // 20% reserve
  return {
    cylinderVolumeL,
    pressureBar,
    flowRateLpm,
    durationMinutes,
    usableDurationMinutes
  };
}
