// src/controllers/userController.ts
// ============================================================================
// CAPA: Presentación (HTTP). Solo traduce req → service → res.
// ============================================================================
import { Request, Response, NextFunction } from 'express';
import { usuarioService } from '../services/usuarioService';

const getUserId = (req: Request): number => {
  const id = req.usuario?.id_usuario;
  return Number(id);
};

// ---------- Perfil ----------
export const obtenerPerfil = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const perfil = await usuarioService.obtenerPerfil(getUserId(req));
    res.status(200).json(perfil);
  } catch (err) {
    next(err);
  }
};

export const actualizarPerfil = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resultado = await usuarioService.actualizarPerfil(getUserId(req), req.body);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

// ---------- CRUD admin ----------
export const listarUsuarios = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const usuarios = await usuarioService.listarUsuarios();
    res.status(200).json(usuarios);
  } catch (err) {
    next(err);
  }
};

export const cambiarEstadoUsuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resultado = await usuarioService.cambiarEstado(req.params.id, req.body.estado);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

export const crearUsuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resultado = await usuarioService.crearUsuario(req.body);
    res.status(201).json(resultado);
  } catch (err) {
    next(err);
  }
};

export const actualizarUsuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resultado = await usuarioService.actualizarUsuario(req.params.id, req.body);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

export const eliminarUsuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resultado = await usuarioService.eliminarUsuario(req.params.id);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

export const obtenerUsuarioCompletoPorId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const usuario = await usuarioService.obtenerPorId(req.params.id);
    res.status(200).json(usuario);
  } catch (err) {
    next(err);
  }
};

// ---------- Ubicaciones geográficas (donantes / mapa) ----------
export const obtenerUsuariosConUbicacion = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const ubicaciones = await usuarioService.obtenerUsuariosConUbicacion();
    res.status(200).json(ubicaciones);
  } catch (err) {
    next(err);
  }
};

export const actualizarMiUbicacion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resultado = await usuarioService.actualizarMiUbicacion(getUserId(req), req.body);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};