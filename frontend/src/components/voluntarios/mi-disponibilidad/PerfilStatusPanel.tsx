/**
 * ============================================================================
 * COMPONENTE: PerfilStatusPanel
 * Columna lateral: información del voluntario, estado real del perfil y
 * nota guía sobre la gestión de la disponibilidad.
 * ============================================================================
 */

import type { PerfilVoluntario } from '../../../types/disponibilidad.types';
import {
  IconoAlerta,
  IconoCheckCirculo,
  IconoCorreo,
  IconoInfo,
  IconoUsuario,
} from './Iconos';

interface PerfilStatusPanelProps {
  perfil: PerfilVoluntario | null;
  esVoluntario: boolean;
  postulando: boolean;
  onPostular: () => void;
}

const PerfilStatusPanel = ({
  perfil,
  esVoluntario,
  postulando,
  onPostular,
}: PerfilStatusPanelProps) => {
  const estado = perfil?.estado;

  return (
    <aside className="space-y-5">
      {/* Información del voluntario */}
      <section className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <IconoUsuario />
          </span>
          <h3 className="font-display text-sm font-bold tracking-[-0.01em] text-text">
            Información del Voluntario
          </h3>
        </div>

        {perfil ? (
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-bold text-text">
                {perfil.nombre} {perfil.apellido}
              </p>
              <p className="mt-1 flex items-center gap-1.5 break-all text-xs text-text-muted">
                <IconoCorreo className="h-3.5 w-3.5" />
                {perfil.correo}
              </p>
            </div>

            <div>
              <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-text-muted">
                Habilidades
              </p>
              {perfil.habilidades.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {perfil.habilidades.map((habilidad) => (
                    <span
                      key={habilidad}
                      className="rounded-full border border-accent/30 bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent-text"
                    >
                      {habilidad}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-subtle">Sin habilidades registradas.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-relaxed text-text-muted">
            Completá tu postulación para ver aquí tus datos y habilidades.
          </p>
        )}
      </section>

      {/* Estado de perfil */}
      <section className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-soft">
        <h3 className="font-display text-sm font-bold tracking-[-0.01em] text-text">
          Estado de Perfil
        </h3>

        {!esVoluntario ? (
          <div className="mt-4 rounded-xl border border-border bg-surface p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <IconoInfo />
            </span>
            <p className="mt-3 text-sm font-bold text-text">Aún no sos voluntario</p>
            <p className="mt-1 text-xs leading-relaxed text-text-muted">
              Para registrar tus horarios, primero postulate al programa de voluntariado.
            </p>
            <button
              type="button"
              onClick={onPostular}
              disabled={postulando}
              className="press mt-4 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary shadow-soft hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {postulando ? 'Enviando…' : 'Postularme como voluntario'}
            </button>
          </div>
        ) : estado === 'Aprobado' ? (
          <div className="mt-4 rounded-xl border border-success/30 bg-success-soft p-4">
            <div className="flex items-center gap-2 text-success">
              <IconoCheckCirculo />
              <span className="text-sm font-bold">Aprobado</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-text">
              Tu perfil está activo y puedes participar en actividades.
            </p>
          </div>
        ) : estado === 'Pendiente' ? (
          <div className="mt-4 rounded-xl border border-warning/30 bg-warning-soft p-4">
            <div className="flex items-center gap-2 text-warning">
              <IconoInfo />
              <span className="text-sm font-bold">Pendiente</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-text">
              Tu solicitud está en revisión. Te avisaremos apenas sea aprobada.
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-error/30 bg-error-soft p-4">
            <div className="flex items-center gap-2 text-error">
              <IconoAlerta />
              <span className="text-sm font-bold">Rechazado</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-text">
              Tu solicitud no fue aprobada. Podés comunicarte con coordinación para más información.
            </p>
            {perfil?.motivo_rechazo && (
              <p className="mt-3 rounded-lg border border-error/30 bg-surface p-3 text-xs italic leading-relaxed text-text-muted">
                “{perfil.motivo_rechazo}”
              </p>
            )}
          </div>
        )}
      </section>

      {/* Nota guía */}
      <section className="rounded-2xl border border-border bg-primary-soft p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-elevated text-primary">
            <IconoInfo />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold tracking-[-0.01em] text-text">
              ¿Necesitas cambiar tu disponibilidad?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-text-muted">
              Podés agregar, editar o desactivar tus horarios en cualquier momento desde el panel
              “Mis Horarios” o directamente desde el calendario semanal.
            </p>
          </div>
        </div>
      </section>
    </aside>
  );
};

export default PerfilStatusPanel;
