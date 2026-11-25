interface Props {
  estado: string;
  nombre: string;
  disabled?: boolean;
  onChange: (estado: 'Aprobado' | 'Rechazado') => void;
}

const estilos: Record<string, string> = {
  pendiente: 'bg-warning/10 text-warning',
  aprobado: 'bg-success/10 text-success',
  rechazado: 'bg-error/10 text-error',
};

export default function EstadoSolicitudBadge({ estado, nombre, disabled = false, onChange }: Props) {
  const estadoNormalizado = estado.toLowerCase();
  const etiqueta = estadoNormalizado.charAt(0).toUpperCase() + estadoNormalizado.slice(1);
  return (
    <span className="relative inline-flex">
      <select
        value={estado}
        disabled={disabled}
        aria-label={`Cambiar estado de la solicitud de ${nombre}`}
        title="Cambiar estado"
        onChange={(event) => {
          if (event.target.value === 'Aprobado' || event.target.value === 'Rechazado') {
            onChange(event.target.value);
          }
        }}
        className={`appearance-none rounded-full py-1 pl-2.5 pr-7 text-xs font-semibold outline-none ring-primary/30 focus:ring-2 disabled:cursor-wait disabled:opacity-60 ${estilos[estadoNormalizado] ?? 'bg-surface-sunken text-text-subtle'}`}
      >
        <option value={estado}>{etiqueta}</option>
        {estado !== 'Pendiente' && <option value="Pendiente" disabled>Pendiente</option>}
        {estado !== 'Aprobado' && <option value="Aprobado">Aprobado</option>}
        {estado !== 'Rechazado' && <option value="Rechazado">Rechazado</option>}
      </select>
      <svg
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
        fill="currentColor"
        aria-hidden="true"
      >
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.09 1.032l-4.25 4.5a.75.75 0 0 1-1.09 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
      </svg>
    </span>
  );
}
