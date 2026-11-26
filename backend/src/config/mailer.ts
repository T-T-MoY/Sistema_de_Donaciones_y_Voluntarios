// src/config/mailer.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Asegurar carga de variables de entorno (.env de la raíz y local)
const envRaiz = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(envRaiz)) {
  dotenv.config({ path: envRaiz });
}
dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT || 587) === 465,
  auth: {
    user: process.env.BREVO_SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.BREVO_SMTP_KEY || process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error('❌ Error al configurar Nodemailer:', error.message);
  } else {
    console.log('✅ Nodemailer listo para enviar correos');
  }
});
