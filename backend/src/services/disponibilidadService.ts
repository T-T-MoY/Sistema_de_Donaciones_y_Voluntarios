/**
 * ============================================================================
 * ARCHIVO: disponibilidadService.ts
 * CAPA: Servicio / reglas de negocio (Sección 5 - Mi Disponibilidad)
 *
 * PROPÓSITO:
 * Validar días, rangos horarios, pertenencia y cruces de horarios antes de
 * delegar al repositorio. No conoce Express (req/res).
 * ============================================================================
 */

import { disponibilidadRepository } from '../repositories/disponibilidadRepository';
import {
  DIAS_SEMANA,
  type DiaSemana,
  type HorarioDisponibilidad,
  type HorarioDTO,
  type HorarioNormalizado,
  type MiDisponibilidadResponse,
  type PerfilVoluntario,
} from '../models/disponibilidadModel';
import { AppError } from '../utils/AppError';

/** Acepta entrada con/sin tilde y devuelve el valor exacto exigido por la BD. */
const normalizarDia = (valor: unknown): DiaSemana | null => {
  if (typeof valor !== 'string') return null;
  const texto = valor.trim();
  const sinTilde = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const dia = DIAS_SEMANA.find(
    (d) => d.toLowerCase() === sinTilde
  );
  return dia ?? null;
};

/** Acepta únicamente HH:MM en formato de 24 horas. */
const normalizarHora = (valor: unknown): string | null => {
  if (typeof valor !== 'string') return null;
  const texto = valor.trim();
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(texto) ? texto : null;
};

const validarRango = (datos: Partial<HorarioDTO>): HorarioNormalizado => {
  const dia = normalizarDia(datos.dia_semana);
  if (!dia) {
    throw new AppError(
      'El día de la semana no es válido. Debe ser Lunes, Martes, Miércoles, Jueves, Viernes, Sábado o Domingo.',
      400
    );
  }

  const horaInicio = normalizarHora(datos.hora_inicio);
  const horaFin = normalizarHora(datos.hora_fin);
  if (!horaInicio || !horaFin) {
    throw new AppError(
      'Las horas deben tener formato HH:MM en 24 horas (por ejemplo, 14:00).',
      400
    );
  }
  if (horaFin <= horaInicio) {
    throw new AppError('La hora de fin debe ser mayor que la hora de inicio.', 400);
  }

  return { dia_semana: dia, hora_inicio: horaInicio, hora_fin: horaFin };
};

const validarId = (valor: unknown): number => {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('El identificador del horario no es válido.', 400);
  }
  return id;
};

const verificarPerfil = async (idUsuario: number): Promise<PerfilVoluntario> => {
  const perfil = await disponibilidadRepository.obtenerPerfil(idUsuario);
  if (!perfil) {
    throw new AppError(
      'Todavía no estás registrado como voluntario. Postulate antes de gestionar tu disponibilidad.',
      403
    );
  }
  return perfil;
};

const verificarPropiedad = async (
  idUsuario: number,
  idValor: unknown
): Promise<{ id: number; horario: HorarioDisponibilidad }> => {
  const id = validarId(idValor);
  const horario = await disponibilidadRepository.obtenerPorId(id, idUsuario);
  if (!horario) {
    throw new AppError('Horario no encontrado o no te pertenece.', 404);
  }
  return { id, horario };
};

const verificarSinCruce = async (
  idUsuario: number,
  datos: HorarioNormalizado,
  excluirId?: number
): Promise<void> => {
  const hayCruce = await disponibilidadRepository.existeSolapamiento(
    idUsuario,
    datos.dia_semana,
    datos.hora_inicio,
    datos.hora_fin,
    excluirId
  );
  if (hayCruce) {
    throw new AppError(
      `El horario se cruza con otro horario activo del ${datos.dia_semana} (${datos.hora_inicio} - ${datos.hora_fin}). Elegí otro rango o desactivá el horario existente.`,
      400
    );
  }
};

export const disponibilidadService = {
  /** Perfil + horarios del usuario autenticado. Nunca lanza si no es voluntario. */
  async obtenerMiDisponibilidad(idUsuario: number): Promise<MiDisponibilidadResponse> {
    const perfil = await disponibilidadRepository.obtenerPerfil(idUsuario);
    if (!perfil) {
      return { esVoluntario: false, perfil: null, horarios: [] };
    }
    const horarios = await disponibilidadRepository.obtenerHorarios(idUsuario);
    return { esVoluntario: true, perfil, horarios };
  },

  async crearHorario(
    idUsuario: number,
    datos: Partial<HorarioDTO>
  ): Promise<HorarioDisponibilidad> {
    await verificarPerfil(idUsuario);
    const normalizado = validarRango(datos);
    await verificarSinCruce(idUsuario, normalizado);
    return disponibilidadRepository.crear(idUsuario, normalizado);
  },

  async actualizarHorario(
    idUsuario: number,
    idValor: unknown,
    datos: Partial<HorarioDTO>
  ): Promise<HorarioDisponibilidad> {
    const { id, horario } = await verificarPropiedad(idUsuario, idValor);
    const normalizado = validarRango(datos);

    // Solo un horario activo compite por el mismo espacio horario.
    if (horario.estado) {
      await verificarSinCruce(idUsuario, normalizado, id);
    }

    const actualizado = await disponibilidadRepository.actualizar(
      id,
      idUsuario,
      normalizado
    );
    if (!actualizado) {
      throw new AppError('Horario no encontrado o no te pertenece.', 404);
    }
    return actualizado;
  },

  async cambiarEstado(
    idUsuario: number,
    idValor: unknown,
    estado: unknown
  ): Promise<HorarioDisponibilidad> {
    const { id, horario } = await verificarPropiedad(idUsuario, idValor);

    const nuevoEstado =
      typeof estado === 'boolean'
        ? estado
        : typeof estado === 'string'
          ? estado.trim().toLowerCase() === 'true'
            ? true
            : estado.trim().toLowerCase() === 'false'
              ? false
              : null
          : null;

    if (nuevoEstado === null) {
      throw new AppError('El campo estado debe ser un valor booleano (true o false).', 400);
    }

    // Reactivar implica volver a competir con los horarios activos del día.
    if (nuevoEstado && !horario.estado) {
      await verificarSinCruce(
        idUsuario,
        {
          dia_semana: horario.dia_semana,
          hora_inicio: horario.hora_inicio,
          hora_fin: horario.hora_fin,
        },
        id
      );
    }

    const actualizado = await disponibilidadRepository.cambiarEstado(
      id,
      idUsuario,
      nuevoEstado
    );
    if (!actualizado) {
      throw new AppError('Horario no encontrado o no te pertenece.', 404);
    }
    return actualizado;
  },
};
