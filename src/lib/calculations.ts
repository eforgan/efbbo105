import { WBStation, WBSummary, PerformanceInput, PerformanceResult, Waypoint, RouteLeg, OxygenCalculation, LatLon } from '../types/efb';
import { BO105_SPECS } from './bo105-specs';

export function calculateWB(stations: WBStation[]): WBSummary {
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

  const bewMoment = (BO105_SPECS.bewKg * BO105_SPECS.bewArmMm) / 1000;
  const zeroFuelWeightKg = BO105_SPECS.bewKg + payloadWeight;
  const zeroFuelMomentKgM = bewMoment + payloadMoment;
  const zeroFuelCgMm = zeroFuelWeightKg > 0 ? (zeroFuelMomentKgM * 1000) / zeroFuelWeightKg : 0;

  const totalWeightKg = zeroFuelWeightKg + fuelWeight;
  const totalMomentKgM = zeroFuelMomentKgM + fuelMoment;
  const cgLocationMm = totalWeightKg > 0 ? (totalMomentKgM * 1000) / totalWeightKg : 0;

  // Envelope checks
  const isWeightValid = totalWeightKg <= BO105_SPECS.mtowKg;
  
  // Interpolate forward CG limit for current total weight
  let fwdLimit = 3080;
  if (totalWeightKg > 2000) {
    if (totalWeightKg >= 2500) {
      fwdLimit = 3180;
    } else if (totalWeightKg >= 2400) {
      fwdLimit = 3120 + ((totalWeightKg - 2400) / 100) * 60;
    } else {
      fwdLimit = 3080 + ((totalWeightKg - 2000) / 400) * 40;
    }
  }
  const aftLimit = 3420;
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

  // BO105 CBS-4 Hover Ceilings (ISA baseline: HIGE 8,200ft @ 2500kg, HOGE 5,400ft @ 2500kg)
  const higeMaxWeightKg = Math.max(1800, Math.min(2500, 2500 - (densityAltFt - 4000) * 0.08));
  const hogeMaxWeightKg = Math.max(1700, Math.min(2500, 2500 - (densityAltFt - 2000) * 0.12));
  const canHoge = input.takeoffWeightKg <= hogeMaxWeightKg;

  // Single engine climb rate (OEI) ~ 450 fpm at sea level ISA, drops with altitude & weight
  const weightFactor = (2500 - input.takeoffWeightKg) * 0.4;
  const oeiClimbRateFpm = Math.max(0, Math.round(450 - densityAltFt * 0.05 + weightFactor));

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
