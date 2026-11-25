import api from './client';
import type { HistorialVoluntario, SolicitudVoluntario } from '../types/usuario.types';

export interface RevisionSolicitudResponse {
  id_usuario: number;
  estado: string;
  historial: HistorialVoluntario;
}

export const voluntarioSolicitudesApi = {
  listar: async (): Promise<SolicitudVoluntario[]> => {
    const { data } = await api.get<SolicitudVoluntario[]>('/voluntarios/solicitudes');
    return data;
  },

  cambiarEstado: async (
    id: number,
    estado: 'Aprobado' | 'Rechazado',
    motivo_rechazo?: string
  ): Promise<RevisionSolicitudResponse> => {
    const { data } = await api.patch<RevisionSolicitudResponse>(
      `/voluntarios/solicitudes/${id}`,
      { estado, motivo_rechazo }
    );
    return data;
  },
};
