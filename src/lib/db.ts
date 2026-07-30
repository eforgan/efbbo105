import { neon } from '@neondatabase/serverless';

// Lazy singleton: neon() reads DATABASE_URL at call time, not at module load, so this
// never throws during `next build` before the Neon integration's env vars are set.
let _sql: ReturnType<typeof neon> | null = null;

export function getSql() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!);
  return _sql;
}
