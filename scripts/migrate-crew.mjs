// One-off schema setup for the online crew registration (Neon Postgres).
// Run with DATABASE_URL sourced from .env.local, e.g.:
//   source <(grep -v '^#' .env.local | sed 's/^/export /') && node scripts/migrate-crew.mjs
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS crew_profiles (
    id SERIAL PRIMARY KEY,
    device_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('PIC', 'SIC', 'medico', 'despachante')),
    license_type TEXT,
    license_number TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    medical_expiry DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

console.log('crew_profiles table ready.');
