/**
 * ============================================================================
 * ARCHIVO: useUsuarios.ts
 * HOOK: Operaciones CRUD de administración de usuarios sobre usuario.api.ts
 * ============================================================================
 */

import { useState, useCallback, useEffect } from 'react';
import { usuarioApi } from '../api/usuario.api';
import type { Usuario } from '../types/usuario.types';
import { useAuth } from './useAuth';

export const useUsuarios = (autoFetch: boolean = true) => {
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = useCallback(async (): Promise<Usuario[]> => {
    try {
      setCargando(true);
      setError(null);
      const data = await usuarioApi.getAll();
      setUsuarios(data);
      return data;
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Error al cargar los usuarios. Verifica tu conexión al servidor.';
      setError(msg);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  const obtenerUsuario = useCallback(async (id: number | string): Promise<Usuario> => {
    setCargando(true);
    setError(null);
    try {
      return await usuarioApi.getById(id);
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Error al obtener el usuario.';
      setError(msg);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  const crearUsuario = useCallback(
    async (payload: Record<string, unknown>): Promise<Usuario> => {
      setCargando(true);
      setError(null);
      try {
        const nuevo = await usuarioApi.create(payload);
        setUsuarios((prev) => [...prev, nuevo]);
        return nuevo;
      } catch (err: any) {
        const msg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          'Error al crear el usuario.';
        setError(msg);
        throw err;
      } finally {
        setCargando(false);
      }
    },
    []
  );

  const actualizarUsuario = useCallback(
    async (
      id: number | string,
      payload: Record<string, unknown>
    ): Promise<Usuario> => {
      setCargando(true);
      setError(null);
      try {
        const actualizado = await usuarioApi.update(id, payload);
        setUsuarios((prev) =>
          prev.map((u) => ((u.id ?? u.id_usuario) === id ? actualizado : u))
        );
        return actualizado;
      } catch (err: any) {
        const msg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          'Error al actualizar el usuario.';
        setError(msg);
        throw err;
      } finally {
        setCargando(false);
      }
    },
    []
  );

  const cambiarEstado = useCallback(
    async (id: number | string, nuevoEstado: string): Promise<Usuario> => {
      setCargando(true);
      setError(null);
      try {
        const actualizado = await usuarioApi.cambiarEstado(id, nuevoEstado);
        setUsuarios((prev) =>
          prev.map((u) => ((u.id ?? u.id_usuario) === id ? actualizado : u))
        );
        return actualizado;
      } catch (err: any) {
        const msg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          'Error al cambiar el estado del usuario.';
        setError(msg);
        throw err;
      } finally {
        setCargando(false);
      }
    },
    []
  );

  const eliminarUsuario = useCallback(
    async (id: number | string): Promise<void> => {
      setCargando(true);
      setError(null);
      try {
        await usuarioApi.delete(id);
        setUsuarios((prev) =>
          prev.filter((u) => (u.id ?? u.id_usuario) !== id)
        );
      } catch (err: any) {
        const msg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          'Error al eliminar el usuario.';
        setError(msg);
        throw err;
      } finally {
        setCargando(false);
      }
    },
    []
  );

  useEffect(() => {
    if (autoFetch && token) {
      fetchUsuarios().catch(() => {});
    }
  }, [autoFetch, token, fetchUsuarios]);

  return {
    usuarios,
    cargando,
    error,
    fetchUsuarios,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    cambiarEstado,
    eliminarUsuario,
  };
};

export default useUsuarios;
