
import { pool } from '../config/database';

import type {
  SeguimientoFiltros,
  ParticipacionSeguimiento,
  VoluntarioSeguimiento,
} from './seguimientoModel';

/**
 * Repositorio del módulo Seguimiento de Voluntarios.
 * Todas las consultas se realizan sobre tablas existentes.
 */
export const seguimientoRepository = {

  /**
   * Obtiene las participaciones para el seguimiento general.
   * Las fechas de los filtros corresponden a la fecha de la actividad.
   * Las participaciones canceladas no aparecen en el seguimiento general.
   */
  async listarParticipaciones(
    filtros: SeguimientoFiltros = {}
  ): Promise<ParticipacionSeguimiento[]> {

    let query = `
      SELECT
        p.id_participacion,
        p.id_voluntario,
        CONCAT_WS(' ', u.nombre, u.apellido) AS voluntario_nombre,
        u.correo AS voluntario_correo,
        p.id_actividad,
        a.nombre AS actividad_nombre,
        TO_CHAR(a.fecha, 'YYYY-MM-DD') AS actividad_fecha,
        COALESCE(a.lugar, '') AS actividad_lugar,
        p.asistio,
        p.estado,
        p.observaciones,
        p.horas_acreditadas::double precision AS horas_acreditadas,
        TO_CHAR(
          p.fecha_asistencia,
          'YYYY-MM-DD"T"HH24:MI:SS'
        ) AS fecha_asistencia
      FROM participa p
      INNER JOIN usuario u
        ON u.id_usuario = p.id_voluntario
      INNER JOIN actividad a
        ON a.id_actividad = p.id_actividad
      WHERE p.estado <> 'Cancelado'
    `;

    const parametros: (string | number)[] = [];

    if (filtros.desde) {
      parametros.push(filtros.desde);
      query += ` AND a.fecha >= $${parametros.length}::date`;
    }

    if (filtros.hasta) {
      parametros.push(filtros.hasta);
      query += ` AND a.fecha <= $${parametros.length}::date`;
    }

    if (filtros.id_actividad) {
      parametros.push(filtros.id_actividad);
      query += ` AND p.id_actividad = $${parametros.length}`;
    }

    if (filtros.id_voluntario) {
      parametros.push(filtros.id_voluntario);
      query += ` AND p.id_voluntario = $${parametros.length}`;
    }

    query += `
      ORDER BY a.fecha DESC, a.hora_inicio DESC,
               p.id_participacion DESC
    `;

    const resultado = await pool.query(query, parametros);

    return resultado.rows;
  },

  /**
   * Obtiene los datos básicos de un voluntario.
   */
  async obtenerVoluntario(
    idVoluntario: number
  ): Promise<VoluntarioSeguimiento | null> {

    const query = `
      SELECT
        u.id_usuario AS id_voluntario,
        CONCAT_WS(' ', u.nombre, u.apellido) AS voluntario_nombre,
        u.correo AS voluntario_correo
      FROM usuario u
      WHERE u.id_usuario = $1
    `;

    const resultado = await pool.query(query, [idVoluntario]);

    if (resultado.rows.length === 0) {
      return null;
    }

    return resultado.rows[0];
  },

  /**
   * Obtiene todas las participaciones de un voluntario,
   * incluyendo las canceladas para conservar su historial.
   */
  async listarHistorial(
    idVoluntario: number
  ): Promise<ParticipacionSeguimiento[]> {

    const query = `
      SELECT
        p.id_participacion,
        p.id_voluntario,
        CONCAT_WS(' ', u.nombre, u.apellido) AS voluntario_nombre,
        u.correo AS voluntario_correo,
        p.id_actividad,
        a.nombre AS actividad_nombre,
        TO_CHAR(a.fecha, 'YYYY-MM-DD') AS actividad_fecha,
        COALESCE(a.lugar, '') AS actividad_lugar,
        p.asistio,
        p.estado,
        p.observaciones,
        p.horas_acreditadas::double precision AS horas_acreditadas,
        TO_CHAR(
          p.fecha_asistencia,
          'YYYY-MM-DD"T"HH24:MI:SS'
        ) AS fecha_asistencia
      FROM participa p
      INNER JOIN usuario u
        ON u.id_usuario = p.id_voluntario
      INNER JOIN actividad a
        ON a.id_actividad = p.id_actividad
      WHERE p.id_voluntario = $1
      ORDER BY a.fecha DESC, a.hora_inicio DESC,
               p.id_participacion DESC
    `;

    const resultado = await pool.query(query, [idVoluntario]);

    return resultado.rows;
  },

  /**
   * Lista las actividades que tienen participaciones.
   * Se utiliza para llenar el filtro de actividades.
   */
  async listarActividadesFiltro(): Promise<
    { id_actividad: number; nombre: string; fecha: string }[]
  > {

    const query = `
      SELECT DISTINCT
        a.id_actividad,
        a.nombre,
        TO_CHAR(a.fecha, 'YYYY-MM-DD') AS fecha
      FROM actividad a
      INNER JOIN participa p
        ON p.id_actividad = a.id_actividad
      WHERE p.estado <> 'Cancelado'
      ORDER BY fecha DESC, a.nombre ASC
    `;

    const resultado = await pool.query(query);

    return resultado.rows;
  },

  /**
   * Lista los voluntarios que tienen participaciones.
   * Se utiliza para llenar el filtro de voluntarios.
   */
  async listarVoluntariosFiltro(): Promise<VoluntarioSeguimiento[]> {

    const query = `
      SELECT DISTINCT
        u.id_usuario AS id_voluntario,
        CONCAT_WS(' ', u.nombre, u.apellido) AS voluntario_nombre,
        u.correo AS voluntario_correo
      FROM usuario u
      INNER JOIN participa p
        ON p.id_voluntario = u.id_usuario
      WHERE p.estado <> 'Cancelado'
      ORDER BY voluntario_nombre ASC
    `;

    const resultado = await pool.query(query);

    return resultado.rows;
  },
};
