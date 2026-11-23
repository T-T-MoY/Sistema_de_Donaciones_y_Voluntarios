// src/controllers/authController.ts
// ============================================================================
// CAPA: Presentación (HTTP). Solo traduce req → service → res.
// No contiene reglas de negocio.
// ============================================================================
import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';

export const registrar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resultado = await authService.registrar(req.body);
    res.status(201).json(resultado);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, usuario } = await authService.login(req.body);
    res.status(200).json({ mensaje: 'Inicio de sesión exitoso', token, usuario });
  } catch (err) {
    next(err);
  }
};

export const solicitarRecuperacion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resultado = await authService.solicitarRecuperacion(req.body?.correo);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

export const validarToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resultado = await authService.validarToken(req.params.token);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resultado = await authService.resetPassword(req.body);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};