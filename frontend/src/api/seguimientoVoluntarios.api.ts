
import api from './client';

import type {
  FiltrosSeguimiento,
  DatosSeguimiento,
  HistorialVoluntario,
  VoluntarioSeguimiento,
} from '../types/seguimientoVoluntarios.types';

/**
 * Respuesta que devuelve el backend al consultar el historial.
 */
export interface HistorialVoluntarioRespuesta {
  voluntario: VoluntarioSeguimiento;
  estadisticas: {
    total_participaciones: number;
    total_asistencias: number;
    total_ausencias: number;
    total_horas: number;
  };
  participaciones: HistorialVoluntario['participaciones'];
}

/**
 * Datos para el selector de actividades.
 */
export interface ActividadFiltro {
  id_actividad: number;
  nombre: string;
  fecha: string;
}

/**
 * API del módulo Seguimiento de Voluntarios.
 */
export const seguimientoVoluntariosApi = {

  /**
   * Obtiene el seguimiento general con sus filtros y estadísticas.
   */
  obtenerSeguimiento: async (
    filtros: Partial<FiltrosSeguimiento> = {}
  ): Promise<DatosSeguimiento> => {
    const res = await api.get('/seguimiento', {
      params: filtros,
    });

    return res.data.data;
  },

  /**
   * Obtiene el historial de un voluntario.
   */
  obtenerHistorial: async (
    idVoluntario: number
  ): Promise<HistorialVoluntarioRespuesta> => {
    const res = await api.get(
      `/seguimiento/voluntarios/${idVoluntario}/historial`
    );

    return res.data.data;
  },

  /**
   * Obtiene las actividades disponibles para el filtro.
   */
  listarActividadesFiltro: async (): Promise<ActividadFiltro[]> => {
    const res = await api.get('/seguimiento/filtros/actividades');

    return res.data.data;
  },

  /**
   * Obtiene los voluntarios disponibles para el filtro.
   */
  listarVoluntariosFiltro: async (): Promise<VoluntarioSeguimiento[]> => {
    const res = await api.get('/seguimiento/filtros/voluntarios');

    return res.data.data;
  },
};
