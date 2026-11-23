// src/routes/donacionRoutes.ts
// ============================================================================
// Rutas /api/donaciones. Reutiliza verificarToken (sin modificarlo) y aplica
// la autorización propia del módulo. Las rutas literales van ANTES de /:id.
// ============================================================================
import { Router } from 'express';
import multer from 'multer';
import type { Request, Response, NextFunction } from 'express';
import { verificarToken } from '../middlewares/authMiddleware';
import { requerirRol } from '../middlewares/donacionAccess';
import { donacionController as c } from '../controllers/donacionController';
import { DonacionValidationError } from '../validators/donacionValidator';

const router = Router();
const fotosUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 5 }, fileFilter: (_req, file, cb) => {
  if (['image/jpeg','image/png','image/webp'].includes(file.mimetype)) cb(null, true);
  else cb(new Error('Formato de imagen no permitido.'));
} });

router.use(verificarToken);

const admin = requerirRol('Administrador');
const todos = requerirRol('Administrador', 'Donante', 'Voluntario', 'Beneficiario');
const registran = requerirRol('Administrador', 'Voluntario');

// --- Apoyo a formularios ---------------------------------------------------
router.get('/inventario', admin, c.inventario);
router.get('/:id(\\d+)/fotos', todos, c.fotos);
router.post('/:id(\\d+)/fotos', requerirRol('Administrador', 'Donante', 'Voluntario'), fotosUpload.array('fotos', 5), c.subirFotos);
router.get('/:id(\\d+)/fotos/:fotoId(\\d+)', todos, c.verFoto);
router.get('/catalogos', requerirRol('Administrador', 'Donante', 'Voluntario'), c.catalogos);
router.get('/campanas-activas', requerirRol('Administrador', 'Donante', 'Voluntario'), c.campanasActivas);
router.get('/donantes/buscar', registran, c.buscarDonantes);
router.get('/beneficiarios-asignables', admin, c.beneficiariosAsignables);

// --- Reportes y asignaciones (solo administrador) --------------------------
router.get('/reportes', admin, c.reporte);
router.get('/asignables', admin, c.asignables);
router.get('/asignaciones', admin, c.listarAsignaciones);
router.post('/asignaciones/:idAsignacion(\\d+)/cancelar', admin, c.cancelarAsignacion);
router.get('/entregas/pendientes', admin, c.entregasPendientes);
router.get('/entregas', admin, c.historialEntregas);
router.post('/entregas', admin, c.registrarEntrega);

// --- Registro --------------------------------------------------------------
router.post('/presencial', registran, c.registrarPresencial);
router.post('/', requerirRol('Donante'), c.registrarPropia);

// --- Consulta y gestión ----------------------------------------------------
router.get('/', todos, c.listar);
router.get('/:id(\\d+)', todos, c.obtener);
router.patch('/:id(\\d+)', admin, c.modificar);
router.post('/:id(\\d+)/anular', admin, c.anular);
router.post('/:id(\\d+)/recepciones', admin, c.registrarRecepcion);
router.post('/:id(\\d+)/asignaciones', admin, c.asignar);
router.get('/:id(\\d+)/auditoria', admin, c.auditoria);

// --- Errores del módulo ----------------------------------------------------
// La validación devuelve la lista completa de errores; el resto sigue al
// errorMiddleware global.
router.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof DonacionValidationError) {
    res.status(400).json({ error: err.message, errores: err.errores });
    return;
  }
  next(err);
});

export default router;
