
import type { Request, Response, NextFunction } from 'express';

import { seguimientoService } from './seguimientoService';

/**
 * Convierte un parámetro de consulta en texto.
 */
const obtenerTexto = (valor: unknown): string | undefined => {
  if (typeof valor !== 'string') {
    return undefined;
  }

  const texto = valor.trim();
  return texto.length > 0 ? texto : undefined;
};

/**
 * Valida que una fecha tenga el formato YYYY-MM-DD
 * y que sea una fecha real.
 */
const validarFecha = (fecha: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return false;
  }

  const fechaObjeto = new Date(`${fecha}T00:00:00.000Z`);

  return (
    !Number.isNaN(fechaObjeto.getTime()) &&
    fechaObjeto.toISOString().slice(0, 10) === fecha
  );
};

/**
 * Convierte un parámetro en un número entero positivo.
 */
const obtenerId = (valor: unknown): number | undefined => {
  if (typeof valor !== 'string' || !/^[1-9]\d*$/.test(valor)) {
    return undefined;
  }

  const numero = Number(valor);

  return Number.isSafeInteger(numero) ? numero : undefined;
};

/**
 * Controladores del módulo Seguimiento de Voluntarios.
 */
export const seguimientoController = {

  /**
   * GET /seguimiento
   * Obtiene participaciones, estadísticas y datos de gráficos.
   */
  async obtenerSeguimiento(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const desde = obtenerTexto(req.query.desde);
      const hasta = obtenerTexto(req.query.hasta);
      const actividadTexto = obtenerTexto(req.query.id_actividad);
      const voluntarioTexto = obtenerTexto(req.query.id_voluntario);

      // Validar fechas
      if (desde && !validarFecha(desde)) {
        res.status(400).json({
          success: false,
          message: 'La fecha inicial no tiene un formato válido.',
        });
        return;
      }

      if (hasta && !validarFecha(hasta)) {
        res.status(400).json({
          success: false,
          message: 'La fecha final no tiene un formato válido.',
        });
        return;
      }

      if (desde && hasta && desde > hasta) {
        res.status(400).json({
          success: false,
          message: 'La fecha inicial no puede ser posterior a la fecha final.',
        });
        return;
      }

      // Validar identificadores
      const idActividad = actividadTexto
        ? obtenerId(actividadTexto)
        : undefined;

      const idVoluntario = voluntarioTexto
        ? obtenerId(voluntarioTexto)
        : undefined;

      if (actividadTexto && !idActividad) {
        res.status(400).json({
          success: false,
          message: 'El identificador de actividad no es válido.',
        });
        return;
      }

      if (voluntarioTexto && !idVoluntario) {
        res.status(400).json({
          success: false,
          message: 'El identificador de voluntario no es válido.',
        });
        return;
      }

      const datos = await seguimientoService.obtenerSeguimiento({
        desde,
        hasta,
        id_actividad: idActividad,
        id_voluntario: idVoluntario,
      });

      res.status(200).json({
        success: true,
        data: datos,
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /seguimiento/voluntarios/:id/historial
   * Obtiene el historial individual de un voluntario.
   */
  async obtenerHistorialVoluntario(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const idVoluntario = obtenerId(req.params.id);

      if (!idVoluntario) {
        res.status(400).json({
          success: false,
          message: 'El identificador del voluntario no es válido.',
        });
        return;
      }

      const historial =
        await seguimientoService.obtenerHistorialVoluntario(idVoluntario);

      if (!historial) {
        res.status(404).json({
          success: false,
          message: 'No se encontró el voluntario solicitado.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: historial,
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /seguimiento/filtros/actividades
   * Obtiene las actividades para el selector de filtros.
   */
  async obtenerActividadesFiltro(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const actividades =
        await seguimientoService.obtenerActividadesFiltro();

      res.status(200).json({
        success: true,
        data: actividades,
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /seguimiento/filtros/voluntarios
   * Obtiene los voluntarios para el selector de filtros.
   */
  async obtenerVoluntariosFiltro(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const voluntarios =
        await seguimientoService.obtenerVoluntariosFiltro();

      res.status(200).json({
        success: true,
        data: voluntarios,
      });

    } catch (error) {
      next(error);
    }
  },
};
