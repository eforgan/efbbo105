// One-off build script: parses the OurAirports open-data CSV (downloaded to
// /tmp/aip/airports.csv) and emits src/data/arAerodromes.ts — a filtered,
// typed list of Argentina aerodromes/airports/heliports (ICAO code, local/IATA
// code, name, municipality, lat/lon, elevation, type). Not part of the app's
// runtime; run manually with `node scripts/build-ar-airports.mjs` whenever the
// upstream CSV needs to be refreshed.
import fs from 'node:fs';

const CSV_PATH = process.argv[2] || '/tmp/aip/airports.csv';
const OUT_PATH = process.argv[3] || 'src/data/arAerodromes.ts';

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { out.push(cur); cur = ''; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}

const raw = fs.readFileSync(CSV_PATH, 'utf-8');
const lines = raw.split('\n').filter(l => l.trim().length > 0);
const header = parseCsvLine(lines[0]);
const idx = Object.fromEntries(header.map((h, i) => [h, i]));

const records = [];
for (let i = 1; i < lines.length; i++) {
  const cols = parseCsvLine(lines[i]);
  if (cols[idx.iso_country] !== 'AR') continue;
  const type = cols[idx.type];
  if (type === 'closed') continue;
  records.push({
    icao: cols[idx.icao_code] || cols[idx.gps_code] || '',
    localCode: cols[idx.local_code] || cols[idx.iata_code] || '',
    name: cols[idx.name],
    municipality: cols[idx.municipality] || '',
    lat: Number(cols[idx.latitude_deg]),
    lon: Number(cols[idx.longitude_deg]),
    elevFt: cols[idx.elevation_ft] ? Math.round(Number(cols[idx.elevation_ft])) : null,
    type,
  });
}

// Keep only entries with a usable identifier (ICAO or local/IATA code) — an
// entry with neither can't be searched by code anyway.
const filtered = records.filter(r => r.icao || r.localCode);
filtered.sort((a, b) => a.name.localeCompare(b.name));

const TYPE_MAP = {
  large_airport: 'airport',
  medium_airport: 'airport',
  small_airport: 'airport',
  heliport: 'heliport',
  seaplane_base: 'airport',
  balloonport: 'heliport',
};

const tsLines = filtered.map(r => {
  const icao = r.icao ? `'${r.icao}'` : 'null';
  const local = r.localCode ? `'${r.localCode}'` : 'null';
  const name = r.name.replace(/'/g, "\\'");
  const muni = r.municipality.replace(/'/g, "\\'");
  const kind = TYPE_MAP[r.type] || 'airport';
  return `  { icao: ${icao}, localCode: ${local}, name: '${name}', municipality: '${muni}', lat: ${r.lat}, lon: ${r.lon}, elevFt: ${r.elevFt ?? 'null'}, kind: '${kind}' },`;
});

const out = `// AUTO-GENERATED from the OurAirports open dataset (ourairports.com / public domain),
// filtered to Argentina (iso_country = AR), excluding closed facilities.
// Regenerate with: node scripts/build-ar-airports.mjs
// Source: https://github.com/davidmegginson/ourairports-data
//
// Coverage note: this is a global community-maintained dataset, not ANAC's
// official domestic registry. ICAO codes and coordinates are generally
// reliable; the 3-letter "localCode" here is OurAirports' local/IATA code and
// may not always match ANAC's assigned 3-letter designator exactly,
// especially for small private aerodromes. Verify against the AIP/NOTAM
// before operational use.
import { AerodromeRecord } from '../types/efb';

export const AR_AERODROMES: AerodromeRecord[] = [
${tsLines.join('\n')}
];
`;

fs.writeFileSync(OUT_PATH, out, 'utf-8');
console.log(`Wrote ${filtered.length} Argentina aerodromes to ${OUT_PATH}`);
