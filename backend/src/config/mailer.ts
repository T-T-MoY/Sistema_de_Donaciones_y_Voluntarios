import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Cargar el .env de la raíz en desarrollo; Render proporciona variables del entorno.
const envRaiz = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(envRaiz)) dotenv.config({ path: envRaiz });
dotenv.config();

type BrevoEmail = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
};

export const enviarCorreo = async ({ to, subject, html, text }: BrevoEmail): Promise<void> => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL_USER;
  if (!apiKey || !senderEmail) {
    throw new Error('Falta configurar BREVO_API_KEY o EMAIL_USER.');
  }
  if (!html && !text) throw new Error('El correo debe incluir contenido HTML o texto.');

  const destinatarios = (Array.isArray(to) ? to : to.split(','))
    .map((email) => email.trim())
    .filter(Boolean)
    .map((email) => ({ email }));
  if (destinatarios.length === 0) return;

  const respuesta = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: process.env.EMAIL_FROM_NAME || 'Donaciones y Voluntarios',
        email: senderEmail,
      },
      to: destinatarios,
      subject,
      ...(html ? { htmlContent: html } : {}),
      ...(text ? { textContent: text } : {}),
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new Error(`Brevo API respondió ${respuesta.status}: ${detalle}`);
  }
};
