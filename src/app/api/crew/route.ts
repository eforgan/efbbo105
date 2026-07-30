import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '../../../lib/db';
import { checkCrewPin } from '../../../lib/apiAuth';
import { CrewProfile, CrewRole, PilotLicenseType } from '../../../types/efb';

const ROLES: CrewRole[] = ['PIC', 'SIC', 'medico', 'despachante'];
const LICENSE_TYPES: PilotLicenseType[] = ['PCH', 'PLH', 'PPH', 'INST', 'OTRO'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ID_RE = /^[a-zA-Z0-9_-]{1,80}$/;
const MAX_TEXT_LEN = 120;

interface DbRow {
  id: string;
  full_name: string;
  role: string;
  license_type: string | null;
  license_number: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  // Cast to ::text in every query (see queries below) instead of letting the driver hand
  // back a JS Date for these DATE columns — @neondatabase/serverless parses DATE into a
  // Date object shifted by the server's local timezone, which risks an off-by-one
  // calendar day. Casting in SQL guarantees a plain 'YYYY-MM-DD' string.
  license_expiry_text: string | null;
  medical_expiry_text: string | null;
  updated_at: string;
}

function toCrewProfile(row: DbRow): CrewProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    role: row.role as CrewRole,
    licenseType: (row.license_type as PilotLicenseType) ?? undefined,
    licenseNumber: row.license_number ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    whatsapp: row.whatsapp ?? undefined,
    licenseExpiry: row.license_expiry_text ?? undefined,
    medicalExpiry: row.medical_expiry_text ?? undefined,
    updatedAt: row.updated_at,
  };
}

interface CrewInput {
  id: string;
  fullName: string;
  role: CrewRole;
  licenseType: PilotLicenseType | null;
  licenseNumber: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  licenseExpiry: string | null;
  medicalExpiry: string | null;
}

function parseInput(body: unknown): { value: CrewInput } | { error: string } {
  if (typeof body !== 'object' || body === null) return { error: 'Cuerpo inválido' };
  const b = body as Record<string, unknown>;

  if (typeof b.id !== 'string' || !ID_RE.test(b.id)) return { error: 'ID inválido' };

  const fullName = typeof b.fullName === 'string' ? b.fullName.trim() : '';
  if (!fullName || fullName.length > MAX_TEXT_LEN) return { error: 'Nombre completo inválido' };

  if (typeof b.role !== 'string' || !ROLES.includes(b.role as CrewRole)) return { error: 'Rol inválido' };
  const role = b.role as CrewRole;

  const licenseType = b.licenseType == null || b.licenseType === ''
    ? null
    : (LICENSE_TYPES.includes(b.licenseType as PilotLicenseType) ? (b.licenseType as PilotLicenseType) : undefined);
  if (licenseType === undefined) return { error: 'Tipo de licencia inválido' };

  const textField = (v: unknown): string | null | undefined => {
    if (v == null || v === '') return null;
    if (typeof v !== 'string' || v.length > MAX_TEXT_LEN) return undefined;
    return v.trim();
  };

  const licenseNumber = textField(b.licenseNumber);
  if (licenseNumber === undefined) return { error: 'Número de licencia inválido' };
  const phone = textField(b.phone);
  if (phone === undefined) return { error: 'Teléfono inválido' };
  const whatsapp = textField(b.whatsapp);
  if (whatsapp === undefined) return { error: 'WhatsApp inválido' };

  let email: string | null = null;
  if (b.email != null && b.email !== '') {
    if (typeof b.email !== 'string' || b.email.length > MAX_TEXT_LEN || !EMAIL_RE.test(b.email)) {
      return { error: 'Email inválido' };
    }
    email = b.email.trim();
  }

  const dateField = (v: unknown, label: string): { value: string | null } | { error: string } => {
    if (v == null || v === '') return { value: null };
    if (typeof v !== 'string' || !DATE_RE.test(v)) return { error: `${label} inválido (formato AAAA-MM-DD)` };
    return { value: v };
  };

  const licenseExpiryResult = dateField(b.licenseExpiry, 'Vencimiento de licencia');
  if ('error' in licenseExpiryResult) return licenseExpiryResult;
  const medicalExpiryResult = dateField(b.medicalExpiry, 'Vencimiento de psicofísico');
  if ('error' in medicalExpiryResult) return medicalExpiryResult;

  return {
    value: {
      id: b.id, fullName, role, licenseType, licenseNumber, phone, whatsapp, email,
      licenseExpiry: licenseExpiryResult.value, medicalExpiry: medicalExpiryResult.value,
    },
  };
}

const SELECT_COLUMNS = '*, license_expiry::text AS license_expiry_text, medical_expiry::text AS medical_expiry_text';

// GET: the full shared roster.
export async function GET(request: NextRequest) {
  const auth = checkCrewPin(request);
  if ('error' in auth) return auth.error;

  const sql = getSql();
  const rows = (await sql`SELECT ${sql.unsafe(SELECT_COLUMNS)} FROM crew_profiles ORDER BY full_name`) as DbRow[];
  return NextResponse.json({ items: rows.map(toCrewProfile) });
}

// PUT: create-or-update by client-generated id (upsert) — the client decides the id up
// front (at creation time, offline-capable) so retries after a dropped connection are
// naturally idempotent instead of risking duplicate records.
export async function PUT(request: NextRequest) {
  const auth = checkCrewPin(request);
  if ('error' in auth) return auth.error;

  const parsed = parseInput(await request.json().catch(() => null));
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const v = parsed.value;

  const sql = getSql();
  const [row] = (await sql`
    INSERT INTO crew_profiles (id, full_name, role, license_type, license_number, phone, whatsapp, email, license_expiry, medical_expiry)
    VALUES (${v.id}, ${v.fullName}, ${v.role}, ${v.licenseType}, ${v.licenseNumber}, ${v.phone}, ${v.whatsapp}, ${v.email}, ${v.licenseExpiry}, ${v.medicalExpiry})
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      license_type = EXCLUDED.license_type,
      license_number = EXCLUDED.license_number,
      phone = EXCLUDED.phone,
      whatsapp = EXCLUDED.whatsapp,
      email = EXCLUDED.email,
      license_expiry = EXCLUDED.license_expiry,
      medical_expiry = EXCLUDED.medical_expiry,
      updated_at = now()
    RETURNING ${sql.unsafe(SELECT_COLUMNS)}
  `) as DbRow[];

  return NextResponse.json({ item: toCrewProfile(row) });
}

// DELETE: remove a roster entry by id (?id=...).
export async function DELETE(request: NextRequest) {
  const auth = checkCrewPin(request);
  if ('error' in auth) return auth.error;

  const id = request.nextUrl.searchParams.get('id');
  if (!id || !ID_RE.test(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

  const sql = getSql();
  const rows = (await sql`DELETE FROM crew_profiles WHERE id = ${id} RETURNING id`) as { id: string }[];
  if (rows.length === 0) return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
