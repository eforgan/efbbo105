import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// Every shared/online EFB list (crew roster, bitácora, matriz de riesgo, planes de ruta)
// sits behind one operational PIN (CREW_ACCESS_PIN, set by the despachante and distributed
// verbally/WhatsApp) — there's no per-person login. This mirrors how these lists always
// worked locally (one device, no per-person auth), just now backed by Neon so every device
// can see and manage the same data instead of each keeping its own disconnected copy.

// Hashing both sides to a fixed-length digest before comparing means timingSafeEqual never
// hits its "different length" throw (which itself would leak the PIN length via a fast
// rejection) and the comparison time is independent of how much of the PIN matched.
function pinsMatch(a: string, b: string): boolean {
  const digestA = crypto.createHash('sha256').update(a).digest();
  const digestB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

// Best-effort per-IP throttle on wrong-PIN attempts. Deliberately in-memory, not backed by
// Neon/Upstash: it only needs to slow down casual brute-forcing of a PIN shared over
// WhatsApp, not survive a cold start or work across concurrent serverless instances — adding
// a real distributed store would be disproportionate to that threat model.
const FAILED_ATTEMPT_LIMIT = 10;
const FAILED_ATTEMPT_WINDOW_MS = 5 * 60 * 1000;
const failedAttempts = new Map<string, { count: number; windowStartMs: number }>();

function clientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  return forwardedFor?.split(',')[0].trim() || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const entry = failedAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.windowStartMs > FAILED_ATTEMPT_WINDOW_MS) {
    failedAttempts.delete(ip);
    return false;
  }
  return entry.count >= FAILED_ATTEMPT_LIMIT;
}

function recordFailedAttempt(ip: string): void {
  const entry = failedAttempts.get(ip);
  if (!entry || Date.now() - entry.windowStartMs > FAILED_ATTEMPT_WINDOW_MS) {
    failedAttempts.set(ip, { count: 1, windowStartMs: Date.now() });
  } else {
    entry.count += 1;
  }
}

export function checkCrewPin(request: NextRequest): { ok: true } | { error: NextResponse } {
  const configuredPin = process.env.CREW_ACCESS_PIN;
  if (!configuredPin) {
    return { error: NextResponse.json({ error: 'Sincronización online no configurada (falta CREW_ACCESS_PIN)' }, { status: 503 }) };
  }

  const ip = clientIp(request);
  if (isRateLimited(ip)) {
    return {
      error: NextResponse.json(
        { error: 'Demasiados intentos con PIN incorrecto. Probá de nuevo en unos minutos.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(FAILED_ATTEMPT_WINDOW_MS / 1000)) } }
      ),
    };
  }

  const pin = request.headers.get('x-crew-pin');
  if (!pin || !pinsMatch(pin, configuredPin)) {
    recordFailedAttempt(ip);
    return { error: NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 }) };
  }
  return { ok: true };
}
