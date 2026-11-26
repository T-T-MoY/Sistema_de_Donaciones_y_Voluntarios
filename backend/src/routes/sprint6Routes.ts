import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { verificarToken } from '../middlewares/authMiddleware';
import { transporter } from '../config/mailer';

const router = Router();
router.use(verificarToken);

const actorId = (req: Request) => Number(req.usuario?.id_usuario || req.usuario?.id);
const roles = (req: Request) => {
  const raw = req.usuario?.roles?.length ? req.usuario.roles : [req.usuario?.rol || ''];
  return raw.map((r) => String(r).toLowerCase().trim());
};
const esAdmin = (req: Request) => roles(req).some((r) => ['admin', 'administrador'].includes(r));
const esCoord = (req: Request) => esAdmin(req) || Boolean(req.usuario?.es_coordinador) || roles(req).includes('coordinador');
const error = (res: Response, status: number, message: string) => res.status(status).json({ error: message });

async function auditar(idUsuario: number, accion: string, entidad: string, detalle: unknown) {
  await pool.query('INSERT INTO sprint6_auditoria (id_usuario, accion, entidad, detalle) VALUES ($1,$2,$3,$4)', [idUsuario, accion, entidad, JSON.stringify(detalle ?? {})]);
}

router.get('/reportes', async (req, res) => {
  try {
    const id = actorId(req);
    const desde = String(req.query.desde || '2000-01-01');
    const hasta = String(req.query.hasta || '2999-12-31');
    const tipo = String(req.query.tipo || 'donaciones');
    const campanaId = req.query.campanaId ? Number(req.query.campanaId) : null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(desde) || !/^\d{4}-\d{2}-\d{2}$/.test(hasta) || desde > hasta) { error(res, 400, 'Rango de fechas inválido.'); return; }
    let result;
    if (tipo === 'donaciones') {
      let sql = `SELECT to_char(d.fecha_donacion,'DD/MM/YYYY HH24:MI') AS fecha_donacion, d.id_donacion, d.codigo, d.tipo_donacion, d.cantidad, d.estado, d.campana_id, c.nombre AS campana, u.nombre || ' ' || u.apellido AS donante FROM donacion d JOIN usuario u ON u.id_usuario=d.donante_usuario_id LEFT JOIN campana c ON c.id_campana=d.campana_id WHERE d.fecha_donacion::date BETWEEN $1 AND $2`;
      const params: unknown[] = [desde, hasta];
      if (!esAdmin(req) && !esCoord(req)) { sql += ' AND d.donante_usuario_id=$3'; params.push(id); }
      if (campanaId) { params.push(campanaId); sql += ` AND d.campana_id=$${params.length}`; }
      sql += ' ORDER BY d.fecha_donacion DESC LIMIT 5000';
      result = await pool.query(sql, params);
    } else if (tipo === 'voluntariado') {
      let sql = `SELECT to_char(a.fecha,'DD/MM/YYYY') AS fecha, p.id_participacion, a.nombre AS actividad, p.estado, p.asistio, p.horas_acreditadas, u.nombre || ' ' || u.apellido AS voluntario FROM participa p JOIN actividad a ON a.id_actividad=p.id_actividad JOIN usuario u ON u.id_usuario=p.id_voluntario WHERE a.fecha BETWEEN $1 AND $2`;
      const params: unknown[] = [desde, hasta];
      if (!esAdmin(req) && !esCoord(req)) { sql += ' AND p.id_voluntario=$3'; params.push(id); }
      sql += ' ORDER BY a.fecha DESC LIMIT 5000';
      result = await pool.query(sql, params);
    } else if (tipo === 'campanas') {
      if (!esAdmin(req) && !esCoord(req)) { await auditar(id, 'ACCESO_DENEGADO', 'reporte', { tipo }); error(res, 403, 'Este reporte está disponible para Administración y Coordinación.'); return; }
      result = await pool.query(`SELECT to_char(c.fecha_inicio,'DD/MM/YYYY') AS fecha_inicio,to_char(c.fecha_fin,'DD/MM/YYYY') AS fecha_fin,c.id_campana,c.nombre,c.estado,(SELECT COUNT(*)::int FROM donacion d WHERE d.campana_id=c.id_campana AND d.fecha_donacion::date BETWEEN $1 AND $2) AS donaciones, (SELECT COALESCE(SUM(d.cantidad),0)::numeric FROM donacion d WHERE d.campana_id=c.id_campana AND d.fecha_donacion::date BETWEEN $1 AND $2 AND d.estado <> 'ANULADA') AS total_donado, (SELECT COUNT(DISTINCT p.id_participacion)::int FROM actividad_campana ac JOIN participa p ON p.id_actividad=ac.id_actividad JOIN actividad a ON a.id_actividad=ac.id_actividad WHERE ac.id_campana=c.id_campana AND a.fecha BETWEEN $1 AND $2) AS participaciones FROM campana c WHERE c.fecha_inicio <= $2::date AND (c.fecha_fin IS NULL OR c.fecha_fin >= $1::date) ORDER BY c.fecha_inicio DESC`, [desde, hasta]);
    } else if (tipo === 'solicitudes') {
      let sql = `SELECT to_char(s.fecha_solicitud,'DD/MM/YYYY') AS fecha_solicitud,s.id_solicitud,s.tipo_ayuda,s.prioridad,s.estado,s.descripcion FROM solicitud_ayuda s WHERE s.fecha_solicitud BETWEEN $1 AND $2`;
      const params: unknown[] = [desde, hasta];
      if (!esAdmin(req) && !esCoord(req)) { sql += ' AND s.beneficiario_usuario_id=$3'; params.push(id); }
      sql += ' ORDER BY s.fecha_solicitud DESC LIMIT 5000';
      result = await pool.query(sql, params);
    } else { error(res, 400, 'Tipo de reporte no válido.'); return; }
    await auditar(id, 'GENERAR_REPORTE', tipo, { desde, hasta, campanaId });
    res.json({ tipo, desde, hasta, total: result.rows.length, filas: result.rows });
  } catch (e) { console.error('[Sprint6] reporte', e); error(res, 500, 'No se pudo generar el reporte. Verifica que la migración Sprint 6 esté aplicada.'); }
});

router.get('/destinatarios', async (req, res) => {
  if (!esCoord(req)) { error(res, 403, 'No tienes permisos para consultar destinatarios.'); return; }
  try {
    const result = esAdmin(req)
      ? await pool.query(`SELECT u.id_usuario,u.nombre,u.apellido,u.correo, string_agg(r.rol, ', ') AS roles FROM usuario u LEFT JOIN (SELECT id_usuario,'Administrador' AS rol FROM administrador UNION ALL SELECT id_usuario,'Donante' FROM donante UNION ALL SELECT id_usuario,'Voluntario' FROM voluntario UNION ALL SELECT id_usuario,'Beneficiario' FROM beneficiario) r ON r.id_usuario=u.id_usuario WHERE u.estado='Activo' GROUP BY u.id_usuario ORDER BY u.nombre`)
      : await pool.query(`SELECT u.id_usuario,u.nombre,u.apellido,u.correo,'Voluntario' AS roles FROM usuario u JOIN voluntario v ON v.id_usuario=u.id_usuario WHERE u.estado='Activo' AND v.estado='Aprobado' ORDER BY u.nombre`);
    res.json(result.rows);
  } catch (e) { console.error(e); error(res, 500, 'No se pudieron cargar los destinatarios.'); }
});

router.get('/notificaciones', async (req, res) => {
  if (!esCoord(req)) { error(res, 403, 'No tienes permisos para consultar notificaciones.'); return; }
  try {
    const result = await pool.query(`SELECT n.id_notificacion,n.asunto,n.mensaje,n.estado,n.programada_para,n.creada_en,n.fecha_envio,COUNT(d.id_destinatario)::int AS total_destinatarios FROM sprint6_notificacion n LEFT JOIN sprint6_notificacion_destinatario d USING(id_notificacion) WHERE n.creado_por=$1 OR $2::boolean GROUP BY n.id_notificacion ORDER BY n.creada_en DESC LIMIT 100`, [actorId(req), esAdmin(req)]);
    res.json(result.rows);
  } catch (e) { console.error(e); error(res, 500, 'No se pudieron cargar las notificaciones.'); }
});

router.post('/notificaciones', async (req, res) => {
  if (!esCoord(req)) { error(res, 403, 'Solo Administración o Coordinación pueden enviar notificaciones.'); return; }
  const asunto = String(req.body?.asunto || '').trim();
  const mensaje = String(req.body?.mensaje || '').trim();
  const ids: number[] = Array.isArray(req.body?.destinatarios) ? [...new Set<number>(req.body.destinatarios.map(Number).filter((n: number) => Number.isInteger(n) && n > 0))] : [];
  const programada = req.body?.programadaPara ? new Date(req.body.programadaPara) : null;
  if (!asunto || asunto.length > 180 || !mensaje || mensaje.length > 10000 || !ids.length) { error(res, 400, 'Completa el asunto, mensaje y al menos un destinatario.'); return; }
  if (programada && (!Number.isFinite(programada.getTime()) || programada.getTime() < Date.now() - 60000)) { error(res, 400, 'La fecha programada debe ser futura.'); return; }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const users = await client.query(`SELECT u.id_usuario,u.correo FROM usuario u WHERE u.id_usuario=ANY($1::int[]) AND u.estado='Activo' ${esAdmin(req) ? '' : 'AND EXISTS (SELECT 1 FROM voluntario v WHERE v.id_usuario=u.id_usuario AND v.estado=\'Aprobado\')'}`, [ids]);
    if (users.rows.length !== ids.length) { await client.query('ROLLBACK'); await auditar(actorId(req), 'PERMISO_INSUFICIENTE', 'notificacion', { destinatariosSolicitados: ids }); error(res, 403, 'Uno o más destinatarios no existen o están fuera de tu alcance autorizado.'); return; }
    const estado = programada ? 'PROGRAMADA' : 'PENDIENTE';
    const n = await client.query('INSERT INTO sprint6_notificacion (creado_por,asunto,mensaje,programada_para,estado) VALUES ($1,$2,$3,$4,$5) RETURNING id_notificacion', [actorId(req), asunto, mensaje, programada, estado]);
    for (const u of users.rows) await client.query('INSERT INTO sprint6_notificacion_destinatario (id_notificacion,id_usuario,correo) VALUES ($1,$2,$3)', [n.rows[0].id_notificacion, u.id_usuario, u.correo]);
    await client.query('COMMIT');
    await auditar(actorId(req), programada ? 'PROGRAMAR_NOTIFICACION' : 'CREAR_NOTIFICACION', 'notificacion', { id: n.rows[0].id_notificacion, destinatarios: ids });
    if (!programada) void procesarNotificacion(Number(n.rows[0].id_notificacion));
    res.status(201).json({ id_notificacion: n.rows[0].id_notificacion, estado });
  } catch (e) { await client.query('ROLLBACK'); console.error(e); error(res, 500, 'No se pudo registrar la notificación.'); }
  finally { client.release(); }
});

// Evita que el envío inmediato, el reintento y la cola procesen a la vez la misma notificación.
const enProceso = new Set<number>();

async function procesarNotificacion(id: number) {
  if (enProceso.has(id)) return;
  enProceso.add(id);
  try {
    await enviarPendientes(id);
  } catch (e) {
    console.error(`[Sprint6] Error procesando notificación ${id}:`, e);
  } finally {
    enProceso.delete(id);
  }
}

async function enviarPendientes(id: number) {
  const n = await pool.query('SELECT * FROM sprint6_notificacion WHERE id_notificacion=$1 AND estado IN (\'PENDIENTE\',\'PROGRAMADA\')', [id]);
  if (!n.rowCount) return;
  const destinatarios = await pool.query('SELECT * FROM sprint6_notificacion_destinatario WHERE id_notificacion=$1 AND estado <> \'ENVIADA\' AND intentos < 5', [id]);
  let fallos = 0;
  for (const d of destinatarios.rows) {
    try {
      if (!process.env.EMAIL_USER || !(process.env.BREVO_SMTP_KEY || process.env.EMAIL_PASS)) throw new Error('Servicio de correo no configurado');
      await transporter.sendMail({ from: `"${process.env.EMAIL_FROM_NAME || 'Donaciones y Voluntarios'}" <${process.env.EMAIL_USER}>`, to: d.correo, subject: n.rows[0].asunto, text: n.rows[0].mensaje });
      await pool.query("UPDATE sprint6_notificacion_destinatario SET estado='ENVIADA',fecha_envio=NOW(),error=NULL WHERE id_destinatario=$1", [d.id_destinatario]);
    } catch (e) {
      fallos++;
      await pool.query("UPDATE sprint6_notificacion_destinatario SET intentos=intentos+1,error=$2 WHERE id_destinatario=$1", [d.id_destinatario, (e as Error).message]);
    }
  }
  const pendientes = await pool.query("SELECT COUNT(*)::int AS n FROM sprint6_notificacion_destinatario WHERE id_notificacion=$1 AND estado <> 'ENVIADA'", [id]);
  const estado = pendientes.rows[0].n === 0 ? 'ENVIADA' : 'PENDIENTE';
  await pool.query('UPDATE sprint6_notificacion SET estado=$2::varchar,fecha_envio=CASE WHEN $2::varchar=\'ENVIADA\' THEN NOW() ELSE fecha_envio END WHERE id_notificacion=$1', [id, estado]);
  await auditar(Number(n.rows[0].creado_por), 'PROCESAR_NOTIFICACION', 'notificacion', { id, estado, fallos });
  if (fallos) console.warn(`[Sprint6] ${fallos} correo(s) pendientes para notificación ${id}`);
}

export async function procesarNotificacionesProgramadas() {
  try {
    const r = await pool.query("SELECT id_notificacion FROM sprint6_notificacion WHERE estado IN ('PROGRAMADA','PENDIENTE') AND (programada_para IS NULL OR programada_para <= NOW()) AND EXISTS (SELECT 1 FROM sprint6_notificacion_destinatario d WHERE d.id_notificacion=sprint6_notificacion.id_notificacion AND d.estado <> 'ENVIADA' AND d.intentos < 5) ORDER BY creada_en LIMIT 20");
    for (const row of r.rows) await procesarNotificacion(Number(row.id_notificacion));
  } catch (e) { console.error('[Sprint6] Error procesando cola:', e); }
}

router.post('/notificaciones/:id/reintentar', async (req, res) => {
  if (!esCoord(req)) { error(res, 403, 'No tienes permisos.'); return; }
  const id = Number(req.params.id);
  try {
    const found = await pool.query('SELECT creado_por FROM sprint6_notificacion WHERE id_notificacion=$1', [id]);
    if (!found.rowCount || (!esAdmin(req) && Number(found.rows[0].creado_por) !== actorId(req))) { error(res, 404, 'Notificación no encontrada.'); return; }
    await pool.query("UPDATE sprint6_notificacion SET estado='PENDIENTE' WHERE id_notificacion=$1", [id]);
    await pool.query("UPDATE sprint6_notificacion_destinatario SET intentos=0,error=NULL WHERE id_notificacion=$1 AND estado <> 'ENVIADA'", [id]);
    void procesarNotificacion(id);
    await auditar(actorId(req), 'REINTENTAR_NOTIFICACION', 'notificacion', { id });
    res.json({ mensaje: 'Reintento iniciado.' });
  } catch (e) { console.error(e); error(res, 500, 'No se pudo reintentar el envío.'); }
});

export default router;
