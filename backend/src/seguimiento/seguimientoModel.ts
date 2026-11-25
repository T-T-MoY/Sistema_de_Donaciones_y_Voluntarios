
export type EstadoParticipacion =
  | 'Inscrito'
  | 'Confirmado'
  | 'Asistio'
  | 'No_Asistio'
  | 'Cancelado';

/**
 * Filtros para consultar el seguimiento general.
 */
export interface SeguimientoFiltros {
  desde?: string;
  hasta?: string;
  id_actividad?: number;
  id_voluntario?: number;
}

/**
 * Información de cada participación obtenida de la base de datos.
 */
export interface ParticipacionSeguimiento {
  id_participacion: number;
  id_voluntario: number;
  voluntario_nombre: string;
  voluntario_correo: string;
  id_actividad: number;
  actividad_nombre: string;
  actividad_fecha: string;
  actividad_lugar: string;
  asistio: boolean;
  estado: EstadoParticipacion;
  observaciones: string | null;
  horas_acreditadas: number;
  fecha_asistencia: string | null;
}

/**
 * Estadísticas generales del seguimiento.
 */
export interface EstadisticasSeguimiento {
  total_participaciones: number;
  total_asistencias: number;
  total_ausencias: number;
  total_horas: number;
}

/**
 * Datos para el gráfico de evolución.
 */
export interface EvolucionParticipaciones {
  fecha: string;
  participaciones: number;
}

/**
 * Datos para el gráfico de distribución de asistencia.
 */
export interface DistribucionAsistencia {
  estado: 'Asistencias' | 'Ausencias' | 'Pendientes';
  cantidad: number;
}

/**
 * Información básica del voluntario.
 */
export interface VoluntarioSeguimiento {
  id_voluntario: number;
  voluntario_nombre: string;
  voluntario_correo: string;
}

/**
 * Datos completos del historial individual.
 */
export interface HistorialVoluntario {
  voluntario: VoluntarioSeguimiento;
  estadisticas: EstadisticasSeguimiento;
  participaciones: ParticipacionSeguimiento[];
}

/**
 * Respuesta completa del seguimiento general.
 */
export interface DatosSeguimiento {
  participaciones: ParticipacionSeguimiento[];
  estadisticas: EstadisticasSeguimiento;
  evolucion: EvolucionParticipaciones[];
  distribucion: DistribucionAsistencia[];
}
