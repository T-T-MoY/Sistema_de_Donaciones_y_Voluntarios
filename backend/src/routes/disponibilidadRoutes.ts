/**
 * ============================================================================
 * ARCHIVO: disponibilidadRoutes.ts
 * CAPA: Rutas (Sección 5 - Mi Disponibilidad)
 *
 * PROPÓSITO:
 * Exponer /api/voluntarios/mi-disponibilidad. Todas las rutas exigen token;
 * la pertenencia del horario y el registro de voluntario se validan en el
 * servicio, por lo que voluntarios y coordinadores pueden usarlas.
 * ============================================================================
 */

import { Router } from 'express';
import { disponibilidadController as c } from '../controllers/disponibilidadController';
import { disponibilidadEquipoController as eq } from '../controllers/disponibilidadEquipoController';
import { verificarToken, esCoordinadorOAdmin } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.use(verificarToken);

// ============================================================================
// SECCIÓN 5: MI DISPONIBILIDAD (Voluntario / Coordinador)
// ============================================================================
router.get('/mi-disponibilidad', asyncHandler(c.obtener));
router.post('/mi-disponibilidad', asyncHandler(c.crear));
router.put('/mi-disponibilidad/:id(\\d+)', asyncHandler(c.actualizar));
router.patch('/mi-disponibilidad/:id(\\d+)/estado', asyncHandler(c.cambiarEstado));

// ============================================================================
// SECCIÓN: DISPONIBILIDAD DE EQUIPO (Solo Coordinador / Administrador)
// ============================================================================
router.get('/disponibilidad-equipo', esCoordinadorOAdmin, asyncHandler(eq.obtenerDisponibilidadEquipo));
router.get('/disponibilidad-equipo/:id(\\d+)', esCoordinadorOAdmin, asyncHandler(eq.obtenerHorariosVoluntario));
router.get('/disponibilidad-equipo/:id(\\d+)/actividades', esCoordinadorOAdmin, asyncHandler(eq.obtenerActividadesVoluntario));

export default router;
