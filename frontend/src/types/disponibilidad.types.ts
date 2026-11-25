/**
 * ============================================================================
 * ARCHIVO: disponibilidad.types.ts
 * Contratos TypeScript de la Sección 5 (Mi Disponibilidad).
 *
 * IMPORTANTE: `valor` es lo que viaja a la API/PostgreSQL (sin tilde en
 * 'Miercoles' y 'Sabado'); `etiqueta` es lo que ve el usuario.
 * ============================================================================
 */

export const DIAS_SEMANA = [
  { valor: 'Lunes', etiqueta: 'Lunes' },
  { valor: 'Martes', etiqueta: 'Martes' },
  { valor: 'Miercoles', etiqueta: 'Miércoles' },
  { valor: 'Jueves', etiqueta: 'Jueves' },
  { valor: 'Viernes', etiqueta: 'Viernes' },
  { valor: 'Sabado', etiqueta: 'Sábado' },
  { valor: 'Domingo', etiqueta: 'Domingo' },
] as const;

export type DiaSemana = (typeof DIAS_SEMANA)[number]['valor'];

export const etiquetaDia = (dia: DiaSemana | string): string =>
  DIAS_SEMANA.find((d) => d.valor === dia)?.etiqueta ?? dia;

export type EstadoVoluntario = 'Pendiente' | 'Aprobado' | 'Rechazado';

export interface PerfilVoluntario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  habilidades: string[];
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
  hora_inicio: string;
  hora_fin: string;
  estado: boolean;
}

export interface MiDisponibilidad {
  esVoluntario: boolean;
  perfil: PerfilVoluntario | null;
  horarios: HorarioDisponibilidad[];
}

export interface HorarioFormulario {
  dia_semana: DiaSemana | '';
  hora_inicio: string;
  hora_fin: string;
}

export interface RespuestaHorario {
  mensaje: string;
  horario: HorarioDisponibilidad;
}
