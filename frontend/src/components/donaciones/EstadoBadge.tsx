import type { EstadoAsignacion, EstadoDonacion } from '../../types/donacion.types';
import { ETIQUETA_ESTADO, ETIQUETA_ESTADO_ASIGNACION } from '../../utils/donacionFormat';

const estilosDonacion: Record<EstadoDonacion, string> = {
  REGISTRADA: 'border-info/30 bg-info-soft text-info',
  ASIGNADA_PARCIAL: 'border-warning/30 bg-warning-soft text-warning',
  ASIGNADA_TOTAL: 'border-success/30 bg-success-soft text-success',
  ANULADA: 'border-error/30 bg-error-soft text-error',
};

const ayudaEstado: Record<EstadoDonacion, string> = {
  REGISTRADA: 'Registrada: falta confirmar la recepción de los recursos.',
  ASIGNADA_PARCIAL: 'Asignada parcial: una parte del compromiso ya tiene beneficiario.',
  ASIGNADA_TOTAL: 'Asignada total: todo el compromiso tiene beneficiario; no implica que ya se entregó.',
  ANULADA: 'Anulada: la donación no admite nuevas operaciones.',
};

const base =
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em]';

/** El estado se comunica con texto + punto: el color nunca es el único indicador. */
export const EstadoBadge = ({ estado }: { estado: EstadoDonacion }) => (
  <span title={ayudaEstado[estado]} aria-label={`${ETIQUETA_ESTADO[estado]}. ${ayudaEstado[estado]}`} className={`${base} ${estilosDonacion[estado]}`}>
    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
    {ETIQUETA_ESTADO[estado]}
  </span>
);

export const EstadoAsignacionBadge = ({ estado }: { estado: EstadoAsignacion }) => (
  <span
    className={`${base} ${
      estado === 'ACTIVA' ? 'border-success/30 bg-success-soft text-success' : 'border-border bg-surface text-text-muted'
    }`}
  >
    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
    {ETIQUETA_ESTADO_ASIGNACION[estado]}
  </span>
);
