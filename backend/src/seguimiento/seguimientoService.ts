
import { seguimientoRepository } from './seguimientoRepository';

import type {
  SeguimientoFiltros,
  ParticipacionSeguimiento,
  EstadisticasSeguimiento,
  EvolucionParticipaciones,
  DistribucionAsistencia,
  DatosSeguimiento,
  HistorialVoluntario,
} from './seguimientoModel';

/**
 * Calcula las estadísticas a partir de una lista de participaciones.
 * Las participaciones canceladas no se contabilizan.
 */
const calcularEstadisticas = (
  participaciones: ParticipacionSeguimiento[]
): EstadisticasSeguimiento => {

  const activas = participaciones.filter(
    (p) => p.estado !== 'Cancelado'
  );

  const asistencias = activas.filter(
    (p) => p.estado === 'Asistio'
  );

  const ausencias = activas.filter(
    (p) => p.estado === 'No_Asistio'
  );

  const totalHoras = asistencias.reduce(
    (total, p) => total + Number(p.horas_acreditadas || 0),
    0
  );

  return {
    total_participaciones: activas.length,
    total_asistencias: asistencias.length,
    total_ausencias: ausencias.length,
    total_horas: Number(totalHoras.toFixed(2)),
  };
};

/**
 * Agrupa las participaciones por fecha para el gráfico de evolución.
 */
const calcularEvolucion = (
  participaciones: ParticipacionSeguimiento[]
): EvolucionParticipaciones[] => {

  const agrupacion = new Map<string, number>();

  participaciones
    .filter((p) => p.estado !== 'Cancelado')
    .forEach((p) => {
      const fecha = p.actividad_fecha;

      agrupacion.set(
        fecha,
        (agrupacion.get(fecha) || 0) + 1
      );
    });

  return Array.from(agrupacion.entries())
    .map(([fecha, cantidad]) => ({
      fecha,
      participaciones: cantidad,
    }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
};

/**
 * Calcula los datos para el gráfico de distribución de asistencia.
 */
const calcularDistribucion = (
  participaciones: ParticipacionSeguimiento[]
): DistribucionAsistencia[] => {

  const activas = participaciones.filter(
    (p) => p.estado !== 'Cancelado'
  );

  return [
    {
      estado: 'Asistencias',
      cantidad: activas.filter(
        (p) => p.estado === 'Asistio'
      ).length,
    },
    {
      estado: 'Ausencias',
      cantidad: activas.filter(
        (p) => p.estado === 'No_Asistio'
      ).length,
    },
    {
      estado: 'Pendientes',
      cantidad: activas.filter(
        (p) =>
          p.estado === 'Inscrito' ||
          p.estado === 'Confirmado'
      ).length,
    },
  ];
};

/**
 * Servicio principal del seguimiento de voluntarios.
 */
export const seguimientoService = {

  /**
   * Obtiene toda la información del seguimiento general.
   */
  async obtenerSeguimiento(
    filtros: SeguimientoFiltros = {}
  ): Promise<DatosSeguimiento> {

    const participaciones =
      await seguimientoRepository.listarParticipaciones(filtros);

    return {
      participaciones,
      estadisticas: calcularEstadisticas(participaciones),
      evolucion: calcularEvolucion(participaciones),
      distribucion: calcularDistribucion(participaciones),
    };
  },

  /**
   * Obtiene el historial individual de un voluntario.
   */
  async obtenerHistorialVoluntario(
    idVoluntario: number
  ): Promise<HistorialVoluntario | null> {

    const voluntario =
      await seguimientoRepository.obtenerVoluntario(idVoluntario);

    if (!voluntario) {
      return null;
    }

    const participaciones =
      await seguimientoRepository.listarHistorial(idVoluntario);

    return {
      voluntario,
      estadisticas: calcularEstadisticas(participaciones),
      participaciones,
    };
  },

  /**
   * Obtiene las actividades disponibles para el filtro.
   */
  async obtenerActividadesFiltro() {
    return await seguimientoRepository.listarActividadesFiltro();
  },

  /**
   * Obtiene los voluntarios disponibles para el filtro.
   */
  async obtenerVoluntariosFiltro() {
    return await seguimientoRepository.listarVoluntariosFiltro();
  },
};
