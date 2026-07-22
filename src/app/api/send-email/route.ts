import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { to, subject, text, html } = await request.json();

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
