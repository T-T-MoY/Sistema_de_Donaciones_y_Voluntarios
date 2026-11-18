// src/validators/usuarioValidator.ts
// ============================================================================
// Validaciones HTTP opcionales (middlewares).
// La validación de negocio vive en services/*. Aquí solo validamos la
// estructura mínima del body para fallar rápido antes de tocar la BD.
// ============================================================================
import { Request, Response, NextFunction } from 'express';
import { esCorreoValido } from '../utils/validaciones';

export const requerirCampos = (campos: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const faltantes = campos.filter((c) => {
      const v = req.body?.[c];
      return v === undefined || v === null || String(v).trim() === '';
    });
    if (faltantes.length > 0) {
      res.status(400).json({ error: `Campos requeridos: ${faltantes.join(', ')}` });
      return;
    }
    next();
  };

export const validarCorreo = (req: Request, res: Response, next: NextFunction): void => {
  const correo = req.body?.correo;
  if (correo && !esCorreoValido(correo)) {
    res.status(400).json({ error: 'El correo no tiene un formato válido.' });
    return;
  }
  next();
};