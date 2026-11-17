/**
 * ============================================================================
 * ARCHIVO: ServicesShowcase.tsx
 * COMPONENTE: Sección de Roles y Áreas de Participación del Sistema
 * ============================================================================
 */

import React from 'react';

const SERVICES = [
  {
    title: 'Administrador',
    description: 'Supervisa la plataforma, gestiona usuarios, valida solicitudes de beneficiarios y asegura la transparencia en cada proceso.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
  },
  {
    title: 'Donante',
    description: 'Publica y canaliza donaciones en especie o recursos esenciales para apoyar a personas, familias e instituciones vulnerables.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    ),
  },
  {
    title: 'Beneficiario',
    description: 'Registra y gestiona solicitudes de ayuda indicando necesidades prioritarias para recibir asistencia directa y digna.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    ),
  },
  {
    title: 'Voluntario',
    description: 'Participa activamente en campañas solidarias, jornadas de acopio, distribución y actividades comunitarias en terreno.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    title: 'Campañas Solidarias',
    description: 'Iniciativas colectivas organizadas con metas claras para canalizar esfuerzos ante emergencias o causas prioritarias.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    ),
  },
  {
    title: 'Trazabilidad y Transparencia',
    description: 'Seguimiento y registro claro de cada donación para asegurar que la ayuda llegue efectivamente a su destino final.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    ),
  },
];

export const ServicesShowcase: React.FC = () => {
  return (
    <section
      id="servicios"
      className="relative isolate overflow-hidden bg-arena-deep px-6 py-20 dark:bg-arena-night sm:py-24"
    >
      <div aria-hidden="true" className="pitch-lines-ink pointer-events-none absolute inset-0 opacity-40 dark:hidden" />

      <div className="relative z-10 mx-auto max-w-[1240px]">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[640px]">
            <span className="inline-flex items-center gap-2 rounded-md bg-arena-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-arena-accent-soft dark:bg-arena-accent dark:text-arena-ink">
              Ecosistema Solidario
            </span>
            <h2 className="mt-4 text-3xl font-extrabold uppercase leading-[0.98] tracking-tight text-arena-ivory text-balance dark:text-arena-ivory sm:text-4xl lg:text-[2.9rem]">
              Roles y Participación
            </h2>
            <p className="mt-3 max-w-[520px] text-base leading-relaxed text-arena-ivory/60 dark:text-arena-ivory/55">
              Una estructura organizada donde cada actor cumple un rol fundamental para transformar realidades.
            </p>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-arena-ivory/40 dark:text-arena-ivory/35">
              4 roles principales
            </span>
            <span className="h-px w-16 bg-arena-ivory/15 dark:bg-white/15" />
          </div>
        </div>

        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className="group relative overflow-hidden rounded-2xl border border-arena-ink/10 bg-arena-ivory p-7 transition-[transform,border-color,box-shadow] duration-300 ease-out-soft hover:border-arena-accent/60 hover:shadow-lift motion-safe:hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-arena-accent/40"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[2px] w-0 bg-arena-base transition-[width] duration-300 ease-out-soft group-hover:w-full dark:bg-arena-accent"
              />

              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-arena-ink/10 bg-arena-ink/[0.04] text-arena-ink transition-colors duration-300 group-hover:border-arena-ink/20 group-hover:bg-arena-ink group-hover:text-arena-accent dark:border-white/10 dark:bg-white/[0.04] dark:text-arena-accent dark:group-hover:border-arena-accent/30 dark:group-hover:bg-arena-accent/10">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {service.icon}
                </svg>
              </span>

              <h3 className="mt-5 text-base font-extrabold uppercase tracking-[0.05em] text-arena-ink dark:text-arena-ivory">
                {service.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-arena-ink2 dark:text-arena-ivory/55">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesShowcase;
