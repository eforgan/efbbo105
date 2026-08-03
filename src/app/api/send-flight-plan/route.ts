import { NextRequest, NextResponse } from 'next/server';
import { checkCrewPin } from '../../../lib/apiAuth';
import { sendMail, isMailerConfigured } from '../../../lib/mailer';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_TEXT_LEN = 200;
// Copia fija en todo plan de vuelo enviado, además del destinatario elegido en la app.
const ADMIN_CC = 'eforgan@gruppomodena.com';
// Generous cap for a small PDF-plus-base64-overhead payload (a one-page FPL 1801 runs a
// few hundred KB at most) — guards against an oversized body tying up the SMTP relay.
const MAX_PDF_BASE64_LEN = 8_000_000;

interface FlightPlanEmailInput {
  to: string;
  callsign: string;
  depIcao: string;
  destIcao: string;
  eobtTime: string;
  pdfBase64: string;
}

function parseInput(body: unknown): { value: FlightPlanEmailInput } | { error: string } {
  if (typeof body !== 'object' || body === null) return { error: 'Cuerpo inválido' };
  const b = body as Record<string, unknown>;

  if (typeof b.to !== 'string' || !EMAIL_RE.test(b.to) || b.to.length > MAX_TEXT_LEN) return { error: 'Email destinatario inválido' };

  const text = (v: unknown, label: string): { value: string } | { error: string } => {
    if (typeof v !== 'string' || !v.trim() || v.length > MAX_TEXT_LEN) return { error: `${label} inválido` };
    return { value: v.trim() };
  };
  const callsignResult = text(b.callsign, 'Identificación');
  if ('error' in callsignResult) return callsignResult;
  const depResult = text(b.depIcao, 'Aeródromo de salida');
  if ('error' in depResult) return depResult;
  const destResult = text(b.destIcao, 'Aeródromo de destino');
  if ('error' in destResult) return destResult;
  const eobtResult = text(b.eobtTime, 'EOBT');
  if ('error' in eobtResult) return eobtResult;

  if (typeof b.pdfBase64 !== 'string' || !b.pdfBase64 || b.pdfBase64.length > MAX_PDF_BASE64_LEN) {
    return { error: 'PDF adjunto inválido' };
  }

  return {
    value: {
      to: b.to.trim(), callsign: callsignResult.value, depIcao: depResult.value,
      destIcao: destResult.value, eobtTime: eobtResult.value, pdfBase64: b.pdfBase64,
    },
  };
}

export async function POST(request: NextRequest) {
  const auth = checkCrewPin(request);
  if ('error' in auth) return auth.error;

  if (!isMailerConfigured()) {
    return NextResponse.json({ error: 'Envío de email no configurado en el servidor (falta SMTP_USER/SMTP_PASS)' }, { status: 503 });
  }

  const parsed = parseInput(await request.json().catch(() => null));
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const v = parsed.value;

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = Buffer.from(v.pdfBase64, 'base64');
  } catch {
    return NextResponse.json({ error: 'No se pudo decodificar el PDF adjunto' }, { status: 400 });
  }

  try {
    await sendMail({
      to: v.to,
      cc: ADMIN_CC,
      subject: `Plan de Vuelo EANA 1801 — ${v.callsign} (${v.depIcao} → ${v.destIcao})`,
      text: `Plan de vuelo reglamentario adjunto.\n\nIdentificación: ${v.callsign}\nSalida: ${v.depIcao} — EOBT ${v.eobtTime} UTC\nDestino: ${v.destIcao}\n\nGenerado por el EFB BO105 CBS-4 — Modena Air Service.`,
      attachments: [{ filename: `Plan_de_Vuelo_EANA_1801_${v.callsign}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }],
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: `No se pudo enviar el email: ${(err as Error).message}` }, { status: 502 });
  }

  // The shared crew PIN doesn't identify who sent it — this line is the only trail if the
  // PIN ever leaks and this endpoint gets used to relay mail to an unexpected recipient.
  console.log(`[send-flight-plan] ${new Date().toISOString()} ${v.callsign} ${v.depIcao}->${v.destIcao} -> ${v.to}`);

  return NextResponse.json({ ok: true });
}
