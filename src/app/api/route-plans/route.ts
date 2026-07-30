import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '../../../lib/db';
import { checkCrewPin } from '../../../lib/apiAuth';
import { SavedRoutePlan, RoutePoint } from '../../../types/efb';

const ID_RE = /^[a-zA-Z0-9_-]{1,80}$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
const MAX_TEXT_LEN = 120;
const MAX_POINTS = 50;

interface DbRow {
  id: string;
  name: string;
  saved_at_iso: string;
  points: RoutePoint[];
  updated_at: string;
}

function toEntry(row: DbRow): SavedRoutePlan & { updatedAt: string } {
  return {
    id: row.id,
    name: row.name,
    savedAtIso: row.saved_at_iso,
    points: row.points,
    updatedAt: row.updated_at,
  };
}

interface PlanInput {
  id: string;
  name: string;
  savedAtIso: string;
  points: RoutePoint[];
}

function parsePoint(v: unknown): RoutePoint | null {
  if (typeof v !== 'object' || v === null) return null;
  const p = v as Record<string, unknown>;
  if (typeof p.id !== 'string' || !p.id || p.id.length > MAX_TEXT_LEN) return null;
  if (typeof p.code !== 'string' || p.code.length > MAX_TEXT_LEN) return null;
  if (typeof p.name !== 'string' || p.name.length > MAX_TEXT_LEN) return null;
  if (typeof p.lat !== 'number' || !Number.isFinite(p.lat) || p.lat < -90 || p.lat > 90) return null;
  if (typeof p.lon !== 'number' || !Number.isFinite(p.lon) || p.lon < -180 || p.lon > 180) return null;
  if (typeof p.isAlternate !== 'boolean') return null;
  if (typeof p.isManual !== 'boolean') return null;
  return { id: p.id, code: p.code, name: p.name, lat: p.lat, lon: p.lon, isAlternate: p.isAlternate, isManual: p.isManual };
}

function parseInput(body: unknown): { value: PlanInput } | { error: string } {
  if (typeof body !== 'object' || body === null) return { error: 'Cuerpo inválido' };
  const b = body as Record<string, unknown>;

  if (typeof b.id !== 'string' || !ID_RE.test(b.id)) return { error: 'ID inválido' };
  if (typeof b.name !== 'string' || !b.name.trim() || b.name.length > MAX_TEXT_LEN) return { error: 'Nombre de ruta inválido' };
  if (typeof b.savedAtIso !== 'string' || !ISO_RE.test(b.savedAtIso)) return { error: 'Fecha/hora inválida' };

  if (!Array.isArray(b.points) || b.points.length === 0 || b.points.length > MAX_POINTS) return { error: 'Puntos de ruta inválidos' };
  const points: RoutePoint[] = [];
  for (const raw of b.points) {
    const point = parsePoint(raw);
    if (!point) return { error: 'Punto de ruta inválido' };
    points.push(point);
  }

  return { value: { id: b.id, name: b.name.trim(), savedAtIso: b.savedAtIso, points } };
}

export async function GET(request: NextRequest) {
  const auth = checkCrewPin(request);
  if ('error' in auth) return auth.error;

  const sql = getSql();
  const rows = (await sql`SELECT * FROM route_plans ORDER BY saved_at_iso DESC LIMIT 100`) as DbRow[];
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
    INSERT INTO route_plans (id, name, saved_at_iso, points)
    VALUES (${v.id}, ${v.name}, ${v.savedAtIso}, ${JSON.stringify(v.points)}::jsonb)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      saved_at_iso = EXCLUDED.saved_at_iso,
      points = EXCLUDED.points,
      updated_at = now()
    RETURNING *
  `) as DbRow[];

  return NextResponse.json({ item: toEntry(row) });
}

export async function DELETE(request: NextRequest) {
  const auth = checkCrewPin(request);
  if ('error' in auth) return auth.error;

  const id = request.nextUrl.searchParams.get('id');
  if (!id || !ID_RE.test(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

  const sql = getSql();
  const rows = (await sql`DELETE FROM route_plans WHERE id = ${id} RETURNING id`) as { id: string }[];
  if (rows.length === 0) return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
