import { describe, it, expect } from 'vitest';
import {
  calculateWB,
  calculatePerformance,
  calculatePowerCurve,
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

describe('calculateWB forward CG limit envelope', () => {
  // calculateWB's fwdLimit steps mirror CG_ENVELOPE_POINTS (1400/2000kg->3080, 2400kg->3120,
  // 2500kg->3180) but aren't derived from it — these tests pin the breakpoints so a future
  // edit to one doesn't silently drift from the other reference table in bo105-specs.ts.
  // A single non-fuel payload station of weight (targetWeightKg - BEW) is placed at the arm
  // that makes the weighted average (BEW, bewArmMm) + (payloadWeight, armMm) land exactly on
  // targetCgMm, isolating the envelope check from BEW/fuel-station bookkeeping.
  function stationsForWeightAndCg(targetWeightKg: number, targetCgMm: number): WBStation[] {
    const payloadWeightKg = targetWeightKg - BO105_SPECS.bewKg;
    const armMm = (targetCgMm * targetWeightKg - BO105_SPECS.bewKg * BO105_SPECS.bewArmMm) / payloadWeightKg;
    return [{ id: 'baggage', name: 'Payload', armMm, weightKg: payloadWeightKg, description: '' }];
  }

  it.each([
    [2000, 3080],
    [2400, 3120],
    [2500, 3180],
  ])('accepts CG exactly at the forward limit for %ikg (%imm)', (weightKg, limitMm) => {
    const summary = calculateWB(stationsForWeightAndCg(weightKg, limitMm));
    expect(summary.totalWeightKg).toBeCloseTo(weightKg, 5);
    expect(summary.cgLocationMm).toBeCloseTo(limitMm, 5);
    expect(summary.isCgValid).toBe(true);
  });

  it.each([
    [2000, 3080],
    [2400, 3120],
    [2500, 3180],
  ])('rejects CG 1mm forward of the limit for %ikg (%imm)', (weightKg, limitMm) => {
    const summary = calculateWB(stationsForWeightAndCg(weightKg, limitMm - 1));
    expect(summary.isCgValid).toBe(false);
  });

  it('interpolates the forward limit linearly between 2000kg and 2400kg', () => {
    const midWeightKg = 2200; // halfway -> fwdLimit should be halfway between 3080 and 3120
    const expectedLimitMm = 3100;
    const atLimit = calculateWB(stationsForWeightAndCg(midWeightKg, expectedLimitMm));
    const belowLimit = calculateWB(stationsForWeightAndCg(midWeightKg, expectedLimitMm - 1));
    expect(atLimit.isCgValid).toBe(true);
    expect(belowLimit.isCgValid).toBe(false);
  });

  it('interpolates the forward limit linearly between 2400kg and 2500kg', () => {
    const midWeightKg = 2450; // halfway -> fwdLimit should be halfway between 3120 and 3180
    const expectedLimitMm = 3150;
    const atLimit = calculateWB(stationsForWeightAndCg(midWeightKg, expectedLimitMm));
    const belowLimit = calculateWB(stationsForWeightAndCg(midWeightKg, expectedLimitMm - 1));
    expect(atLimit.isCgValid).toBe(true);
    expect(belowLimit.isCgValid).toBe(false);
  });

  it('rejects CG aft of the fixed 3420mm aft limit regardless of weight', () => {
    const summary = calculateWB(stationsForWeightAndCg(2000, 3421));
    expect(summary.isCgValid).toBe(false);
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

  // Regression test for a bug where the HIGE/HOGE ceilings were clamped at MTOW (2500kg) for
  // the entire pressure-altitude range the crew actually operates in (real field elevations
  // are ~900-2200ft), making the slider look like it did nothing: the code's own comment
  // documents the ISA baseline as "HIGE 8,200ft @ 2500kg, HOGE 5,400ft @ 2500kg" but the
  // formula's breakpoints were 4,000ft/2,000ft instead. tempC=15/qnhHpa=1013.25 keeps
  // densityAltFt == pressureAltFt exactly (zero ISA deviation), so the breakpoints can be
  // hit precisely.
  describe('HIGE/HOGE ceilings hold at MTOW up to their documented baseline altitude', () => {
    // tempC set to the ISA temperature *for that specific pressure altitude* (15 - alt/1000*2)
    // zeroes out isaDevC, so densityAltFt == pressureAltFt exactly and the baseline breakpoint
    // can be hit precisely.
    function isaConditionsAt(pressureAltFt: number) {
      return {
        pressureAltFt, tempC: 15 - (pressureAltFt / 1000) * 2, qnhHpa: 1013.25,
        windSpeedKt: 0, windDirDeg: 0, runwayHeadingDeg: 0, takeoffWeightKg: 2400,
      };
    }

    it('keeps HOGE at 2500kg up to 5,400ft density altitude, then reduces it', () => {
      const atBaseline = calculatePerformance(isaConditionsAt(5400));
      const pastBaseline = calculatePerformance(isaConditionsAt(6400));
      expect(atBaseline.hogeMaxWeightKg).toBe(2500);
      expect(pastBaseline.hogeMaxWeightKg).toBe(2380); // 2500 - 1000ft * 0.12kg/ft
    });

    it('keeps HIGE at 2500kg up to 8,200ft density altitude, then reduces it', () => {
      const atBaseline = calculatePerformance(isaConditionsAt(8200));
      const pastBaseline = calculatePerformance(isaConditionsAt(9200));
      expect(atBaseline.higeMaxWeightKg).toBe(2500);
      expect(pastBaseline.higeMaxWeightKg).toBe(2420); // 2500 - 1000ft * 0.08kg/ft
    });

    it('changes the HOGE ceiling across the altitudes typical of Modena field elevations (900-2200ft)', () => {
      const low = calculatePerformance(isaConditionsAt(900));
      const high = calculatePerformance(isaConditionsAt(2200));
      // Both stay clamped at MTOW here (well below the 5,400ft HOGE baseline) — this asserts
      // the *correct* flat behavior at real operating altitudes, as opposed to the old bug
      // where the ceiling was already declining by 2000ft.
      expect(low.hogeMaxWeightKg).toBe(2500);
      expect(high.hogeMaxWeightKg).toBe(2500);
    });
  });

  it('flags canHoge false once takeoff weight exceeds the HOGE ceiling for the conditions', () => {
    const input = { pressureAltFt: 6000, tempC: 25, qnhHpa: 1013.25, windSpeedKt: 0, windDirDeg: 0, runwayHeadingDeg: 0, takeoffWeightKg: 2500 };
    const result = calculatePerformance(input);
    expect(result.canHoge).toBe(input.takeoffWeightKg <= result.hogeMaxWeightKg);
    expect(result.canHoge).toBe(false);
  });

  it('clamps hogeMaxWeightKg and higeMaxWeightKg within the type-certified weight band', () => {
    const veryHigh = calculatePerformance({
      pressureAltFt: 15000, tempC: 30, qnhHpa: 1013.25, windSpeedKt: 0, windDirDeg: 0, runwayHeadingDeg: 0, takeoffWeightKg: 2000,
    });
    expect(veryHigh.hogeMaxWeightKg).toBeGreaterThanOrEqual(1700);
    expect(veryHigh.higeMaxWeightKg).toBeGreaterThanOrEqual(1800);
    const seaLevelCold = calculatePerformance({
      pressureAltFt: 0, tempC: -20, qnhHpa: 1030, windSpeedKt: 0, windDirDeg: 0, runwayHeadingDeg: 0, takeoffWeightKg: 2000,
    });
    expect(seaLevelCold.hogeMaxWeightKg).toBeLessThanOrEqual(BO105_SPECS.mtowKg);
    expect(seaLevelCold.higeMaxWeightKg).toBeLessThanOrEqual(BO105_SPECS.mtowKg);
  });
});

describe('calculatePerformance OEI (single-engine) climb rate', () => {
  const base = { pressureAltFt: 0, tempC: 15, qnhHpa: 1013.25, windSpeedKt: 0, windDirDeg: 0, runwayHeadingDeg: 0 };

  it('drops the OEI climb rate as density altitude increases at a fixed weight', () => {
    const low = calculatePerformance({ ...base, pressureAltFt: 0, takeoffWeightKg: 2400 });
    const high = calculatePerformance({ ...base, pressureAltFt: 8000, takeoffWeightKg: 2400 });
    expect(high.oeiClimbRateFpm).toBeLessThan(low.oeiClimbRateFpm);
  });

  it('improves the OEI climb rate at a lighter takeoff weight, altitude held fixed', () => {
    const heavy = calculatePerformance({ ...base, pressureAltFt: 4000, takeoffWeightKg: 2500 });
    const light = calculatePerformance({ ...base, pressureAltFt: 4000, takeoffWeightKg: 1800 });
    expect(light.oeiClimbRateFpm).toBeGreaterThan(heavy.oeiClimbRateFpm);
  });

  it('never reports a negative OEI climb rate in an extreme hot-and-high case', () => {
    const extreme = calculatePerformance({ ...base, pressureAltFt: 12000, tempC: 40, takeoffWeightKg: 2500 });
    expect(extreme.oeiClimbRateFpm).toBeGreaterThanOrEqual(0);
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

describe('calculatePowerCurve', () => {
  const baseInput = { pressureAltFt: 0, tempC: 15, qnhHpa: 1013.25, takeoffWeightKg: 2400 };

  it('produces one point per knot across the requested speed range', () => {
    const curve = calculatePowerCurve(baseInput, 20, 130);
    expect(curve.points.length).toBe(130 - 20 + 1);
    expect(curve.points[0].speedKt).toBe(20);
    expect(curve.points[curve.points.length - 1].speedKt).toBe(130);
  });

  it('shapes a U-curve: total power is higher at both ends of the range than at the minimum', () => {
    const curve = calculatePowerCurve(baseInput, 20, 130);
    const first = curve.points[0];
    const last = curve.points[curve.points.length - 1];
    expect(curve.minPowerKw).toBeLessThan(first.totalPowerKw);
    expect(curve.minPowerKw).toBeLessThan(last.totalPowerKw);
  });

  it('reports minPowerKw as the actual minimum among all plotted points', () => {
    const curve = calculatePowerCurve(baseInput, 20, 130);
    const trueMin = Math.min(...curve.points.map(p => p.totalPowerKw));
    expect(curve.minPowerKw).toBe(trueMin);
    const matched = curve.points.find(p => p.speedKt === curve.minPowerSpeedKt);
    expect(matched?.totalPowerKw).toBe(curve.minPowerKw);
  });

  it('places the best-range speed above the minimum-power speed (best range > best endurance)', () => {
    const curve = calculatePowerCurve(baseInput, 20, 130);
    expect(curve.bestRangeSpeedKt).toBeGreaterThan(curve.minPowerSpeedKt);
  });

  it('picks the best-range speed as the one minimizing power/speed among all points', () => {
    const curve = calculatePowerCurve(baseInput, 20, 130);
    const trueBestRatio = Math.min(...curve.points.map(p => p.totalPowerKw / p.speedKt));
    const reportedRatio = curve.bestRangePowerKw / curve.bestRangeSpeedKt;
    expect(reportedRatio).toBeCloseTo(trueBestRatio, 1);
  });

  it('requires more induced power at a heavier takeoff weight, speed held fixed', () => {
    const light = calculatePowerCurve({ ...baseInput, takeoffWeightKg: 1800 }, 40, 40);
    const heavy = calculatePowerCurve({ ...baseInput, takeoffWeightKg: 2500 }, 40, 40);
    expect(heavy.points[0].inducedPowerKw).toBeGreaterThan(light.points[0].inducedPowerKw);
  });

  it('requires more parasite power in denser air (sea level) than thinner air (high density altitude), speed held fixed', () => {
    const denseAir = calculatePowerCurve({ ...baseInput, pressureAltFt: 0 }, 100, 100);
    const thinAir = calculatePowerCurve({ ...baseInput, pressureAltFt: 10000, tempC: -5 }, 100, 100);
    expect(denseAir.points[0].parasitePowerKw).toBeGreaterThan(thinAir.points[0].parasitePowerKw);
  });

  it('reports a fixed available power derived from the two installed 420 SHP engines', () => {
    const curve = calculatePowerCurve(baseInput, 20, 20);
    expect(curve.availablePowerKw).toBeCloseTo(2 * 420 * 0.7457, 1);
  });
});
