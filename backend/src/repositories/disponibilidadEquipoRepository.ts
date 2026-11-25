/**
 * ============================================================================
 * ARCHIVO: disponibilidadEquipoRepository.ts
 * CAPA: Repositorio (Disponibilidad de Voluntarios - Coordinador)
 *
 * PROPÓSITO:
 * Consultas SQL puras y parametrizadas para obtener el listado de voluntarios
 * junto con sus horarios de disponibilidad semanal agrupados.
 * ============================================================================
 */

import { pool } from '../config/database';
import type {
  VoluntarioEquipoResponse,
  FiltrosDisponibilidadEquipo,
  ActividadVoluntarioResumen,
} from '../models/disponibilidadEquipoModel';
import type { HorarioDisponibilidad } from '../models/disponibilidadModel';

export const disponibilidadEquipoRepository = {
  /**
   * Obtiene todos los voluntarios no eliminados y sus horarios de disponibilidad.
   * Opcionalmente filtra por día de la semana o término de búsqueda.
   */
  async obtenerVoluntarios(
    filtros?: FiltrosDisponibilidadEquipo
  ): Promise<VoluntarioEquipoResponse[]> {
    const params: (string | number)[] = [];
    const condiciones: string[] = ["u.estado <> 'Eliminado'"];

    if (filtros?.busqueda?.trim()) {
      params.push(`%${filtros.busqueda.trim().toLowerCase()}%`);
      condiciones.push(`(
        LOWER(u.nombre) LIKE $${params.length}
        OR LOWER(u.apellido) LIKE $${params.length}
        OR LOWER(u.correo) LIKE $${params.length}
        OR EXISTS (
          SELECT 1 FROM unnest(v.habilidades) hab
          WHERE LOWER(hab) LIKE $${params.length}
        )
      )`);
    }

    if (filtros?.dia?.trim()) {
      params.push(filtros.dia.trim());
      condiciones.push(`EXISTS (
        SELECT 1 FROM disponibilidad_voluntario dv_f
        WHERE dv_f.id_voluntario = v.id_usuario
          AND dv_f.dia_semana = $${params.length}
          AND dv_f.estado = TRUE
      )`);
    }

    const whereClause = condiciones.length > 0
      ? `WHERE ${condiciones.join(' AND ')}`
      : '';

    const query = `
      SELECT
        u.id_usuario,
        u.nombre,
        u.apellido,
        u.correo,
        u.telefono,
        u.foto_url,
        v.habilidades,
        COALESCE(v.disponibilidad, '') AS disponibilidad_general,
        v.es_coordinador,
        v.estado AS estado_voluntario,
        u.estado AS estado_usuario,
        COALESCE(
          json_agg(
            json_build_object(
              'id_disponibilidad', dv.id_disponibilidad,
              'id_voluntario', dv.id_voluntario,
              'dia_semana', dv.dia_semana,
              'hora_inicio', to_char(dv.hora_inicio, 'HH24:MI'),
              'hora_fin', to_char(dv.hora_fin, 'HH24:MI'),
              'estado', dv.estado
            )
            ORDER BY
              CASE dv.dia_semana
                WHEN 'Lunes' THEN 1
                WHEN 'Martes' THEN 2
                WHEN 'Miercoles' THEN 3
                WHEN 'Jueves' THEN 4
                WHEN 'Viernes' THEN 5
                WHEN 'Sabado' THEN 6
                WHEN 'Domingo' THEN 7
                ELSE 8
              END,
              dv.hora_inicio ASC
          ) FILTER (WHERE dv.id_disponibilidad IS NOT NULL),
          '[]'
        ) AS horarios
      FROM voluntario v
      JOIN usuario u ON u.id_usuario = v.id_usuario
      LEFT JOIN disponibilidad_voluntario dv ON dv.id_voluntario = v.id_usuario
      ${whereClause}
      GROUP BY u.id_usuario, v.id_usuario
      ORDER BY
        CASE v.estado
          WHEN 'Aprobado' THEN 1
          WHEN 'Pendiente' THEN 2
          WHEN 'Rechazado' THEN 3
          ELSE 4
        END,
        u.nombre ASC,
        u.apellido ASC;
    `;

    const { rows } = await pool.query(query, params);

    return rows.map((fila) => ({
      id_usuario: Number(fila.id_usuario),
      nombre: fila.nombre,
      apellido: fila.apellido,
      correo: fila.correo,
      telefono: fila.telefono ?? null,
      foto_url: fila.foto_url ?? null,
      habilidades: Array.isArray(fila.habilidades) ? fila.habilidades : [],
      disponibilidad_general: fila.disponibilidad_general ?? '',
      es_coordinador: Boolean(fila.es_coordinador),
      estado_voluntario: fila.estado_voluntario,
      estado_usuario: fila.estado_usuario,
      horarios: Array.isArray(fila.horarios)
        ? fila.horarios.map((h: any) => ({
            id_disponibilidad: Number(h.id_disponibilidad),
            id_voluntario: Number(h.id_voluntario),
            dia_semana: h.dia_semana,
            hora_inicio: h.hora_inicio,
            hora_fin: h.hora_fin,
            estado: Boolean(h.estado),
          }))
        : [],
    }));
  },

  /**
   * Obtiene los horarios de un voluntario específico por su id_usuario.
   */
  async obtenerHorariosVoluntario(idVoluntario: number): Promise<HorarioDisponibilidad[]> {
    const { rows } = await pool.query(
      `
      SELECT
        id_disponibilidad,
        id_voluntario,
        dia_semana,
        to_char(hora_inicio, 'HH24:MI') AS hora_inicio,
        to_char(hora_fin, 'HH24:MI') AS hora_fin,
        estado
      FROM disponibilidad_voluntario
      WHERE id_voluntario = $1
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
        hora_inicio ASC
      `,
      [idVoluntario]
    );

    return rows.map((fila) => ({
      id_disponibilidad: Number(fila.id_disponibilidad),
      id_voluntario: Number(fila.id_voluntario),
      dia_semana: fila.dia_semana,
      hora_inicio: fila.hora_inicio,
      hora_fin: fila.hora_fin,
      estado: Boolean(fila.estado),
    }));
  },

  /**
   * Obtiene las actividades actuales y futuras en las que el voluntario está inscrito.
   */
  async obtenerActividadesVoluntario(
    idVoluntario: number
  ): Promise<ActividadVoluntarioResumen[]> {
    const query = `
      SELECT 
        p.id_participacion,
        p.id_actividad,
        a.nombre AS actividad_nombre,
        a.descripcion AS actividad_descripcion,
        to_char(a.fecha, 'YYYY-MM-DD') AS fecha,
        to_char(a.hora_inicio, 'HH24:MI') AS hora_inicio,
        to_char(a.hora_fin, 'HH24:MI') AS hora_fin,
        a.lugar,
        a.estado AS estado_actividad,
        a.tipo_actividad,
        p.estado AS estado_participacion,
        to_char(p.fecha_inscripcion, 'YYYY-MM-DD"T"HH24:MI:SS') AS fecha_inscripcion,
        c.nombre AS campana_nombre
      FROM participa p
      JOIN actividad a ON a.id_actividad = p.id_actividad
      LEFT JOIN actividad_campana ac ON ac.id_actividad = a.id_actividad
      LEFT JOIN campana c ON c.id_campana = ac.id_campana
      WHERE p.id_voluntario = $1 
        AND a.fecha >= CURRENT_DATE
        AND p.estado NOT IN ('Cancelado', 'No_Asistio')
        AND a.estado NOT IN ('Cancelada', 'Finalizada')
      ORDER BY a.fecha ASC, a.hora_inicio ASC;
    `;

    const { rows } = await pool.query(query, [idVoluntario]);

    return rows.map((fila) => ({
      id_participacion: Number(fila.id_participacion),
      id_actividad: Number(fila.id_actividad),
      actividad_nombre: fila.actividad_nombre,
      actividad_descripcion: fila.actividad_descripcion ?? null,
      fecha: fila.fecha,
      hora_inicio: fila.hora_inicio,
      hora_fin: fila.hora_fin,
      lugar: fila.lugar,
      estado_actividad: fila.estado_actividad,
      tipo_actividad: fila.tipo_actividad,
      estado_participacion: fila.estado_participacion,
      fecha_inscripcion: fila.fecha_inscripcion,
      campana_nombre: fila.campana_nombre ?? null,
    }));
  },
};
