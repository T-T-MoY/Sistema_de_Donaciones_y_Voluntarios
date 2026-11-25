import { Request, Response, NextFunction } from 'express';
import { usuarioService } from '../services/usuarioService';

const getUserId = (req: Request): number => Number(req.usuario?.id_usuario);

export const listarSolicitudesVoluntariosAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const solicitudes = await usuarioService.obtenerSolicitudesVoluntariosAdmin(
      typeof req.query.estado === 'string' ? req.query.estado : undefined
    );
    res.status(200).json(solicitudes);
  } catch (error) {
    next(error);
  }
};

export const cambiarEstadoSolicitudVoluntarioAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { estado, motivo_rechazo } = req.body as {
      estado?: string;
      motivo_rechazo?: string;
    };
    const resultado = await usuarioService.revisarSolicitudVoluntarioAdmin(
      req.params.id,
      estado ?? '',
      getUserId(req),
      motivo_rechazo
    );
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};
