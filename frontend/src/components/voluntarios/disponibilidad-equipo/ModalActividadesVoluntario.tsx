/**
 * ============================================================================
 * COMPONENTE: ModalActividadesVoluntario
 * Pantalla modal que muestra un detalle mínimo de la participación del
 * voluntario en actividades actuales y futuras.
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import disponibilidadEquipoApi from '../../../api/disponibilidadEquipo.api';
import type {
  VoluntarioEquipo,
  ActividadVoluntarioResumen,
} from '../../../types/disponibilidadEquipo.types';

interface ModalActividadesVoluntarioProps {
  abierto: boolean;
  onCerrar: () => void;
  voluntario: VoluntarioEquipo;
}

export default function ModalActividadesVoluntario({
  abierto,
  onCerrar,
  voluntario,
}: ModalActividadesVoluntarioProps) {
  const [actividades, setActividades] = useState<ActividadVoluntarioResumen[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargarActividades = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await disponibilidadEquipoApi.obtenerActividadesVoluntario(
        voluntario.id_usuario
      );
      setActividades(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.mensaje ||
        'No se pudieron cargar las actividades asignadas.'
      );
    } finally {
      setCargando(false);
    }
  }, [voluntario.id_usuario]);

  useEffect(() => {
    if (abierto) {
      void cargarActividades();
    }
  }, [abierto, cargarActividades]);

  // Cerrar al presionar la tecla Escape
  useEffect(() => {
    if (!abierto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-actividades-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/60 backdrop-blur-xs animate-overlay-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface-elevated p-6 shadow-deep animate-modal-in max-h-[90vh] flex flex-col">
        {/* Cabecera del Modal */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-subtle">
              Participación en Convocatorias
            </span>
            <h3
              id="modal-actividades-titulo"
              className="mt-0.5 font-display text-lg font-bold text-text"
            >
              Actividades de {voluntario.nombre} {voluntario.apellido}
            </h3>
            <p className="mt-0.5 text-xs text-text-muted">
              Listado de jornadas actuales y futuras asignadas a este voluntario.
            </p>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar modal"
            className="press flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface text-text-subtle hover:text-text hover:bg-surface-sunken transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Contenido / Lista de Actividades */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {cargando ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl border border-border bg-surface"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-error/30 bg-error-soft p-4 text-center">
              <p className="text-xs font-semibold text-error">{error}</p>
              <button
                type="button"
                onClick={() => void cargarActividades()}
                className="press mt-2 text-xs font-bold text-primary underline"
              >
                Reintentar
              </button>
            </div>
          ) : actividades.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center bg-surface/50">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-text-subtle">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="mt-3 font-semibold text-sm text-text">
                Sin actividades próximas
              </p>
              <p className="mt-1 text-xs text-text-subtle max-w-xs">
                Este voluntario no está inscrito en ninguna actividad actual o futura.
              </p>
            </div>
          ) : (
            actividades.map((act) => (
              <div
                key={act.id_participacion}
                className="rounded-xl border border-border bg-surface p-4 shadow-xs hover:border-primary/50 transition-all"
              >
                {/* Nombre y Estado */}
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm text-text">
                    {act.actividad_nombre}
                  </h4>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold ${
                      act.estado_participacion === 'Confirmado'
                        ? 'border-success/30 bg-success-soft text-success'
                        : 'border-primary/30 bg-primary-soft text-primary'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {act.estado_participacion}
                  </span>
                </div>

                {/* Campaña asociada */}
                {act.campana_nombre && (
                  <p className="mt-1 text-xs text-text-subtle">
                    <span className="font-medium text-text-muted">Campaña:</span> {act.campana_nombre}
                  </p>
                )}

                {/* Fecha y Horario */}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-sunken px-2 py-1 font-medium">
                    <svg className="h-3.5 w-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {act.fecha}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-sunken px-2 py-1 font-medium">
                    <svg className="h-3.5 w-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {act.hora_inicio} - {act.hora_fin}
                  </span>
                </div>

                {/* Lugar */}
                {act.lugar && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-text-subtle">
                    <svg className="h-3.5 w-3.5 text-text-subtle shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{act.lugar}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pie del Modal */}
        <div className="border-t border-border pt-4 flex justify-end">
          <button
            type="button"
            onClick={onCerrar}
            className="press rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-text hover:bg-surface-sunken transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
