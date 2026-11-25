import { AppError } from '../utils/AppError';
import {
  TIPOS_AYUDA,
  type FichaBeneficiario,
  type SolicitudCrear,
  type ApoyoDatos,
} from '../models/ayudaModel';

export const objeto = (v: unknown): Record<string, unknown> => {
  if (!v || typeof v !== 'object' || Array.isArray(v))
    throw new AppError('Datos inválidos.', 400);
  return v as Record<string, unknown>;
};
export function texto(v: unknown, campo: string, min = 1, max = 2000): string {
  if (typeof v !== 'string' || v.trim().length < min || v.trim().length > max)
    throw new AppError(
      `${campo}: ingresa entre ${min} y ${max} caracteres.`,
      400,
    );
  return v.trim();
}
export function idPositivo(v: unknown): number {
  if (
    (typeof v !== 'string' && typeof v !== 'number') ||
    !/^\d+$/.test(String(v)) ||
    !Number.isSafeInteger(Number(v)) ||
    Number(v) < 1
  )
    throw new AppError('Identificador inválido.', 400);
  return Number(v);
}
export function opcion(
  v: unknown,
  valores: readonly string[],
  campo: string,
): string {
  if (typeof v !== 'string' || !valores.includes(v))
    throw new AppError(`${campo}: selecciona una opción válida.`, 400);
  return v;
}
export const hoyBolivia = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/La_Paz',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
export function fecha(v: unknown, campo: string, futura = false): string {
  const s = texto(v, campo, 10, 10);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(s) ||
    !Number.isFinite(Date.parse(s)) ||
    new Date(s).toISOString().slice(0, 10) !== s ||
    s < '1900-01-01' ||
    (!futura && s > hoyBolivia())
  )
    throw new AppError(
      `${campo}: fecha inválida${futura ? '' : ' o futura'}.`,
      400,
    );
  return s;
}
export function validarFicha(b: Record<string, unknown>): FichaBeneficiario {
  const correo = texto(b.correo, 'Correo', 5, 150).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
    throw new AppError('Correo electrónico inválido.', 400);
  const telefono = b.telefono
    ? texto(b.telefono, 'Teléfono', 8, 20).replace(/^\+591\s*/, '')
    : null;
  if (telefono && !/^\d{8}$/.test(telefono))
    throw new AppError(
      'Teléfono: ingresa 8 dígitos, con prefijo +591 opcional.',
      400,
    );
  const documento = texto(b.documento, 'Documento', 5, 30).toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9.\-/ ]{4,29}$/.test(documento))
    throw new AppError('Formato de documento inválido.', 400);
  return {
    nombre: texto(b.nombre, 'Nombres', 2, 100),
    apellido: texto(b.apellido, 'Apellidos / razón social', 2, 100),
    correo,
    telefono,
    documento,
    tipo_documento: opcion(
      b.tipo_documento,
      ['CI', 'NIT', 'Pasaporte', 'Personeria juridica'],
      'Tipo de documento',
    ),
    tipo_beneficiario: opcion(
      b.tipo_beneficiario,
      ['Persona', 'Familia', 'Institucion'],
      'Tipo de beneficiario',
    ),
    direccion: texto(b.direccion, 'Dirección', 5, 255),
    necesidad: texto(b.necesidad, 'Necesidad', 3, 150),
    descripcion: b.descripcion
      ? texto(b.descripcion, 'Descripción', 0, 2000)
      : '',
    estado: opcion(
      b.estado,
      ['Pendiente', 'Verificado', 'Rechazado'],
      'Estado del beneficiario',
    ),
  };
}
export function validarSolicitud(
  b: Record<string, unknown>,
  beneficiario: number,
): SolicitudCrear {
  return {
    beneficiario_usuario_id: beneficiario,
    tipo_ayuda: opcion(b.tipo_ayuda, TIPOS_AYUDA, 'Tipo de ayuda'),
    descripcion: texto(b.descripcion, 'Descripción de la necesidad', 10, 4000),
    prioridad: opcion(b.prioridad, ['Baja', 'Media', 'Alta'], 'Prioridad'),
    fecha_solicitud: fecha(b.fecha_solicitud, 'Fecha de solicitud'),
  };
}
export function validarApoyo(b: Record<string, unknown>): ApoyoDatos {
  return {
    tipo_apoyo: texto(b.tipo_apoyo, 'Tipo de apoyo', 3, 150),
    descripcion: texto(b.descripcion, 'Descripción', 10, 2000),
    responsable_id: idPositivo(b.responsable_id),
    fecha_programada: b.fecha_programada
      ? fecha(b.fecha_programada, 'Fecha programada', true)
      : null,
  };
}
export function mismaVersion(actual: number, enviada: unknown) {
  if (idPositivo(enviada) !== actual)
    throw new AppError(
      'El registro cambió. Recarga el detalle antes de guardar.',
      409,
    );
}
