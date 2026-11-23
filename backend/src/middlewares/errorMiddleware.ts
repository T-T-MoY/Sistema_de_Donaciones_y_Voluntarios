// src/middlewares/errorMiddleware.ts
// Handler global de errores. Centraliza la traducción de errores a JSON HTTP.
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

interface PgError extends Error {
  code?: string;
  constraint?: string;
}

export const errorMiddleware = (
  err: Error | AppError | PgError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Errores de negocio (AppError) → status controlado
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Errores de PostgreSQL
  const pg = err as PgError;
  if (pg.code === '23505') {
    const constraint = String(pg.constraint || '');
    if (constraint.includes('correo')) {
      res.status(400).json({ error: 'El correo ya está registrado' });
      return;
    }
    if (constraint.includes('documento')) {
      res.status(400).json({ error: 'El documento (CI / NIT) ya está registrado' });
      return;
    }
    res.status(400).json({ error: 'Datos duplicados' });
    return;
  }

  // Errores de multer / tamaño de archivo
  if ((err as any)?.name === 'MulterError') {
    res.status(400).json({ error: 'Archivo inválido o demasiado grande (máx. 5MB).' });
    return;
  }

  if (err.message === 'Formato de imagen no permitido.') {
    res.status(400).json({ error: 'Formato de imagen no permitido. Usa JPG, PNG o WEBP.' });
    return;
  }

  console.error('💥 Error no controlado:', err);
  res.status(500).json({
    error:
      process.env.NODE_ENV === 'development'
        ? err.message || 'Error interno del servidor'
        : 'Error interno del servidor',
  });
};

export const notFoundMiddleware = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `La ruta [${req.method}] ${req.originalUrl} no existe en este servidor`,
  });
};