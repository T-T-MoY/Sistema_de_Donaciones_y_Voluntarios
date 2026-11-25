/**
 * ============================================================================
 * COMPONENTE: CalendarioSemanal
 * Grilla de 7 columnas con los bloques horarios de cada día. Responsiva:
 * en pantallas chicas se desplaza horizontalmente.
 * ============================================================================
 */

import {
  DIAS_SEMANA,
  type DiaSemana,
  type HorarioDisponibilidad,
} from '../../../types/disponibilidad.types';
import { IconoMas, IconoReloj } from './Iconos';

interface CalendarioSemanalProps {
  horarios: HorarioDisponibilidad[];
  onAgregar: (dia: DiaSemana) => void;
  onEditar: (horario: HorarioDisponibilidad) => void;
}

const CalendarioSemanal = ({
  horarios,
  onAgregar,
  onEditar,
}: CalendarioSemanalProps) => {
  const porDia = (dia: DiaSemana): HorarioDisponibilidad[] =>
    horarios
      .filter((h) => h.dia_semana === dia)
      .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

  return (
    <section className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-soft sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold tracking-[-0.02em] text-text sm:text-lg">
            Mi Disponibilidad Semanal
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-text-muted">
            Hacé clic en un bloque para editarlo o en <span className="font-bold text-primary">+</span> para agregar un horario ese día.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10.5px] font-semibold text-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Activo
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-text-subtle" />
            Inactivo
          </span>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto pb-2">
        <div className="grid min-w-[770px] grid-cols-7 gap-2">
          {DIAS_SEMANA.map((dia) => {
            const bloques = porDia(dia.valor);
            return (
              <div
                key={dia.valor}
                className="flex min-h-[220px] flex-col overflow-hidden rounded-xl border border-border bg-surface"
              >
                <div className="flex items-center justify-between gap-1 border-b border-border bg-surface-sunken px-2 py-2.5">
                  <span className="truncate text-[11px] font-bold uppercase tracking-[0.06em] text-text">
                    {dia.etiqueta}
                  </span>
                  <button
                    type="button"
                    onClick={() => onAgregar(dia.valor)}
                    aria-label={`Agregar horario el ${dia.etiqueta}`}
                    title={`Agregar horario el ${dia.etiqueta}`}
                    className="press flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-elevated text-primary hover:border-primary/50 hover:bg-primary-soft"
                  >
                    <IconoMas className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex-1 space-y-2 p-2">
                  {bloques.length === 0 ? (
                    <p className="pt-6 text-center text-xs text-text-subtle" aria-label="Sin horarios">
                      —
                    </p>
                  ) : (
                    bloques.map((horario) => (
                      <button
                        key={horario.id_disponibilidad}
                        type="button"
                        onClick={() => onEditar(horario)}
                        title={`Editar ${dia.etiqueta} ${horario.hora_inicio} - ${horario.hora_fin}`}
                        className={`press flex w-full flex-col items-start gap-1 rounded-lg border px-2.5 py-2 text-left ${
                          horario.estado
                            ? 'border-success/30 bg-success-soft text-success hover:border-success/60'
                            : 'border-border bg-surface-sunken text-text-subtle hover:border-border-strong'
                        }`}
                      >
                        <span className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.06em]">
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                              horario.estado ? 'bg-success' : 'bg-text-subtle'
                            }`}
                          />
                          {horario.estado ? 'Activo' : 'Inactivo'}
                        </span>
                        <span
                          className={`flex items-center gap-1 text-[11px] font-semibold ${
                            horario.estado ? '' : 'line-through'
                          }`}
                        >
                          <IconoReloj className="h-3 w-3" />
                          {horario.hora_inicio} - {horario.hora_fin}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CalendarioSemanal;
