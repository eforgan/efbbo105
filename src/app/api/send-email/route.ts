import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Basic abuse guardrails for this endpoint: it sends mail through the app's own Gmail
// account on behalf of whoever calls it, so without these checks it is an open relay.
// - Same-origin check: rejects calls whose Origin header doesn't match this deployment
//   (blocks trivial cross-site / bot abuse; not a substitute for real auth).
// - In-memory per-IP rate limit: best-effort in a serverless runtime (resets on cold
//   start / across instances) but still raises the bar significantly.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const MAX_FIELD_LENGTH = 998; // RFC 5322 header line length
const MAX_BODY_LENGTH = 200_000;

const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin');
    if (!origin || origin !== request.nextUrl.origin) {
      return NextResponse.json({ success: false, error: 'Origen no autorizado' }, { status: 403 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ success: false, error: 'Demasiadas solicitudes, intente más tarde' }, { status: 429 });
    }

    const { to, subject, text, html } = await request.json();

    if (typeof to !== 'string' || !EMAIL_RE.test(to)) {
      return NextResponse.json({ success: false, error: 'Destinatario inválido' }, { status: 400 });
    }
    if (typeof subject !== 'string' || !subject || subject.length > MAX_FIELD_LENGTH) {
      return NextResponse.json({ success: false, error: 'Asunto inválido' }, { status: 400 });
    }
    if (typeof text !== 'string' || (html !== undefined && typeof html !== 'string')) {
      return NextResponse.json({ success: false, error: 'Cuerpo de mensaje inválido' }, { status: 400 });
    }
    if (text.length > MAX_BODY_LENGTH || (typeof html === 'string' && html.length > MAX_BODY_LENGTH)) {
      return NextResponse.json({ success: false, error: 'Mensaje demasiado extenso' }, { status: 400 });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("Faltan variables de entorno SMTP_USER o SMTP_PASS. No se enviará el correo.");
      return NextResponse.json({ success: false, error: 'Configuración de correo incompleta' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Eforgan Projects | BO105" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: unknown) {
    console.error('Error enviando correo:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
