/**
 * ============================================================================
 * ARCHIVO: disponibilidad.api.ts
 * Llama a /api/voluntarios/mi-disponibilidad usando el cliente Axios compartido.
 * ============================================================================
 */

import api from './client';
import type {
  HorarioFormulario,
  MiDisponibilidad,
  RespuestaHorario,
} from '../types/disponibilidad.types';

const BASE = '/voluntarios/mi-disponibilidad';

export const disponibilidadApi = {
  obtener: async (): Promise<MiDisponibilidad> => {
    const res = await api.get<MiDisponibilidad>(BASE);
    return res.data;
  },

  crear: async (payload: HorarioFormulario): Promise<RespuestaHorario> => {
    const res = await api.post<RespuestaHorario>(BASE, payload);
    return res.data;
  },

  actualizar: async (
    id: number,
    payload: HorarioFormulario
  ): Promise<RespuestaHorario> => {
    const res = await api.put<RespuestaHorario>(`${BASE}/${id}`, payload);
    return res.data;
  },

  cambiarEstado: async (id: number, estado: boolean): Promise<RespuestaHorario> => {
    const res = await api.patch<RespuestaHorario>(`${BASE}/${id}/estado`, { estado });
    return res.data;
  },
};

export default disponibilidadApi;
