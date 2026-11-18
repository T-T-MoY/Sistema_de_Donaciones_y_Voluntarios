// src/middlewares/asyncHandler.ts
// Envuelve handlers async para que los errores caigan en errorMiddleware.
import type { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncHandler = (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };