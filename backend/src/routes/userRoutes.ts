import { Router, Request } from 'express';
import { 
    obtenerPerfil, 
    actualizarPerfil, 
    listarUsuarios, 
    crearUsuario, 
    cambiarEstadoUsuario, 
    actualizarUsuario, 
    eliminarUsuario, 
    obtenerUsuarioCompletoPorId,
    obtenerUsuariosConUbicacion,
    actualizarMiUbicacion,
    obtenerSolicitudesVoluntarios,
    revisarSolicitudVoluntario,
    obtenerSolicitudesBeneficiarios,
    revisarSolicitudBeneficiario,
    activarPerfilDonante,
    postularVoluntario,
    postularBeneficiario
} from '../controllers/userController';
import { verificarToken, esAdmin, esCoordinadorOAdmin } from '../middlewares/authMiddleware';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

const storage = multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        const dir = './uploads/perfiles';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('El archivo no es una imagen válida'));
    }
};

const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Rutas de perfil (cualquier usuario autenticado)
router.get('/perfil', verificarToken, obtenerPerfil);
router.put('/perfil', verificarToken, upload.single('foto'), actualizarPerfil);

// Rutas de ubicación geográfica (donantes / mapa)
router.get('/ubicaciones', verificarToken, obtenerUsuariosConUbicacion);
router.post('/mi-ubicacion', verificarToken, actualizarMiUbicacion);

// Rutas de postulaciones (cualquier usuario autenticado puede solicitar)
router.post('/postular/donante', verificarToken, activarPerfilDonante);
router.post('/postular/voluntario', verificarToken, postularVoluntario);
router.post('/postular/beneficiario', verificarToken, postularBeneficiario);

// Rutas de solicitudes de voluntarios (Coordinador de Voluntariado o Administrador)
router.get('/solicitudes/voluntarios', verificarToken, esCoordinadorOAdmin, obtenerSolicitudesVoluntarios);
router.patch('/solicitudes/voluntarios/:id', verificarToken, esCoordinadorOAdmin, revisarSolicitudVoluntario);

// Rutas de solicitudes de beneficiarios (Administrador)
router.get('/solicitudes/beneficiarios', verificarToken, esAdmin, obtenerSolicitudesBeneficiarios);
router.patch('/solicitudes/beneficiarios/:id', verificarToken, esAdmin, revisarSolicitudBeneficiario);

// Rutas CRUD de usuarios (solo administradores)
router.get('/', verificarToken, esAdmin, listarUsuarios);
router.post('/', verificarToken, esAdmin, crearUsuario);
router.put('/estado/:id', verificarToken, esAdmin, cambiarEstadoUsuario);
router.put('/:id', verificarToken, esAdmin, actualizarUsuario);
router.delete('/:id', verificarToken, esAdmin, eliminarUsuario);

router.get('/:id', verificarToken, esAdmin, obtenerUsuarioCompletoPorId);

export default router;
