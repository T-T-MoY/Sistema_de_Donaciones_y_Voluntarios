/**
 * ============================================================================
 * ARCHIVO: HowItWorks.tsx
 * COMPONENTE: Sección explicativa "Cómo Funciona"
 * ============================================================================
 */

import React from 'react';

const STEPS = [
  {
    number: '01',
    title: 'Creá tu cuenta',
    description: 'Registrate según tu rol (Donante, Beneficiario o Voluntario) y completá tu perfil para formar parte de la red solidaria.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    ),
  },
  {
    number: '02',
    title: 'Publicá o solicitá apoyo',
    description: 'Indicá los recursos que podés aportar o detallá las necesidades prioritarias para canalizar la ayuda adecuada.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    ),
  },
  {
    number: '03',
    title: 'Coordiná y generá impacto',
    description: 'Conectá de manera directa, participá en campañas solidarias y seguí el destino de cada colaboración con total transparencia.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    ),
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section
      id="como-funciona"
      className="relative isolate overflow-hidden border-y border-white/10 bg-arena-base px-6 py-20 text-arena-ivory dark:bg-arena-night sm:py-24"
    >
      <div aria-hidden="true" className="pitch-lines pointer-events-none absolute inset-0 opacity-50" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-arena-accent/[0.10] blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-[1240px]">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[640px]">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.26em] text-arena-accent-soft">
              <span className="h-px w-8 bg-arena-accent" />
              Cómo funciona
            </span>
            <h2 className="mt-4 text-3xl font-extrabold uppercase leading-[0.98] tracking-tight text-balance sm:text-4xl lg:text-[2.9rem]">
              Ayudar es así de simple
            </h2>
            <p className="mt-3 max-w-[520px] text-base leading-relaxed text-arena-ivory/70">
              Tres pasos transparentes para conectar voluntades y recursos donde más se necesitan.
            </p>
          </div>

          <div className="hidden shrink-0 items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 md:flex">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-arena-ivory/55">Plataforma</span>
            <span className="font-mono text-lg font-bold text-arena-accent-soft">100% Solidaria</span>
          </div>
        </div>

        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className="group relative overflow-hidden rounded-3xl border border-white/12 bg-white/[0.04] p-7 transition-[transform,border-color,background-color,box-shadow] duration-300 ease-out-soft hover:border-arena-accent/40 hover:bg-white/[0.065] hover:shadow-[0_24px_60px_-36px_rgba(0,0,0,0.9)] motion-safe:hover:-translate-y-1"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[2px] w-0 bg-arena-accent transition-[width] duration-300 ease-out-soft group-hover:w-full"
              />

              <div className="mb-7 flex items-center justify-between">
                <span className="font-mono text-[2.6rem] font-black leading-none tracking-tighter text-arena-ivory/15 transition-colors duration-300 group-hover:text-arena-accent-soft/80">
                  {step.number}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-white/[0.05] text-arena-accent-soft transition-colors duration-300 group-hover:border-arena-accent/35 group-hover:bg-arena-accent/10">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {step.icon}
                  </svg>
                </span>
              </div>

              <h3 className="text-base font-extrabold uppercase tracking-[0.06em] text-arena-ivory">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-arena-ivory/70">{step.description}</p>

              <span className="mt-6 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-arena-ivory/45">
                Paso {i + 1} de 3
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M5 12h14m-6-6l6 6-6 6" />
                </svg>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
