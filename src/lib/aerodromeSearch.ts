import { AerodromeRecord, LatLon } from '../types/efb';
import { AR_AERODROMES } from '../data/arAerodromes';
import { calculateDistanceNm } from './calculations';

// Search the Argentina aerodrome/heliport reference list by ICAO code, local
// (ANAC/IATA-style) 3-letter code, or free-text place/municipality name.
export function searchAerodromes(query: string, limit: number = 15): AerodromeRecord[] {
  const q = query.trim().toUpperCase();
  if (!q) return [];

  const exactCode = AR_AERODROMES.filter(a => a.icao === q || a.localCode === q);
  if (exactCode.length > 0) return exactCode.slice(0, limit);

  const qLower = q.toLowerCase();
  const matches = AR_AERODROMES.filter(a =>
    (a.icao && a.icao.toLowerCase().includes(qLower)) ||
    (a.localCode && a.localCode.toLowerCase().includes(qLower)) ||
    a.name.toLowerCase().includes(qLower) ||
    a.municipality.toLowerCase().includes(qLower)
  );
  return matches.slice(0, limit);
}

// Finds aerodromes/heliports within radiusNm of a point, sorted nearest-first — used to
// suggest candidate alternates near the planned destination.
export function findNearbyAerodromes(origin: LatLon, radiusNm: number, limit: number = 8): (AerodromeRecord & { distanceNm: number })[] {
  return AR_AERODROMES
    .map(a => ({ ...a, distanceNm: calculateDistanceNm(origin, { lat: a.lat, lon: a.lon }) }))
    .filter(a => a.distanceNm > 0.5 && a.distanceNm <= radiusNm)
    .sort((a, b) => a.distanceNm - b.distanceNm)
    .slice(0, limit);
}

export interface DmsInput {
  deg: number;
  min: number;
  sec: number;
  hemisphere: 'N' | 'S' | 'E' | 'W';
}

// Converts degrees/minutes/seconds + hemisphere to signed decimal degrees.
export function dmsToDecimal({ deg, min, sec, hemisphere }: DmsInput): number {
  const magnitude = Math.abs(deg) + min / 60 + sec / 3600;
  const sign = hemisphere === 'S' || hemisphere === 'W' ? -1 : 1;
  return sign * magnitude;
}

export function decimalToDms(value: number, isLatitude: boolean): DmsInput {
  const hemisphere: DmsInput['hemisphere'] = isLatitude
    ? (value >= 0 ? 'N' : 'S')
    : (value >= 0 ? 'E' : 'W');
  const abs = Math.abs(value);
  const deg = Math.floor(abs);
  const minFull = (abs - deg) * 60;
  const min = Math.floor(minFull);
  const sec = Math.round((minFull - min) * 60 * 10) / 10;
  return { deg, min, sec, hemisphere };
}
