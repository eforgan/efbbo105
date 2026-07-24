import { describe, it, expect } from 'vitest';
import { getSunTimesUtc, formatUtcHm, getMoonPhase, getNvgSuitability } from '../lib/astronomy';

describe('getSunTimesUtc', () => {
  it('gives a near-equatorial location a sunrise before noon and sunset after noon on the equinox', () => {
    const { sunriseUtc, sunsetUtc, civilTwilightEndUtc } = getSunTimesUtc(new Date('2026-03-20T00:00:00Z'), 0, 0);
    expect(sunriseUtc).not.toBeNull();
    expect(sunsetUtc).not.toBeNull();
    // At the equator on the equinox, sunrise/sunset sit close to 06:00/18:00 UTC (lon 0).
    expect(sunriseUtc!.getUTCHours()).toBeGreaterThanOrEqual(5);
    expect(sunriseUtc!.getUTCHours()).toBeLessThanOrEqual(7);
    expect(sunsetUtc!.getUTCHours()).toBeGreaterThanOrEqual(17);
    expect(sunsetUtc!.getUTCHours()).toBeLessThanOrEqual(19);
    // Civil twilight ends after sunset.
    expect(civilTwilightEndUtc!.getTime()).toBeGreaterThan(sunsetUtc!.getTime());
  });

  it('returns null for a pole in full polar night', () => {
    const { sunriseUtc, sunsetUtc } = getSunTimesUtc(new Date('2026-06-21T00:00:00Z'), -89, 0);
    expect(sunriseUtc).toBeNull();
    expect(sunsetUtc).toBeNull();
  });
});

describe('formatUtcHm', () => {
  it('formats a UTC date as zero-padded HH:MM UTC', () => {
    const d = new Date(Date.UTC(2026, 6, 24, 5, 7));
    expect(formatUtcHm(d)).toBe('05:07 UTC');
  });

  it('returns a fallback message for a null date (e.g. polar day/night)', () => {
    expect(formatUtcHm(null)).toMatch(/N\/D/);
  });
});

describe('getMoonPhase', () => {
  it('reports near-zero illumination on a known new moon date', () => {
    // KNOWN_NEW_MOON_JD in astronomy.ts corresponds to 2000-01-06 18:14 UTC.
    const phase = getMoonPhase(new Date('2000-01-06T18:14:00Z'));
    expect(phase.illuminationPct).toBeLessThanOrEqual(2);
    expect(phase.name).toBe('Luna Nueva');
  });

  it('reports high illumination roughly half a synodic month after a new moon', () => {
    const halfMonthLaterMs = new Date('2000-01-06T18:14:00Z').getTime() + 14.76 * 86400000;
    const phase = getMoonPhase(new Date(halfMonthLaterMs));
    expect(phase.illuminationPct).toBeGreaterThanOrEqual(95);
    expect(phase.name).toBe('Luna Llena');
  });
});

describe('getNvgSuitability', () => {
  it('classifies illumination at and above 60% as excellent', () => {
    expect(getNvgSuitability(60)).toBe('EXCELENTE');
    expect(getNvgSuitability(100)).toBe('EXCELENTE');
  });

  it('classifies illumination between 20% and 59% as needing a searchlight', () => {
    expect(getNvgSuitability(59)).toBe('MEDIO_REQUIERE_FARO');
    expect(getNvgSuitability(20)).toBe('MEDIO_REQUIERE_FARO');
  });

  it('classifies illumination below 20% as critical with no illumination', () => {
    expect(getNvgSuitability(19)).toBe('CRITICO_SIN_ILUMINACION');
    expect(getNvgSuitability(0)).toBe('CRITICO_SIN_ILUMINACION');
  });
});
