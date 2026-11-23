/**
 * ============================================================================
 * ARCHIVO: donacionFormat.ts
 * Etiquetas y formateo del módulo Gestión de Donaciones.
 * Las fechas llegan como texto local de Bolivia (AAAA-MM-DDTHH:MM:SS) y se
 * formatean por texto, sin `new Date`, para no depender de la zona horaria.
 * ============================================================================
 */

import type {
  EstadoAsignacion,
  EstadoDonacion,
  EstadoMaterial,
  MetodoPago,
  TipoDonacion,
} from '../types/donacion.types';

export const ETIQUETA_TIPO: Record<TipoDonacion, string> = {
  ALIMENTO: 'Alimento',
  MATERIAL: 'Material',
  ECONOMICO: 'Económica',
};

export const ETIQUETA_ESTADO: Record<EstadoDonacion, string> = {
  REGISTRADA: 'Registrada',
  ASIGNADA_PARCIAL: 'Asignada parcial',
  ASIGNADA_TOTAL: 'Asignada total',
  ANULADA: 'Anulada',
};

export const ETIQUETA_ESTADO_ASIGNACION: Record<EstadoAsignacion, string> = {
  ACTIVA: 'Activa',
  CANCELADA: 'Cancelada',
};

export const ETIQUETA_ESTADO_MATERIAL: Record<EstadoMaterial, string> = {
  NUEVO: 'Nuevo',
  USADO_BUEN_ESTADO: 'Usado en buen estado',
  REPARABLE: 'Reparable',
};

export const ETIQUETA_METODO_PAGO: Record<MetodoPago, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  DEPOSITO: 'Depósito',
  QR: 'QR',
};

export const ETIQUETA_ACCION: Record<string, string> = {
  REGISTRAR: 'Registro',
  MODIFICAR: 'Modificación',
  ANULAR: 'Anulación',
  ASIGNAR: 'Asignación',
  CANCELAR_ASIGNACION: 'Cancelación de asignación',
};

/** 1234.5 → "1.234,5" (formato es-BO) */
export const formatoNumero = (n: number | null | undefined): string =>
  n === null || n === undefined
    ? '—'
    : n.toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export const formatoCantidad = (n: number | null | undefined, unidad: string | null | undefined): string =>
  n === null || n === undefined ? '—' : `${formatoNumero(n)}${unidad ? ` ${unidad.trim()}` : ''}`;

/** "2026-11-22T14:05:00" → "22/11/2026" */
export const formatoFecha = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  const [a, m, d] = iso.slice(0, 10).split('-');
  return a && m && d ? `${d}/${m}/${a}` : iso;
};

/** "2026-11-22T14:05:00" → "22/11/2026 14:05" */
export const formatoFechaHora = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  const hora = iso.length >= 16 ? iso.slice(11, 16) : '';
  return `${formatoFecha(iso)}${hora ? ` ${hora}` : ''}`;
};

/** Fecha de hoy (AAAA-MM-DD) en hora de Bolivia, para atributos min/max de inputs. */
export const hoyBolivia = (): string =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'America/La_Paz' });

/** Suma un día a AAAA-MM-DD (para el mínimo de la fecha de vencimiento). */
export const mananaBolivia = (): string => {
  const [a, m, d] = hoyBolivia().split('-').map(Number);
  const f = new Date(Date.UTC(a, m - 1, d + 1));
  return f.toISOString().slice(0, 10);
};
