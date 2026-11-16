// src/utils/AppError.ts
// Error de negocio tipado con código HTTP. Permite que las capas de servicio
// comuniquen fallos sin acoplarse a Express.
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}