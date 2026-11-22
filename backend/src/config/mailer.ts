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
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // Soluciona el error "self-signed certificate in certificate chain"
    // que ocurre cuando un antivirus (Avast, Kaspersky, ESET, etc.), VPN o proxy local
    // en Windows intercepta las conexiones TLS e inyecta su propio certificado CA.
    rejectUnauthorized: false,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error('❌ Error al configurar Nodemailer:', error.message);
  } else {
    console.log('✅ Nodemailer listo para enviar correos');
  }
});
