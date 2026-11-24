/**
 * ============================================================================
 * ARCHIVO: disponibilidadController.ts
 * CAPA: Controlador (Sección 5 - Mi Disponibilidad)
 *
 * PROPÓSITO:
 * Traducir HTTP (req/res) a llamadas del servicio. Sin SQL y sin reglas de
 * negocio. Los errores los maneja asyncHandler + errorMiddleware.
 * ============================================================================
 */

import type { Request, Response } from 'express';
import { disponibilidadService } from '../services/disponibilidadService';

const idUsuarioActual = (req: Request): number => Number(req.usuario?.id_usuario);

export const disponibilidadController = {
  async obtener(req: Request, res: Response): Promise<void> {
    const datos = await disponibilidadService.obtenerMiDisponibilidad(
      idUsuarioActual(req)
    );
    res.status(200).json(datos);
  },

  async crear(req: Request, res: Response): Promise<void> {
    const horario = await disponibilidadService.crearHorario(
      idUsuarioActual(req),
      req.body
    );
    res.status(201).json({
      mensaje: 'Horario agregado exitosamente',
      horario,
    });
  },

  async actualizar(req: Request, res: Response): Promise<void> {
    const horario = await disponibilidadService.actualizarHorario(
      idUsuarioActual(req),
      req.params.id,
      req.body
    );
    res.status(200).json({
      mensaje: 'Horario actualizado exitosamente',
      horario,
    });
  },

  async cambiarEstado(req: Request, res: Response): Promise<void> {
    const horario = await disponibilidadService.cambiarEstado(
      idUsuarioActual(req),
      req.params.id,
      req.body?.estado
    );
    res.status(200).json({
      mensaje: horario.estado
        ? 'Horario activado exitosamente'
        : 'Horario desactivado exitosamente',
      horario,
    });
  },
};
