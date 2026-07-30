import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '../../../lib/db';
import { checkCrewPin } from '../../../lib/apiAuth';
import { FlightLogEntry, MissionType } from '../../../types/efb';

const MISSION_TYPES: MissionType[] = [
  'hems-neuquen-vista', 'hems-rosario-utv', 'hems-same-ba', 'hems-ypf-vmos', 'hems-onshore', 'hems-offshore', 'training',
];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ID_RE = /^[a-zA-Z0-9_-]{1,80}$/;
const MAX_TEXT_LEN = 200;

interface DbRow {
  id: string;
  date_text: string;
  mission_type: string;
  departure_point: string;
  destination_point: string;
  flight_time_hours: number;
  fuel_used_kg: number;
  pic_name: string;
  sic_name: string | null;
  landings_count: number;
  notes: string | null;
  updated_at: string;
}

function toEntry(row: DbRow): FlightLogEntry & { updatedAt: string } {
  return {
    id: row.id,
    date: row.date_text,
    missionType: row.mission_type as MissionType,
    departurePoint: row.departure_point,
    destinationPoint: row.destination_point,
    flightTimeHours: row.flight_time_hours,
    fuelUsedKg: row.fuel_used_kg,
    picName: row.pic_name,
    sicName: row.sic_name ?? undefined,
    landingsCount: row.landings_count,
    notes: row.notes ?? '',
    updatedAt: row.updated_at,
  };
}

interface LogInput {
  id: string;
  date: string;
  missionType: MissionType;
  departurePoint: string;
  destinationPoint: string;
  flightTimeHours: number;
  fuelUsedKg: number;
  picName: string;
  sicName: string | null;
  landingsCount: number;
  notes: string | null;
}

function parseInput(body: unknown): { value: LogInput } | { error: string } {
  if (typeof body !== 'object' || body === null) return { error: 'Cuerpo inválido' };
  const b = body as Record<string, unknown>;

  if (typeof b.id !== 'string' || !ID_RE.test(b.id)) return { error: 'ID inválido' };
  if (typeof b.date !== 'string' || !DATE_RE.test(b.date)) return { error: 'Fecha inválida (formato AAAA-MM-DD)' };
  if (typeof b.missionType !== 'string' || !MISSION_TYPES.includes(b.missionType as MissionType)) return { error: 'Misión inválida' };

  const text = (v: unknown, label: string, required: boolean): { value: string | null } | { error: string } => {
    if (v == null || v === '') return required ? { error: `${label} requerido` } : { value: null };
    if (typeof v !== 'string' || v.length > MAX_TEXT_LEN) return { error: `${label} inválido` };
    return { value: v.trim() };
  };

  const departureResult = text(b.departurePoint, 'Origen', true);
  if ('error' in departureResult) return departureResult;
  const destinationResult = text(b.destinationPoint, 'Destino', true);
  if ('error' in destinationResult) return destinationResult;
  const picResult = text(b.picName, 'Piloto al mando', true);
  if ('error' in picResult) return picResult;
  const sicResult = text(b.sicName, 'Copiloto', false);
  if ('error' in sicResult) return sicResult;
  const notesResult = text(b.notes, 'Observaciones', false);
  if ('error' in notesResult) return notesResult;

  if (typeof b.flightTimeHours !== 'number' || !Number.isFinite(b.flightTimeHours) || b.flightTimeHours <= 0 || b.flightTimeHours > 24) {
    return { error: 'Horas de vuelo inválidas' };
  }
  if (typeof b.fuelUsedKg !== 'number' || !Number.isFinite(b.fuelUsedKg) || b.fuelUsedKg < 0 || b.fuelUsedKg > 2000) {
    return { error: 'Combustible inválido' };
  }
  if (typeof b.landingsCount !== 'number' || !Number.isInteger(b.landingsCount) || b.landingsCount < 0 || b.landingsCount > 100) {
    return { error: 'Cantidad de aterrizajes inválida' };
  }

  return {
    value: {
      id: b.id, date: b.date, missionType: b.missionType as MissionType,
      departurePoint: departureResult.value!, destinationPoint: destinationResult.value!, picName: picResult.value!,
      sicName: sicResult.value, notes: notesResult.value,
      flightTimeHours: b.flightTimeHours, fuelUsedKg: b.fuelUsedKg, landingsCount: b.landingsCount,
    },
  };
}

const SELECT_COLUMNS = '*, date::text AS date_text';

export async function GET(request: NextRequest) {
  const auth = checkCrewPin(request);
  if ('error' in auth) return auth.error;

  const sql = getSql();
  const rows = (await sql`SELECT ${sql.unsafe(SELECT_COLUMNS)} FROM flight_logs ORDER BY date DESC, updated_at DESC`) as DbRow[];
  return NextResponse.json({ items: rows.map(toEntry) });
}

// PUT: create-or-update by client-generated id (upsert).
export async function PUT(request: NextRequest) {
  const auth = checkCrewPin(request);
  if ('error' in auth) return auth.error;

  const parsed = parseInput(await request.json().catch(() => null));
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const v = parsed.value;

  const sql = getSql();
  const [row] = (await sql`
    INSERT INTO flight_logs (id, date, mission_type, departure_point, destination_point, flight_time_hours, fuel_used_kg, pic_name, sic_name, landings_count, notes)
    VALUES (${v.id}, ${v.date}, ${v.missionType}, ${v.departurePoint}, ${v.destinationPoint}, ${v.flightTimeHours}, ${v.fuelUsedKg}, ${v.picName}, ${v.sicName}, ${v.landingsCount}, ${v.notes})
    ON CONFLICT (id) DO UPDATE SET
      date = EXCLUDED.date,
      mission_type = EXCLUDED.mission_type,
      departure_point = EXCLUDED.departure_point,
      destination_point = EXCLUDED.destination_point,
      flight_time_hours = EXCLUDED.flight_time_hours,
      fuel_used_kg = EXCLUDED.fuel_used_kg,
      pic_name = EXCLUDED.pic_name,
      sic_name = EXCLUDED.sic_name,
      landings_count = EXCLUDED.landings_count,
      notes = EXCLUDED.notes,
      updated_at = now()
    RETURNING ${sql.unsafe(SELECT_COLUMNS)}
  `) as DbRow[];

  return NextResponse.json({ item: toEntry(row) });
}

export async function DELETE(request: NextRequest) {
  const auth = checkCrewPin(request);
  if ('error' in auth) return auth.error;

  const id = request.nextUrl.searchParams.get('id');
  if (!id || !ID_RE.test(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

  const sql = getSql();
  const rows = (await sql`DELETE FROM flight_logs WHERE id = ${id} RETURNING id`) as { id: string }[];
  if (rows.length === 0) return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
