// src/services/donacionNotificador.ts
// ============================================================================
// Notificaciones por correo del módulo Gestión de Donaciones.
// Best-effort: se ejecutan DESPUÉS del commit y un fallo de correo nunca
// revierte ni rompe la operación (solo se registra en consola).
// ============================================================================
import { transporter } from '../config/mailer';

const escapar = (t: string): string =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const plantilla = (titulo: string, lineas: string[]): string => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #111C2D; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: #FFFFFF; margin: 0; font-size: 20px;">Donaciones <span style="color: #68B5E8;">y Voluntariado</span></h1>
    </div>
    <div style="background: #F6F8FB; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #DCE4EE; border-top: none;">
      <h2 style="color: #111C2D; margin-top: 0; font-size: 18px;">${escapar(titulo)}</h2>
      ${lineas.map((l) => `<p style="color: #475569; line-height: 1.6; margin: 8px 0;">${l}</p>`).join('')}
    </div>
  </div>`;

const enviar = async (destinos: string[], asunto: string, html: string): Promise<void> => {
  const para = [...new Set(destinos.filter(Boolean))];
  if (para.length === 0) return;
  if (!process.env.EMAIL_USER || !(process.env.BREVO_SMTP_KEY || process.env.EMAIL_PASS)) {
    console.warn(`✉️  [donaciones] SMTP no configurado; no se envió: "${asunto}"`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Donaciones y Voluntarios'}" <${process.env.EMAIL_USER}>`,
      to: para.join(','),
      subject: asunto,
      html,
    });
  } catch (err) {
    console.error(`✉️  [donaciones] No se pudo enviar "${asunto}":`, (err as Error).message);
  }
};

interface DatosBase {
  codigo: string;
  resumen: string; // ej. "25 KG · Arroz"
}

/** Dispara sin esperar y sin propagar errores. */
const enSegundoPlano = (tarea: Promise<void>): void => {
  void tarea.catch((e) => console.error('✉️  [donaciones] Error de notificación:', e));
};

export const donacionNotificador = {
  registrada(p: DatosBase & { numeroComprobante: string; donanteNombre: string; donanteCorreo: string; adminCorreos: string[] }): void {
    enSegundoPlano(
      (async () => {
        await enviar(
          [p.donanteCorreo],
          `Donación ${p.codigo} registrada`,
          plantilla('¡Gracias por tu donación!', [
            `Hola <strong>${escapar(p.donanteNombre)}</strong>, registramos tu donación <strong>${escapar(p.codigo)}</strong> (${escapar(p.resumen)}).`,
            `Comprobante: <strong>${escapar(p.numeroComprobante)}</strong>. Puedes descargarlo desde el sistema.`,
          ])
        );
        await enviar(
          p.adminCorreos,
          `Nueva donación ${p.codigo}`,
          plantilla('Nueva donación registrada', [
            `Se registró la donación <strong>${escapar(p.codigo)}</strong> de ${escapar(p.donanteNombre)}: ${escapar(p.resumen)}.`,
          ])
        );
      })()
    );
  },

  modificada(p: DatosBase & { donanteNombre: string; donanteCorreo: string }): void {
    enSegundoPlano(
      enviar(
        [p.donanteCorreo],
        `Donación ${p.codigo} actualizada`,
        plantilla('Tu donación fue actualizada', [
          `Hola <strong>${escapar(p.donanteNombre)}</strong>, un administrador corrigió los datos de tu donación <strong>${escapar(p.codigo)}</strong> (${escapar(p.resumen)}).`,
        ])
      )
    );
  },

  anulada(p: DatosBase & { donanteNombre: string; donanteCorreo: string; motivo: string }): void {
    enSegundoPlano(
      enviar(
        [p.donanteCorreo],
        `Donación ${p.codigo} anulada`,
        plantilla('Tu donación fue anulada', [
          `Hola <strong>${escapar(p.donanteNombre)}</strong>, la donación <strong>${escapar(p.codigo)}</strong> fue anulada.`,
          `Motivo: ${escapar(p.motivo)}`,
        ])
      )
    );
  },

  asignada(
    p: DatosBase & {
      cantidadAsignada: string;
      donanteNombre: string;
      donanteCorreo: string;
      beneficiarioNombre: string;
      beneficiarioCorreo: string;
    }
  ): void {
    enSegundoPlano(
      (async () => {
        await enviar(
          [p.donanteCorreo],
          `Tu donación ${p.codigo} tiene una asignación`,
          plantilla('Tu donación tiene una asignación', [
            `Hola <strong>${escapar(p.donanteNombre)}</strong>, una parte de tu donación <strong>${escapar(p.codigo)}</strong> (${escapar(p.cantidadAsignada)}) fue asignada a una persona o institución beneficiaria.`,
          ])
        );
        await enviar(
          [p.beneficiarioCorreo],
          'Tienes una donación reservada',
          plantilla('Se reservó una donación para ti', [
            `Hola <strong>${escapar(p.beneficiarioNombre)}</strong>, se reservó una donación (${escapar(p.cantidadAsignada)}) a tu nombre. La entrega todavía debe coordinarse y confirmarse.`,
          ])
        );
      })()
    );
  },
};
