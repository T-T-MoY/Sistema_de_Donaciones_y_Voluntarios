/**
 * ============================================================================
 * COMPONENTE: HorariosList
 * Panel "Mis Horarios": resumen, alta y gestión de cada bloque registrado.
 * ============================================================================
 */

import {
  etiquetaDia,
  type HorarioDisponibilidad,
} from '../../../types/disponibilidad.types';
import { IconoCalendario, IconoEditar, IconoMas, IconoPausa, IconoReloj } from './Iconos';

interface HorariosListProps {
  horarios: HorarioDisponibilidad[];
  procesandoId: number | null;
  onAgregar: () => void;
  onEditar: (horario: HorarioDisponibilidad) => void;
  onCambiarEstado: (horario: HorarioDisponibilidad) => void;
}

const HorariosList = ({
  horarios,
  procesandoId,
  onAgregar,
  onEditar,
  onCambiarEstado,
}: HorariosListProps) => {
  const activos = horarios.filter((h) => h.estado).length;
  const inactivos = horarios.length - activos;

  return (
    <section className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-soft sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <IconoCalendario />
            </span>
            <h3 className="font-display text-base font-bold tracking-[-0.02em] text-text sm:text-lg">
              Mis Horarios
            </h3>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-muted">
            <span className="rounded-full border border-border bg-surface px-2.5 py-1 font-semibold">
              {horarios.length} {horarios.length === 1 ? 'horario registrado' : 'horarios registrados'}
            </span>
            <span className="rounded-full border border-success/30 bg-success-soft px-2.5 py-1 font-semibold text-success">
              {activos} activos
            </span>
            <span className="rounded-full border border-border bg-surface-sunken px-2.5 py-1 font-semibold text-text-muted">
              {inactivos} inactivos
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onAgregar}
          className="press inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary shadow-soft hover:bg-primary-hover hover:shadow-lift"
        >
          <IconoMas className="h-4 w-4" />
          Agregar Horario
        </button>
      </div>

      {horarios.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border-strong bg-surface p-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <IconoReloj />
          </span>
          <p className="mt-3 font-semibold text-text">Todavía no registraste horarios</p>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-text-muted">
            Agregá los días y rangos en los que podés participar de actividades.
          </p>
          <button
            type="button"
            onClick={onAgregar}
            className="press mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-muted hover:border-accent/50 hover:bg-accent-soft"
          >
            <IconoMas className="h-4 w-4" />
            Registrar mi primer horario
          </button>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {horarios.map((horario) => {
            const ocupado = procesandoId === horario.id_disponibilidad;
            return (
              <li
                key={horario.id_disponibilidad}
                className="lift rounded-2xl border border-border bg-surface p-4 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        horario.estado
                          ? 'bg-success-soft text-success'
                          : 'bg-surface-sunken text-text-subtle'
                      }`}
                    >
                      <IconoCalendario className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-text">{etiquetaDia(horario.dia_semana)}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-text-muted">
                        <IconoReloj className="h-3.5 w-3.5" />
                        <span className={horario.estado ? '' : 'line-through'}>
                          {horario.hora_inicio} - {horario.hora_fin}
                        </span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] ${
                      horario.estado
                        ? 'border-success/30 bg-success-soft text-success'
                        : 'border-border bg-surface-sunken text-text-muted'
                    }`}
                  >
                    {horario.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onEditar(horario)}
                    disabled={ocupado}
                    className="press inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-text-muted hover:border-accent/50 hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <IconoEditar className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onCambiarEstado(horario)}
                    disabled={ocupado}
                    className={`press inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
                      horario.estado
                        ? 'border-error/30 bg-error-soft text-error hover:border-error/60'
                        : 'border-success/30 bg-success-soft text-success hover:border-success/60'
                    }`}
                  >
                    <IconoPausa className="h-3.5 w-3.5" />
                    {horario.estado ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default HorariosList;
