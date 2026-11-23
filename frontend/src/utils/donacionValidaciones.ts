/**
 * ============================================================================
 * ARCHIVO: donacionValidaciones.ts
 * Espejo en cliente de validarDonacion() del backend (la validación real vive
 * SIEMPRE en el servidor; esto solo mejora la experiencia de uso).
 * Devuelve TODOS los errores a la vez, indexados por campo.
 * ============================================================================
 */

import type { CatalogosDonacion, DonacionFormValores } from '../types/donacion.types';
import { hoyBolivia } from './donacionFormat';

export type ErroresForm = Partial<Record<keyof DonacionFormValores, string>>;

const numero = (v: string): number | null => {
  const t = v.trim().replace(',', '.');
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

const dosDecimales = (n: number): boolean => Math.abs(Math.round(n * 100) - n * 100) < 1e-6;

export const validarDonacionForm = (
  v: DonacionFormValores,
  cat: CatalogosDonacion,
  opts: { vencimientoOriginal?: string | null } = {}
): ErroresForm => {
  const e: ErroresForm = {};

  if (!v.tipo_donacion) e.tipo_donacion = 'Selecciona el tipo de donación.';
  if (v.descripcion.length > 1000) e.descripcion = 'Máximo 1000 caracteres.';
  if (v.nombre_item.length > 120) e.nombre_item = 'Máximo 120 caracteres.';

  if (v.tipo_donacion === 'ECONOMICO') {
    const m = numero(v.monto);
    if (v.monto.trim() === '') e.monto = 'El monto es obligatorio.';
    else if (m === null) e.monto = 'El monto debe ser un número.';
    else if (m <= 0) e.monto = 'El monto debe ser mayor a cero.';
    else if (!dosDecimales(m)) e.monto = 'Máximo 2 decimales.';
    if (!v.metodo_pago) e.metodo_pago = 'Selecciona el método de pago.';
    if (v.referencia_pago.length > 80) e.referencia_pago = 'Máximo 80 caracteres.';
  }

  if (v.tipo_donacion === 'ALIMENTO' || v.tipo_donacion === 'MATERIAL') {
    const unidad = cat.unidades.find((u) => String(u.id_unidad) === v.unidad_medida_id);
    if (!v.unidad_medida_id) e.unidad_medida_id = 'Selecciona la unidad de medida.';

    const c = numero(v.cantidad);
    if (v.cantidad.trim() === '') e.cantidad = 'La cantidad es obligatoria.';
    else if (c === null) e.cantidad = 'La cantidad debe ser un número.';
    else if (c <= 0) e.cantidad = 'La cantidad debe ser mayor a cero.';
    else if (!dosDecimales(c)) e.cantidad = 'Máximo 2 decimales.';
    else if (unidad && !unidad.permite_decimales && !Number.isInteger(c)) {
      e.cantidad = 'Esta unidad no admite decimales.';
    }

    if (!v.categoria_id) {
      e.categoria_id = v.tipo_donacion === 'ALIMENTO' ? 'Selecciona el tipo de alimento.' : 'Selecciona el tipo de material.';
    }
  }

  if (v.tipo_donacion === 'ALIMENTO') {
    if (!v.fecha_vencimiento) e.fecha_vencimiento = 'La fecha de vencimiento es obligatoria.';
    else if (v.fecha_vencimiento !== opts.vencimientoOriginal && v.fecha_vencimiento <= hoyBolivia()) {
      e.fecha_vencimiento = 'Debe ser posterior a la fecha actual.';
    }
  }

  if (v.tipo_donacion === 'MATERIAL' && !v.estado_material) {
    e.estado_material = 'Selecciona el estado del material.';
  }

  return e;
};

/** Convierte los valores del formulario al cuerpo que espera la API. */
export const construirPayload = (v: DonacionFormValores): Record<string, unknown> => {
  const base: Record<string, unknown> = {
    tipo_donacion: v.tipo_donacion,
    descripcion: v.descripcion.trim(),
    campana_id: v.campana_id ? Number(v.campana_id) : null,
  };
  if (v.tipo_donacion === 'ECONOMICO') {
    return {
      ...base,
      monto: numero(v.monto),
      moneda_codigo: v.moneda_codigo,
      metodo_pago: v.metodo_pago,
      referencia_pago: v.referencia_pago.trim(),
    };
  }
  const comunes = {
    ...base,
    cantidad: numero(v.cantidad),
    categoria_id: Number(v.categoria_id),
    unidad_medida_id: Number(v.unidad_medida_id),
  };
  return v.tipo_donacion === 'ALIMENTO'
    ? { ...comunes, nombre_producto: v.nombre_item.trim(), fecha_vencimiento: v.fecha_vencimiento }
    : { ...comunes, nombre_material: v.nombre_item.trim(), estado_material: v.estado_material };
};

export const valoresIniciales = (): DonacionFormValores => ({
  tipo_donacion: '',
  cantidad: '',
  descripcion: '',
  campana_id: '',
  categoria_id: '',
  unidad_medida_id: '',
  nombre_item: '',
  fecha_vencimiento: '',
  estado_material: '',
  monto: '',
  moneda_codigo: 'BOB',
  metodo_pago: '',
  referencia_pago: '',
});
