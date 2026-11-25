/**
 * ============================================================================
 * ARCHIVO: disponibilidadEquipoController.ts
 * CAPA: Controlador (Disponibilidad de Voluntarios - Coordinador)
 *
 * PROPÓSITO:
 * Recibir la petición HTTP para consultar la disponibilidad del equipo
 * de voluntarios y delegar al servicio.
 * ============================================================================
 */

import type { Request, Response } from 'express';
import { disponibilidadEquipoService } from '../services/disponibilidadEquipoService';

export const disponibilidadEquipoController = {
  async obtenerDisponibilidadEquipo(req: Request, res: Response): Promise<void> {
    const { dia, busqueda } = req.query;
    const voluntarios = await disponibilidadEquipoService.obtenerDisponibilidadEquipo({
      dia,
      busqueda,
    });
    res.status(200).json(voluntarios);
  },

  async obtenerHorariosVoluntario(req: Request, res: Response): Promise<void> {
    const idVoluntario = Number(req.params.id);
    const horarios = await disponibilidadEquipoService.obtenerHorariosVoluntario(idVoluntario);
    res.status(200).json(horarios);
  },

  async obtenerActividadesVoluntario(req: Request, res: Response): Promise<void> {
    const idVoluntario = Number(req.params.id);
    const actividades = await disponibilidadEquipoService.obtenerActividadesVoluntario(idVoluntario);
    res.status(200).json(actividades);
  },
};
