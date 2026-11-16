// src/services/authService.ts
// ============================================================================
// CAPA: Negocio (autenticación).
// Reglas de negocio: validar datos, hashear contraseñas, emitir JWT,
// gestionar recuperación de contraseña. No conoce Express.
// ============================================================================
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

import { usuarioRepository, normalizarRol } from '../repositories/usuarioRepository';
import { AppError } from '../utils/AppError';
import {
  validarDatosUsuario,
  esContraseñaSegura,
  esCorreoValido,
  esCiNitValido,
} from '../utils/validaciones';
import type { UsuarioResponse } from '../models/usuarioModel';

// ---------- Nodemailer (SMTP) ----------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

transporter.verify((error) => {
  if (error) console.error('Error al configurar Nodemailer:', error.message);
  else console.log('Nodemailer listo para enviar correos');
});

const construirDireccion = (
  calle?: string | null,
  zona?: string | null,
  ciudad?: string | null
): string | null => {
  const partes = [calle, zona, ciudad]
    .map((p) => (p || '').trim())
    .filter(Boolean);
  return partes.length ? partes.join(', ') : null;
};

const firmarToken = (usuario: UsuarioResponse): string =>
  jwt.sign(
    {
      id: usuario.id_usuario,
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      rol: usuario.rol,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: '8h' }
  );

// ============================================================================
// Servicio público
// ============================================================================
export const authService = {
  // ---------- Registro público (Donante) ----------
  async registrar(dto: {
    nombre: string;
    paterno: string;
    materno?: string;
    correo: string;
    telefono: string | number;
    contraseña: string;
    ci_nit?: string;
    calle?: string;
    zona?: string;
    ciudad?: string;
  }): Promise<{ id_usuario: number }> {
    const validacion = validarDatosUsuario(dto);
    if (!validacion.valido) throw new AppError(validacion.error!, 400);

    const validacionPwd = esContraseñaSegura(dto.contraseña);
    if (!validacionPwd.valido) throw new AppError(validacionPwd.error!, 400);

    if (dto.ci_nit && !esCiNitValido(dto.ci_nit)) {
      throw new AppError('El CI/NIT debe tener entre 5 y 15 dígitos numéricos.', 400);
    }
    if (dto.calle && String(dto.calle).trim().length > 150) {
      throw new AppError('La calle no puede superar los 150 caracteres.', 400);
    }

    const correo = dto.correo.toLowerCase().trim();
    const existente = await usuarioRepository.obtenerPorCorreo(correo);
    if (existente) throw new AppError('El correo ya está registrado', 400);

    const hash = await bcrypt.hash(dto.contraseña, 10);

    return usuarioRepository.crearUsuario(
      {
        nombre: dto.nombre.trim(),
        paterno: dto.paterno.trim(),
        materno: dto.materno?.trim() || null,
        correo,
        telefono: String(dto.telefono).trim(),
        contraseña: hash,
        estado_cuenta: 'Activo',
        rol: 'Donante',
      },
      { direccion: construirDireccion(dto.calle, dto.zona, dto.ciudad) }
    );
  },

  // ---------- Login ----------
  async login(dto: { correo: string; contraseña: string }): Promise<{
    token: string;
    usuario: {
      id: number;
      id_usuario: number;
      nombre: string;
      apellido: string;
      correo: string;
      telefono: string | null;
      estado: string;
      rol: string;
    };
  }> {
    const { correo, contraseña } = dto;
    if (!correo || !contraseña) {
      throw new AppError('Correo y contraseña son obligatorios.', 400);
    }
    if (!esCorreoValido(correo)) {
      throw new AppError('El correo no tiene un formato válido.', 400);
    }
    if (String(contraseña).length < 6) {
      throw new AppError('Contraseña inválida.', 400);
    }

    const usuario = await usuarioRepository.obtenerPorCorreo(correo.toLowerCase().trim());
    if (!usuario || !usuario.contraseña) {
      throw new AppError('Credenciales inválidas', 401);
    }
    if (usuario.activo === false) {
      throw new AppError('Tu cuenta ha sido desactivada', 403);
    }

    const hash = usuario.contraseña;
    const esHash = /^\$2[aby]\$/.test(hash);
    const ok = esHash
      ? await bcrypt.compare(contraseña, hash)
      : contraseña === hash; // compatibilidad con texto plano legado

    if (!ok) throw new AppError('Credenciales inválidas', 401);

    const token = firmarToken(usuario);
    return {
      token,
      usuario: {
        id: usuario.id_usuario,
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        telefono: usuario.telefono,
        estado: usuario.estado,
        rol: usuario.rol,
      },
    };
  },

  // ---------- Solicitar recuperación ----------
  async solicitarRecuperacion(correo: string): Promise<{ mensaje: string }> {
    if (!correo) throw new AppError('El correo es obligatorio.', 400);
    if (!esCorreoValido(correo)) {
      throw new AppError('El correo no tiene un formato válido.', 400);
    }

    const correoNorm = correo.toLowerCase().trim();
    const usuario = await usuarioRepository.obtenerPorCorreo(correoNorm);

    // Respuesta idéntica exista o no (anti-enumeración)
    const RESPUESTA = { mensaje: 'Si el correo está registrado, te enviamos las instrucciones.' };
    if (!usuario) return RESPUESTA;

    const token = crypto.randomBytes(32).toString('hex');
    const fechaExp = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    await usuarioRepository.guardarTokenRecuperacion(correoNorm, token, fechaExp);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const link = `${frontendUrl}/reset-password?token=${token}`;

    try {
      await transporter.sendMail({
        from: `"Donaciones y Voluntariado" <${process.env.EMAIL_USER}>`,
        to: correo,
        subject: 'Recuperación de contraseña — Donaciones y Voluntariado',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1C3B34, #101010); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #F6EADA; margin: 0; font-size: 24px;">Donaciones y Voluntariado</h1>
            </div>
            <div style="background: #FBF3E8; padding: 30px; border-radius: 0 0 12px 12px;">
              <h2 style="color: #101010; margin-top: 0;">Recuperación de contraseña</h2>
              <p style="color: #5A5350; line-height: 1.6;">Hola <strong>${usuario.nombre}</strong>,</p>
              <p style="color: #5A5350; line-height: 1.6;">Recibimos una solicitud para restablecer tu contraseña:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="display: inline-block; background: #1C3B34; color: #F6EADA; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: bold;">Restablecer contraseña</a>
              </div>
              <p style="color: #5A5350; font-size: 14px;">O copiá este enlace:<br><span style="color: #1C3B34; word-break: break-all;">${link}</span></p>
              <p style="color: #5A5350; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E0D2BC;">⏰ Expira en <strong>1 hora</strong>.</p>
            </div>
          </div>
        `,
      });
    } catch (mailError: any) {
      console.error('No se pudo enviar el correo:', mailError?.message);
      console.log('Enlace de recuperación (modo desarrollo):', link);
    }

    return RESPUESTA;
  },

  // ---------- Validar token ----------
  async validarToken(token: string): Promise<{ valido: true; correo: string }> {
    if (!token) throw new AppError('Token no proporcionado', 400);

    const usuario = await usuarioRepository.obtenerPorTokenRecuperacion(token);
    if (!usuario) throw new AppError('Token inválido', 404);

    if (!usuario.fecha_expiracion_token || new Date() > new Date(usuario.fecha_expiracion_token)) {
      throw new AppError('El token ha expirado', 400);
    }

    return { valido: true, correo: usuario.correo };
  },

  // ---------- Reset password ----------
  async resetPassword(dto: { token: string; nuevaContraseña: string }): Promise<{ mensaje: string }> {
    const { token, nuevaContraseña } = dto;
    if (!token || !nuevaContraseña) {
      throw new AppError('Token y contraseña son obligatorios.', 400);
    }

    const validacionPwd = esContraseñaSegura(nuevaContraseña);
    if (!validacionPwd.valido) throw new AppError(validacionPwd.error!, 400);

    const usuario = await usuarioRepository.obtenerPorTokenRecuperacion(token);
    if (!usuario) throw new AppError('Token inválido o ya utilizado', 404);

    if (!usuario.fecha_expiracion_token || new Date() > new Date(usuario.fecha_expiracion_token)) {
      throw new AppError('El token ha expirado. Solicitá uno nuevo.', 400);
    }

    const hash = await bcrypt.hash(nuevaContraseña, 10);
    await usuarioRepository.actualizarContraseñaConToken(usuario.id_usuario, hash);

    return { mensaje: 'Contraseña actualizada con éxito' };
  },
};