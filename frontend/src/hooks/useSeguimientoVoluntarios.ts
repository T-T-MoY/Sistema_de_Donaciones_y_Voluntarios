
import { useCallback, useEffect, useState } from 'react';

import { seguimientoVoluntariosApi } from '../api/seguimientoVoluntarios.api';

import type {
  FiltrosSeguimiento,
  DatosSeguimiento,
  VoluntarioSeguimiento,
} from '../types/seguimientoVoluntarios.types';

import type {
  ActividadFiltro,
  HistorialVoluntarioRespuesta,
} from '../api/seguimientoVoluntarios.api';

/**
 * Filtros iniciales sin restricciones.
 */
const filtrosIniciales: FiltrosSeguimiento = {
  desde: '',
  hasta: '',
  id_actividad: null,
  id_voluntario: null,
};

/**
 * Hook principal del módulo Seguimiento de Voluntarios.
 */
export const useSeguimientoVoluntarios = () => {

  // ============================================================
  // ESTADOS PRINCIPALES
  // ============================================================

  const [datos, setDatos] = useState<DatosSeguimiento | null>(null);

  const [filtros, setFiltros] =
    useState<FiltrosSeguimiento>(filtrosIniciales);

  const [actividades, setActividades] =
    useState<ActividadFiltro[]>([]);

  const [voluntarios, setVoluntarios] =
    useState<VoluntarioSeguimiento[]>([]);

  const [cargando, setCargando] = useState(true);

  const [cargandoFiltros, setCargandoFiltros] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // ESTADOS DEL HISTORIAL INDIVIDUAL
  // ============================================================

  const [historial, setHistorial] =
    useState<HistorialVoluntarioRespuesta | null>(null);

  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const [errorHistorial, setErrorHistorial] = useState<string | null>(null);

  // ============================================================
  // CARGAR SEGUIMIENTO GENERAL
  // ============================================================

  const cargarSeguimiento = useCallback(
    async (filtrosConsulta: Partial<FiltrosSeguimiento> = {}) => {
      try {
        setCargando(true);
        setError(null);

        const respuesta =
          await seguimientoVoluntariosApi.obtenerSeguimiento(
            filtrosConsulta
          );

        setDatos(respuesta);

      } catch (err) {
        console.error('Error al cargar el seguimiento:', err);

        setError(
          'No se pudo cargar la información del seguimiento. Intenta nuevamente.'
        );
      } finally {
        setCargando(false);
      }
    },
    []
  );

  // ============================================================
  // CARGAR OPCIONES DE LOS FILTROS
  // ============================================================

  const cargarFiltros = useCallback(async () => {
    try {
      setCargandoFiltros(true);

      const [listaActividades, listaVoluntarios] = await Promise.all([
        seguimientoVoluntariosApi.listarActividadesFiltro(),
        seguimientoVoluntariosApi.listarVoluntariosFiltro(),
      ]);

      setActividades(listaActividades);
      setVoluntarios(listaVoluntarios);

    } catch (err) {
      console.error('Error al cargar los filtros:', err);

      setError(
        'No se pudieron cargar las opciones de los filtros.'
      );
    } finally {
      setCargandoFiltros(false);
    }
  }, []);

  // ============================================================
  // ACTUALIZAR FILTROS
  // ============================================================

  const actualizarFiltros = useCallback(
    (cambios: Partial<FiltrosSeguimiento>) => {
      setFiltros((actuales) => ({
        ...actuales,
        ...cambios,
      }));
    },
    []
  );

  // ============================================================
  // APLICAR FILTROS
  // ============================================================

  const aplicarFiltros = useCallback(async () => {
    await cargarSeguimiento(filtros);
  }, [cargarSeguimiento, filtros]);

  // ============================================================
  // LIMPIAR FILTROS
  // ============================================================

  const limpiarFiltros = useCallback(async () => {
    setFiltros({ ...filtrosIniciales });
    await cargarSeguimiento({});
  }, [cargarSeguimiento]);

  // ============================================================
  // ABRIR HISTORIAL INDIVIDUAL
  // ============================================================

  const abrirHistorial = useCallback(async (idVoluntario: number) => {
    try {
      setMostrarHistorial(true);
      setCargandoHistorial(true);
      setErrorHistorial(null);
      setHistorial(null);

      const respuesta =
        await seguimientoVoluntariosApi.obtenerHistorial(idVoluntario);

      setHistorial(respuesta);

    } catch (err) {
      console.error('Error al cargar el historial:', err);

      setErrorHistorial(
        'No se pudo cargar el historial del voluntario.'
      );
    } finally {
      setCargandoHistorial(false);
    }
  }, []);

  // ============================================================
  // CERRAR HISTORIAL INDIVIDUAL
  // ============================================================

  const cerrarHistorial = useCallback(() => {
    setMostrarHistorial(false);
    setHistorial(null);
    setErrorHistorial(null);
  }, []);

  // ============================================================
  // CARGA INICIAL
  // ============================================================

  useEffect(() => {
    void cargarSeguimiento({});
    void cargarFiltros();
  }, [cargarSeguimiento, cargarFiltros]);

  // ============================================================
  // DATOS EXPUESTOS A LOS COMPONENTES
  // ============================================================

  return {
    datos,
    participaciones: datos?.participaciones ?? [],
    estadisticas: datos?.estadisticas ?? null,
    evolucion: datos?.evolucion ?? [],
    distribucion: datos?.distribucion ?? [],

    filtros,
    actividades,
    voluntarios,

    cargando,
    cargandoFiltros,
    error,

    actualizarFiltros,
    aplicarFiltros,
    limpiarFiltros,
    cargarSeguimiento,

    historial,
    mostrarHistorial,
    cargandoHistorial,
    errorHistorial,

    abrirHistorial,
    cerrarHistorial,
  };
};
