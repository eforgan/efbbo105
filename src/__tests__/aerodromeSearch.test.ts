import { describe, it, expect } from 'vitest';
import { searchAerodromes, dmsToDecimal, decimalToDms, findNearbyAerodromes } from '../lib/aerodromeSearch';

describe('searchAerodromes', () => {
  it('finds an exact ICAO code match first', () => {
    const results = searchAerodromes('SAEZ');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].icao).toBe('SAEZ');
  });

  it('is case-insensitive', () => {
    const upper = searchAerodromes('SAEZ');
    const lower = searchAerodromes('saez');
    expect(lower.map(r => r.icao)).toEqual(upper.map(r => r.icao));
  });

  it('falls back to a substring/locality match when no exact code matches', () => {
    const results = searchAerodromes('neuquen');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.municipality.toLowerCase().includes('neuqu'))).toBe(true);
  });

  it('returns an empty array for a blank query', () => {
    expect(searchAerodromes('')).toEqual([]);
    expect(searchAerodromes('   ')).toEqual([]);
  });

  it('respects the limit parameter', () => {
    const results = searchAerodromes('a', 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });
});

describe('dmsToDecimal / decimalToDms', () => {
  it('converts DMS to decimal degrees correctly for southern/western hemispheres', () => {
    // 41°41'48"S -> -41.696666...
    const lat = dmsToDecimal({ deg: 41, min: 41, sec: 48, hemisphere: 'S' });
    expect(lat).toBeCloseTo(-41.6967, 3);

    const lon = dmsToDecimal({ deg: 65, min: 1, sec: 24, hemisphere: 'W' });
    expect(lon).toBeCloseTo(-65.0233, 3);
  });

  it('keeps northern/eastern hemispheres positive', () => {
    expect(dmsToDecimal({ deg: 10, min: 30, sec: 0, hemisphere: 'N' })).toBeCloseTo(10.5, 5);
    expect(dmsToDecimal({ deg: 10, min: 30, sec: 0, hemisphere: 'E' })).toBeCloseTo(10.5, 5);
  });

  it('round-trips decimal -> DMS -> decimal within a small tolerance', () => {
    const original = -38.9489;
    const dms = decimalToDms(original, true);
    expect(dms.hemisphere).toBe('S');
    const back = dmsToDecimal(dms);
    expect(back).toBeCloseTo(original, 3);
  });

  it('picks the correct hemisphere for positive/negative decimals', () => {
    expect(decimalToDms(-10, true).hemisphere).toBe('S');
    expect(decimalToDms(10, true).hemisphere).toBe('N');
    expect(decimalToDms(-10, false).hemisphere).toBe('W');
    expect(decimalToDms(10, false).hemisphere).toBe('E');
  });
});

describe('findNearbyAerodromes', () => {
  it('only returns aerodromes within the given radius, nearest first', () => {
    // Near Neuquén (SAZN)
    const origin = { lat: -38.9489, lon: -68.1558 };
    const results = findNearbyAerodromes(origin, 100);
    expect(results.length).toBeGreaterThan(0);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].distanceNm).toBeGreaterThanOrEqual(results[i - 1].distanceNm);
    }
    results.forEach(r => expect(r.distanceNm).toBeLessThanOrEqual(100));
  });

  it('excludes the origin point itself (near-zero distance)', () => {
    const origin = { lat: -38.9489, lon: -68.1558 };
    const results = findNearbyAerodromes(origin, 100);
    results.forEach(r => expect(r.distanceNm).toBeGreaterThan(0.5));
  });

  it('respects the limit parameter', () => {
    const origin = { lat: -34.6037, lon: -58.3816 }; // Buenos Aires — dense area
    const results = findNearbyAerodromes(origin, 200, 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });
});
