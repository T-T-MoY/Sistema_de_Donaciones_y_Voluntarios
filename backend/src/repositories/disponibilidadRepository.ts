/**
 * ============================================================================
 * ARCHIVO: disponibilidadRepository.ts
 * CAPA: Repositorio (Sección 5 - Mi Disponibilidad)
 *
 * PROPÓSITO:
 * Único lugar con SQL de este dominio. Consultas siempre parametrizadas ($1,
 * $2, ...) y horas formateadas en SQL con to_char para evitar conversiones
 * de zona horaria en Node.
 * ============================================================================
 */

import { pool } from '../config/database';
import type {
  DiaSemana,
  HorarioDisponibilidad,
  HorarioNormalizado,
  PerfilVoluntario,
} from '../models/disponibilidadModel';

const COLUMNAS_HORARIO = `
    id_disponibilidad,
    id_voluntario,
    dia_semana,
    to_char(hora_inicio, 'HH24:MI') AS hora_inicio,
    to_char(hora_fin, 'HH24:MI') AS hora_fin,
    estado
`;

/** Orden cronológico Lunes → Domingo y, dentro del día, por hora de inicio. */
const ORDEN_HORARIO = `
    ORDER BY
        CASE dia_semana
            WHEN 'Lunes' THEN 1
            WHEN 'Martes' THEN 2
            WHEN 'Miercoles' THEN 3
            WHEN 'Jueves' THEN 4
            WHEN 'Viernes' THEN 5
            WHEN 'Sabado' THEN 6
            WHEN 'Domingo' THEN 7
            ELSE 8
        END,
        hora_inicio ASC,
        id_disponibilidad ASC
`;

interface FilaHorario {
  id_disponibilidad: number | string;
  id_voluntario: number | string;
  dia_semana: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
  estado: boolean;
}

const mapearHorario = (fila: FilaHorario): HorarioDisponibilidad => ({
  id_disponibilidad: Number(fila.id_disponibilidad),
  id_voluntario: Number(fila.id_voluntario),
  dia_semana: fila.dia_semana,
  hora_inicio: fila.hora_inicio,
  hora_fin: fila.hora_fin,
  estado: Boolean(fila.estado),
});

export const disponibilidadRepository = {
  /**
   * Perfil del voluntario. Devuelve null si el usuario autenticado aún no
   * tiene fila en la tabla voluntario (no es un error de base de datos).
   */
  async obtenerPerfil(idUsuario: number): Promise<PerfilVoluntario | null> {
    const { rows } = await pool.query(
      `
        SELECT
            u.id_usuario,
            u.nombre,
            u.apellido,
            u.correo,
            v.habilidades,
            v.disponibilidad AS disponibilidad_general,
            v.es_coordinador,
            v.estado,
            v.motivo_rechazo,
            to_char(v.fecha_registro, 'YYYY-MM-DD"T"HH24:MI:SS') AS fecha_registro
        FROM usuario u
        INNER JOIN voluntario v ON v.id_usuario = u.id_usuario
        WHERE u.id_usuario = $1
      `,
      [idUsuario]
    );

    if (rows.length === 0) return null;

    const fila = rows[0];
    return {
      id_usuario: Number(fila.id_usuario),
      nombre: fila.nombre,
      apellido: fila.apellido,
      correo: fila.correo,
      habilidades: Array.isArray(fila.habilidades) ? fila.habilidades : [],
      disponibilidad_general: fila.disponibilidad ?? '',
      es_coordinador: Boolean(fila.es_coordinador),
      estado: fila.estado,
      motivo_rechazo: fila.motivo_rechazo ?? null,
      fecha_registro: fila.fecha_registro,
    };
  },

  async obtenerHorarios(idVoluntario: number): Promise<HorarioDisponibilidad[]> {
    const { rows } = await pool.query(
      `SELECT ${COLUMNAS_HORARIO} FROM disponibilidad_voluntario
        WHERE id_voluntario = $1
        ${ORDEN_HORARIO}`,
      [idVoluntario]
    );
    return rows.map((fila: FilaHorario) => mapearHorario(fila));
  },

  async obtenerPorId(
    idDisponibilidad: number,
    idVoluntario: number
  ): Promise<HorarioDisponibilidad | null> {
    const { rows } = await pool.query(
      `SELECT ${COLUMNAS_HORARIO} FROM disponibilidad_voluntario
        WHERE id_disponibilidad = $1 AND id_voluntario = $2`,
      [idDisponibilidad, idVoluntario]
    );
    return rows.length > 0 ? mapearHorario(rows[0]) : null;
  },

  /**
   * true cuando existe un horario ACTIVO del mismo día cuyo rango se cruza
   * con el propuesto. `excluirId` se usa al editar/reactivar para no
   * comparar el horario contra sí mismo.
   */
  async existeSolapamiento(
    idVoluntario: number,
    diaSemana: DiaSemana,
    horaInicio: string,
    horaFin: string,
    excluirId?: number
  ): Promise<boolean> {
    const { rowCount } = await pool.query(
      `
        SELECT 1
        FROM disponibilidad_voluntario
        WHERE id_voluntario = $1
          AND dia_semana = $2
          AND estado = TRUE
          AND hora_inicio < $4::time
          AND hora_fin > $3::time
          AND ($5::int IS NULL OR id_disponibilidad <> $5::int)
        LIMIT 1
      `,
      [idVoluntario, diaSemana, horaInicio, horaFin, excluirId ?? null]
    );
    return (rowCount ?? 0) > 0;
  },

  async crear(
    idVoluntario: number,
    datos: HorarioNormalizado
  ): Promise<HorarioDisponibilidad> {
    const { rows } = await pool.query(
      `
        INSERT INTO disponibilidad_voluntario
            (id_voluntario, dia_semana, hora_inicio, hora_fin, estado)
        VALUES ($1, $2, $3::time, $4::time, TRUE)
        RETURNING id_disponibilidad
      `,
      [idVoluntario, datos.dia_semana, datos.hora_inicio, datos.hora_fin]
    );

    const creado = await this.obtenerPorId(
      Number(rows[0].id_disponibilidad),
      idVoluntario
    );
    if (!creado) throw new Error('No se pudo recuperar el horario creado');
    return creado;
  },

  async actualizar(
    idDisponibilidad: number,
    idVoluntario: number,
    datos: HorarioNormalizado
  ): Promise<HorarioDisponibilidad | null> {
    const { rowCount } = await pool.query(
      `
        UPDATE disponibilidad_voluntario
        SET dia_semana = $3,
            hora_inicio = $4::time,
            hora_fin = $5::time
        WHERE id_disponibilidad = $1 AND id_voluntario = $2
      `,
      [idDisponibilidad, idVoluntario, datos.dia_semana, datos.hora_inicio, datos.hora_fin]
    );

    if (!rowCount) return null;
    return this.obtenerPorId(idDisponibilidad, idVoluntario);
  },

  async cambiarEstado(
    idDisponibilidad: number,
    idVoluntario: number,
    estado: boolean
  ): Promise<HorarioDisponibilidad | null> {
    const { rowCount } = await pool.query(
      `
        UPDATE disponibilidad_voluntario
        SET estado = $3
        WHERE id_disponibilidad = $1 AND id_voluntario = $2
      `,
      [idDisponibilidad, idVoluntario, estado]
    );

    if (!rowCount) return null;
    return this.obtenerPorId(idDisponibilidad, idVoluntario);
  },
};
