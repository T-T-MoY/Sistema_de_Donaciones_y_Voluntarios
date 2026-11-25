/**
 * ============================================================================
 * ARCHIVO: disponibilidadEquipo.api.ts
 * Llamadas HTTP para la consulta de disponibilidad del equipo de voluntarios.
 * ============================================================================
 */

import api from './client';
import type { VoluntarioEquipo, ActividadVoluntarioResumen } from '../types/disponibilidadEquipo.types';

const BASE = '/voluntarios/disponibilidad-equipo';

export const disponibilidadEquipoApi = {
  obtenerDisponibilidadEquipo: async (filtros?: {
    dia?: string;
    busqueda?: string;
  }): Promise<VoluntarioEquipo[]> => {
    const res = await api.get<VoluntarioEquipo[]>(BASE, {
      params: {
        ...(filtros?.dia ? { dia: filtros.dia } : {}),
        ...(filtros?.busqueda ? { busqueda: filtros.busqueda } : {}),
      },
    });
    return res.data;
  },

  obtenerHorariosVoluntario: async (idVoluntario: number) => {
    const res = await api.get(`${BASE}/${idVoluntario}`);
    return res.data;
  },

  obtenerActividadesVoluntario: async (
    idVoluntario: number
  ): Promise<ActividadVoluntarioResumen[]> => {
    const res = await api.get<ActividadVoluntarioResumen[]>(`${BASE}/${idVoluntario}/actividades`);
    return res.data;
  },
};

export default disponibilidadEquipoApi;
