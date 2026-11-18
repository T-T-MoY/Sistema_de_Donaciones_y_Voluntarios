/**
 * ============================================================================
 * ARCHIVO: app.ts
 * CAPA: Configuración de la Aplicación Express
 *
 * PROPÓSITO:
 * Centraliza la configuración de Express y el registro de todas las rutas
 * del sistema de donaciones y voluntariado.
 *
 * NOTA ARQUITECTURA MULTICAPA:
 * El manejo de errores y el 404 se delegan a middlewares dedicados
 * (errorMiddleware / notFoundMiddleware) para mantener la capa de
 * presentación limpia y centralizada.
 * ============================================================================
 */

import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';

// ============================================================================
// IMPORTACIÓN DE RUTAS
// ============================================================================

// Gestión de usuarios y autenticación
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

// ============================================================================
// IMPORTACIÓN DE MIDDLEWARES GLOBALES
// ============================================================================

import { errorMiddleware, notFoundMiddleware } from './middlewares/errorMiddleware';

// ============================================================================
// INICIALIZACIÓN DE EXPRESS
// ============================================================================

export const app: Application = express();

// ============================================================================
// MIDDLEWARES GLOBALES
// ============================================================================

// CORS
// En producción, FRONTEND_URL debe apuntar al dominio de Vercel.
// En desarrollo, acepta localhost:5173.
const allowedOrigins = [
  process.env.FRONTEND_URL,          // https://tu-app.vercel.app (Vercel)
  'http://localhost:5173',            // Vite dev server
  'http://localhost:4000',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite peticiones sin Origin (Postman, Render health-checks, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS bloqueado para: ${origin}`));
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Permite recibir JSON
app.use(express.json());

// Archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Logger simple
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`📡 [${req.method}] ${req.url} - ${new Date().toLocaleTimeString()}`);
  next();
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend de Donaciones y Voluntariado funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// RUTAS DE LA API
// ============================================================================

// Autenticación
app.use('/api/auth', authRoutes);

// Gestión de usuarios
app.use('/api/usuarios', userRoutes);

// ============================================================================
// RUTA PRINCIPAL
// ============================================================================

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'API del sistema de donaciones y voluntariado funcionando correctamente',
  });
});

// ============================================================================
// RUTA 404 (middleware dedicado)
// ============================================================================

app.use(notFoundMiddleware);

// ============================================================================
// MANEJO GLOBAL DE ERRORES (middleware dedicado)
// ============================================================================

app.use(errorMiddleware);

export default app;