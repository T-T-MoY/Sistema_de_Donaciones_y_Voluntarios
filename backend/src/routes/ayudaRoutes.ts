import { Router } from 'express';
import multer from 'multer';
import { verificarToken } from '../middlewares/authMiddleware';
import { ayudaController as c } from '../controllers/ayudaController';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../middlewares/asyncHandler';
import { ayudaService } from '../services/ayudaService';

const router = Router();
const subir = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5, fields: 0 },
}).array('archivos', 5);
const subirFoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 1, fieldSize: 2000 },
}).single('foto');
router.use(verificarToken);
router.get('/acceso', c.acceso);
router.get('/catalogos', c.catalogos);
router.get('/beneficiarios', c.fichas);
router.post('/beneficiarios', c.crearFicha);
router.put('/beneficiarios/:id', c.editarFicha);
router.get('/solicitudes', c.solicitudes);
router.post('/solicitudes', c.crearSolicitud);
router.get('/solicitudes/:id', c.solicitud);
router.put('/solicitudes/:id', c.editarSolicitud);
router.post('/solicitudes/:id/evaluaciones', c.evaluar);
router.post(
  '/solicitudes/:id/adjuntos',
  (req, res, next) =>
    subir(req, res, (e) =>
      next(
        e
          ? new AppError(
              'Adjunta hasta 5 PDF, JPG o PNG de máximo 10 MB cada uno.',
              400,
            )
          : undefined,
      ),
    ),
  c.adjuntar,
);
router.get('/adjuntos/:id', c.descargar);
router.get('/apoyos', c.apoyos);
router.post('/apoyos', c.crearApoyo);
router.get('/apoyos/:id', c.apoyo);
router.put('/apoyos/:id', c.editarApoyo);
router.post(
  '/apoyos/:id/evidencias',
  asyncHandler(async (req, _res, next) => {
    const actor = await ayudaService.actor(
      req.usuario?.id_usuario ?? req.usuario?.id,
    );
    if (!actor.admin)
      throw new AppError(
        'Solo un administrador puede adjuntar evidencias de entrega.',
        403,
      );
    next();
  }),
  (req, res, next) =>
    subirFoto(req, res, (e) =>
      next(
        e
          ? new AppError(
              'Selecciona una sola imagen de hasta 5 MB y una descripción de máximo 500 caracteres.',
              400,
            )
          : undefined,
      ),
    ),
  c.subirEvidencia,
);
router.get('/evidencias/:id', c.verEvidencia);
export default router;
