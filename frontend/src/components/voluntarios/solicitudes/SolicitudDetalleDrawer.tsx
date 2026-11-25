import { useState } from 'react';
import type { HistorialVoluntario, SolicitudVoluntario } from '../../../types/usuario.types';

interface Props {
  solicitud: SolicitudVoluntario;
  guardando: boolean;
  solicitarMotivoInicial?: boolean;
  onClose: () => void;
  onAprobar: () => Promise<boolean>;
  onRechazar: (motivo: string) => Promise<boolean>;
}

const formatFecha = (fecha?: string | null) => {
  if (!fecha) return 'Fecha no disponible';
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
  return date.toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const estadoLabel: Record<HistorialVoluntario['estado_nuevo'], string> = {
  Pendiente: 'Pendiente',
  Aprobado: 'Aprobado',
  Rechazado: 'Rechazado',
};

export default function SolicitudDetalleDrawer({
  solicitud,
  guardando,
  solicitarMotivoInicial = false,
  onClose,
  onAprobar,
  onRechazar,
}: Props) {
  const [mostrarMotivo, setMostrarMotivo] = useState(solicitarMotivoInicial);
  const [motivo, setMotivo] = useState('');
  const historial = [...(solicitud.historial ?? [])].sort(
    (a, b) => new Date(a.fecha_cambio).getTime() - new Date(b.fecha_cambio).getTime()
  );
  const tieneEnvioInicial = historial.some((evento) => evento.estado_anterior === null);

  const confirmarRechazo = async () => {
    const motivoLimpio = motivo.trim();
    if (!motivoLimpio || motivoLimpio.length > 1000) return;
    const guardado = await onRechazar(motivoLimpio);
    if (guardado) {
      setMotivo('');
      setMostrarMotivo(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-night/55"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !guardando) onClose();
      }}
    >
      <section
        className="flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-surface-elevated shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="solicitud-detalle-titulo"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-surface-elevated px-5 py-5 sm:px-7">
          <div>
            <p className="text-sm font-medium text-text-subtle">Detalle de solicitud</p>
            <h2 id="solicitud-detalle-titulo" className="mt-1 text-xl font-bold text-text">
              {solicitud.nombre} {solicitud.apellido}
            </h2>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-text-subtle hover:bg-surface-sunken hover:text-text"
            onClick={onClose}
            disabled={guardando}
            aria-label="Cerrar detalle"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-7 px-5 py-6 sm:px-7">
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-subtle">
              Información personal
            </h3>
            <dl className="grid gap-x-6 gap-y-4 rounded-xl border border-border bg-surface px-4 py-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-text-subtle">Correo electrónico</dt>
                <dd className="mt-1 break-all text-sm font-medium text-text">{solicitud.correo}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-subtle">Teléfono</dt>
                <dd className="mt-1 text-sm font-medium text-text">{solicitud.telefono || 'No registrado'}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-subtle">Fecha de registro</dt>
                <dd className="mt-1 text-sm font-medium text-text">{formatFecha(solicitud.fecha_registro)}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-subtle">Disponibilidad</dt>
                <dd className="mt-1 text-sm font-medium text-text">{solicitud.disponibilidad || 'No especificada'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-text-subtle">Habilidades e intereses</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {solicitud.habilidades?.length ? solicitud.habilidades.map((habilidad) => (
                    <span
                      key={habilidad}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {habilidad}
                    </span>
                  )) : <span className="text-sm text-text-subtle">No especificadas</span>}
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-text-subtle">
                Historial de cambios
              </h3>
              <span className="text-xs text-text-subtle">
                {historial.length + (tieneEnvioInicial ? 0 : 1)} evento(s)
              </span>
            </div>
            <ol className="space-y-0">
              {!tieneEnvioInicial && (
                <li className="relative flex gap-3 pb-5">
                  <span className="absolute bottom-0 left-[9px] top-5 w-px bg-border" />
                  <span className="relative mt-1 h-[19px] w-[19px] shrink-0 rounded-full border-2 border-primary bg-surface" />
                  <div>
                    <p className="text-sm font-semibold text-text">Solicitud recibida</p>
                    <p className="mt-1 text-xs text-text-subtle">{formatFecha(solicitud.fecha_registro)}</p>
                  </div>
                </li>
              )}
              {historial.map((evento: HistorialVoluntario, index: number) => {
                const esUltimo = index === historial.length - 1;
                const esInicial = evento.estado_anterior === null;
                const estado = evento.estado_nuevo;
                const color = estado === 'Aprobado'
                  ? 'border-success text-success'
                  : estado === 'Rechazado'
                    ? 'border-error text-error'
                    : 'border-warning text-warning';
                return (
                  <li key={evento.id_historial} className={`relative flex gap-3 ${esUltimo ? '' : 'pb-5'}`}>
                    {!esUltimo && <span className="absolute bottom-0 left-[9px] top-5 w-px bg-border" />}
                    <span className={`relative mt-1 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border-2 bg-surface ${color}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text">
                        {esInicial
                          ? estado === 'Pendiente'
                            ? 'Solicitud recibida'
                            : `Estado registrado: ${estadoLabel[estado]}`
                          : `Estado cambiado de ${evento.estado_anterior
                            ? estadoLabel[evento.estado_anterior]
                            : 'desconocido'} a ${estadoLabel[estado]}`}
                      </p>
                      <p className="mt-1 text-xs text-text-subtle">{formatFecha(evento.fecha_cambio)}</p>
                      {!esInicial && (
                        <p className="mt-1 text-xs text-text-subtle">
                          Por {evento.nombre_revisor || 'Administrador'}
                        </p>
                      )}
                      {estado === 'Rechazado' && evento.motivo && (
                        <p className="mt-2 rounded-lg bg-error/5 px-3 py-2 text-sm text-text">
                          <span className="font-medium">Motivo:</span> {evento.motivo}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {solicitud.estado === 'Rechazado' && solicitud.motivo_rechazo && (
            <p className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-text">
              <span className="font-semibold">Motivo del rechazo registrado:</span>{' '}
              {solicitud.motivo_rechazo}
            </p>
          )}
        </div>

        <div className="sticky bottom-0 space-y-3 border-t border-border bg-surface-elevated px-5 py-4 sm:px-7">
          {mostrarMotivo ? (
            <div>
                <label htmlFor="motivo-rechazo" className="mb-2 block text-sm font-medium text-text">
                  Motivo del rechazo <span className="text-error">*</span>
                </label>
                <textarea
                  id="motivo-rechazo"
                  value={motivo}
                  onChange={(event) => setMotivo(event.target.value)}
                  rows={3}
                  maxLength={1000}
                  required
                  placeholder="Explica brevemente por qué se rechaza la solicitud"
                  className="w-full resize-y rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  disabled={guardando}
                />
                <p className="mt-1 text-right text-xs text-text-subtle">{motivo.length}/1000</p>
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setMostrarMotivo(false)}
                    disabled={guardando}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:bg-surface-sunken disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={confirmarRechazo}
                    disabled={guardando || !motivo.trim() || motivo.trim().length > 1000}
                    className="rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {guardando ? 'Guardando…' : 'Confirmar rechazo'}
                  </button>
                </div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-end gap-2">
              {solicitud.estado !== 'Rechazado' && (
                <button
                  type="button"
                  onClick={() => setMostrarMotivo(true)}
                  disabled={guardando}
                  className="rounded-lg border border-error/40 px-4 py-2 text-sm font-semibold text-error hover:bg-error/5 disabled:opacity-50"
                >
                  Rechazar solicitud
                </button>
              )}
              {solicitud.estado !== 'Aprobado' && (
                <button
                  type="button"
                  onClick={onAprobar}
                  disabled={guardando}
                  className="rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-50"
                >
                  {guardando ? 'Guardando…' : 'Aprobar solicitud'}
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
