export interface FiltrosSeguimiento {
  desde: string;
  hasta: string;
  id_actividad: number | null;
  id_voluntario: number | null;
}

export type EstadoAsistencia =
  | 'Asistio'
  | 'No_Asistio'
  | 'Inscrito'
  | 'Confirmado'
  | 'Cancelado';

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
  estado: EstadoAsistencia;
  observaciones: string | null;
  horas_acreditadas: number;
  fecha_asistencia: string | null;
}

export interface EstadisticasSeguimiento {
  total_participaciones: number;
  total_asistencias: number;
  total_ausencias: number;
  total_horas: number;
}

export interface EvolucionParticipaciones {
  fecha: string;
  participaciones: number;
}

export interface DistribucionAsistencia {
  estado: 'Asistencias' | 'Ausencias' | 'Pendientes';
  cantidad: number;
}

export interface VoluntarioSeguimiento {
  id_voluntario: number;
  voluntario_nombre: string;
  voluntario_correo: string;
}

export interface HistorialVoluntario {
  id_voluntario: number;
  voluntario_nombre: string;
  voluntario_correo: string;
  total_participaciones: number;
  total_asistencias: number;
  total_ausencias: number;
  total_horas: number;
  participaciones: ParticipacionSeguimiento[];
}

export interface DatosSeguimiento {
  participaciones: ParticipacionSeguimiento[];
  estadisticas: EstadisticasSeguimiento;
  evolucion: EvolucionParticipaciones[];
  distribucion: DistribucionAsistencia[];
}