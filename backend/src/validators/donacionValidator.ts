// src/validators/donacionValidator.ts
// ============================================================================
// CAPA: Validación de DTO del módulo Gestión de Donaciones.
// Implementa el caso de uso "Validar datos de donación": recolecta TODOS los
// errores y los devuelve juntos (el actor los corrige en una sola iteración).
// ============================================================================
import { AppError } from '../utils/AppError';
import {
  ESTADOS_DONACION,
  ESTADOS_MATERIAL,
  METODOS_PAGO,
  MONEDAS,
  TIPOS_DONACION,
} from '../models/donacionModel';
import type {
  CatalogosDonacion,
  DonacionNormalizada,
  EstadoAsignacion,
  EstadoDonacion,
  EstadoMaterial,
  FiltrosAsignacion,
  FiltrosDonacion,
  MetodoPago,
  Moneda,
  TipoDonacion,
} from '../models/donacionModel';

/** Error de validación con la lista completa de problemas encontrados. */
export class DonacionValidationError extends AppError {
  public readonly errores: string[];

  constructor(errores: string[]) {
    super(errores.length === 1 ? errores[0] : 'Hay errores en los datos enviados', 400);
    this.name = 'DonacionValidationError';
    this.errores = errores;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const MAX_IMPORTE = 999_999_999_999.99;

/** Fecha de hoy (YYYY-MM-DD) en la zona horaria de Bolivia. */
export const fechaHoyBolivia = (): string =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'America/La_Paz' });

const vacio = (v: unknown): boolean => v === undefined || v === null || String(v).trim() === '';

const aTexto = (v: unknown): string => String(v ?? '').trim();

const aNumero = (v: unknown): number | null => {
  if (vacio(v)) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim().replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

const aEntero = (v: unknown): number | null => {
  const n = aNumero(v);
  return n !== null && Number.isInteger(n) ? n : null;
};

const maximoDosDecimales = (n: number): boolean => Math.abs(Math.round(n * 100) - n * 100) < 1e-6;

export const esFechaISO = (v: unknown): v is string => {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const [a, m, d] = v.split('-').map(Number);
  const f = new Date(Date.UTC(a, m - 1, d));
  return f.getUTCFullYear() === a && f.getUTCMonth() === m - 1 && f.getUTCDate() === d;
};

/** Convierte a número redondeado a 2 decimales (evita ruido de coma flotante). */
export const redondear2 = (n: number): number => Math.round(n * 100) / 100;

// ---------------------------------------------------------------------------
// Donación (registrar / modificar)
// ---------------------------------------------------------------------------
export interface OpcionesValidacionDonacion {
  /** Al modificar: tipo fijo de la donación existente (no se puede cambiar). */
  tipoFijo?: TipoDonacion;
  /** Al modificar: vencimiento actual; si no cambia no se exige que sea futuro. */
  vencimientoPrevio?: string | null;
}

export const validarDonacion = (
  body: Record<string, unknown>,
  catalogos: Pick<CatalogosDonacion, 'categorias' | 'unidades'>,
  opciones: OpcionesValidacionDonacion = {}
): DonacionNormalizada => {
  const errores: string[] = [];

  // --- Tipo -----------------------------------------------------------------
  const tipoRecibido = aTexto(body.tipo_donacion).toUpperCase();
  let tipo: TipoDonacion | null = null;
  if (!tipoRecibido) {
    errores.push('El tipo de donación es obligatorio.');
  } else if (!(TIPOS_DONACION as readonly string[]).includes(tipoRecibido)) {
    errores.push('El tipo de donación debe ser Alimento, Material o Económico.');
  } else {
    tipo = tipoRecibido as TipoDonacion;
    if (opciones.tipoFijo && tipo !== opciones.tipoFijo) {
      errores.push('No se puede cambiar el tipo de una donación ya registrada.');
    }
  }

  // --- Campos comunes -------------------------------------------------------
  const descripcion = aTexto(body.descripcion);
  if (descripcion.length > 1000) errores.push('La descripción no puede superar los 1000 caracteres.');

  let campana_id: number | null = null;
  if (!vacio(body.campana_id)) {
    const c = aEntero(body.campana_id);
    if (c === null || c <= 0) errores.push('La campaña seleccionada no es válida.');
    else campana_id = c;
  }

  // --- Unidad (alimento / material) ----------------------------------------
  let unidadPermiteDecimales = false;
  let unidad_medida_id: number | undefined;
  if (tipo === 'ALIMENTO' || tipo === 'MATERIAL') {
    const u = aEntero(body.unidad_medida_id);
    const unidad = u === null ? undefined : catalogos.unidades.find((x) => x.id_unidad === u);
    if (vacio(body.unidad_medida_id)) errores.push('La unidad de medida es obligatoria.');
    else if (!unidad) errores.push('La unidad de medida seleccionada no es válida.');
    else {
      unidad_medida_id = unidad.id_unidad;
      unidadPermiteDecimales = unidad.permite_decimales;
    }
  }

  // --- Cantidad -------------------------------------------------------------
  let cantidad = 0;
  if (tipo === 'ECONOMICO') {
    // En económicas la cantidad es el monto.
    const monto = aNumero(body.monto);
    if (vacio(body.monto)) errores.push('El monto es obligatorio.');
    else if (monto === null) errores.push('El monto debe ser un valor numérico.');
    else if (monto <= 0) errores.push('El monto debe ser mayor a cero.');
    else if (monto > MAX_IMPORTE) errores.push('El monto supera el máximo permitido.');
    else if (!maximoDosDecimales(monto)) errores.push('El monto admite como máximo 2 decimales.');
    else cantidad = redondear2(monto);
  } else {
    const c = aNumero(body.cantidad);
    if (vacio(body.cantidad)) errores.push('La cantidad es obligatoria.');
    else if (c === null) errores.push('La cantidad debe ser un valor numérico.');
    else if (c <= 0) errores.push('La cantidad debe ser mayor a cero.');
    else if (c > MAX_IMPORTE) errores.push('La cantidad supera el máximo permitido.');
    else if (!maximoDosDecimales(c)) errores.push('La cantidad admite como máximo 2 decimales.');
    else if (!unidadPermiteDecimales && !Number.isInteger(c) && unidad_medida_id !== undefined) {
      errores.push('La unidad de medida elegida no admite cantidades decimales.');
    } else cantidad = redondear2(c);
  }

  const resultado: DonacionNormalizada = {
    tipo_donacion: tipo ?? 'ALIMENTO',
    cantidad,
    descripcion: descripcion || null,
    campana_id,
  };

  // --- Campos propios del tipo ---------------------------------------------
  if (tipo === 'ALIMENTO' || tipo === 'MATERIAL') {
    const tipoCategoria = tipo;
    const cat = aEntero(body.categoria_id);
    const categoria = cat === null ? undefined : catalogos.categorias.find((x) => x.id_categoria === cat);
    if (vacio(body.categoria_id)) {
      errores.push(tipo === 'ALIMENTO' ? 'El tipo de alimento es obligatorio.' : 'El tipo de material es obligatorio.');
    } else if (!categoria || categoria.tipo !== tipoCategoria) {
      errores.push(
        tipo === 'ALIMENTO'
          ? 'El tipo de alimento seleccionado no es válido.'
          : 'El tipo de material seleccionado no es válido.'
      );
    } else {
      resultado.categoria_id = categoria.id_categoria;
    }

    resultado.unidad_medida_id = unidad_medida_id;

    const nombre = aTexto(tipo === 'ALIMENTO' ? body.nombre_producto : body.nombre_material);
    if (nombre.length > 120) errores.push('El nombre del artículo no puede superar los 120 caracteres.');
    resultado.nombre_item = nombre || null;
  }

  if (tipo === 'ALIMENTO') {
    const venc = body.fecha_vencimiento;
    if (vacio(venc)) {
      errores.push('La fecha de vencimiento es obligatoria.');
    } else if (!esFechaISO(venc)) {
      errores.push('La fecha de vencimiento no tiene un formato válido (AAAA-MM-DD).');
    } else {
      const sinCambios = opciones.vencimientoPrevio !== undefined && opciones.vencimientoPrevio === venc;
      if (!sinCambios && venc <= fechaHoyBolivia()) {
        errores.push('La fecha de vencimiento debe ser posterior a la fecha actual.');
      }
      resultado.fecha_vencimiento = venc;
    }
  }

  if (tipo === 'MATERIAL') {
    const em = aTexto(body.estado_material).toUpperCase();
    if (!em) errores.push('El estado del material es obligatorio.');
    else if (!(ESTADOS_MATERIAL as readonly string[]).includes(em)) {
      errores.push('El estado del material seleccionado no es válido.');
    } else resultado.estado_material = em as EstadoMaterial;
  }

  if (tipo === 'ECONOMICO') {
    resultado.monto = cantidad;

    const moneda = aTexto(body.moneda_codigo || 'BOB').toUpperCase();
    if (!(MONEDAS as readonly string[]).includes(moneda)) errores.push('La moneda debe ser BOB o USD.');
    else resultado.moneda_codigo = moneda as Moneda;

    const metodo = aTexto(body.metodo_pago).toUpperCase();
    if (!metodo) errores.push('El método de pago es obligatorio.');
    else if (!(METODOS_PAGO as readonly string[]).includes(metodo)) {
      errores.push('El método de pago seleccionado no es válido.');
    } else resultado.metodo_pago = metodo as MetodoPago;

    const ref = aTexto(body.referencia_pago);
    if (ref.length > 80) errores.push('La referencia de pago no puede superar los 80 caracteres.');
    resultado.referencia_pago = ref || null;
  }

  if (errores.length > 0) throw new DonacionValidationError(errores);
  return resultado;
};

// ---------------------------------------------------------------------------
// Identificadores y textos sueltos
// ---------------------------------------------------------------------------
export const validarIdPositivo = (valor: unknown, nombre: string): number => {
  const n = aEntero(valor);
  if (n === null || n <= 0) throw new AppError(`El identificador de ${nombre} no es válido.`, 400);
  return n;
};

export const validarMotivo = (valor: unknown, etiqueta: string): string => {
  const motivo = aTexto(valor);
  if (!motivo) throw new AppError(`El ${etiqueta} es obligatorio.`, 400);
  if (motivo.length < 5) throw new AppError(`El ${etiqueta} debe tener al menos 5 caracteres.`, 400);
  if (motivo.length > 500) throw new AppError(`El ${etiqueta} no puede superar los 500 caracteres.`, 400);
  return motivo;
};

// ---------------------------------------------------------------------------
// Asignación
// ---------------------------------------------------------------------------
export interface AsignacionNormalizada {
  beneficiario_usuario_id: number;
  cantidad: number;
  solicitud_ayuda_id: number | null;
  observaciones: string | null;
}

export const validarAsignacion = (body: Record<string, unknown>): AsignacionNormalizada => {
  const errores: string[] = [];

  const benef = aEntero(body.beneficiario_usuario_id);
  if (benef === null || benef <= 0) errores.push('Debe seleccionar un beneficiario.');

  let cantidad = 0;
  const c = aNumero(body.cantidad);
  if (vacio(body.cantidad)) errores.push('La cantidad a asignar es obligatoria.');
  else if (c === null) errores.push('La cantidad a asignar debe ser un valor numérico.');
  else if (c <= 0) errores.push('La cantidad a asignar debe ser mayor a cero.');
  else if (c > MAX_IMPORTE) errores.push('La cantidad a asignar supera el máximo permitido.');
  else if (!maximoDosDecimales(c)) errores.push('La cantidad a asignar admite como máximo 2 decimales.');
  else cantidad = redondear2(c);

  let solicitud: number | null = null;
  if (!vacio(body.solicitud_ayuda_id)) {
    const s = aEntero(body.solicitud_ayuda_id);
    if (s === null || s <= 0) errores.push('La solicitud de ayuda indicada no es válida.');
    else solicitud = s;
  }

  const obs = aTexto(body.observaciones);
  if (obs.length > 500) errores.push('Las observaciones no pueden superar los 500 caracteres.');

  if (errores.length > 0) throw new DonacionValidationError(errores);
  return {
    beneficiario_usuario_id: benef as number,
    cantidad,
    solicitud_ayuda_id: solicitud,
    observaciones: obs || null,
  };
};

// ---------------------------------------------------------------------------
// Filtros de consulta (historial / reportes / asignaciones)
// ---------------------------------------------------------------------------
export const validarFiltrosDonacion = (query: Record<string, unknown>): FiltrosDonacion => {
  const f: FiltrosDonacion = {};

  if (!vacio(query.desde)) {
    if (!esFechaISO(query.desde)) throw new AppError('La fecha de inicio no es válida.', 400);
    f.desde = query.desde;
  }
  if (!vacio(query.hasta)) {
    if (!esFechaISO(query.hasta)) throw new AppError('La fecha de fin no es válida.', 400);
    f.hasta = query.hasta;
  }
  if (f.desde && f.hasta && f.desde > f.hasta) {
    throw new AppError('La fecha de inicio no puede ser posterior a la fecha de fin.', 400);
  }

  if (!vacio(query.tipo)) {
    const t = aTexto(query.tipo).toUpperCase();
    if (!(TIPOS_DONACION as readonly string[]).includes(t)) throw new AppError('El tipo de donación no es válido.', 400);
    f.tipo = t as TipoDonacion;
  }
  if (!vacio(query.estado)) {
    const e = aTexto(query.estado).toUpperCase();
    if (!(ESTADOS_DONACION as readonly string[]).includes(e)) throw new AppError('El estado no es válido.', 400);
    f.estado = e as EstadoDonacion;
  }

  const ids: [keyof FiltrosDonacion, string, string][] = [
    ['campana_id', 'campana_id', 'campaña'],
    ['donante_id', 'donante_id', 'donante'],
    ['voluntario_id', 'voluntario_id', 'voluntario'],
  ];
  for (const [clave, campo, etiqueta] of ids) {
    if (!vacio(query[campo])) {
      const n = aEntero(query[campo]);
      if (n === null || n <= 0) throw new AppError(`El filtro de ${etiqueta} no es válido.`, 400);
      (f as Record<string, unknown>)[clave] = n;
    }
  }

  const q = aTexto(query.q);
  if (q) f.q = q.slice(0, 80);

  const page = aEntero(query.page);
  const limit = aEntero(query.limit);
  f.page = page && page > 0 ? page : 1;
  f.limit = limit && limit > 0 ? Math.min(limit, 50) : 10;

  return f;
};

export const validarFiltrosAsignacion = (query: Record<string, unknown>): FiltrosAsignacion => {
  const f: FiltrosAsignacion = {};
  if (!vacio(query.estado)) {
    const e = aTexto(query.estado).toUpperCase();
    if (e !== 'ACTIVA' && e !== 'CANCELADA') throw new AppError('El estado de asignación no es válido.', 400);
    f.estado = e as EstadoAsignacion;
  }
  const q = aTexto(query.q);
  if (q) f.q = q.slice(0, 80);
  const page = aEntero(query.page);
  const limit = aEntero(query.limit);
  f.page = page && page > 0 ? page : 1;
  f.limit = limit && limit > 0 ? Math.min(limit, 50) : 10;
  return f;
};
