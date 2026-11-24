/**
 * ============================================================================
 * ARCHIVO: disponibilidadModel.ts
 * CAPA: Modelos / tipos de dominio (Sección 5 - Mi Disponibilidad)
 *
 * PROPÓSITO:
 * Vocabulario tipado compartido para el perfil del voluntario y sus horarios.
 * Solo contiene tipos y constantes: sin SQL, sin Express.
 *
 * NOTA: los valores de día deben coincidir EXACTAMENTE con el CHECK de la BD.
 * 'Miercoles' y 'Sabado' van sin tilde en la base de datos; la UI muestra
 * 'Miércoles' y 'Sábado' al usuario final.
 * ============================================================================
 */

export const DIAS_SEMANA = [
  'Lunes',
  'Martes',
  'Miercoles',
  'Jueves',
  'Viernes',
  'Sabado',
  'Domingo',
] as const;

export type DiaSemana = (typeof DIAS_SEMANA)[number];

/** Día tal como se envía/recibe de la API y PostgreSQL (sin tilde). */
export type DiaSemanaBD = DiaSemana;

export type EstadoVoluntario = 'Pendiente' | 'Aprobado' | 'Rechazado';

export interface PerfilVoluntario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  habilidades: string[];
  /** Texto libre histórico de voluntario.disponibilidad. */
  disponibilidad_general: string;
  es_coordinador: boolean;
  estado: EstadoVoluntario;
  motivo_rechazo: string | null;
  fecha_registro: string;
}

export interface HorarioDisponibilidad {
  id_disponibilidad: number;
  id_voluntario: number;
  dia_semana: DiaSemana;
  /** Formato HH:MM (24 horas). */
  hora_inicio: string;
  /** Formato HH:MM (24 horas). */
  hora_fin: string;
  estado: boolean;
}

export interface MiDisponibilidadResponse {
  esVoluntario: boolean;
  perfil: PerfilVoluntario | null;
  horarios: HorarioDisponibilidad[];
}

export interface HorarioDTO {
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
}

export interface HorarioNormalizado {
  dia_semana: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
}

export interface CambiarEstadoDTO {
  estado: boolean;
}
