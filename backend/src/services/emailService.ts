// src/services/emailService.ts
// ============================================================================
// CAPA: Negocio / Infraestructura de mensajería.
// Encapsula las plantillas y el envío de correos electrónicos.
// ============================================================================
import { transporter } from '../config/mailer';

export const emailService = {
  async enviarRecuperacionPassword(
    correo: string,
    nombre: string,
    token: string
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const link = `${frontendUrl}/reset-password?token=${token}`;

    try {
      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'Donaciones y Voluntarios'}" <${process.env.EMAIL_USER}>`,
        to: correo,
        subject: 'Recuperación de contraseña — Donaciones y Voluntariado',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #111C2D, #1B2B44); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">Donaciones <span style="color: #68B5E8;">y Voluntariado</span></h1>
            </div>
            <div style="background: #F6F8FB; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #DCE4EE; border-top: none;">
              <h2 style="color: #111C2D; margin-top: 0;">Recuperación de contraseña</h2>
              <p style="color: #475569; line-height: 1.6;">Hola <strong>${nombre}</strong>,</p>
              <p style="color: #475569; line-height: 1.6;">Recibimos una solicitud para restablecer tu contraseña:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="display: inline-block; background: #346094; color: #FFFFFF; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: bold;">Restablecer contraseña</a>
              </div>
              <p style="color: #475569; font-size: 14px;">O copiá este enlace:<br><span style="color: #346094; word-break: break-all;">${link}</span></p>
              <p style="color: #475569; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #CBD5E1;">⏰ Expira en <strong>1 hora</strong>.</p>
            </div>
          </div>
        `,
      });
    } catch (mailError: any) {
      console.error('No se pudo enviar el correo:', mailError?.message);
      console.log('Enlace de recuperación (modo desarrollo):', link);
    }
  },
};
