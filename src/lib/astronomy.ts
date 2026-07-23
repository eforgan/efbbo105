// Sunrise/sunset/civil-twilight (Sunrise Equation, "Almanac for Computers" 1990,
// the standard public-domain algorithm) and moon-phase (synodic month
// approximation) calculations. Self-contained — no external API — accurate
// enough for HEMS pre-flight planning reference, not for legal timekeeping.

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function normalizeDeg(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function dayOfYearUtc(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((today - start) / 86400000);
}

/**
 * @param zenithDeg 90.833 = standard sunrise/sunset (accounts for refraction + solar radius), 96 = civil twilight
 * @returns UTC Date of the event on the given calendar day, or null if the sun never crosses that zenith there (polar day/night)
 */
function calcSunEventUtc(date: Date, latDeg: number, lonDeg: number, zenithDeg: number, rising: boolean): Date | null {
  const dayOfYear = dayOfYearUtc(date);
  const lngHour = lonDeg / 15;
  const t = rising ? dayOfYear + (6 - lngHour) / 24 : dayOfYear + (18 - lngHour) / 24;

  const M = 0.9856 * t - 3.289;
  let L = M + 1.916 * Math.sin(M * DEG2RAD) + 0.02 * Math.sin(2 * M * DEG2RAD) + 282.634;
  L = normalizeDeg(L);

  let RA = RAD2DEG * Math.atan(0.91764 * Math.tan(L * DEG2RAD));
  RA = normalizeDeg(RA);
  const Lquadrant = Math.floor(L / 90) * 90;
  const RAquadrant = Math.floor(RA / 90) * 90;
  RA = (RA + (Lquadrant - RAquadrant)) / 15;

  const sinDec = 0.39782 * Math.sin(L * DEG2RAD);
  const cosDec = Math.cos(Math.asin(sinDec));

  const cosH =
    (Math.cos(zenithDeg * DEG2RAD) - sinDec * Math.sin(latDeg * DEG2RAD)) / (cosDec * Math.cos(latDeg * DEG2RAD));

  if (cosH > 1 || cosH < -1) return null; // sun never reaches this zenith today at this latitude

  let H = rising ? 360 - RAD2DEG * Math.acos(cosH) : RAD2DEG * Math.acos(cosH);
  H = H / 15;

  const T = H + RA - 0.06571 * t - 6.622;
  const UT = ((T - lngHour) % 24 + 24) % 24;

  const hours = Math.floor(UT);
  const minutes = Math.round((UT - hours) * 60);
  const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hours));
  result.setUTCMinutes(minutes);
  return result;
}

export interface SunTimes {
  sunriseUtc: Date | null;
  sunsetUtc: Date | null;
  civilTwilightEndUtc: Date | null;
}

export function getSunTimesUtc(date: Date, latDeg: number, lonDeg: number): SunTimes {
  return {
    sunriseUtc: calcSunEventUtc(date, latDeg, lonDeg, 90.833, true),
    sunsetUtc: calcSunEventUtc(date, latDeg, lonDeg, 90.833, false),
    civilTwilightEndUtc: calcSunEventUtc(date, latDeg, lonDeg, 96, false),
  };
}

export function formatUtcHm(date: Date | null): string {
  if (!date) return 'N/D (sin ocaso/orto hoy en esta latitud)';
  return `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')} UTC`;
}

const SYNODIC_MONTH_DAYS = 29.53058867;
const KNOWN_NEW_MOON_JD = 2451550.1; // 2000-01-06 18:14 UTC new moon

export interface MoonPhase {
  name: string;
  illuminationPct: number;
}

export function getMoonPhase(date: Date): MoonPhase {
  const julianDay = date.getTime() / 86400000 + 2440587.5;
  const daysSinceNewMoon = julianDay - KNOWN_NEW_MOON_JD;
  const phaseFraction = ((daysSinceNewMoon % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS / SYNODIC_MONTH_DAYS;
  const illuminationPct = Math.round(((1 - Math.cos(2 * Math.PI * phaseFraction)) / 2) * 100);

  let name: string;
  if (phaseFraction < 0.03 || phaseFraction > 0.97) name = 'Luna Nueva';
  else if (phaseFraction < 0.22) name = 'Luna Creciente';
  else if (phaseFraction < 0.28) name = 'Cuarto Creciente';
  else if (phaseFraction < 0.47) name = 'Gibosa Creciente';
  else if (phaseFraction < 0.53) name = 'Luna Llena';
  else if (phaseFraction < 0.72) name = 'Gibosa Menguante';
  else if (phaseFraction < 0.78) name = 'Cuarto Menguante';
  else name = 'Luna Menguante';

  return { name, illuminationPct };
}

export type NvgSuitability = 'EXCELENTE' | 'MEDIO_REQUIERE_FARO' | 'CRITICO_SIN_ILUMINACION';

export function getNvgSuitability(moonIlluminationPct: number): NvgSuitability {
  if (moonIlluminationPct >= 60) return 'EXCELENTE';
  if (moonIlluminationPct >= 20) return 'MEDIO_REQUIERE_FARO';
  return 'CRITICO_SIN_ILUMINACION';
}
