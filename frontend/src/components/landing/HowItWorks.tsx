/**
 * ============================================================================
 * ARCHIVO: HowItWorks.tsx
 * COMPONENTE: Sección explicativa "Cómo Funciona"
 * - Tres pasos con conectores visuales.
 * - Aparición escalonada al entrar en pantalla.
 * ============================================================================
 */

import React from 'react';
import { Reveal } from '../ui/Reveal';

const STEPS = [
  {
    number: '01',
    title: 'Creá tu cuenta',
    description:
      'Registrate según tu rol (Donante, Beneficiario o Voluntario) y completá tu perfil para formar parte de la red solidaria.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    ),
  },
  {
    number: '02',
    title: 'Publicá o solicitá apoyo',
    description:
      'Indicá los recursos que podés aportar o detallá las necesidades prioritarias para canalizar la ayuda adecuada.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    ),
  },
  {
    number: '03',
    title: 'Coordiná y generá impacto',
    description:
      'Conectá de manera directa, participá en campañas solidarias y seguí el destino de cada colaboración con total transparencia.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    ),
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section
      id="como-funciona"
      className="relative isolate overflow-hidden bg-surface-sunken py-20 pl-[max(1.5rem,env(safe-area-inset-left,0px))] pr-[max(1.5rem,env(safe-area-inset-right,0px))] sm:py-24"
    >
      <div aria-hidden="true" className="grid-paper pointer-events-none absolute inset-0 opacity-60" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-accent/[0.10] blur-[130px]"
      />

      <div className="relative z-10 mx-auto max-w-[1240px]">
        <Reveal>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[640px]">
              <span className="inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.26em] text-accent-text">
                <span className="h-px w-8 bg-accent" />
                Cómo funciona
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.02] tracking-[-0.03em] text-balance text-text sm:text-4xl lg:text-[2.9rem]">
                Ayudar es así de simple
              </h2>
              <p className="mt-4 max-w-[520px] text-base leading-relaxed text-text-muted">
                Tres pasos transparentes para conectar voluntades y recursos donde más se
                necesitan.
              </p>
            </div>

            <div className="hidden shrink-0 items-center gap-3 self-start rounded-2xl border border-border bg-surface-elevated px-4 py-3 shadow-soft md:flex">
              <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-text-subtle">
                Plataforma
              </span>
              <span className="font-display text-base font-bold text-primary">100% solidaria</span>
            </div>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-5">
          {STEPS.map((step, i) => (
            <Reveal key={step.number} delay={(i + 1) as 1 | 2 | 3} className="h-full">
              <div className="group flex h-full flex-col">
                {/* Conector */}
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent-soft font-display text-sm font-bold text-accent-text shadow-soft transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent">
                    {step.number}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="hidden h-px flex-1 bg-linear-to-r from-border-strong via-border to-transparent md:block"
                    />
                  )}
                </div>

                {/* Tarjeta */}
                <div className="lift relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated p-7 shadow-soft hover:border-accent/45 hover:shadow-lift">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-[2px] w-0 bg-linear-to-r from-accent to-accent/40 transition-[width] duration-300 ease-out-soft group-hover:w-full"
                  />

                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-on-primary">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {step.icon}
                    </svg>
                  </span>

                  <h3 className="mt-5 font-display text-[1.05rem] font-bold leading-snug tracking-[-0.01em] text-text">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-text-muted">{step.description}</p>

                  <span className="mt-auto pt-6 text-[9.5px] font-bold uppercase tracking-[0.2em] text-text-subtle">
                    Paso {i + 1} de {STEPS.length}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
