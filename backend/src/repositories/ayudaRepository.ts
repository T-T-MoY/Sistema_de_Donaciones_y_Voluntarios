import { pool } from '../config/database';
import type { PoolClient } from 'pg';
import type {
  FichaBeneficiario,
  SolicitudCrear,
  ApoyoDatos,
} from '../models/ayudaModel';

const fichaSQL = `SELECT b.*, COALESCE(f.tipo_documento,CASE WHEN b.tipo_beneficiario='Institucion' THEN 'NIT' ELSE 'CI' END) AS tipo_documento,
  u.nombre, u.apellido, u.correo, u.telefono, u.estado AS estado_cuenta
  FROM beneficiario b JOIN usuario u USING (id_usuario) LEFT JOIN beneficiario_ayuda_ficha f USING(id_usuario)`;
const solicitudSQL = `SELECT s.*, 'SOL-' || lpad(s.id_solicitud::text,6,'0') AS codigo,
  to_char(s.fecha_solicitud,'YYYY-MM-DD') AS fecha_solicitud,
  u.nombre || ' ' || u.apellido AS beneficiario_nombre, b.documento, b.estado AS estado_beneficiario,
  b.necesidad, b.direccion, b.tipo_beneficiario,
  (SELECT count(*)::int FROM apoya_a a WHERE a.id_solicitud=s.id_solicitud) AS apoyos
  FROM solicitud_ayuda s JOIN beneficiario b ON b.id_usuario=s.beneficiario_usuario_id
  JOIN usuario u ON u.id_usuario=b.id_usuario`;
const apoyoSQL = `SELECT a.*, 'AYU-' || lpad(a.id_apoyo::text,6,'0') AS codigo,
  'SOL-' || lpad(a.id_solicitud::text,6,'0') AS solicitud_codigo,
  to_char(a.fecha_entrega,'YYYY-MM-DD') AS fecha_entrega,
  to_char(a.fecha_programada,'YYYY-MM-DD') AS fecha_programada,
  u.nombre || ' ' || u.apellido AS beneficiario_nombre, b.documento, c.nombre AS campana_nombre,
  r.nombre || ' ' || r.apellido AS responsable_nombre
  FROM apoya_a a JOIN usuario u ON u.id_usuario=a.beneficiario_usuario_id
  JOIN beneficiario b ON b.id_usuario=u.id_usuario JOIN campana c USING (id_campana)
  JOIN usuario r ON r.id_usuario=a.responsable_id`;

export const ayudaRepository = {
  async transaccion<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    const c = await pool.connect();
    try {
      await c.query('BEGIN');
      const r = await fn(c);
      await c.query('COMMIT');
      return r;
    } catch (e) {
      await c.query('ROLLBACK');
      throw e;
    } finally {
      c.release();
    }
  },
  async actor(id: number) {
    const { rows } = await pool.query(
      `SELECT u.estado, EXISTS(SELECT 1 FROM administrador a WHERE a.id_usuario=u.id_usuario) AS admin,
      EXISTS(SELECT 1 FROM beneficiario b WHERE b.id_usuario=u.id_usuario) AS beneficiario FROM usuario u WHERE id_usuario=$1`,
      [id],
    );
    return rows[0];
  },
  async fichas(propio: number | null) {
    return (
      await pool.query(
        `${fichaSQL} WHERE u.estado <> 'Eliminado' AND ($1::int IS NULL OR b.id_usuario=$1) ORDER BY u.nombre,u.apellido`,
        [propio],
      )
    ).rows;
  },
  async ficha(id: number, c?: PoolClient) {
    return (
      await (c || pool).query(
        `${fichaSQL} WHERE b.id_usuario=$1${c ? ' FOR UPDATE OF b, u' : ''}`,
        [id],
      )
    ).rows[0];
  },
  async usuariosDisponibles() {
    return (
      await pool.query(`SELECT u.id_usuario,u.nombre,u.apellido,u.correo,u.telefono FROM usuario u
      WHERE u.estado='Activo' AND NOT EXISTS(SELECT 1 FROM beneficiario b WHERE b.id_usuario=u.id_usuario) ORDER BY u.nombre`)
    ).rows;
  },
  async usuario(c: PoolClient, id: number) {
    return (
      await c.query(
        'SELECT id_usuario,estado FROM usuario WHERE id_usuario=$1 FOR UPDATE',
        [id],
      )
    ).rows[0];
  },
  async crearUsuario(c: PoolClient, d: FichaBeneficiario, password: string) {
    return (
      await c.query(
        `INSERT INTO usuario(nombre,apellido,correo,telefono,password) VALUES($1,$2,$3,$4,$5) RETURNING id_usuario`,
        [d.nombre, d.apellido, d.correo, d.telefono, password],
      )
    ).rows[0].id_usuario as number;
  },
  async guardarFicha(
    c: PoolClient,
    id: number,
    d: FichaBeneficiario,
    actor: number | null,
    nueva: boolean,
  ) {
    await c.query(
      'UPDATE usuario SET nombre=$2,apellido=$3,correo=$4,telefono=$5 WHERE id_usuario=$1',
      [id, d.nombre, d.apellido, d.correo, d.telefono],
    );
    const vals = [
      id,
      d.tipo_beneficiario,
      d.documento,
      d.direccion,
      d.necesidad,
      d.descripcion,
      d.estado,
      actor,
    ];
    if (nueva)
      await c.query(
        `INSERT INTO beneficiario(id_usuario,tipo_beneficiario,documento,direccion,necesidad,descripcion,estado,revisado_por,fecha_revision)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,CASE WHEN $8::int IS NOT NULL THEN now() END)`,
        vals,
      );
    else
      await c.query(
        `UPDATE beneficiario SET tipo_beneficiario=$2,documento=$3,direccion=$4,necesidad=$5,descripcion=$6,
      estado=$7::varchar,revisado_por=CASE WHEN estado<>$7::varchar THEN $8::int ELSE revisado_por END,
      fecha_revision=CASE WHEN estado<>$7::varchar THEN CASE WHEN $8::int IS NOT NULL THEN now() END ELSE fecha_revision END,
      motivo_rechazo=CASE WHEN estado<>$7::varchar THEN NULL ELSE motivo_rechazo END WHERE id_usuario=$1`,
        vals,
      );
    await c.query(
      `INSERT INTO beneficiario_ayuda_ficha(id_usuario,tipo_documento) VALUES($1,$2)
      ON CONFLICT(id_usuario) DO UPDATE SET tipo_documento=EXCLUDED.tipo_documento`,
      [id, d.tipo_documento],
    );
  },
  async solicitudes(propio: number | null) {
    return (
      await pool.query(
        `${solicitudSQL} WHERE ($1::int IS NULL OR s.beneficiario_usuario_id=$1) ORDER BY s.creado_en DESC,s.id_solicitud DESC`,
        [propio],
      )
    ).rows;
  },
  async solicitud(id: number, c?: PoolClient) {
    return (
      await (c || pool).query(
        `${solicitudSQL} WHERE s.id_solicitud=$1${c ? ' FOR UPDATE OF s' : ''}`,
        [id],
      )
    ).rows[0];
  },
  async crearSolicitud(c: PoolClient, d: SolicitudCrear, actor: number) {
    return (
      await c.query(
        `INSERT INTO solicitud_ayuda(beneficiario_usuario_id,tipo_ayuda,descripcion,prioridad,fecha_solicitud,creado_por)
      VALUES($1,$2,$3,$4,$5,$6) RETURNING id_solicitud`,
        [
          d.beneficiario_usuario_id,
          d.tipo_ayuda,
          d.descripcion,
          d.prioridad,
          d.fecha_solicitud,
          actor,
        ],
      )
    ).rows[0].id_solicitud as number;
  },
  async actualizarSolicitud(c: PoolClient, id: number, d: SolicitudCrear) {
    await c.query(
      `UPDATE solicitud_ayuda SET tipo_ayuda=$2,descripcion=$3,prioridad=$4,fecha_solicitud=$5,version=version+1,actualizado_en=now() WHERE id_solicitud=$1`,
      [id, d.tipo_ayuda, d.descripcion, d.prioridad, d.fecha_solicitud],
    );
  },
  async evaluar(
    c: PoolClient,
    id: number,
    actor: number,
    estado: string,
    observaciones: string,
  ) {
    await c.query(
      'INSERT INTO evaluacion_ayuda(id_solicitud,administrador_id,estado,observaciones) VALUES($1,$2,$3,$4)',
      [id, actor, estado, observaciones],
    );
    await c.query(
      'UPDATE solicitud_ayuda SET estado=$2,version=version+1,actualizado_en=now() WHERE id_solicitud=$1',
      [id, estado],
    );
  },
  async evaluaciones(id: number) {
    return (
      await pool.query(
        `SELECT e.*,u.nombre || ' ' || u.apellido AS administrador_nombre FROM evaluacion_ayuda e JOIN usuario u ON u.id_usuario=e.administrador_id WHERE id_solicitud=$1 ORDER BY e.fecha,e.id_evaluacion`,
        [id],
      )
    ).rows;
  },
  async campanas(c?: PoolClient, id?: number) {
    return (
      await (c || pool).query(
        `SELECT id_campana,nombre,estado,to_char(fecha_inicio,'YYYY-MM-DD') AS fecha_inicio,to_char(fecha_fin,'YYYY-MM-DD') AS fecha_fin FROM campana
      WHERE estado='Activa' AND fecha_inicio <= (now() AT TIME ZONE 'America/La_Paz')::date
      AND (fecha_fin IS NULL OR fecha_fin >= (now() AT TIME ZONE 'America/La_Paz')::date)
      AND ($1::int IS NULL OR id_campana=$1) ORDER BY nombre${c ? ' FOR SHARE' : ''}`,
        [id || null],
      )
    ).rows;
  },
  async responsables(c?: PoolClient) {
    return (
      await (c || pool)
        .query(`SELECT u.id_usuario,u.nombre || ' ' || u.apellido AS nombre FROM usuario u WHERE u.estado='Activo'
      AND (EXISTS(SELECT 1 FROM administrador a WHERE a.id_usuario=u.id_usuario) OR EXISTS(SELECT 1 FROM voluntario v WHERE v.id_usuario=u.id_usuario AND v.estado='Aprobado')) ORDER BY u.nombre`)
    ).rows;
  },
  async apoyos(propio: number | null) {
    return (
      await pool.query(
        `${apoyoSQL} WHERE ($1::int IS NULL OR a.beneficiario_usuario_id=$1) ORDER BY a.creado_en DESC,a.id_apoyo DESC`,
        [propio],
      )
    ).rows;
  },
  async apoyo(id: number, c?: PoolClient) {
    return (
      await (c || pool).query(
        `${apoyoSQL} WHERE a.id_apoyo=$1${c ? ' FOR UPDATE OF a' : ''}`,
        [id],
      )
    ).rows[0];
  },
  async crearApoyo(
    c: PoolClient,
    solicitud: number,
    beneficiario: number,
    campana: number,
    d: ApoyoDatos,
    actor: number,
  ) {
    return (
      await c.query(
        `INSERT INTO apoya_a(id_solicitud,beneficiario_usuario_id,id_campana,tipo_apoyo,descripcion,responsable_id,fecha_programada,creado_por)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id_apoyo`,
        [
          solicitud,
          beneficiario,
          campana,
          d.tipo_apoyo,
          d.descripcion,
          d.responsable_id,
          d.fecha_programada,
          actor,
        ],
      )
    ).rows[0].id_apoyo as number;
  },
  async actualizarApoyo(
    c: PoolClient,
    id: number,
    d: ApoyoDatos,
    estado: string,
    fecha: string | null,
  ) {
    await c.query(
      `UPDATE apoya_a SET tipo_apoyo=$2,descripcion=$3,responsable_id=$4,fecha_programada=$5,estado=$6,fecha_entrega=$7,version=version+1,actualizado_en=now() WHERE id_apoyo=$1`,
      [
        id,
        d.tipo_apoyo,
        d.descripcion,
        d.responsable_id,
        d.fecha_programada,
        estado,
        fecha,
      ],
    );
  },
  async evento(
    c: PoolClient,
    id: number,
    actor: number,
    estado: string,
    descripcion: string,
  ) {
    await c.query(
      'INSERT INTO apoyo_historial(id_apoyo,actor_id,estado,descripcion) VALUES($1,$2,$3,$4)',
      [id, actor, estado, descripcion],
    );
  },
  async historial(id: number) {
    return (
      await pool.query(
        `SELECT h.*,u.nombre || ' ' || u.apellido AS actor_nombre FROM apoyo_historial h JOIN usuario u ON u.id_usuario=h.actor_id WHERE id_apoyo=$1 ORDER BY h.fecha,h.id_evento`,
        [id],
      )
    ).rows;
  },
  async evidencias(id: number, c?: PoolClient) {
    return (
      await (c || pool).query(
        `SELECT e.id_evidencia,e.nombre,e.mime,e.descripcion,e.creado_en,
      octet_length(e.contenido) AS bytes,u.nombre || ' ' || u.apellido AS autor_nombre
      FROM apoyo_evidencia e JOIN usuario u ON u.id_usuario=e.subido_por
      WHERE e.id_apoyo=$1 ORDER BY e.creado_en,e.id_evidencia`,
        [id],
      )
    ).rows;
  },
  async guardarEvidencia(
    c: PoolClient,
    id: number,
    actor: number,
    f: {
      nombre: string;
      mime: string;
      buffer: Buffer;
      descripcion: string;
      sha256: string;
    },
  ) {
    return (
      await c.query(
        `INSERT INTO apoyo_evidencia(id_apoyo,nombre,mime,contenido,descripcion,sha256,subido_por)
      VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(id_apoyo,sha256) DO NOTHING RETURNING id_evidencia`,
        [id, f.nombre, f.mime, f.buffer, f.descripcion, f.sha256, actor],
      )
    ).rows[0];
  },
  async evidencia(id: number) {
    return (
      await pool.query('SELECT * FROM apoyo_evidencia WHERE id_evidencia=$1', [
        id,
      ])
    ).rows[0];
  },
  async adjuntos(id: number, c?: PoolClient) {
    return (
      await (c || pool).query(
        'SELECT id_adjunto,nombre,mime,octet_length(contenido) AS bytes FROM solicitud_ayuda_adjunto WHERE id_solicitud=$1 ORDER BY id_adjunto',
        [id],
      )
    ).rows;
  },
  async adjuntar(
    c: PoolClient,
    id: number,
    f: { nombre: string; mime: string; buffer: Buffer },
  ) {
    await c.query(
      'INSERT INTO solicitud_ayuda_adjunto(id_solicitud,nombre,mime,contenido) VALUES($1,$2,$3,$4)',
      [id, f.nombre, f.mime, f.buffer],
    );
  },
  async incrementarVersionSolicitud(c: PoolClient, id: number) {
    await c.query(
      'UPDATE solicitud_ayuda SET version=version+1,actualizado_en=now() WHERE id_solicitud=$1',
      [id],
    );
  },
  async adjunto(id: number) {
    return (
      await pool.query(
        'SELECT * FROM solicitud_ayuda_adjunto WHERE id_adjunto=$1',
        [id],
      )
    ).rows[0];
  },
  async estaAprobada(id: number, beneficiario?: number) {
    return (
      (
        await pool.query(
          `SELECT 1 FROM solicitud_ayuda WHERE id_solicitud=$1 AND estado='Aprobada' AND ($2::int IS NULL OR beneficiario_usuario_id=$2)`,
          [id, beneficiario || null],
        )
      ).rowCount === 1
    );
  },
};
