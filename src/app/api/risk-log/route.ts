import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '../../../lib/db';
import { checkCrewPin } from '../../../lib/apiAuth';
import { ID_RE, ISO_RE, handleDeleteByGeneratedId } from '../../../lib/apiCrud';
import { RiskLogEntry, MissionType } from '../../../types/efb';

const MISSION_TYPES: MissionType[] = [
  'hems-neuquen-vista', 'hems-rosario-utv', 'hems-same-ba', 'hems-ypf-vmos', 'hems-onshore', 'hems-offshore', 'training',
];
const VERDICTS = ['GO', 'PRECAUCION', 'NO-GO'] as const;
const MAX_TEXT_LEN = 300;
const MAX_LIST_ITEMS = 50;

interface DbRow {
  id: string;
  saved_at_iso: string;
  mission: string;
  route_summary: string;
  verdict: string;
  blockers: string[];
  cautions: string[];
  updated_at: string;
}

function toEntry(row: DbRow): RiskLogEntry & { updatedAt: string } {
  return {
    id: row.id,
    savedAtIso: row.saved_at_iso,
    mission: row.mission as MissionType,
    routeSummary: row.route_summary,
    verdict: row.verdict as RiskLogEntry['verdict'],
    blockers: row.blockers,
    cautions: row.cautions,
    updatedAt: row.updated_at,
  };
}

interface RiskInput {
  id: string;
  savedAtIso: string;
  mission: MissionType;
  routeSummary: string;
  verdict: (typeof VERDICTS)[number];
  blockers: string[];
  cautions: string[];
}

function parseStringList(v: unknown, label: string): { value: string[] } | { error: string } {
  if (!Array.isArray(v)) return { error: `${label} inválido` };
  if (v.length > MAX_LIST_ITEMS) return { error: `${label} inválido (demasiados elementos)` };
  const value: string[] = [];
  for (const item of v) {
    if (typeof item !== 'string' || item.length > MAX_TEXT_LEN) return { error: `${label} inválido` };
    value.push(item);
  }
  return { value };
}

function parseInput(body: unknown): { value: RiskInput } | { error: string } {
  if (typeof body !== 'object' || body === null) return { error: 'Cuerpo inválido' };
  const b = body as Record<string, unknown>;

  if (typeof b.id !== 'string' || !ID_RE.test(b.id)) return { error: 'ID inválido' };
  if (typeof b.savedAtIso !== 'string' || !ISO_RE.test(b.savedAtIso)) return { error: 'Fecha/hora inválida' };
  if (typeof b.mission !== 'string' || !MISSION_TYPES.includes(b.mission as MissionType)) return { error: 'Misión inválida' };
  if (typeof b.routeSummary !== 'string' || !b.routeSummary.trim() || b.routeSummary.length > MAX_TEXT_LEN) return { error: 'Resumen de ruta inválido' };
  if (typeof b.verdict !== 'string' || !VERDICTS.includes(b.verdict as (typeof VERDICTS)[number])) return { error: 'Veredicto inválido' };

  const blockersResult = parseStringList(b.blockers, 'Bloqueantes');
  if ('error' in blockersResult) return blockersResult;
  const cautionsResult = parseStringList(b.cautions, 'Precauciones');
  if ('error' in cautionsResult) return cautionsResult;

  return {
    value: {
      id: b.id, savedAtIso: b.savedAtIso, mission: b.mission as MissionType, routeSummary: b.routeSummary.trim(),
      verdict: b.verdict as (typeof VERDICTS)[number], blockers: blockersResult.value, cautions: cautionsResult.value,
    },
  };
}

export async function GET(request: NextRequest) {
  const auth = checkCrewPin(request);
  if ('error' in auth) return auth.error;

  const sql = getSql();
  const rows = (await sql`SELECT * FROM risk_log_entries ORDER BY saved_at_iso DESC LIMIT 200`) as DbRow[];
  return NextResponse.json({ items: rows.map(toEntry) });
}

// PUT: create-or-update by client-generated id (upsert). Risk assessments are meant to be an
// append-only SMS audit trail — PUT is only reachable here from the offline-sync queue, which
// only ever enqueues brand-new entries (there's no edit UI for a past assessment).
export async function PUT(request: NextRequest) {
  const auth = checkCrewPin(request);
  if ('error' in auth) return auth.error;

  const parsed = parseInput(await request.json().catch(() => null));
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const v = parsed.value;

  const sql = getSql();
  const [row] = (await sql`
    INSERT INTO risk_log_entries (id, saved_at_iso, mission, route_summary, verdict, blockers, cautions)
    VALUES (${v.id}, ${v.savedAtIso}, ${v.mission}, ${v.routeSummary}, ${v.verdict}, ${JSON.stringify(v.blockers)}::jsonb, ${JSON.stringify(v.cautions)}::jsonb)
    ON CONFLICT (id) DO UPDATE SET
      saved_at_iso = EXCLUDED.saved_at_iso,
      mission = EXCLUDED.mission,
      route_summary = EXCLUDED.route_summary,
      verdict = EXCLUDED.verdict,
      blockers = EXCLUDED.blockers,
      cautions = EXCLUDED.cautions,
      updated_at = now()
    RETURNING *
  `) as DbRow[];

  return NextResponse.json({ item: toEntry(row) });
}

export async function DELETE(request: NextRequest) {
  return handleDeleteByGeneratedId(request, 'risk_log_entries');
}
