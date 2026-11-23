/**
 * ============================================================================
 * ARCHIVO: donacion.api.ts
 * LLAMADAS HTTP del módulo Gestión de Donaciones.
 * Usa el cliente central (api/client.ts: baseURL + Bearer token).
 * ============================================================================
 */

import axios from 'axios';
import api from './client';
import type {
  AsignacionItem,
  AuditoriaItem,
  BeneficiarioAsignable,
  CampanaResumen,
  CatalogosDonacion,
  ComprobanteItem,
  DonacionDetalle,
  DonacionListaItem,
  DonanteBusqueda,
  EntregaPendienteItem,
  EntregaHistorialItem,
  FiltrosDonacion,
  Paginado,
  ReporteDonaciones,
} from '../types/donacion.types';

/** Quita filtros vacíos antes de enviarlos como query string. */
const limpiar = (obj: object): Record<string, string | number> => {
  const salida: Record<string, string | number> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== '' && v !== undefined && v !== null) salida[k] = v as string | number;
  });
  return salida;
};

/** Error del backend normalizado: mensaje principal + lista de errores de campo. */
export interface ErrorApi {
  mensaje: string;
  errores: string[];
  status?: number;
}

export const leerError = (err: unknown): ErrorApi => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string; errores?: string[] } | undefined;
    const errores = Array.isArray(data?.errores) ? data!.errores! : [];
    return {
      mensaje: data?.error || (err.response ? 'No se pudo completar la operación.' : 'No hay conexión con el servidor.'),
      errores,
      status: err.response?.status,
    };
  }
  return { mensaje: 'Ocurrió un error inesperado.', errores: [] };
};

export interface InventarioItem {
  id_inventario: number; id_donacion: number; donacion_codigo: string; id_recepcion: number;
  tipo_item: string; nombre_item: string | null; cantidad_ingresada: number; cantidad_disponible: number;
  unidad: string; ubicacion: string; estado: string; fecha_ingreso: string; destinado: number;
}

export const donacionApi = {
  inventario: async (): Promise<InventarioItem[]> => (await api.get('/donaciones/inventario')).data,

  catalogos: async (): Promise<CatalogosDonacion> => (await api.get('/donaciones/catalogos')).data,

  campanasActivas: async (): Promise<CampanaResumen[]> => (await api.get('/donaciones/campanas-activas')).data,

  buscarDonantes: async (q: string): Promise<DonanteBusqueda[]> =>
    (await api.get('/donaciones/donantes/buscar', { params: { q } })).data,

  beneficiariosAsignables: async (): Promise<BeneficiarioAsignable[]> =>
    (await api.get('/donaciones/beneficiarios-asignables')).data,

  listar: async (filtros: Partial<FiltrosDonacion>): Promise<Paginado<DonacionListaItem>> =>
    (await api.get('/donaciones', { params: limpiar(filtros) })).data,

  obtener: async (id: number): Promise<DonacionDetalle> => (await api.get(`/donaciones/${id}`)).data,

  registrar: async (payload: Record<string, unknown>) =>
    (await api.post<{ mensaje: string; donacion: { id_donacion: number; codigo: string }; comprobante: ComprobanteItem }>(
      '/donaciones',
      payload
    )).data,

  registrarPresencial: async (payload: Record<string, unknown>) =>
    (await api.post<{ mensaje: string; donacion: { id_donacion: number; codigo: string }; comprobante: ComprobanteItem }>(
      '/donaciones/presencial',
      payload
    )).data,

  subirFotos: async (id: number, files: File[]) => {
    const data = new FormData(); files.forEach(file => data.append('fotos', file));
    return (await api.post(`/donaciones/${id}/fotos`, data, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
  fotos: async (id: number) => (await api.get(`/donaciones/${id}/fotos`)).data,

  modificar: async (id: number, payload: Record<string, unknown>) =>
    (await api.patch<{ mensaje: string }>(`/donaciones/${id}`, payload)).data,

  anular: async (id: number, motivo: string) =>
    (await api.post<{ mensaje: string }>(`/donaciones/${id}/anular`, { motivo })).data,

  auditoria: async (id: number): Promise<AuditoriaItem[]> => (await api.get(`/donaciones/${id}/auditoria`)).data,

  asignables: async (filtros: Partial<FiltrosDonacion>): Promise<Paginado<DonacionListaItem>> =>
    (await api.get('/donaciones/asignables', { params: limpiar(filtros) })).data,

  registrarRecepcion: async (id: number, payload: Record<string, unknown>) =>
    (await api.post<{ mensaje: string; id_recepcion: number; cantidad_recibida: number; cantidad_disponible: number; estado: 'ACEPTADA' | 'PARCIAL' | 'RECHAZADA' }>(`/donaciones/${id}/recepciones`, payload)).data,

  asignar: async (id: number, payload: Record<string, unknown>) =>
    (await api.post<{ mensaje: string; estado_donacion: string; saldo_restante: number }>(
      `/donaciones/${id}/asignaciones`,
      payload
    )).data,

  cancelarAsignacion: async (idAsignacion: number, motivo: string) =>
    (await api.post<{ mensaje: string }>(`/donaciones/asignaciones/${idAsignacion}/cancelar`, { motivo })).data,

  listarAsignaciones: async (params: {
    estado?: string;
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<Paginado<AsignacionItem>> => (await api.get('/donaciones/asignaciones', { params: limpiar(params) })).data,

  entregasPendientes: async (): Promise<EntregaPendienteItem[]> =>
    (await api.get('/donaciones/entregas/pendientes')).data,

  historialEntregas: async (): Promise<EntregaHistorialItem[]> =>
    (await api.get('/donaciones/entregas')).data,

  registrarEntrega: async (payload: {
    id_asignacion: number;
    cantidad: number;
    lugar_entrega: string;
    observaciones?: string;
  }): Promise<{ mensaje: string; id_entrega: number }> =>
    (await api.post('/donaciones/entregas', payload)).data,

  reporte: async (filtros: Partial<FiltrosDonacion>): Promise<ReporteDonaciones> =>
    (await api.get('/donaciones/reportes', { params: limpiar(filtros) })).data,
};

export default donacionApi;
