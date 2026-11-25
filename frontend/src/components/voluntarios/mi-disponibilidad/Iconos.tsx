/** Iconos SVG livianos del panel "Mi Disponibilidad" (sin dependencias extra). */

interface IconoProps {
  className?: string;
}

const svgProps = {
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const IconoBase = ({ className, d }: IconoProps & { d: string }) => (
  <svg className={`h-5 w-5 shrink-0 ${className ?? ''}`} aria-hidden="true" {...svgProps}>
    <path d={d} />
  </svg>
);

export const IconoCalendario = (p: IconoProps) => (
  <IconoBase {...p} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
);

export const IconoReloj = (p: IconoProps) => (
  <IconoBase {...p} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
);

export const IconoMas = (p: IconoProps) => (
  <IconoBase {...p} d="M12 5v14M5 12h14" />
);

export const IconoEditar = (p: IconoProps) => (
  <IconoBase {...p} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
);

export const IconoCheckCirculo = (p: IconoProps) => (
  <IconoBase {...p} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
);

export const IconoCheck = (p: IconoProps) => (
  <IconoBase {...p} d="M5 13l4 4L19 7" />
);

export const IconoInfo = (p: IconoProps) => (
  <IconoBase {...p} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
);

export const IconoAlerta = (p: IconoProps) => (
  <IconoBase {...p} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
);

export const IconoUsuario = (p: IconoProps) => (
  <IconoBase {...p} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
);

export const IconoCorreo = (p: IconoProps) => (
  <IconoBase {...p} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
);

export const IconoPausa = (p: IconoProps) => (
  <IconoBase {...p} d="M10 9v6m4-6v6m5-3a9 9 0 11-18 0 9 9 0 0118 0z" />
);

export const IconoReintentar = (p: IconoProps) => (
  <IconoBase {...p} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
);
