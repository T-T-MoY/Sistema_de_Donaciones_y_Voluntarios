import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const verificarToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            error: 'Acceso denegado. No se proporcionó un token de autenticación.'
        });
    }

    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET as string);
        (req as any).usuario = decodificado;
        next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Sesión expirada por inactividad. Por favor, inicia sesión de nuevo.'
            });
        }
        return res.status(403).json({
            error: 'Token inválido o corrupto.'
        });
    }
};

const esAdmin = (req: Request, res: Response, next: NextFunction) => {
    const usuario = (req as any).usuario;
    const roles = (usuario?.roles || [usuario?.rol]).map((r: string) => r?.toLowerCase());
    if (!usuario || !roles.some((rol: string) => rol === 'admin' || rol === 'administrador')) {
        return res.status(403).json({
            error: 'Acceso denegado. Se requieren permisos de administrador.'
        });
    }
    next();
};

const esCoordinadorOAdmin = (req: Request, res: Response, next: NextFunction) => {
    const usuario = (req as any).usuario;
    const roles = (usuario?.roles || [usuario?.rol]).map((r: string) => r?.toLowerCase());
    const esCoord = Boolean(usuario?.es_coordinador);
    if (!usuario || (!roles.some((rol: string) => ['admin', 'administrador', 'coordinador'].includes(rol)) && !esCoord)) {
        return res.status(403).json({
            error: 'Acceso denegado. Se requieren permisos de Coordinador de Voluntariado o Administrador.'
        });
    }
    next();
};


const esCoordinador = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const usuario = (req as any).usuario;

    const roles = (
        usuario?.roles || [usuario?.rol]
    ).map((rol: string) => rol?.toLowerCase().trim());

    const esCoordinadorReal =
        usuario?.es_coordinador === true ||
        roles.includes('coordinador');

    if (!usuario || !esCoordinadorReal) {
        return res.status(403).json({
            error: 'Acceso denegado. Solo el coordinador puede gestionar la asistencia.'
        });
    }

    next();
};


export {verificarToken,esAdmin,esCoordinadorOAdmin,esCoordinador};
