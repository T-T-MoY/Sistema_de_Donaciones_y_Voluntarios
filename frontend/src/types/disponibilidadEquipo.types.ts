/**
 * ============================================================================
 * ARCHIVO: disponibilidadEquipo.types.ts
 * Contratos TypeScript para la sección Disponibilidad de Voluntarios (Coordinador).
 * ============================================================================
 */

import type { EstadoVoluntario, HorarioDisponibilidad } from './disponibilidad.types';

export interface VoluntarioEquipo {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string | null;
  foto_url: string | null;
  habilidades: string[];
  disponibilidad_general: string;
  es_coordinador: boolean;
  estado_voluntario: EstadoVoluntario;
  estado_usuario: string;
  horarios: HorarioDisponibilidad[];
}

export const DIAS_FILTRO = [
  { valor: '', etiqueta: 'Todos los días' },
  { valor: 'Lunes', etiqueta: 'Lunes' },
  { valor: 'Martes', etiqueta: 'Martes' },
  { valor: 'Miercoles', etiqueta: 'Miércoles' },
  { valor: 'Jueves', etiqueta: 'Jueves' },
  { valor: 'Viernes', etiqueta: 'Viernes' },
  { valor: 'Sabado', etiqueta: 'Sábado' },
  { valor: 'Domingo', etiqueta: 'Domingo' },
] as const;

export type DiaFiltroValor = (typeof DIAS_FILTRO)[number]['valor'];

export interface ActividadVoluntarioResumen {
  id_participacion: number;
  id_actividad: number;
  actividad_nombre: string;
  actividad_descripcion: string | null;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  lugar: string;
  estado_actividad: string;
  tipo_actividad: string;
  estado_participacion: string;
  fecha_inscripcion: string;
  campana_nombre: string | null;
}
