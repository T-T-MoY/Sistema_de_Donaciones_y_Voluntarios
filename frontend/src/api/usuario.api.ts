/**
 * ============================================================================
 * ARCHIVO: usuario.api.ts
 * LLAMADAS HTTP del módulo de usuarios.
 * Usa el cliente configurado en api/client.ts (con baseURL y token).
 * ============================================================================
 */

import api from './client';
import type { Usuario } from '../types/usuario.types';

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
   * Crea un nuevo usuario.
   */
  create: async (payload: Record<string, unknown>): Promise<Usuario> => {
    const res = await api.post<Usuario>('/usuarios', payload);
    return res.data;
  },

  /**
   * Actualiza un usuario existente.
   */
  update: async (
    id: number | string,
    payload: Record<string, unknown>
  ): Promise<Usuario> => {
    const res = await api.put<Usuario>(`/usuarios/${id}`, payload);
    return res.data;
  },

  /**
   * Cambia el estado de un usuario (solo admin).
   */
  cambiarEstado: async (
    id: number | string,
    estado: string
  ): Promise<Usuario> => {
    const res = await api.put<Usuario>(`/usuarios/estado/${id}`, { estado });
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
};

export default usuarioApi;
