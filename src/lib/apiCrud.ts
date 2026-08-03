import { NextRequest, NextResponse } from 'next/server';
import { getSql } from './db';
import { checkCrewPin } from './apiAuth';

// Shared across every EFB list route (crew, flight-logs, risk-log, route-plans): a
// client-generated id, and (where the record carries a timestamp) either a plain date or a
// full ISO instant.
export const ID_RE = /^[a-zA-Z0-9_-]{1,80}$/;
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

// Identical in every EFB list route: auth, validate the ?id= query param, delete the row by
// its client-generated id, 404 if nothing matched. `table` is always a hardcoded constant
// passed by the calling route file — never user input — so interpolating it via sql.unsafe()
// is exactly as safe as the SELECT_COLUMNS interpolation each route already does; the id
// value itself stays a normal tagged-template parameter, not string-concatenated.
export async function handleDeleteByGeneratedId(request: NextRequest, table: string): Promise<NextResponse> {
  const auth = checkCrewPin(request);
  if ('error' in auth) return auth.error;

  const id = request.nextUrl.searchParams.get('id');
  if (!id || !ID_RE.test(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

  const sql = getSql();
  const rows = (await sql`DELETE FROM ${sql.unsafe(table)} WHERE id = ${id} RETURNING id`) as { id: string }[];
  if (rows.length === 0) return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
