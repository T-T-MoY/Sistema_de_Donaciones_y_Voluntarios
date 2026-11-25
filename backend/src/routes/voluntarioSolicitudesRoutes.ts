import { Router } from 'express';
import {
  cambiarEstadoSolicitudVoluntarioAdmin,
  listarSolicitudesVoluntariosAdmin,
} from '../controllers/voluntarioSolicitudesController';
import { esAdmin, verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/solicitudes', verificarToken, esAdmin, listarSolicitudesVoluntariosAdmin);
router.patch('/solicitudes/:id', verificarToken, esAdmin, cambiarEstadoSolicitudVoluntarioAdmin);

export default router;
