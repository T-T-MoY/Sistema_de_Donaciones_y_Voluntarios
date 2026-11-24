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
import { verificarToken } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.use(verificarToken);

router.get('/mi-disponibilidad', asyncHandler(c.obtener));
router.post('/mi-disponibilidad', asyncHandler(c.crear));
router.put('/mi-disponibilidad/:id(\\d+)', asyncHandler(c.actualizar));
router.patch('/mi-disponibilidad/:id(\\d+)/estado', asyncHandler(c.cambiarEstado));

export default router;
