/**
 * ============================================================================
 * ARCHIVO: disponibilidadEquipoService.ts
 * CAPA: Servicio (Disponibilidad de Voluntarios - Coordinador)
 *
 * PROPÓSITO:
 * Reglas de negocio para la consulta de la disponibilidad del equipo de voluntarios.
 * ============================================================================
 */

import { disponibilidadEquipoRepository } from '../repositories/disponibilidadEquipoRepository';
import { DIAS_SEMANA, type DiaSemana } from '../models/disponibilidadModel';
import type {
  VoluntarioEquipoResponse,
  FiltrosDisponibilidadEquipo,
} from '../models/disponibilidadEquipoModel';

/** Normaliza el día opcional recibido como filtro */
const normalizarDiaFiltro = (valor?: unknown): DiaSemana | undefined => {
  if (typeof valor !== 'string') return undefined;
  const texto = valor.trim();
  if (!texto || texto.toLowerCase().includes('todos')) return undefined;

  const sinTilde = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const dia = DIAS_SEMANA.find(
    (d) => d.toLowerCase() === sinTilde
  );
  return dia ?? undefined;
};

export const disponibilidadEquipoService = {
  /**
   * Obtiene la lista de voluntarios con sus horarios según filtros opcionales.
   */
  async obtenerDisponibilidadEquipo(
    filtrosRaw?: { dia?: unknown; busqueda?: unknown }
  ): Promise<VoluntarioEquipoResponse[]> {
    const diaNormalizado = normalizarDiaFiltro(filtrosRaw?.dia);
    const busqueda = typeof filtrosRaw?.busqueda === 'string'
      ? filtrosRaw.busqueda.trim()
      : undefined;

    const filtros: FiltrosDisponibilidadEquipo = {
      dia: diaNormalizado,
      busqueda: busqueda || undefined,
    };

    return disponibilidadEquipoRepository.obtenerVoluntarios(filtros);
  },

  /**
   * Obtiene los horarios de un voluntario específico.
   */
  async obtenerHorariosVoluntario(idVoluntario: number) {
    return disponibilidadEquipoRepository.obtenerHorariosVoluntario(idVoluntario);
  },

  /**
   * Obtiene las actividades actuales y futuras de un voluntario.
   */
  async obtenerActividadesVoluntario(idVoluntario: number) {
    return disponibilidadEquipoRepository.obtenerActividadesVoluntario(idVoluntario);
  },
};
