import { useId, type ReactNode } from 'react';
import axios from 'axios';
export {
  claseInput,
  claseEtiqueta,
  btnPrimario,
  btnSecundario,
  tarjeta,
} from '../donaciones/estilos';

export const hoy = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/La_Paz',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
export const fechaCorta = (v: string | null | undefined) =>
  v
    ? new Intl.DateTimeFormat('es-BO', {
        timeZone: 'America/La_Paz',
        dateStyle: 'medium',
      }).format(new Date(v.length === 10 ? v + 'T12:00:00-04:00' : v))
    : 'Sin registrar';
export const mensajeError = (e: unknown) =>
  axios.isAxiosError(e)
    ? e.response?.data?.error ||
      'No se pudo completar la operación. Intenta nuevamente.'
    : 'No se pudo completar la operación.';
export function Campo({
  titulo,
  children,
  ayuda,
}: {
  titulo: string;
  children: ReactNode;
  ayuda?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.09em] text-text-muted">
        {titulo}
      </span>
      {children}
      {ayuda && (
        <span className="mt-1.5 block text-xs text-text-subtle">{ayuda}</span>
      )}
    </label>
  );
}
export function Panel({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-soft"
    >
      <header className="border-b border-border bg-surface px-5 py-4 sm:px-6">
        <h3 id={id} className="font-display text-lg font-bold text-text">
          {titulo}
        </h3>
        {descripcion && (
          <p className="mt-1 text-sm text-text-muted">{descripcion}</p>
        )}
      </header>
      <div className="space-y-5 p-5 sm:p-6">{children}</div>
    </section>
  );
}
export function Estado({ valor }: { valor: string }) {
  const color = ['Verificado', 'Aprobada', 'Entregada'].includes(valor)
    ? 'border-success/30 bg-success-soft text-success'
    : ['Rechazado', 'Rechazada', 'Inactivo', 'Eliminado'].includes(valor)
      ? 'border-error/30 bg-error-soft text-error'
      : valor === 'Preparada'
        ? 'border-primary/30 bg-primary-soft text-primary'
        : 'border-warning/30 bg-warning-soft text-text';
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${color}`}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-current"
      />
      {valor}
    </span>
  );
}
export function Aviso({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      role={error ? 'alert' : 'status'}
      className={`rounded-xl border px-4 py-3 text-sm ${error ? 'border-error/30 bg-error-soft text-error' : 'border-primary/25 bg-primary-soft text-text'}`}
    >
      {children}
    </div>
  );
}
export function Vacio({
  titulo,
  detalle,
}: {
  titulo: string;
  detalle: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border-strong bg-surface-elevated p-10 text-center">
      <svg
        aria-hidden="true"
        className="mx-auto mb-4 h-10 w-10 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeWidth="1.4"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
      <h3 className="font-display text-lg font-bold text-text">{titulo}</h3>
      <p className="mt-2 text-sm text-text-muted">{detalle}</p>
    </div>
  );
}
export function Pasos({ actual }: { actual: number }) {
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Avance de la entrega">
      {['Vínculo registrado', 'Entrega preparada', 'Entrega confirmada'].map(
        (p, i) => (
          <li
            key={p}
            className={`rounded-xl border p-3 text-xs font-bold sm:text-sm ${i <= actual ? 'border-primary/30 bg-primary-soft text-primary' : 'border-border bg-surface text-text-subtle'}`}
          >
            <span className="mb-2 block text-lg">
              {i < actual ? '✓' : String(i + 1).padStart(2, '0')}
            </span>
            {p}
          </li>
        ),
      )}
    </ol>
  );
}
export function Paginacion({
  pagina,
  total,
  onChange,
}: {
  pagina: number;
  total: number;
  onChange: (p: number) => void;
}) {
  const max = Math.max(1, Math.ceil(total / 10));
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-text-muted">
      <span>
        {total} registros · Página {pagina} de {max}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pagina <= 1}
          onClick={() => onChange(pagina - 1)}
          className="rounded-xl border border-border bg-surface px-4 py-2 disabled:opacity-40"
        >
          Anterior
        </button>
        <button
          type="button"
          disabled={pagina >= max}
          onClick={() => onChange(pagina + 1)}
          className="rounded-xl border border-border bg-surface px-4 py-2 disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
