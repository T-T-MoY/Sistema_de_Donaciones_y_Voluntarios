/**
 * ============================================================================
 * ARCHIVO: disponibilidadEquipoModel.ts
 * CAPA: Modelos / tipos de dominio (Disponibilidad de Voluntarios - Coordinador)
 *
 * PROPÓSITO:
 * Define las interfaces de respuesta y filtros para la consulta de
 * disponibilidad del equipo de voluntarios por parte del coordinador.
 * ============================================================================
 */

import type { DiaSemana, EstadoVoluntario, HorarioDisponibilidad } from './disponibilidadModel';

export interface VoluntarioEquipoResponse {
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

export interface FiltrosDisponibilidadEquipo {
  dia?: DiaSemana | string;
  busqueda?: string;
}

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
