import { NextRequest, NextResponse } from 'next/server';
import { MetarStationInfo } from '../../../types/efb';

// Free, no-API-key METAR/TAF source: NOAA Aviation Weather Center (aviationweather.gov).
// Official US government aviation weather API; carries the international OPMET feed,
// so it covers Argentine stations (SAZN/SAAR/SABE/SADF) as well. No CORS headers are
// sent by that API, so this route proxies it server-side for the client to consume.
const AWC_BASE = 'https://aviationweather.gov/api/data';
const DEFAULT_IDS = 'SAZN,SAAR,SABE,SADF';

interface AwcCloud {
  cover: string;
  base: number | null;
}

interface AwcMetar {
  icaoId: string;
  rawOb: string;
  name: string;
  temp: number | null;
  dewp: number | null;
  wdir: number | string | null;
  wspd: number | null;
  visib: string | number | null;
  altim: number | null;
  fltCat: 'VFR' | 'MVFR' | 'IFR' | 'LIFR' | null;
  cover: string | null;
  clouds: AwcCloud[];
  reportTime: string;
}

interface AwcTafForecast {
  timeFrom: number;
  timeTo: number;
  fcstChange: string | null;
  probability: number | null;
  wdir: number | string | null;
  wspd: number | null;
  wgst: number | null;
  visib: string | number | null;
  wxString: string | null;
  clouds: AwcCloud[];
}

interface AwcTaf {
  icaoId: string;
  name: string;
  rawTAF: string;
  issueTime: string;
  validTimeFrom: number;
  validTimeTo: number;
  fcsts: AwcTafForecast[];
}

function statuteMilesToKm(visib: string | number | null): number {
  if (visib === null || visib === undefined) return 10;
  const str = String(visib).replace('+', '');
  const sm = parseFloat(str);
  if (Number.isNaN(sm)) return 10;
  return Math.round(sm * 1.609344 * 10) / 10;
}

function formatCloudCover(cover: string | null, clouds: AwcCloud[]): string {
  if (clouds && clouds.length > 0) {
    return clouds
      .map(c => `${c.cover}${c.base !== null ? Math.round(c.base / 100).toString().padStart(3, '0') : ''}`)
      .join(' ');
  }
  return cover || 'SKC';
}

function toMetarStationInfo(m: AwcMetar): MetarStationInfo {
  return {
    icao: m.icaoId,
    name: m.name,
    rawMetar: m.rawOb,
    tempC: m.temp ?? 0,
    dewPointC: m.dewp ?? 0,
    // "VRB" (variable) winds are reported verbatim in rawMetar; normalized to 0 here since
    // the UI field is numeric-only.
    windDirDeg: typeof m.wdir === 'number' ? m.wdir : 0,
    windSpeedKt: m.wspd ?? 0,
    visibilityKm: statuteMilesToKm(m.visib),
    qnhHpa: m.altim ?? 1013,
    flightCategory: m.fltCat ?? 'VFR',
    cloudCover: formatCloudCover(m.cover, m.clouds),
  };
}

export interface TafSummary {
  icao: string;
  name: string;
  rawTaf: string;
  issueTimeUtc: string;
  periods: {
    fromUtc: string;
    toUtc: string;
    change: string | null;
    probability: number | null;
    windDirDeg: number | string | null;
    windSpeedKt: number | null;
    windGustKt: number | null;
    visibilityKm: number;
    weather: string | null;
    cloudCover: string;
  }[];
}

function toTafSummary(t: AwcTaf): TafSummary {
  return {
    icao: t.icaoId,
    name: t.name,
    rawTaf: t.rawTAF,
    issueTimeUtc: t.issueTime,
    periods: (t.fcsts || []).map(f => ({
      fromUtc: new Date(f.timeFrom * 1000).toISOString(),
      toUtc: new Date(f.timeTo * 1000).toISOString(),
      change: f.fcstChange,
      probability: f.probability,
      windDirDeg: f.wdir,
      windSpeedKt: f.wspd,
      windGustKt: f.wgst,
      visibilityKm: statuteMilesToKm(f.visib),
      weather: f.wxString,
      cloudCover: formatCloudCover(null, f.clouds),
    })),
  };
}

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get('ids') || DEFAULT_IDS;

  try {
    const [metarRes, tafRes] = await Promise.all([
      fetch(`${AWC_BASE}/metar?ids=${encodeURIComponent(ids)}&format=json`, {
        next: { revalidate: 600 }, // AWC updates hourly; refetch at most every 10 min
      }),
      fetch(`${AWC_BASE}/taf?ids=${encodeURIComponent(ids)}&format=json`, {
        next: { revalidate: 600 },
      }),
    ]);

    if (!metarRes.ok || !tafRes.ok) {
      return NextResponse.json(
        { error: 'Fuente meteorológica (aviationweather.gov) no disponible', metars: [], tafs: [] },
        { status: 502 }
      );
    }

    const rawMetars: AwcMetar[] = await metarRes.json();
    const rawTafs: AwcTaf[] = await tafRes.json();

    return NextResponse.json({
      source: 'NOAA Aviation Weather Center (aviationweather.gov) — sin costo, sin API key',
      fetchedAtUtc: new Date().toISOString(),
      metars: rawMetars.map(toMetarStationInfo),
      tafs: rawTafs.map(toTafSummary),
    });
  } catch {
    return NextResponse.json(
      { error: 'No se pudo conectar con la fuente meteorológica', metars: [], tafs: [] },
      { status: 502 }
    );
  }
}
