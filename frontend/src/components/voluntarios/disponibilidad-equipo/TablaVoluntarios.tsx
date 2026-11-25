/**
 * ============================================================================
 * COMPONENTE: TablaVoluntarios
 * Tabla espaciosa de 3 columnas (Nombre, Habilidades, Estado) con selección reactiva.
 * ============================================================================
 */

import type { VoluntarioEquipo } from '../../../types/disponibilidadEquipo.types';

interface TablaVoluntariosProps {
  voluntarios: VoluntarioEquipo[];
  voluntarioSeleccionado: VoluntarioEquipo | null;
  onSeleccionar: (v: VoluntarioEquipo) => void;
  filtroDia: string;
}

const getIniciales = (nombre: string, apellido: string): string => {
  const n = nombre?.trim()?.charAt(0) || '';
  const a = apellido?.trim()?.charAt(0) || '';
  return (n + a).toUpperCase() || '?';
};

const renderEstadoBadge = (estado: string) => {
  const normalizado = (estado || '').toLowerCase().trim();

  if (normalizado === 'aprobado') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success-soft px-3 py-1 text-xs font-bold text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        Aprobado
      </span>
    );
  }

  if (normalizado === 'pendiente') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning-soft px-3 py-1 text-xs font-bold text-warning">
        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
        Pendiente
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-error/30 bg-error-soft px-3 py-1 text-xs font-bold text-error">
      <span className="h-1.5 w-1.5 rounded-full bg-error" />
      {estado || 'Rechazado'}
    </span>
  );
};

export default function TablaVoluntarios({
  voluntarios,
  voluntarioSeleccionado,
  onSeleccionar,
  filtroDia,
}: TablaVoluntariosProps) {
  if (voluntarios.length === 0) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-border bg-surface-elevated p-8 text-center shadow-soft">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface text-text-subtle">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <p className="mt-3 font-display text-sm font-bold text-text">
          No se encontraron voluntarios
        </p>
        <p className="mt-1 text-xs text-text-subtle max-w-sm leading-relaxed">
          {filtroDia
            ? `No hay voluntarios con disponibilidad registrada para el día ${filtroDia} o que coincidan con la búsqueda.`
            : 'No hay voluntarios que coincidan con el término de búsqueda ingresado.'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-soft">
      <div className="flex items-center justify-between border-b border-border bg-surface px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-text-subtle">
            Equipo de Voluntarios
          </span>
          <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-xs font-semibold text-text-muted">
            {voluntarios.length}
          </span>
        </div>
        <span className="text-xs text-text-subtle">
          Selecciona un voluntario para ver sus bloques horarios
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm" role="table">
          <thead>
            <tr className="border-b border-border bg-surface-sunken text-xs font-bold uppercase tracking-wider text-text-subtle">
              <th scope="col" className="px-5 py-3.5 w-[42%]">
                Nombre
              </th>
              <th scope="col" className="px-5 py-3.5 w-[38%]">
                Habilidades
              </th>
              <th scope="col" className="px-5 py-3.5 w-[20%] text-right">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {voluntarios.map((v) => {
              const estaSeleccionado = voluntarioSeleccionado?.id_usuario === v.id_usuario;

              return (
                <tr
                  key={v.id_usuario}
                  tabIndex={0}
                  role="row"
                  aria-selected={estaSeleccionado}
                  onClick={() => onSeleccionar(v)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSeleccionar(v);
                    }
                  }}
                  className={`cursor-pointer transition-colors outline-none focus-visible:bg-surface-sunken ${
                    estaSeleccionado
                      ? 'border-l-4 border-l-primary bg-primary-soft/40 dark:bg-primary-soft/30'
                      : 'border-l-4 border-l-transparent hover:bg-surface-sunken/60'
                  }`}
                >
                  {/* Columna 1: Nombre (Espacioso y con detalle) */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3.5">
                      {v.foto_url ? (
                        <img
                          src={v.foto_url}
                          alt={`${v.nombre} ${v.apellido}`}
                          className="h-10 w-10 shrink-0 rounded-full border border-border object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary-soft text-xs font-bold text-primary">
                          {getIniciales(v.nombre, v.apellido)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-text truncate">
                            {v.nombre} {v.apellido}
                          </p>
                          {v.es_coordinador && (
                            <span className="shrink-0 rounded-md border border-accent/30 bg-accent-soft px-1.5 py-0.5 text-[10px] font-bold text-accent-text dark:text-accent">
                              Coord.
                            </span>
                          )}
                          {estaSeleccionado && (
                            <span className="shrink-0 rounded-full bg-primary/20 text-primary px-2 py-0.5 text-[10px] font-bold">
                              Activo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-subtle truncate mt-0.5">
                          {v.correo}
                        </p>
                        {v.telefono && (
                          <p className="text-[11px] text-text-subtle truncate">
                            Tel: {v.telefono}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Columna 2: Habilidades (Espacioso con badges legibles) */}
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {v.habilidades && v.habilidades.length > 0 ? (
                        v.habilidades.map((hab, idx) => (
                          <span
                            key={idx}
                            className="inline-block rounded-lg border border-border/80 bg-surface px-2.5 py-1 text-xs font-medium text-text-muted"
                          >
                            {hab}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-text-subtle italic">
                          Sin habilidades registradas
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Columna 3: Estado (Claro y visible) */}
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    {renderEstadoBadge(v.estado_voluntario)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
