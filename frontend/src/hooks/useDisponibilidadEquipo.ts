/**
 * ============================================================================
 * HOOK: useDisponibilidadEquipo
 * Manejo de estado, filtros y selección para Disponibilidad del Equipo.
 * ============================================================================
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import disponibilidadEquipoApi from '../api/disponibilidadEquipo.api';
import type { VoluntarioEquipo } from '../types/disponibilidadEquipo.types';

export const useDisponibilidadEquipo = () => {
  const [voluntarios, setVoluntarios] = useState<VoluntarioEquipo[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroDia, setFiltroDia] = useState<string>('');
  const [busqueda, setBusqueda] = useState<string>('');
  const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await disponibilidadEquipoApi.obtenerDisponibilidadEquipo();
      setVoluntarios(data);
    } catch (err: any) {
      const mensaje =
        err?.response?.data?.error ||
        err?.response?.data?.mensaje ||
        'No se pudo cargar la disponibilidad de los voluntarios.';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  /** Voluntarios filtrados dinámicamente según día y término de búsqueda */
  const voluntariosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return voluntarios.filter((v) => {
      // 1. Filtro de búsqueda (nombre, apellido, correo, habilidades)
      if (termino) {
        const nombreCompleto = `${v.nombre} ${v.apellido}`.toLowerCase();
        const coincideNombre = nombreCompleto.includes(termino);
        const coincideCorreo = v.correo.toLowerCase().includes(termino);
        const coincideHabilidad = v.habilidades?.some((hab) =>
          hab.toLowerCase().includes(termino)
        );

        if (!coincideNombre && !coincideCorreo && !coincideHabilidad) {
          return false;
        }
      }

      // 2. Filtro de día de la semana
      if (filtroDia) {
        const tieneDisponibilidadEseDia = v.horarios?.some(
          (h) => h.dia_semana === filtroDia && h.estado === true
        );
        if (!tieneDisponibilidadEseDia) {
          return false;
        }
      }

      return true;
    });
  }, [voluntarios, busqueda, filtroDia]);

  /** Voluntario actualmente seleccionado para el calendario */
  const voluntarioSeleccionado = useMemo(() => {
    if (voluntariosFiltrados.length === 0) return null;
    if (idSeleccionado !== null) {
      const encontrado = voluntariosFiltrados.find((v) => v.id_usuario === idSeleccionado);
      if (encontrado) return encontrado;
    }
    // Si no está seleccionado o el filtro lo excluyó, selecciona el primer resultado disponible
    return voluntariosFiltrados[0];
  }, [voluntariosFiltrados, idSeleccionado]);

  const seleccionarVoluntario = (v: VoluntarioEquipo) => {
    setIdSeleccionado(v.id_usuario);
  };

  return {
    voluntarios: voluntariosFiltrados,
    totalVoluntarios: voluntarios.length,
    voluntarioSeleccionado,
    cargando,
    error,
    filtroDia,
    setFiltroDia,
    busqueda,
    setBusqueda,
    seleccionarVoluntario,
    recargar: cargarDatos,
  };
};
