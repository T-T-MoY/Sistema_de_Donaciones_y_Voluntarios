/**
 * ============================================================================
 * ARCHIVO: useMiDisponibilidad.ts
 * Hook de la Sección 5: estado, carga y mutaciones de los horarios propios.
 * ============================================================================
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import disponibilidadApi from '../api/disponibilidad.api';
import type {
  HorarioFormulario,
  MiDisponibilidad,
} from '../types/disponibilidad.types';

interface ErrorApi {
  response?: { data?: { error?: string; message?: string } };
  message?: string;
}

export const mensajeErrorApi = (err: unknown, fallback: string): string => {
  const e = err as ErrorApi | undefined;
  return (
    e?.response?.data?.error ||
    e?.response?.data?.message ||
    e?.message ||
    fallback
  );
};

const VACIO: MiDisponibilidad = {
  esVoluntario: false,
  perfil: null,
  horarios: [],
};

export function useMiDisponibilidad() {
  const [datos, setDatos] = useState<MiDisponibilidad>(VACIO);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const primeraCarga = useRef<boolean>(true);

  const recargar = useCallback(async (): Promise<void> => {
    if (primeraCarga.current) setCargando(true);
    try {
      const respuesta = await disponibilidadApi.obtener();
      setDatos(respuesta);
      setError(null);
    } catch (err) {
      setError(mensajeErrorApi(err, 'No se pudo cargar tu disponibilidad. Intenta nuevamente.'));
    } finally {
      if (primeraCarga.current) {
        primeraCarga.current = false;
        setCargando(false);
      }
    }
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const crear = useCallback(
    async (payload: HorarioFormulario): Promise<void> => {
      await disponibilidadApi.crear(payload);
      await recargar();
    },
    [recargar]
  );

  const actualizar = useCallback(
    async (id: number, payload: HorarioFormulario): Promise<void> => {
      await disponibilidadApi.actualizar(id, payload);
      await recargar();
    },
    [recargar]
  );

  const cambiarEstado = useCallback(
    async (id: number, estado: boolean): Promise<void> => {
      await disponibilidadApi.cambiarEstado(id, estado);
      await recargar();
    },
    [recargar]
  );

  return {
    datos,
    cargando,
    error,
    recargar,
    crear,
    actualizar,
    cambiarEstado,
  };
}
