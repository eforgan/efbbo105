import { describe, it, expect } from 'vitest';
import {
  calculateWB,
  calculatePerformance,
  calculateDistanceNm,
  calculateHeadingDeg,
  buildRouteLegs,
  calculateOxygen,
} from '../lib/calculations';
import { BO105_SPECS, INITIAL_STATIONS } from '../lib/bo105-specs';
import { WBStation, Waypoint } from '../types/efb';

describe('calculateWB', () => {
  it('with no stations returns the aircraft BEW alone', () => {
    const summary = calculateWB([]);
    expect(summary.totalWeightKg).toBe(BO105_SPECS.bewKg);
    expect(summary.zeroFuelWeightKg).toBe(BO105_SPECS.bewKg);
    expect(summary.cgLocationMm).toBeCloseTo(BO105_SPECS.bewArmMm, 5);
    expect(summary.isWeightValid).toBe(true);
  });

  it('separates fuel-main from payload when computing ZFW vs TOW', () => {
    const stations: WBStation[] = [
      { id: 'front-crew', name: 'Crew', armMm: 1800, weightKg: 170, description: '' },
      { id: 'fuel-main', name: 'Fuel', armMm: 3380, weightKg: 300, description: '' },
    ];
    const summary = calculateWB(stations);
    expect(summary.zeroFuelWeightKg).toBe(BO105_SPECS.bewKg + 170);
    expect(summary.totalWeightKg).toBe(BO105_SPECS.bewKg + 170 + 300);
    expect(summary.totalWeightKg).toBe(summary.zeroFuelWeightKg + 300);
  });

  it('flags weight above MTOW as invalid', () => {
    const stations: WBStation[] = [
      { id: 'fuel-main', name: 'Fuel', armMm: 3380, weightKg: BO105_SPECS.maxFuelKg, description: '' },
      { id: 'baggage', name: 'Baggage', armMm: 4150, weightKg: 1000, description: '' },
    ];
    const summary = calculateWB(stations);
    expect(summary.totalWeightKg).toBeGreaterThan(BO105_SPECS.mtowKg);
    expect(summary.isWeightValid).toBe(false);
  });

  it('computes a plausible CG within the envelope for the default HEMS loadout', () => {
    const summary = calculateWB(INITIAL_STATIONS);
    expect(summary.isWeightValid).toBe(true);
    expect(summary.isCgValid).toBe(true);
    expect(summary.cgLocationMm).toBeGreaterThan(3080);
    expect(summary.cgLocationMm).toBeLessThan(3420);
  });

  it('has zero lateral CG offset when no patient is loaded', () => {
    const stations: WBStation[] = [
      { id: 'front-crew', name: 'Crew', armMm: 1800, weightKg: 170, description: '' },
    ];
    const summary = calculateWB(stations);
    expect(summary.lateralCgMm).toBe(0);
    expect(summary.isLateralValid).toBe(true);
  });

  it('produces a nonzero lateral CG offset once the stretcher is loaded', () => {
    const stations: WBStation[] = [
      { id: 'patient-stretcher', name: 'Patient', armMm: 2650, weightKg: 85, description: '' },
    ];
    const summary = calculateWB(stations);
    expect(summary.lateralCgMm).toBeGreaterThan(0);
  });
});

describe('calculatePerformance', () => {
  it('reports zero ISA deviation at 15°C sea level pressure altitude', () => {
    const result = calculatePerformance({
      pressureAltFt: 0,
      tempC: 15,
      qnhHpa: 1013.25,
      windSpeedKt: 0,
      windDirDeg: 0,
      runwayHeadingDeg: 0,
      takeoffWeightKg: 2400,
    });
    expect(result.isaDevC).toBeCloseTo(0, 5);
    expect(result.densityAltFt).toBeCloseTo(0, 0);
  });

  it('computes a full headwind when wind direction matches runway heading', () => {
    const result = calculatePerformance({
      pressureAltFt: 0,
      tempC: 15,
      qnhHpa: 1013.25,
      windSpeedKt: 20,
      windDirDeg: 90,
      runwayHeadingDeg: 90,
      takeoffWeightKg: 2400,
    });
    expect(result.headwindKt).toBe(20);
    expect(result.crosswindKt).toBe(0);
  });

  it('computes a pure crosswind when wind is 90 degrees off runway heading', () => {
    const result = calculatePerformance({
      pressureAltFt: 0,
      tempC: 15,
      qnhHpa: 1013.25,
      windSpeedKt: 20,
      windDirDeg: 180,
      runwayHeadingDeg: 90,
      takeoffWeightKg: 2400,
    });
    expect(result.headwindKt).toBe(0);
    expect(result.crosswindKt).toBe(20);
  });

  it('flags a crosswind beyond the 25kt limit as unsafe', () => {
    const result = calculatePerformance({
      pressureAltFt: 0,
      tempC: 15,
      qnhHpa: 1013.25,
      windSpeedKt: 30,
      windDirDeg: 180,
      runwayHeadingDeg: 90,
      takeoffWeightKg: 2400,
    });
    expect(result.isCrosswindSafe).toBe(false);
  });

  it('reduces VNE only above 3,000ft density altitude', () => {
    const lowAlt = calculatePerformance({
      pressureAltFt: 1000, tempC: 15, qnhHpa: 1013.25, windSpeedKt: 0, windDirDeg: 0, runwayHeadingDeg: 0, takeoffWeightKg: 2400,
    });
    const highAlt = calculatePerformance({
      pressureAltFt: 8000, tempC: 15, qnhHpa: 1013.25, windSpeedKt: 0, windDirDeg: 0, runwayHeadingDeg: 0, takeoffWeightKg: 2400,
    });
    expect(lowAlt.adjustedVneKias).toBe(BO105_SPECS.vneKias);
    expect(highAlt.adjustedVneKias).toBeLessThan(BO105_SPECS.vneKias);
  });

  it('lowers the HOGE weight margin as density altitude increases', () => {
    const low = calculatePerformance({
      pressureAltFt: 0, tempC: 15, qnhHpa: 1013.25, windSpeedKt: 0, windDirDeg: 0, runwayHeadingDeg: 0, takeoffWeightKg: 2400,
    });
    const high = calculatePerformance({
      pressureAltFt: 6000, tempC: 15, qnhHpa: 1013.25, windSpeedKt: 0, windDirDeg: 0, runwayHeadingDeg: 0, takeoffWeightKg: 2400,
    });
    expect(high.hogeMaxWeightKg).toBeLessThanOrEqual(low.hogeMaxWeightKg);
  });
});

describe('calculateDistanceNm / calculateHeadingDeg', () => {
  const point: Waypoint = { id: 'a', name: 'A', lat: -38.9489, lon: -68.1558, altFt: 890, isOverwater: false, type: 'airfield' };

  it('returns zero distance between a point and itself', () => {
    expect(calculateDistanceNm(point, point)).toBe(0);
  });

  it('computes a due-north heading of 0 degrees', () => {
    const north: Waypoint = { ...point, id: 'b', lat: point.lat + 1 };
    expect(calculateHeadingDeg(point, north)).toBe(0);
  });

  it('computes a due-east heading of 90 degrees', () => {
    const east: Waypoint = { ...point, id: 'c', lon: point.lon + 1 };
    expect(calculateHeadingDeg(point, east)).toBe(90);
  });
});

describe('buildRouteLegs', () => {
  const wpts: Waypoint[] = [
    { id: 'a', name: 'A', lat: -38.9, lon: -68.1, altFt: 800, isOverwater: false, type: 'airfield' },
    { id: 'b', name: 'B', lat: -38.3, lon: -68.7, altFt: 1300, isOverwater: false, type: 'helideck' },
    { id: 'c', name: 'C', lat: -41.7, lon: -64.9, altFt: 85, isOverwater: true, type: 'helideck' },
  ];

  it('builds one leg per consecutive waypoint pair', () => {
    const legs = buildRouteLegs(wpts);
    expect(legs.length).toBe(wpts.length - 1);
  });

  it('marks a leg overwater if either endpoint is overwater', () => {
    const legs = buildRouteLegs(wpts);
    expect(legs[1].isOverwater).toBe(true);
    expect(legs[0].isOverwater).toBe(false);
  });

  it('derives flight time and fuel burn from cruise speed and burn rate', () => {
    const legs = buildRouteLegs(wpts, 120, 240);
    for (const leg of legs) {
      const expectedMin = Math.round((leg.distanceNm / 120) * 60 * 10) / 10;
      expect(leg.flightTimeMin).toBe(expectedMin);
    }
  });
});

describe('calculateOxygen', () => {
  it('computes total and reserve-adjusted usable duration', () => {
    const calc = calculateOxygen(10, 180, 12);
    expect(calc.durationMinutes).toBe(Math.round((10 * 180) / 12));
    expect(calc.usableDurationMinutes).toBe(Math.round(calc.durationMinutes * 0.8));
  });

  it('returns zero duration for a zero flow rate instead of dividing by zero', () => {
    const calc = calculateOxygen(10, 180, 0);
    expect(calc.durationMinutes).toBe(0);
    expect(calc.usableDurationMinutes).toBe(0);
  });
});
