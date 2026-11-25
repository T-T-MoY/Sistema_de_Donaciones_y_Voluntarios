
import { Router } from 'express';

import { seguimientoController } from './seguimientoController';

import {
  verificarToken,
  esAdmin,
} from '../middlewares/authMiddleware';

const router = Router();

/**
 * Todas las rutas de seguimiento requieren:
 * 1. Tener una sesión autenticada.
 * 2. Tener el rol de Administrador.
 */
router.use(verificarToken);
router.use(esAdmin);

// ============================================================
// SEGUIMIENTO GENERAL
// ============================================================

// GET /seguimiento
router.get(
  '/',
  seguimientoController.obtenerSeguimiento
);

// ============================================================
// HISTORIAL INDIVIDUAL
// ============================================================

// GET /seguimiento/voluntarios/:id/historial
router.get(
  '/voluntarios/:id/historial',
  seguimientoController.obtenerHistorialVoluntario
);

// ============================================================
// DATOS PARA LOS FILTROS
// ============================================================

// GET /seguimiento/filtros/actividades
router.get(
  '/filtros/actividades',
  seguimientoController.obtenerActividadesFiltro
);

// GET /seguimiento/filtros/voluntarios
router.get(
  '/filtros/voluntarios',
  seguimientoController.obtenerVoluntariosFiltro
);

export default router;
