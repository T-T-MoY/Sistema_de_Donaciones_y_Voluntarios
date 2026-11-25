
/**
 * ============================================================================
 * ARCHIVO: app.ts
 * CAPA: Configuración de la Aplicación Express
 *
 * PROPÓSITO:
 * Centraliza la configuración de Express y el registro de todas las rutas
 * del sistema de donaciones y voluntariado.
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
import donacionRoutes from './routes/donacionRoutes';
import campanaRoutes from './routes/campanaRoutes';

// Gestión de voluntarios
import disponibilidadRoutes from './routes/disponibilidadRoutes';
import voluntarioSolicitudesRoutes from './routes/voluntarioSolicitudesRoutes';

// Seguimiento general del voluntariado
import seguimientoRoutes from './seguimiento/seguimientoRoutes';

// ============================================================================
// IMPORTACIÓN DE MIDDLEWARES GLOBALES
// ============================================================================

import { errorMiddleware, notFoundMiddleware } from './middlewares/errorMiddleware';

// ============================================================================
// INICIALIZACIÓN DE EXPRESS
// ============================================================================

export const app: Application = express();

app.disable('x-powered-by');

// ============================================================================
// MIDDLEWARES GLOBALES
// ============================================================================

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

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

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/donaciones', donacionRoutes);

// Gestión de campañas y actividades
app.use('/api/campanas', campanaRoutes);

// Gestión de voluntarios: Mi Disponibilidad
app.use('/api/voluntarios', disponibilidadRoutes);
app.use('/api/voluntarios', voluntarioSolicitudesRoutes);

// Seguimiento general del voluntariado
app.use('/api/seguimiento', seguimientoRoutes);

// ============================================================================
// RUTA PRINCIPAL
// ============================================================================

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'API del sistema de donaciones y voluntariado funcionando correctamente',
  });
});

// ============================================================================
// RUTA 404 Y MANEJO GLOBAL DE ERRORES
// ============================================================================

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
