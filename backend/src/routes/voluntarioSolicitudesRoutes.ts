import { Router } from 'express';
import {
  cambiarEstadoSolicitudVoluntarioAdmin,
  listarSolicitudesVoluntariosAdmin,
} from '../controllers/voluntarioSolicitudesController';
import { esCoordinadorOAdmin, verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/solicitudes', verificarToken, esCoordinadorOAdmin, listarSolicitudesVoluntariosAdmin);
router.patch('/solicitudes/:id', verificarToken, esCoordinadorOAdmin, cambiarEstadoSolicitudVoluntarioAdmin);

export default router;
