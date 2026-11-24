import { Router } from 'express';
import { 
    registrar, 
    login, 
    refrescarSesion,
    solicitarRecuperacion, 
    validarToken, 
    resetPassword 
} from '../controllers/authController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/registrar', registrar);
router.post('/login', login);
router.post('/refresh', verificarToken, refrescarSesion);

router.post('/solicitar-recuperacion', solicitarRecuperacion);
router.get('/validar-token/:token', validarToken);
router.post('/reset-password', resetPassword);

export default router;
