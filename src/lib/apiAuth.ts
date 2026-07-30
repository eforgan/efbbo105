import { NextRequest, NextResponse } from 'next/server';

// Every shared/online EFB list (crew roster, bitácora, matriz de riesgo, planes de ruta)
// sits behind one operational PIN (CREW_ACCESS_PIN, set by the despachante and distributed
// verbally/WhatsApp) — there's no per-person login. This mirrors how these lists always
// worked locally (one device, no per-person auth), just now backed by Neon so every device
// can see and manage the same data instead of each keeping its own disconnected copy.
export function checkCrewPin(request: NextRequest): { ok: true } | { error: NextResponse } {
  const configuredPin = process.env.CREW_ACCESS_PIN;
  if (!configuredPin) {
    return { error: NextResponse.json({ error: 'Sincronización online no configurada (falta CREW_ACCESS_PIN)' }, { status: 503 }) };
  }
  const pin = request.headers.get('x-crew-pin');
  if (pin !== configuredPin) {
    return { error: NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 }) };
  }
  return { ok: true };
}
