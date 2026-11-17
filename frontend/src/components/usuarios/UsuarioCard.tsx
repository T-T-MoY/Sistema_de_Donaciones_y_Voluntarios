/**
 * ============================================================================
 * ARCHIVO: UsuarioCard.tsx
 * Tarjeta individual de usuario. Funciona en desktop y móvil.
 * ============================================================================
 */

import type { Usuario } from '../../types/usuario.types';
import {
  obtenerId,
  getNombreCompleto,
  getIniciales,
  getEstado,
  esActivo,
  getRolDisplay,
} from '../../types/usuario.types';

interface UsuarioCardProps {
  usuario: Usuario;
  onEdit: (usuario: Usuario) => void;
  onDelete: (id: number) => void;
}

/**
 * Color del badge de rol (solo presentación).
 */
const getRolBadgeClass = (rol?: string): string => {
  const r = (rol || '').toLowerCase();

  if (r === 'admin' || r === 'administrador') {
    return 'bg-claro-primario/10 text-claro-primario border-claro-primario/25 dark:bg-oscuro-primario/15 dark:text-oscuro-primario dark:border-oscuro-primario/30';
  }
  if (r === 'donante' || r === 'cliente') {
    return 'bg-claro-acento/10 text-claro-acento border-claro-acento/25 dark:bg-oscuro-acento/15 dark:text-oscuro-acento dark:border-oscuro-acento/30';
  }
  if (r === 'empleado' || r === 'voluntario') {
    return 'bg-emerald-500/10 text-emerald-800 border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-400/30';
  }
  if (r === 'beneficiario') {
    return 'bg-sky-500/10 text-sky-800 border-sky-500/25 dark:bg-sky-500/15 dark:text-sky-200 dark:border-sky-400/30';
  }
  return 'bg-claro-tinte text-claro-primario border-claro-borde dark:bg-oscuro-tinte dark:text-oscuro-primario dark:border-oscuro-borde';
};

export const UsuarioCard = ({ usuario, onEdit, onDelete }: UsuarioCardProps) => {
  const estado = getEstado(usuario);
  const activo = esActivo(usuario);
  const id = obtenerId(usuario);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-claro-borde bg-claro-tarjeta p-5 shadow-soft transition-[transform,box-shadow,border-color] duration-300 ease-out-soft hover:border-claro-primario/30 hover:shadow-lift motion-safe:hover:-translate-y-0.5 dark:border-oscuro-borde dark:bg-oscuro-tarjeta dark:hover:border-oscuro-primario/40">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[2px] w-0 bg-claro-primario transition-[width] duration-300 ease-out-soft group-hover:w-full dark:bg-oscuro-primario"
      />

      {/* Cabecera: avatar + nombre + correo */}
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-claro-tinte text-sm font-bold text-claro-primario ring-1 ring-claro-primario/15 dark:bg-oscuro-tinte dark:text-oscuro-primario dark:ring-oscuro-primario/25">
          {getIniciales(usuario)}
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className="font-semibold text-claro-texto dark:text-oscuro-texto truncate"
            title={getNombreCompleto(usuario)}
          >
            {getNombreCompleto(usuario)}
          </h3>
          <p
            className="text-xs text-claro-texto2 dark:text-oscuro-texto2 truncate"
            title={usuario.correo}
          >
            {usuario.correo || 'sin correo'}
          </p>
        </div>
      </div>

      {/* Rol + Estado */}
      <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
        <div className="min-w-0">
          <p className="mb-1 font-bold uppercase tracking-[0.12em] text-claro-texto2 dark:text-oscuro-texto2">
            Rol
          </p>
          <span
            className={`inline-flex max-w-full items-center truncate rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getRolBadgeClass(usuario.rol)}`}
            title={getRolDisplay(usuario.rol)}
          >
            {getRolDisplay(usuario.rol) || '—'}
          </span>
        </div>
        <div>
          <p className="mb-1 font-bold uppercase tracking-[0.12em] text-claro-texto2 dark:text-oscuro-texto2">
            Estado
          </p>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
              activo
                ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-400/30'
                : 'bg-red-500/10 text-red-700 border-red-500/25 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                activo ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            {estado}
          </span>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(usuario)}
          className="press flex-1 rounded-xl border border-claro-borde bg-claro-fondo py-2 text-sm font-semibold text-claro-texto2 hover:border-claro-primario/40 hover:text-claro-primario dark:border-oscuro-borde dark:bg-oscuro-fondo dark:text-oscuro-texto2 dark:hover:border-oscuro-primario/40 dark:hover:text-oscuro-primario"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => id !== undefined && onDelete(Number(id))}
          className="press flex-1 rounded-xl border border-claro-borde bg-claro-fondo py-2 text-sm font-semibold text-red-600 hover:border-red-300 hover:bg-red-50 dark:border-oscuro-borde dark:bg-oscuro-fondo dark:text-red-400 dark:hover:border-red-800 dark:hover:bg-red-900/20"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default UsuarioCard;
