import bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { ayudaRepository as repo } from '../repositories/ayudaRepository';
import type { ActorAyuda } from '../models/ayudaModel';
import { TIPOS_AYUDA } from '../models/ayudaModel';
import { AppError } from '../utils/AppError';
import {
  objeto,
  texto,
  idPositivo,
  opcion,
  fecha,
  validarFicha,
  validarSolicitud,
  validarApoyo,
  mismaVersion,
} from '../validators/ayudaValidator';

function admin(a: ActorAyuda) {
  if (!a.admin)
    throw new AppError('Esta acción requiere un administrador.', 403);
}
function propietario(a: ActorAyuda, id: number) {
  if (!a.admin && a.id !== id)
    throw new AppError('Registro no encontrado.', 404);
}
function existe<T>(r: T | null | undefined): T {
  if (!r) throw new AppError('Registro no encontrado.', 404);
  return r;
}
function pendiente(estado: string) {
  if (estado !== 'Pendiente')
    throw new AppError(
      'Solo se puede editar o evaluar una solicitud pendiente.',
      409,
    );
}

export const ayudaService = {
  async acceso(id: unknown) {
    const actorId = idPositivo(id);
    const cuenta = await repo.actor(actorId);
    if (!cuenta || cuenta.estado !== 'Activo')
      throw new AppError('La cuenta no está activa.', 403);
    return {
      id: actorId,
      admin: !!cuenta.admin,
      beneficiario: !!cuenta.beneficiario,
    };
  },
  async actor(id: unknown): Promise<ActorAyuda> {
    const a = await this.acceso(id);
    if (!a.admin && !a.beneficiario)
      throw new AppError(
        'Debes registrar tu ficha de beneficiario desde Inicio para acceder.',
        403,
      );
    return a;
  },
  async catalogos(a: ActorAyuda) {
    return {
      tipos_ayuda: TIPOS_AYUDA,
      campanas: a.admin ? await repo.campanas() : [],
      responsables: a.admin ? await repo.responsables() : [],
      usuarios: a.admin ? await repo.usuariosDisponibles() : [],
    };
  },
  async fichas(a: ActorAyuda) {
    return repo.fichas(a.admin ? null : a.id);
  },
  async guardarFicha(a: ActorAyuda, id: unknown, body: unknown) {
    const b = objeto(body);
    const nueva = id === null;
    if (nueva) admin(a);
    const seleccionado = nueva
      ? b.usuario_existente_id
        ? idPositivo(b.usuario_existente_id)
        : null
      : idPositivo(id);
    if (seleccionado) propietario(a, seleccionado);
    let password = '';
    if (nueva && !seleccionado) {
      password = texto(b.password, 'Contraseña inicial', 8, 100);
      if (
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/[0-9]/.test(password)
      )
        throw new AppError(
          'La contraseña necesita mayúscula, minúscula y número.',
          400,
        );
      password = await bcrypt.hash(password, 10);
    }
    const guardado = await repo.transaccion(async (c) => {
      const actual = seleccionado ? await repo.ficha(seleccionado, c) : null;
      if (!nueva) existe(actual);
      if (nueva && actual)
        throw new AppError(
          'Esta cuenta ya tiene una ficha de beneficiario.',
          409,
        );
      const d = validarFicha({
        ...b,
        estado: a.admin ? b.estado : actual.estado,
      });
      if (!a.admin) {
        if (b.estado !== undefined && b.estado !== actual.estado)
          throw new AppError(
            'Solo un administrador puede cambiar la verificación.',
            403,
          );
        if (
          d.documento !== actual.documento ||
          d.tipo_beneficiario !== actual.tipo_beneficiario ||
          d.tipo_documento !== actual.tipo_documento
        )
          d.estado = 'Pendiente';
      }
      if (
        a.admin &&
        seleccionado === a.id &&
        d.estado !== (actual?.estado || 'Pendiente')
      )
        throw new AppError(
          'No puedes verificar ni rechazar tu propia ficha.',
          403,
        );
      let usuarioId = seleccionado;
      if (nueva && usuarioId) {
        const u = existe(await repo.usuario(c, usuarioId));
        if (u.estado !== 'Activo')
          throw new AppError('La cuenta seleccionada debe estar activa.', 400);
      }
      if (!usuarioId) usuarioId = await repo.crearUsuario(c, d, password);
      await repo.guardarFicha(
        c,
        usuarioId,
        d,
        a.admin && d.estado !== 'Pendiente' ? a.id : null,
        nueva,
      );
      return usuarioId;
    });
    return repo.ficha(guardado);
  },
  async solicitudes(a: ActorAyuda) {
    return repo.solicitudes(a.admin ? null : a.id);
  },
  async detalleSolicitud(a: ActorAyuda, id: unknown) {
    const s = existe(await repo.solicitud(idPositivo(id)));
    propietario(a, s.beneficiario_usuario_id);
    return {
      ...s,
      evaluaciones: await repo.evaluaciones(s.id_solicitud),
      adjuntos: await repo.adjuntos(s.id_solicitud),
    };
  },
  async guardarSolicitud(a: ActorAyuda, id: unknown, body: unknown) {
    const b = objeto(body);
    const sid = await repo.transaccion(async (c) => {
      const actual =
        id === null ? null : existe(await repo.solicitud(idPositivo(id), c));
      const bid = actual
        ? actual.beneficiario_usuario_id
        : a.admin
          ? idPositivo(b.beneficiario_usuario_id)
          : a.id;
      propietario(a, bid);
      if (
        !a.admin &&
        b.beneficiario_usuario_id !== undefined &&
        idPositivo(b.beneficiario_usuario_id) !== a.id
      )
        throw new AppError(
          'No puedes presentar solicitudes para otra persona.',
          403,
        );
      const f = existe(await repo.ficha(bid, c));
      if (f.estado_cuenta !== 'Activo' || f.estado === 'Rechazado')
        throw new AppError(
          'El beneficiario debe tener una cuenta activa y una ficha pendiente o verificada.',
          400,
        );
      const d = validarSolicitud(b, bid);
      if (actual) {
        pendiente(actual.estado);
        mismaVersion(actual.version, b.version);
        await repo.actualizarSolicitud(c, actual.id_solicitud, d);
        return actual.id_solicitud;
      }
      return repo.crearSolicitud(c, d, a.id);
    });
    return this.detalleSolicitud(a, sid);
  },
  async evaluar(a: ActorAyuda, id: unknown, body: unknown) {
    admin(a);
    const sid = idPositivo(id),
      b = objeto(body);
    const estado = opcion(
      b.estado,
      ['Pendiente', 'Aprobada', 'Rechazada'],
      'Resolución',
    );
    const observaciones = texto(
      b.observaciones,
      'Observaciones de evaluación',
      5,
      2000,
    );
    if (b.revisada !== true || b.evaluada !== true)
      throw new AppError(
        'Confirma que revisaste y evaluaste la solicitud.',
        400,
      );
    await repo.transaccion(async (c) => {
      const s = existe(await repo.solicitud(sid, c));
      pendiente(s.estado);
      mismaVersion(s.version, b.version);
      if (s.beneficiario_usuario_id === a.id)
        throw new AppError('No puedes evaluar tu propia solicitud.', 403);
      const f = existe(await repo.ficha(s.beneficiario_usuario_id, c));
      if (
        estado === 'Aprobada' &&
        (f.estado !== 'Verificado' || f.estado_cuenta !== 'Activo')
      )
        throw new AppError(
          'Verifica al beneficiario y activa su cuenta antes de aprobar la ayuda.',
          400,
        );
      await repo.evaluar(c, sid, a.id, estado, observaciones);
    });
    return this.detalleSolicitud(a, sid);
  },
  async apoyos(a: ActorAyuda) {
    return repo.apoyos(a.admin ? null : a.id);
  },
  async detalleApoyo(a: ActorAyuda, id: unknown) {
    const r = existe(await repo.apoyo(idPositivo(id)));
    propietario(a, r.beneficiario_usuario_id);
    return {
      ...r,
      historial: await repo.historial(r.id_apoyo),
      evidencias: await repo.evidencias(r.id_apoyo),
    };
  },
  async crearApoyo(a: ActorAyuda, body: unknown) {
    admin(a);
    const b = objeto(body),
      sid = idPositivo(b.id_solicitud),
      cid = idPositivo(b.id_campana),
      d = validarApoyo(b);
    const id = await repo.transaccion(async (c) => {
      const s = existe(await repo.solicitud(sid, c));
      if (s.estado !== 'Aprobada')
        throw new AppError(
          'Solo se puede asociar una campaña a solicitudes aprobadas.',
          409,
        );
      const f = existe(await repo.ficha(s.beneficiario_usuario_id, c));
      if (f.estado !== 'Verificado' || f.estado_cuenta !== 'Activo')
        throw new AppError(
          'El beneficiario debe estar verificado y activo.',
          400,
        );
      if (!(await repo.campanas(c, cid)).length)
        throw new AppError(
          'La campaña no está activa o está fuera de sus fechas.',
          400,
        );
      if (
        !(await repo.responsables(c)).some(
          (r) => r.id_usuario === d.responsable_id,
        )
      )
        throw new AppError('Selecciona un responsable activo.', 400);
      const id = await repo.crearApoyo(
        c,
        sid,
        s.beneficiario_usuario_id,
        cid,
        d,
        a.id,
      );
      await repo.evento(
        c,
        id,
        a.id,
        'Pendiente',
        `Vínculo registrado. ${d.descripcion}`,
      );
      return id;
    });
    return this.detalleApoyo(a, id);
  },
  async actualizarApoyo(a: ActorAyuda, id: unknown, body: unknown) {
    admin(a);
    const aid = idPositivo(id),
      b = objeto(body),
      d = validarApoyo(b);
    const estado = opcion(
      b.estado,
      ['Pendiente', 'Preparada', 'Entregada'],
      'Estado de entrega',
    );
    const entrega =
      estado === 'Entregada'
        ? fecha(b.fecha_entrega, 'Fecha real de entrega')
        : null;
    if (estado !== 'Entregada' && b.fecha_entrega)
      throw new AppError(
        'Una ayuda pendiente o preparada no puede tener fecha de entrega.',
        400,
      );
    await repo.transaccion(async (c) => {
      const actual = existe(await repo.apoyo(aid, c));
      mismaVersion(actual.version, b.version);
      if (actual.estado === 'Entregada')
        throw new AppError(
          'La entrega ya fue confirmada y no se puede modificar.',
          409,
        );
      if (actual.estado === 'Pendiente' && estado === 'Entregada')
        throw new AppError('Primero prepara la entrega.', 409);
      if (actual.estado === 'Preparada' && estado === 'Pendiente')
        throw new AppError(
          'Una entrega preparada no puede volver a pendiente.',
          409,
        );
      if (
        !(await repo.responsables(c)).some(
          (r) => r.id_usuario === d.responsable_id,
        )
      )
        throw new AppError('Selecciona un responsable activo.', 400);
      if (
        entrega &&
        entrega <
          new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/La_Paz',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(new Date(actual.creado_en))
      )
        throw new AppError(
          'La entrega no puede ser anterior a la asignación.',
          400,
        );
      await repo.actualizarApoyo(c, aid, d, estado, entrega);
      await repo.evento(
        c,
        aid,
        a.id,
        estado,
        `${estado === actual.estado ? 'Apoyo actualizado' : estado === 'Preparada' ? 'Entrega preparada' : 'Entrega confirmada'}. ${d.descripcion}${entrega ? ' Fecha real: ' + entrega : ''}`,
      );
    });
    return this.detalleApoyo(a, aid);
  },
  async adjuntar(a: ActorAyuda, id: unknown, archivos: Express.Multer.File[]) {
    const sid = idPositivo(id);
    if (!archivos.length || archivos.length > 5)
      throw new AppError('Adjunta entre 1 y 5 archivos.', 400);
    const files = archivos.map((f) => {
      const hex = f.buffer.subarray(0, 8).toString('hex');
      const mime = hex.startsWith('255044462d')
        ? 'application/pdf'
        : hex.startsWith('ffd8ff')
          ? 'image/jpeg'
          : hex === '89504e470d0a1a0a'
            ? 'image/png'
            : null;
      if (!mime || mime !== f.mimetype || f.size > 10485760)
        throw new AppError(
          'Usa archivos PDF, JPG o PNG válidos de hasta 10 MB.',
          400,
        );
      return {
        nombre: f.originalname.replace(/[\\/\x00-\x1f]/g, '_').slice(0, 180),
        mime,
        buffer: f.buffer,
      };
    });
    await repo.transaccion(async (c) => {
      const s = existe(await repo.solicitud(sid, c));
      propietario(a, s.beneficiario_usuario_id);
      pendiente(s.estado);
      if ((await repo.adjuntos(sid, c)).length + files.length > 5)
        throw new AppError(
          'Cada solicitud admite un máximo de 5 adjuntos.',
          400,
        );
      for (const f of files) await repo.adjuntar(c, sid, f);
      await repo.incrementarVersionSolicitud(c, sid);
    });
    return repo.adjuntos(sid);
  },
  async subirEvidencia(
    a: ActorAyuda,
    id: unknown,
    foto: Express.Multer.File | undefined,
    descripcion: unknown,
  ) {
    admin(a);
    const aid = idPositivo(id);
    if (!foto || foto.size > 5 * 1024 * 1024 || foto.buffer.length < 12)
      throw new AppError(
        'Selecciona una foto JPG, PNG o WEBP de hasta 5 MB.',
        400,
      );
    const bytes = foto.buffer;
    const mime =
      bytes.subarray(0, 3).toString('hex') === 'ffd8ff' &&
      bytes.subarray(-2).toString('hex') === 'ffd9'
        ? 'image/jpeg'
        : bytes.subarray(0, 8).toString('hex') === '89504e470d0a1a0a' &&
            bytes.subarray(-8, -4).toString() === 'IEND'
          ? 'image/png'
          : bytes.toString('ascii', 0, 4) === 'RIFF' &&
              bytes.toString('ascii', 8, 12) === 'WEBP' &&
              bytes.readUInt32LE(4) === bytes.length - 8
            ? 'image/webp'
            : null;
    if (!mime || foto.mimetype !== mime)
      throw new AppError('La imagen no es un JPG, PNG o WEBP válido.', 400);
    const detalle =
      descripcion === undefined || descripcion === ''
        ? ''
        : texto(descripcion, 'Descripción de la foto', 0, 500);
    const nombre =
      foto.originalname.replace(/[\\/\x00-\x1f]/g, '_').slice(0, 180) ||
      'evidencia';
    await repo.transaccion(async (c) => {
      const apoyo = existe(await repo.apoyo(aid, c));
      if (apoyo.estado !== 'Entregada')
        throw new AppError(
          'Confirma primero la entrega para adjuntar su evidencia.',
          409,
        );
      if ((await repo.evidencias(aid, c)).length >= 5)
        throw new AppError(
          'La entrega ya tiene el máximo de 5 fotografías.',
          400,
        );
      const guardada = await repo.guardarEvidencia(c, aid, a.id, {
        nombre,
        mime,
        buffer: bytes,
        descripcion: detalle,
        sha256: createHash('sha256').update(bytes).digest('hex'),
      });
      if (!guardada)
        throw new AppError(
          'Esta fotografía ya está adjunta a la entrega.',
          409,
        );
      await repo.evento(
        c,
        aid,
        a.id,
        'Entregada',
        `Evidencia fotográfica adjuntada: ${nombre}${detalle ? ' — ' + detalle : ''}`,
      );
    });
    return this.detalleApoyo(a, aid);
  },
  async verEvidencia(a: ActorAyuda, id: unknown) {
    const f = existe(await repo.evidencia(idPositivo(id)));
    const apoyo = existe(await repo.apoyo(f.id_apoyo));
    propietario(a, apoyo.beneficiario_usuario_id);
    return f;
  },
  async descargar(a: ActorAyuda, id: unknown) {
    const f = existe(await repo.adjunto(idPositivo(id)));
    const s = existe(await repo.solicitud(f.id_solicitud));
    propietario(a, s.beneficiario_usuario_id);
    return f;
  },
};
