/**
 * ============================================================================
 * ARCHIVO: usuario.api.ts
 * LLAMADAS HTTP del módulo de usuarios.
 * Usa el cliente configurado en api/client.ts (con baseURL y token).
 * ============================================================================
 */

import api from './client';
import type { 
  Usuario, 
  UbicacionUsuario,
  SolicitudVoluntario,
  SolicitudBeneficiario
} from '../types/usuario.types';

/** Respuesta de `PUT /usuarios/estado/:id` (subconjunto del usuario). */
interface EstadoUsuarioResponse {
  id_usuario: number;
  nombre: string;
  correo: string;
  estado: string;
}

export const usuarioApi = {
  /**
   * Lista todos los usuarios (solo admin).
   */
  getAll: async (): Promise<Usuario[]> => {
    const res = await api.get<Usuario[]>('/usuarios');
    return res.data;
  },

  /**
   * Obtiene un usuario por ID.
   */
  getById: async (id: number | string): Promise<Usuario> => {
    const res = await api.get<Usuario>(`/usuarios/${id}`);
    return res.data;
  },

  /**
   * Crea un nuevo usuario. El backend solo devuelve el id creado.
   */
  create: async (
    payload: Record<string, unknown>
  ): Promise<{ mensaje: string; id_usuario: number }> => {
    const res = await api.post<{ mensaje: string; id_usuario: number }>('/usuarios', payload);
    return res.data;
  },

  /**
   * Actualiza un usuario existente. El backend solo confirma la operación.
   */
  update: async (
    id: number | string,
    payload: Record<string, unknown>
  ): Promise<{ mensaje: string }> => {
    const res = await api.put<{ mensaje: string }>(`/usuarios/${id}`, payload);
    return res.data;
  },

  /**
   * Cambia el estado de un usuario (solo admin).
   */
  cambiarEstado: async (
    id: number | string,
    estado: string
  ): Promise<{ mensaje: string; usuario: EstadoUsuarioResponse }> => {
    const res = await api.put<{ mensaje: string; usuario: EstadoUsuarioResponse }>(
      `/usuarios/estado/${id}`,
      { estado }
    );
    return res.data;
  },

  /**
   * Elimina un usuario.
   */
  delete: async (id: number | string): Promise<void> => {
    await api.delete(`/usuarios/${id}`);
  },

  /**
   * Obtiene el perfil del usuario autenticado.
   */
  getPerfil: async (): Promise<Usuario> => {
    const res = await api.get<Usuario>('/usuarios/perfil');
    return res.data;
  },

  /**
   * Actualiza el perfil del usuario autenticado.
   */
  updatePerfil: async (formData: FormData): Promise<any> => {
    const res = await api.put('/usuarios/perfil', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  /**
   * Obtiene la lista de usuarios donantes con ubicación geográfica.
   */
  getUbicaciones: async (): Promise<UbicacionUsuario[]> => {
    const res = await api.get<UbicacionUsuario[]>('/usuarios/ubicaciones');
    return res.data;
  },

  /**
   * Actualiza la ubicación geográfica en vivo del usuario autenticado.
   */
  actualizarMiUbicacion: async (coords: {
    latitud: number;
    longitud: number;
  }): Promise<{ mensaje: string; ubicacion: { lat: number; lng: number } }> => {
    const res = await api.post('/usuarios/mi-ubicacion', coords);
    return res.data;
  },

  /**
   * Obtiene la lista de solicitudes de voluntariado (coordinador o admin).
   */
  getSolicitudesVoluntarios: async (estado?: string): Promise<SolicitudVoluntario[]> => {
    const res = await api.get<SolicitudVoluntario[]>('/usuarios/solicitudes/voluntarios', {
      params: estado ? { estado } : undefined,
    });
    return res.data;
  },

  /**
   * Aprueba o rechaza una solicitud de voluntariado.
   */
  revisarSolicitudVoluntario: async (
    id: number | string,
    payload: { estado: 'Aprobado' | 'Rechazado'; motivo_rechazo?: string }
  ): Promise<{ id_usuario: number; estado: string }> => {
    const res = await api.patch<{ id_usuario: number; estado: string }>(
      `/usuarios/solicitudes/voluntarios/${id}`,
      payload
    );
    return res.data;
  },

  /**
   * Obtiene la lista de solicitudes de beneficiario (admin).
   */
  getSolicitudesBeneficiarios: async (estado?: string): Promise<SolicitudBeneficiario[]> => {
    const res = await api.get<SolicitudBeneficiario[]>('/usuarios/solicitudes/beneficiarios', {
      params: estado ? { estado } : undefined,
    });
    return res.data;
  },

  /**
   * Verifica o rechaza una solicitud de beneficiario.
   */
  revisarSolicitudBeneficiario: async (
    id: number | string,
    payload: { estado: 'Verificado' | 'Rechazado'; motivo_rechazo?: string }
  ): Promise<{ id_usuario: number; estado: string }> => {
    const res = await api.patch<{ id_usuario: number; estado: string }>(
      `/usuarios/solicitudes/beneficiarios/${id}`,
      payload
    );
    return res.data;
  },

  /**
   * Postula al usuario autenticado como voluntario.
   */
  activarPerfilDonante: async (): Promise<{ id_usuario: number; mensaje: string }> => {
    const res = await api.post<{ id_usuario: number; mensaje: string }>('/usuarios/postular/donante');
    return res.data;
  },

  postularVoluntario: async (payload: {
    habilidades: string[] | string;
    disponibilidad: string;
  }): Promise<{ id_usuario: number; mensaje: string }> => {
    const res = await api.post<{ id_usuario: number; mensaje: string }>(
      '/usuarios/postular/voluntario',
      payload
    );
    return res.data;
  },

  /**
   * Postula al usuario autenticado como beneficiario.
   */
  postularBeneficiario: async (payload: {
    tipo_beneficiario: string;
    documento: string;
    direccion: string;
    necesidad: string;
    descripcion?: string;
  }): Promise<{ id_usuario: number; mensaje: string }> => {
    const res = await api.post<{ id_usuario: number; mensaje: string }>(
      '/usuarios/postular/beneficiario',
      payload
    );
    return res.data;
  },
};

export default usuarioApi;
