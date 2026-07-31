import nodemailer, { Transporter } from 'nodemailer';

// Lazy singleton, same pattern as getSql() in db.ts: reads SMTP_USER/SMTP_PASS at call
// time (not at module load), so this never throws during `next build` before the env
// vars are set. SMTP_PASS is a Gmail App Password (requires 2FA on the sending account).
let _transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return _transporter;
}

export function isMailerConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

interface SendMailOptions {
  to: string;
  cc?: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
}

export async function sendMail(options: SendMailOptions): Promise<void> {
  if (!isMailerConfigured()) throw new Error('Envío de email no configurado (falta SMTP_USER/SMTP_PASS)');
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"Modena Air Service EFB" <${process.env.SMTP_USER}>`,
    to: options.to,
    cc: options.cc,
    subject: options.subject,
    text: options.text,
    html: options.html,
    attachments: options.attachments,
  });
}
