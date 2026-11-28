// src/repositories/usuarioRepository.ts
// ============================================================================
// CAPA: Acceso a datos (PostgreSQL · SQL puro).
// Único lugar del proyecto donde se ejecuta SQL sobre tablas de usuarios.
// ============================================================================
import { PoolClient } from 'pg';
import { pool } from '../config/database';
import { AppError } from '../utils/AppError';
import type {
  UsuarioRow,
  UsuarioResponse,
  UsuarioData,
  RolData,
  RolUsuario,
  UbicacionResponse,
  HistorialVoluntarioResponse,
  SolicitudVoluntarioResponse,
  SolicitudBeneficiarioResponse,
} from '../models/usuarioModel';

// ---------- Helpers de mapeo / normalización (privados del repo) ----------

export const normalizarRol = (rol?: string | null): RolUsuario => {
  const valor = (rol || '').toLowerCase().trim();
  if (valor === 'administrador' || valor === 'admin') return 'Administrador';
  if (valor === 'coordinador') return 'Coordinador';
  if (valor === 'beneficiario') return 'Beneficiario';
  if (valor === 'donante' || valor === 'cliente') return 'Donante';
  if (valor === 'voluntario' || valor === 'empleado') return 'Voluntario';
  return 'Usuario';
};

const splitApellido = (apellido: string | null): { paterno: string; materno: string } => {
  const partes = (apellido || '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return { paterno: '', materno: '' };
  if (partes.length === 1) return { paterno: partes[0], materno: '' };
  return { paterno: partes[0], materno: partes.slice(1).join(' ') };
};

const unirApellido = (paterno?: string | null, materno?: string | null): string =>
  [paterno, materno].map((p) => (p || '').trim()).filter(Boolean).join(' ');

type EstadoUsuario = 'Activo' | 'Inactivo' | 'Eliminado';

/** Convierte cualquier valor recibido (string/boolean) a un estado válido. */
const normalizarEstadoUsuario = (estado?: string | boolean | null): EstadoUsuario => {
  if (typeof estado === 'boolean') return estado ? 'Activo' : 'Inactivo';
  const valor = (estado || '').toLowerCase().trim();
  if (valor === 'eliminado') return 'Eliminado';
  if (['inactivo', 'inactive', 'bloqueado', 'false', '0', 'pendiente'].includes(valor)) return 'Inactivo';
  return 'Activo';
};

  /**
   * Estado permitido al crear/editar/cambiar estado desde la API:
   * "Eliminado" solo se asigna con eliminarUsuario(), nunca por estos caminos.
   */
  const estadoParaGuardar = (estado?: string | boolean | null): 'Activo' | 'Inactivo' =>
    normalizarEstadoUsuario(estado) === 'Inactivo' ? 'Inactivo' : 'Activo';
const normalizarTipoBeneficiario = (tipo?: string | null): string => {
  const valor = (tipo || '').toLowerCase().trim();
  if (valor === 'familia') return 'Familia';
  if (valor === 'institucion' || valor === 'institución') return 'Institucion';
  return 'Persona';
};

const normalizarEstadoBeneficiario = (estado?: string | null): string => {
  const valor = (estado || '').toLowerCase().trim();
  if (valor === 'verificado') return 'Verificado';
  if (valor === 'rechazado') return 'Rechazado';
  return 'Pendiente';
};

const mapearUsuario = (fila: UsuarioRow): UsuarioResponse => {
  const { paterno, materno } = splitApellido(fila.apellido);
  const rol = normalizarRol(fila.rol);
  const estado = normalizarEstadoUsuario(fila.estado);

  return {
    id_usuario: fila.id_usuario,
    id: fila.id_usuario,
    nombre: fila.nombre,
    apellido: fila.apellido || '',
    apellidos: fila.apellido || '',
    paterno,
    materno,
    correo: fila.correo,
    telefono: fila.telefono,
    ...(fila.contraseña !== undefined ? { contraseña: fila.contraseña } : {}),
    foto_url: fila.foto_url || null,
    estado,
    estado_cuenta: estado,
    activo: estado === 'Activo',
    fecha_registro: fila.fecha_registro,
    fecha_creacion: fila.fecha_registro,
    rol,
    roles: fila.roles || (rol === 'Usuario' ? [] : [rol]),
    tipo_beneficiario: fila.tipo_beneficiario,
    documento: fila.documento,
    ci_nit: fila.documento,
    direccion: fila.direccion_beneficiario ?? fila.direccion_donante ?? null,
    necesidad: fila.necesidad,
    descripcion: fila.descripcion,
    estado_beneficiario: fila.estado_beneficiario,
    revisado_por_beneficiario: fila.revisado_por_beneficiario ?? null,
    motivo_rechazo_beneficiario: fila.motivo_rechazo_beneficiario ?? null,
    ubi_latitud: fila.ubi_latitud,
    ubi_longitud: fila.ubi_longitud,
    habilidades: fila.habilidades || [],
    disponibilidad: fila.disponibilidad,
    es_coordinador: Boolean(fila.es_coordinador),
    es_donante: Boolean(fila.es_donante),
    estado_voluntario: fila.estado_voluntario ?? null,
    revisado_por_voluntario: fila.revisado_por_voluntario ?? null,
    motivo_rechazo_voluntario: fila.motivo_rechazo_voluntario ?? null,
    fecha_registro_voluntario: fila.fecha_registro_voluntario,
  };
};

const SELECT_USUARIO = `
    SELECT
        u.id_usuario, u.nombre, u.apellido, u.correo, u.telefono, u.foto_url, u.estado,
        u.fecha_registro,
        b.tipo_beneficiario, b.documento,
        b.direccion AS direccion_beneficiario,
        b.necesidad, b.descripcion,
        b.estado    AS estado_beneficiario,
        b.revisado_por AS revisado_por_beneficiario,
        b.motivo_rechazo AS motivo_rechazo_beneficiario,
        d.direccion AS direccion_donante,
        (d.id_usuario IS NOT NULL) AS es_donante,
        d.ubi_latitud, d.ubi_longitud,
        v.habilidades, v.disponibilidad,
        v.es_coordinador,
        v.estado    AS estado_voluntario,
        v.revisado_por AS revisado_por_voluntario,
        v.motivo_rechazo AS motivo_rechazo_voluntario,
        v.fecha_registro AS fecha_registro_voluntario,
        ARRAY_REMOVE(ARRAY[
            CASE WHEN a.id_usuario IS NOT NULL THEN 'Administrador' END,
            CASE WHEN v.id_usuario IS NOT NULL AND v.estado = 'Aprobado' AND v.es_coordinador = TRUE THEN 'Coordinador' END,
            CASE WHEN v.id_usuario IS NOT NULL AND v.estado = 'Aprobado' THEN 'Voluntario' END,
            CASE WHEN b.id_usuario IS NOT NULL AND b.estado = 'Verificado' THEN 'Beneficiario' END,
            CASE WHEN d.id_usuario IS NOT NULL THEN 'Donante' END
        ]::text[], NULL) AS roles,
        CASE
            WHEN a.id_usuario IS NOT NULL THEN 'Administrador'
            WHEN v.id_usuario IS NOT NULL AND v.estado = 'Aprobado' AND v.es_coordinador = TRUE THEN 'Coordinador'
            WHEN v.id_usuario IS NOT NULL AND v.estado = 'Aprobado' THEN 'Voluntario'
            WHEN b.id_usuario IS NOT NULL AND b.estado = 'Verificado' THEN 'Beneficiario'
            WHEN d.id_usuario IS NOT NULL THEN 'Donante'
            ELSE 'Usuario'
        END AS rol
    FROM usuario u
    LEFT JOIN administrador a ON u.id_usuario = a.id_usuario
    LEFT JOIN beneficiario  b ON u.id_usuario = b.id_usuario
    LEFT JOIN donante       d ON u.id_usuario = d.id_usuario
    LEFT JOIN voluntario    v ON u.id_usuario = v.id_usuario
`;

// ---------- Helpers de subtipos (privados) ----------

async function insertarSubtipo(
  client: PoolClient,
  id_usuario: number,
  rol: RolUsuario,
  rolData: RolData
): Promise<void> {
  if (rol === 'Administrador') {
    await client.query(
      `INSERT INTO administrador (id_usuario) VALUES ($1)`,
      [id_usuario]
    );
    return;
  }

  if (rol === 'Beneficiario') {
    await client.query(
      `INSERT INTO beneficiario
         (id_usuario, tipo_beneficiario, documento, direccion, necesidad, descripcion, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        id_usuario,
        normalizarTipoBeneficiario(rolData.tipo_beneficiario),
        (rolData.documento || '').trim(),
        (rolData.direccion || '').trim(),
        (rolData.necesidad || '').trim(),
        rolData.descripcion?.trim() || null,
        normalizarEstadoBeneficiario(rolData.estado_beneficiario),
      ]
    );
    return;
  }

  if (rol === 'Donante') {
    await client.query(
      `INSERT INTO donante (id_usuario, direccion, ubi_latitud, ubi_longitud)
       VALUES ($1, $2, $3, $4)`,
      [
        id_usuario,
        rolData.direccion?.trim() || null,
        rolData.ubi_latitud ?? null,
        rolData.ubi_longitud ?? null,
      ]
    );
    return;
  }

  if (rol === 'Voluntario' || rol === 'Coordinador') {
    const esCoord = rol === 'Coordinador' || Boolean(rolData.es_coordinador);
    const estadoVol = esCoord ? 'Aprobado' : (rolData.estado_voluntario || 'Pendiente');
    await client.query(
      `INSERT INTO voluntario (id_usuario, habilidades, disponibilidad, es_coordinador, estado)
       VALUES ($1, $2, $3, $4, $5)`,
      [id_usuario, rolData.habilidades || [], (rolData.disponibilidad || '').trim(), esCoord, estadoVol]
    );
  }
}

async function actualizarSubtipo(
  client: PoolClient,
  id_usuario: number | string,
  rol: RolUsuario,
  rolData: RolData
): Promise<void> {
  if (rol === 'Administrador') {
    await client.query(
      `INSERT INTO administrador (id_usuario) VALUES ($1)
       ON CONFLICT (id_usuario) DO NOTHING`,
      [id_usuario]
    );
    return;
  }

  if (rol === 'Beneficiario') {
    await client.query(
      `INSERT INTO beneficiario
         (id_usuario, tipo_beneficiario, documento, direccion, necesidad, descripcion, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id_usuario) DO UPDATE SET
         tipo_beneficiario = EXCLUDED.tipo_beneficiario,
         documento         = EXCLUDED.documento,
         direccion         = EXCLUDED.direccion,
         necesidad         = EXCLUDED.necesidad,
         descripcion       = EXCLUDED.descripcion,
         estado            = CASE WHEN EXCLUDED.estado = 'Verificado' THEN 'Verificado' ELSE beneficiario.estado END`,
      [
        id_usuario,
        normalizarTipoBeneficiario(rolData.tipo_beneficiario),
        (rolData.documento || '').trim(),
        (rolData.direccion || '').trim(),
        (rolData.necesidad || '').trim(),
        rolData.descripcion?.trim() || null,
        normalizarEstadoBeneficiario(rolData.estado_beneficiario),
      ]
    );
    return;
  }

  if (rol === 'Donante') {
    await client.query(
      `INSERT INTO donante (id_usuario, direccion, ubi_latitud, ubi_longitud)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id_usuario) DO UPDATE SET
         direccion    = EXCLUDED.direccion,
         ubi_latitud  = EXCLUDED.ubi_latitud,
         ubi_longitud = EXCLUDED.ubi_longitud`,
      [
        id_usuario,
        rolData.direccion?.trim() || null,
        rolData.ubi_latitud ?? null,
        rolData.ubi_longitud ?? null,
      ]
    );
    return;
  }

  if (rol === 'Voluntario' || rol === 'Coordinador') {
    const esCoord = rol === 'Coordinador' || Boolean(rolData.es_coordinador);
    const estadoVol = esCoord ? 'Aprobado' : (rolData.estado_voluntario || 'Pendiente');
    await client.query(
      `INSERT INTO voluntario (id_usuario, habilidades, disponibilidad, es_coordinador, estado)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id_usuario) DO UPDATE SET
         habilidades    = EXCLUDED.habilidades,
         disponibilidad = EXCLUDED.disponibilidad,
         es_coordinador = EXCLUDED.es_coordinador,
         estado         = CASE WHEN EXCLUDED.es_coordinador OR EXCLUDED.estado = 'Aprobado' THEN 'Aprobado' ELSE voluntario.estado END`,
      [id_usuario, rolData.habilidades || [], (rolData.disponibilidad || '').trim(), esCoord, estadoVol]
    );
  }
}

// ---------- Tokens de recuperación (en memoria) ----------
interface TokenRecuperacion {
  id_usuario: number;
  correo: string;
  fecha_expiracion_token: Date;
}
const tokensRecuperacion = new Map<string, TokenRecuperacion>();

// ============================================================================
// Repositorio público
// ============================================================================
export const usuarioRepository = {
  // ---------- Lecturas ----------

  async obtenerPorCorreo(correo: string): Promise<UsuarioResponse | undefined> {
    const query = `
      SELECT sub.*, u.password AS "contraseña"
      FROM (${SELECT_USUARIO} WHERE LOWER(u.correo) = LOWER($1)) sub
      JOIN usuario u ON u.id_usuario = sub.id_usuario
    `;
    const { rows } = await pool.query<UsuarioRow>(query, [correo.trim()]);
    return rows[0] ? mapearUsuario(rows[0]) : undefined;
  },

  async obtenerPorDocumento(
    documento: string
  ): Promise<{ id_usuario: number; documento: string } | undefined> {
    const { rows } = await pool.query(
      `SELECT id_usuario, documento FROM beneficiario WHERE documento = $1`,
      [documento.trim()]
    );
    return rows[0];
  },

  async obtenerTodos(): Promise<UsuarioResponse[]> {
    const { rows } = await pool.query<UsuarioRow>(
      `${SELECT_USUARIO} WHERE u.estado <> 'Eliminado' ORDER BY u.id_usuario DESC`
    );
    return rows.map(mapearUsuario);
  },

  async obtenerPorId(id_usuario: number | string): Promise<UsuarioResponse | undefined> {
    const { rows } = await pool.query<UsuarioRow>(
      `${SELECT_USUARIO} WHERE u.id_usuario = $1 AND u.estado <> 'Eliminado'`,
      [id_usuario]
    );
    return rows[0] ? mapearUsuario(rows[0]) : undefined;
  },

  // ---------- Escrituras ----------

  async crearUsuario(
    usuarioData: UsuarioData,
    rolData: RolData,
    rolesData?: Array<{ rol: RolUsuario; data: RolData }>
  ): Promise<{ id_usuario: number }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const roles = rolesData?.length ? rolesData : [{ rol: normalizarRol(usuarioData.rol), data: rolData }];

      const { rows } = await client.query<{ id_usuario: number }>(
        `INSERT INTO usuario (nombre, apellido, correo, telefono, password, foto_url, estado)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id_usuario`,
        [
          usuarioData.nombre.trim(),
          unirApellido(usuarioData.paterno, usuarioData.materno),
          usuarioData.correo.toLowerCase().trim(),
          usuarioData.telefono || null,
          usuarioData.contraseña,
          usuarioData.foto_url || null,
          estadoParaGuardar(usuarioData.estado_cuenta),
        ]
      );

      const id_usuario = rows[0].id_usuario;
      for (const item of roles) await insertarSubtipo(client, id_usuario, item.rol, item.data);

      await client.query('COMMIT');
      return { id_usuario };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async actualizarEstado(
    id_usuario: number | string,
    nuevoEstado: string | boolean
  ): Promise<
    | { id_usuario: number; nombre: string; correo: string; estado: string }
    | undefined
  > {
    const { rows } = await pool.query(
      `UPDATE usuario SET estado = $1
        WHERE id_usuario = $2 AND estado <> 'Eliminado'
        RETURNING id_usuario, nombre, correo, estado`,
      [estadoParaGuardar(nuevoEstado), id_usuario]
    );
    const fila = rows[0];
    if (!fila) return undefined;
    return {
      id_usuario: fila.id_usuario,
      nombre: fila.nombre,
      correo: fila.correo,
      estado: normalizarEstadoUsuario(fila.estado),
    };
  },

  async actualizarPerfil(
    id_usuario: number | string,
    datosUpdate: UsuarioData,
    rolData: RolData
  ): Promise<UsuarioResponse | undefined> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let queryUsuario = `UPDATE usuario SET nombre = $1, apellido = $2, correo = $3, telefono = $4`;
      const values: any[] = [
        datosUpdate.nombre.trim(),
        unirApellido(datosUpdate.paterno, datosUpdate.materno),
        datosUpdate.correo.toLowerCase().trim(),
        datosUpdate.telefono || null,
      ];
      let contador = 5;

      if (datosUpdate.contraseña) {
        queryUsuario += `, password = $${contador}`;
        values.push(datosUpdate.contraseña);
        contador++;
      }
      if (datosUpdate.foto_url !== undefined) {
        queryUsuario += `, foto_url = $${contador}`;
        values.push(datosUpdate.foto_url);
        contador++;
      }
      queryUsuario += ` WHERE id_usuario = $${contador}`;
      values.push(id_usuario);

      await client.query(queryUsuario, values);

      const rol = normalizarRol(datosUpdate.rol);
      if (rol !== 'Usuario') {
        await actualizarSubtipo(client, id_usuario, rol, rolData);
      }
      if (rol === 'Voluntario' || rol === 'Coordinador') {
        await client.query(
          `INSERT INTO donante (id_usuario, direccion) VALUES ($1, $2)
           ON CONFLICT (id_usuario) DO UPDATE SET direccion = EXCLUDED.direccion`,
          [id_usuario, rolData.direccion?.trim() || null]
        );
      }

      await client.query('COMMIT');
      return await usuarioRepository.obtenerPorId(id_usuario);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async actualizarUsuario(
    id_usuario: number | string,
    usuarioData: UsuarioData,
    rolData: RolData,
    rolesData?: Array<{ rol: RolUsuario; data: RolData }>,
    rolesToRemove: RolUsuario[] = []
  ): Promise<{ id_usuario: number | string }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let query = `UPDATE usuario SET nombre = $1, apellido = $2, correo = $3, telefono = $4, estado = $5`;
      const values: any[] = [
        usuarioData.nombre.trim(),
        unirApellido(usuarioData.paterno, usuarioData.materno),
        usuarioData.correo.toLowerCase().trim(),
        usuarioData.telefono || null,
        estadoParaGuardar(usuarioData.estado_cuenta),
      ];
      let contador = 6;

      if (usuarioData.contraseña) {
        query += `, password = $${contador}`;
        values.push(usuarioData.contraseña);
        contador++;
      }
      if (usuarioData.foto_url !== undefined) {
        query += `, foto_url = $${contador}`;
        values.push(usuarioData.foto_url);
        contador++;
      }
      query += ` WHERE id_usuario = $${contador}`;
      values.push(id_usuario);

      await client.query(query, values);

      for (const rol of rolesToRemove) {
        if (rol === 'Coordinador') {
          await client.query('UPDATE voluntario SET es_coordinador = FALSE WHERE id_usuario = $1', [id_usuario]);
        } else {
          const tablaPorRol: Partial<Record<RolUsuario, string>> = {
            Administrador: 'administrador',
            Beneficiario: 'beneficiario',
            Donante: 'donante',
            Voluntario: 'voluntario',
          };
          const tabla = tablaPorRol[rol];
          if (tabla) {
            await client.query('SAVEPOINT sp_remove_role');
            try {
              await client.query(`DELETE FROM ${tabla} WHERE id_usuario = $1`, [id_usuario]);
              await client.query('RELEASE SAVEPOINT sp_remove_role');
            } catch (fkError: any) {
              await client.query('ROLLBACK TO SAVEPOINT sp_remove_role');
              await client.query('RELEASE SAVEPOINT sp_remove_role');
              if (fkError?.code !== '23503') throw fkError;

              // Si hay registros históricos asociados, desactivamos el rol cuando es posible
              // o informamos con un 409 claro en vez de fallar con 500.
              if (rol === 'Voluntario') {
                await client.query(
                  `UPDATE voluntario SET es_coordinador = FALSE, estado = 'Rechazado' WHERE id_usuario = $1`,
                  [id_usuario]
                );
              } else if (rol === 'Beneficiario') {
                await client.query(
                  `UPDATE beneficiario SET estado = 'Rechazado' WHERE id_usuario = $1`,
                  [id_usuario]
                );
              } else {
                throw new AppError(
                  `No se puede quitar el rol ${rol} porque el usuario tiene registros asociados en el sistema. Podés añadirle otros roles sin quitar este.`,
                  409
                );
              }
            }
          }
        }
      }

      // Cambiar datos de un subtipo nunca elimina los demás roles del usuario.
      const roles = rolesData?.length ? rolesData : [{ rol: normalizarRol(usuarioData.rol), data: rolData }];
      for (const item of roles) await actualizarSubtipo(client, id_usuario, item.rol, item.data);

      await client.query('COMMIT');
      return { id_usuario };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async eliminarUsuario(
    id_usuario: number | string
  ): Promise<{ id_usuario: number } | undefined> {
    const { rows } = await pool.query(
      `UPDATE usuario SET estado = 'Eliminado'
        WHERE id_usuario = $1 AND estado <> 'Eliminado'
        RETURNING id_usuario`,
      [id_usuario]
    );
    return rows[0];
  },

  // ---------- Recuperación de contraseña (en memoria) ----------

  async guardarTokenRecuperacion(
    correo: string,
    token: string,
    fechaExpiracion: Date | string
  ): Promise<{ id_usuario: number; correo: string } | undefined> {
    const usuario = await usuarioRepository.obtenerPorCorreo(correo);
    if (!usuario) return undefined;

    tokensRecuperacion.set(token, {
      id_usuario: usuario.id_usuario,
      correo: usuario.correo,
      fecha_expiracion_token: new Date(fechaExpiracion),
    });
    return { id_usuario: usuario.id_usuario, correo: usuario.correo };
  },

  async obtenerPorTokenRecuperacion(token: string): Promise<UsuarioResponse | undefined> {
    const registro = tokensRecuperacion.get(token);
    if (!registro) return undefined;

    const usuario = await usuarioRepository.obtenerPorId(registro.id_usuario);
    if (!usuario) {
      tokensRecuperacion.delete(token);
      return undefined;
    }
    return {
      ...usuario,
      token_recuperacion: token,
      fecha_expiracion_token: registro.fecha_expiracion_token,
    };
  },

  async actualizarContraseñaConToken(
    id_usuario: number | string,
    nuevaContraseñaHash: string
  ): Promise<{ id_usuario: number; correo: string } | undefined> {
    const { rows } = await pool.query(
      `UPDATE usuario SET password = $1 WHERE id_usuario = $2
       RETURNING id_usuario, correo`,
      [nuevaContraseñaHash, id_usuario]
    );

    for (const [token, registro] of tokensRecuperacion.entries()) {
      if (String(registro.id_usuario) === String(id_usuario)) {
        tokensRecuperacion.delete(token);
      }
    }
    return rows[0];
  },

  // ---------- Ubicaciones geográficas de donantes ----------

  async obtenerUsuariosConUbicacion(): Promise<UbicacionResponse[]> {
    const query = `
      SELECT 
        u.id_usuario AS id,
        TRIM(CONCAT(u.nombre, ' ', COALESCE(u.apellido, ''))) AS nombre,
        u.apellido,
        d.ubi_latitud AS lat,
        d.ubi_longitud AS lng,
        d.direccion
      FROM donante d
      JOIN usuario u ON u.id_usuario = d.id_usuario
      WHERE d.ubi_latitud IS NOT NULL 
        AND d.ubi_longitud IS NOT NULL
        AND u.estado <> 'Eliminado'
      ORDER BY u.id_usuario ASC
    `;
    const { rows } = await pool.query<UbicacionResponse>(query);
    return rows;
  },

  async actualizarUbicacionDonante(
    id_usuario: number | string,
    latitud: number,
    longitud: number
  ): Promise<{ id_usuario: number; ubi_latitud: number; ubi_longitud: number }> {
    const query = `
      INSERT INTO donante (id_usuario, ubi_latitud, ubi_longitud)
      VALUES ($1, $2, $3)
      ON CONFLICT (id_usuario) DO UPDATE SET
        ubi_latitud = EXCLUDED.ubi_latitud,
        ubi_longitud = EXCLUDED.ubi_longitud
      RETURNING id_usuario, ubi_latitud, ubi_longitud
    `;
    const { rows } = await pool.query(query, [id_usuario, latitud, longitud]);
    return rows[0];
  },

  // ---------- Solicitudes de Voluntarios (Coordinador de Voluntariado) ----------

  async obtenerSolicitudesVoluntarios(filtroEstado?: string): Promise<SolicitudVoluntarioResponse[]> {
    let query = `
      SELECT
        v.id_usuario,
        u.nombre,
        u.apellido,
        u.correo,
        u.telefono,
        u.foto_url,
        v.habilidades,
        v.disponibilidad,
        v.fecha_registro,
        v.estado,
        v.es_coordinador,
        v.revisado_por,
        r.nombre || ' ' || r.apellido AS nombre_revisor,
        v.motivo_rechazo
      FROM voluntario v
      JOIN usuario u ON u.id_usuario = v.id_usuario
      LEFT JOIN usuario r ON r.id_usuario = v.revisado_por
      WHERE u.estado <> 'Eliminado'
    `;
    const params: any[] = [];
    if (filtroEstado) {
      params.push(filtroEstado);
      query += ` AND LOWER(v.estado) = LOWER($1)`;
    }
    query += ` ORDER BY v.fecha_registro DESC`;

    const { rows } = await pool.query(query, params);
    return rows;
  },

  async obtenerSolicitudesVoluntariosAdmin(filtroEstado?: string) {
    const solicitudes = await usuarioRepository.obtenerSolicitudesVoluntarios(filtroEstado);
    if (solicitudes.length === 0) {
      return solicitudes.map((solicitud) => ({ ...solicitud, historial: [] }));
    }

    const ids = solicitudes.map((solicitud) => solicitud.id_usuario);
    const { rows } = await pool.query<HistorialVoluntarioResponse & { id_voluntario: number }>(
      `SELECT
         h.id_voluntario,
         h.id_historial,
         h.estado_anterior,
         h.estado_nuevo,
         h.cambiado_por,
         u.nombre || ' ' || u.apellido AS nombre_revisor,
         h.motivo,
         h.fecha_cambio
       FROM historial_voluntario h
       LEFT JOIN usuario u ON u.id_usuario = h.cambiado_por
       WHERE h.id_voluntario = ANY($1::int[])
       ORDER BY h.id_voluntario, h.fecha_cambio ASC, h.id_historial ASC`,
      [ids]
    );
    const historialPorVoluntario = new Map<number, HistorialVoluntarioResponse[]>();
    for (const evento of rows) {
      const { id_voluntario, ...historial } = evento;
      const eventos = historialPorVoluntario.get(id_voluntario) ?? [];
      eventos.push(historial);
      historialPorVoluntario.set(id_voluntario, eventos);
    }

    return solicitudes.map((solicitud) => ({
      ...solicitud,
      historial: historialPorVoluntario.get(solicitud.id_usuario) ?? [],
    }));
  },

  async revisarSolicitudVoluntario(
    id_voluntario: number | string,
    nuevoEstado: 'Aprobado' | 'Rechazado',
    revisorId: number,
    motivoRechazo?: string
  ): Promise<{ id_usuario: number; estado: string }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE voluntario
         SET estado = $1, revisado_por = $2, fecha_revision = CURRENT_TIMESTAMP, motivo_rechazo = $3
         WHERE id_usuario = $4`,
        [nuevoEstado, revisorId, motivoRechazo?.trim() || null, id_voluntario]
      );

      // Si se aprueba, se activa la cuenta de usuario para que pueda acceder.
      // Un rechazo NO desactiva la cuenta: el usuario puede tener otros roles
      // (por ejemplo, donante) y solo se marca el subtipo `voluntario`.
      if (nuevoEstado === 'Aprobado') {
        await client.query(
          `UPDATE usuario SET estado = 'Activo' WHERE id_usuario = $1 AND estado <> 'Eliminado'`,
          [id_voluntario]
        );
      }

      await client.query('COMMIT');
      return { id_usuario: Number(id_voluntario), estado: nuevoEstado };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async revisarSolicitudVoluntarioAdmin(
    id_voluntario: number | string,
    nuevoEstado: 'Aprobado' | 'Rechazado',
    revisorId: number,
    motivoRechazo?: string
  ): Promise<{
    id_usuario: number;
    estado: string;
    historial: HistorialVoluntarioResponse;
  } | null> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const solicitud = await client.query<{ estado: 'Pendiente' | 'Aprobado' | 'Rechazado' }>(
        `SELECT estado
         FROM voluntario
         WHERE id_usuario = $1
         FOR UPDATE`,
        [id_voluntario]
      );
      if (solicitud.rowCount === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      await client.query(
        `UPDATE voluntario
         SET estado = $1, revisado_por = $2, fecha_revision = CURRENT_TIMESTAMP, motivo_rechazo = $3
         WHERE id_usuario = $4`,
        [nuevoEstado, revisorId, motivoRechazo?.trim() || null, id_voluntario]
      );

      if (nuevoEstado === 'Aprobado') {
        await client.query(
          `UPDATE usuario SET estado = 'Activo' WHERE id_usuario = $1 AND estado <> 'Eliminado'`,
          [id_voluntario]
        );
      }

      const { rows: historialRows } = await client.query<HistorialVoluntarioResponse>(
        `SELECT
           h.id_historial,
           h.estado_anterior,
           h.estado_nuevo,
           h.cambiado_por,
           u.nombre || ' ' || u.apellido AS nombre_revisor,
           h.motivo,
           h.fecha_cambio
         FROM historial_voluntario h
         LEFT JOIN usuario u ON u.id_usuario = h.cambiado_por
         WHERE h.id_voluntario = $1
         ORDER BY h.id_historial DESC
         LIMIT 1`,
        [id_voluntario]
      );

      await client.query('COMMIT');
      return {
        id_usuario: Number(id_voluntario),
        estado: nuevoEstado,
        historial: historialRows[0],
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // ---------- Solicitudes de Beneficiarios (Administrador) ----------

  async obtenerSolicitudesBeneficiarios(filtroEstado?: string): Promise<SolicitudBeneficiarioResponse[]> {
    let query = `
      SELECT
        b.id_usuario,
        u.nombre,
        u.apellido,
        u.correo,
        u.telefono,
        u.foto_url,
        b.tipo_beneficiario,
        b.documento,
        b.direccion,
        b.necesidad,
        b.descripcion,
        u.fecha_registro,
        b.estado,
        b.revisado_por,
        r.nombre || ' ' || r.apellido AS nombre_revisor,
        b.motivo_rechazo
      FROM beneficiario b
      JOIN usuario u ON u.id_usuario = b.id_usuario
      LEFT JOIN usuario r ON r.id_usuario = b.revisado_por
      WHERE u.estado <> 'Eliminado'
    `;
    const params: any[] = [];
    if (filtroEstado) {
      params.push(filtroEstado);
      query += ` AND LOWER(b.estado) = LOWER($1)`;
    }
    query += ` ORDER BY u.fecha_registro DESC`;

    const { rows } = await pool.query(query, params);
    return rows;
  },

  async revisarSolicitudBeneficiario(
    id_beneficiario: number | string,
    nuevoEstado: 'Verificado' | 'Rechazado',
    revisorId: number,
    motivoRechazo?: string
  ): Promise<{ id_usuario: number; estado: string }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE beneficiario
         SET estado = $1, revisado_por = $2, fecha_revision = CURRENT_TIMESTAMP, motivo_rechazo = $3
         WHERE id_usuario = $4`,
        [nuevoEstado, revisorId, motivoRechazo?.trim() || null, id_beneficiario]
      );

      if (nuevoEstado === 'Verificado') {
        await client.query(
          `UPDATE usuario SET estado = 'Activo' WHERE id_usuario = $1 AND estado <> 'Eliminado'`,
          [id_beneficiario]
        );
      }

      await client.query('COMMIT');
      return { id_usuario: Number(id_beneficiario), estado: nuevoEstado };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // ---------- Postulaciones desde Dashboard ----------

  async postularVoluntario(
    id_usuario: number | string,
    habilidades: string[],
    disponibilidad: string
  ): Promise<{ id_usuario: number; mensaje: string } | null> {
    const { rows } = await pool.query<{ id_usuario: number }>(
      `INSERT INTO voluntario (id_usuario, habilidades, disponibilidad, es_coordinador, estado)
       VALUES ($1, $2, $3, FALSE, 'Pendiente')
       ON CONFLICT (id_usuario) DO UPDATE SET
         habilidades = EXCLUDED.habilidades,
         disponibilidad = EXCLUDED.disponibilidad,
         estado = CASE WHEN voluntario.estado = 'Aprobado' OR voluntario.es_coordinador
                       THEN voluntario.estado ELSE 'Pendiente' END,
         revisado_por = CASE WHEN voluntario.estado = 'Aprobado' OR voluntario.es_coordinador
                             THEN voluntario.revisado_por ELSE NULL END,
         fecha_revision = CASE WHEN voluntario.estado = 'Aprobado' OR voluntario.es_coordinador
                               THEN voluntario.fecha_revision ELSE NULL END,
         motivo_rechazo = CASE WHEN voluntario.estado = 'Aprobado' OR voluntario.es_coordinador
                               THEN voluntario.motivo_rechazo ELSE NULL END
       WHERE voluntario.estado = 'Rechazado' AND voluntario.es_coordinador = FALSE
       RETURNING id_usuario`,
      [id_usuario, habilidades, disponibilidad]
    );

    if (!rows[0]) return null;

    return { id_usuario: Number(id_usuario), mensaje: 'Postulación a voluntariado enviada con éxito' };
  },

  async postularBeneficiario(
    id_usuario: number | string,
    datos: {
      tipo_beneficiario: string;
      documento: string;
      direccion: string;
      necesidad: string;
      descripcion?: string | null;
    }
  ): Promise<{ id_usuario: number; mensaje: string } | null> {
    const { rows } = await pool.query<{ id_usuario: number }>(
      `INSERT INTO beneficiario (id_usuario, tipo_beneficiario, documento, direccion, necesidad, descripcion, estado)
       VALUES ($1, $2, $3, $4, $5, $6, 'Pendiente')
       ON CONFLICT (id_usuario) DO UPDATE SET
         tipo_beneficiario = EXCLUDED.tipo_beneficiario,
         documento         = EXCLUDED.documento,
         direccion         = EXCLUDED.direccion,
         necesidad         = EXCLUDED.necesidad,
         descripcion       = EXCLUDED.descripcion,
         estado            = CASE WHEN beneficiario.estado = 'Verificado'
                                  THEN beneficiario.estado ELSE 'Pendiente' END,
         motivo_rechazo    = CASE WHEN beneficiario.estado = 'Verificado'
                                  THEN beneficiario.motivo_rechazo ELSE NULL END,
         revisado_por      = CASE WHEN beneficiario.estado = 'Verificado'
                                  THEN beneficiario.revisado_por ELSE NULL END,
         fecha_revision    = CASE WHEN beneficiario.estado = 'Verificado'
                                  THEN beneficiario.fecha_revision ELSE NULL END
       WHERE beneficiario.estado = 'Rechazado'
       RETURNING id_usuario`,
      [
        id_usuario,
        normalizarTipoBeneficiario(datos.tipo_beneficiario),
        datos.documento.trim(),
        datos.direccion.trim(),
        datos.necesidad.trim(),
        datos.descripcion?.trim() || null,
      ]
    );
    if (!rows[0]) return null;
    return { id_usuario: Number(id_usuario), mensaje: 'Solicitud de beneficiario enviada con éxito' };
  },
};
