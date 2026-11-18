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
    return 'border-primary/25 bg-primary-soft text-primary';
  }
  if (r === 'donante' || r === 'cliente') {
    return 'border-accent/35 bg-accent-soft text-accent-text';
  }
  if (r === 'empleado' || r === 'voluntario') {
    return 'border-success/30 bg-success-soft text-success';
  }
  if (r === 'beneficiario') {
    return 'border-info/30 bg-info-soft text-info';
  }
  return 'border-border bg-surface text-text-muted';
};

export const UsuarioCard = ({ usuario, onEdit, onDelete }: UsuarioCardProps) => {
  const estado = getEstado(usuario);
  const activo = esActivo(usuario);
  const id = obtenerId(usuario);

  return (
    <div className="lift group relative overflow-hidden rounded-2xl border border-border bg-surface-elevated p-5 shadow-soft hover:border-accent/45 hover:shadow-lift">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[2px] w-0 bg-linear-to-r from-accent to-accent/30 transition-[width] duration-300 ease-out-soft group-hover:w-full"
      />

      {/* Cabecera: avatar + nombre + correo */}
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-sm font-bold text-primary ring-1 ring-primary/15 transition-colors duration-300 group-hover:bg-primary group-hover:text-on-primary">
          {getIniciales(usuario)}
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className="truncate font-display text-sm font-bold tracking-[-0.01em] text-text"
            title={getNombreCompleto(usuario)}
          >
            {getNombreCompleto(usuario)}
          </h3>
          <p
            className="truncate text-xs text-text-muted"
            title={usuario.correo}
          >
            {usuario.correo || 'sin correo'}
          </p>
        </div>
      </div>

      {/* Rol + Estado */}
      <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
        <div className="min-w-0">
          <p className="mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.12em] text-text-subtle">
            Rol
          </p>
          <span
            className={`inline-flex max-w-full items-center truncate rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.06em] ${getRolBadgeClass(usuario.rol)}`}
            title={getRolDisplay(usuario.rol)}
          >
            {getRolDisplay(usuario.rol) || '—'}
          </span>
        </div>
        <div>
          <p className="mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.12em] text-text-subtle">
            Estado
          </p>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold ${
              activo
                ? 'border-success/30 bg-success-soft text-success'
                : 'border-error/30 bg-error-soft text-error'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${activo ? 'bg-success' : 'bg-error'}`}
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
          className="press flex-1 rounded-xl border border-border bg-surface py-2 text-[11.5px] font-bold uppercase tracking-[0.06em] text-text-muted hover:border-accent/50 hover:bg-accent-soft hover:text-text"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => id !== undefined && onDelete(Number(id))}
          className="press flex-1 rounded-xl border border-border bg-surface py-2 text-[11.5px] font-bold uppercase tracking-[0.06em] text-error hover:border-error/40 hover:bg-error-soft"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default UsuarioCard;
