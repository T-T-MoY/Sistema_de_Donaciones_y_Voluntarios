/**
 * ============================================================================
 * ARCHIVO: Hero.tsx
 * COMPONENTE: Portada de la landing
 * ============================================================================
 */

import React from 'react';

const IMPACTO = [
  { valor: '1.2K', etiqueta: 'Donaciones gestionadas', avance: 'w-full' },
  { valor: '320',  etiqueta: 'Voluntarios activos',    avance: 'w-4/5' },
  { valor: '850+', etiqueta: 'Familias apoyadas',      avance: 'w-11/12' },
  { valor: '12',   etiqueta: 'Campañas en curso',      avance: 'w-2/3' },
];

const AREAS_IMPACTO = [
  'Donaciones en especie',
  'Alimentos y nutrición',
  'Ropa y abrigo',
  'Voluntariado activo',
  'Educación comunitaria',
  'Apoyo a familias',
  'Campañas solidarias',
];

const GARANTIAS = ['Registro transparente', 'Conexión directa', 'Impacto comunitario'];

export const Hero: React.FC = () => {
  return (
    <section className="relative isolate overflow-hidden bg-surface text-text transition-colors duration-300 dark:bg-night dark:text-cream">
      {/* Rejilla fina */}
      <div
        aria-hidden="true"
        className="grid-paper dark:grid-paper-light pointer-events-none absolute inset-0 opacity-50"
      />

      {/* Resplandores */}
      <div
        aria-hidden="true"
        className="motion-safe:animate-float-slow pointer-events-none absolute -top-56 left-[6%] h-[620px] w-[620px] rounded-full bg-primary/[0.16] blur-[150px] dark:bg-gold/[0.16]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 right-[-8%] h-[560px] w-[560px] rounded-full bg-accent/[0.12] blur-[140px] dark:bg-night-3/70"
      />

      <div className="relative z-10 mx-auto grid max-w-[1280px] items-center gap-14 pb-20 pl-[max(1.5rem,env(safe-area-inset-left,0px))] pr-[max(1.5rem,env(safe-area-inset-right,0px))] pt-[calc(6rem+env(safe-area-inset-top,0px))] sm:pt-[calc(6.5rem+env(safe-area-inset-top,0px))] lg:grid-cols-[1.06fr_0.94fr] lg:gap-20 lg:pb-28 lg:pt-[calc(7.5rem+env(safe-area-inset-top,0px))]">
        {/* =====================================================
            MENSAJE
            ===================================================== */}
        <div>
          <h1 className="anim-rise mt-6 font-display text-[2.35rem] font-extrabold leading-[0.96] tracking-[-0.035em] text-balance text-text sm:mt-7 sm:text-6xl dark:text-cream lg:text-[4.5rem] [animation-delay:70ms]">
            Tu ayuda.
            <br />
            Tu tiempo.
            <br />
            <span className="bg-linear-[100deg] from-primary via-primary to-accent bg-clip-text text-transparent dark:from-(--brand-title-1) dark:via-(--brand-title-2) dark:to-(--brand-title-3)">
              Tu comunidad.
            </span>
          </h1>

          <p className="anim-rise mt-7 max-w-[540px] text-base leading-relaxed text-text-muted sm:text-lg dark:text-cream/85 [animation-delay:140ms]">
            Conectamos donantes, voluntarios y beneficiarios en una sola plataforma.
            Gestioná donaciones, sumate a campañas solidarias y generá impacto real con
            total transparencia.
          </p>

          {/* CTAs */}
          <div className="anim-rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center [animation-delay:210ms]">
            <a
              href="#como-funciona"
              className="press group inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary px-7 py-4 text-[12.5px] font-bold uppercase tracking-[0.14em] text-on-primary shadow-glow outline-none transition-transform duration-200 ease-out-soft hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface dark:bg-gold dark:text-night dark:hover:bg-gold-bright dark:focus-visible:ring-gold dark:focus-visible:ring-offset-night motion-safe:hover:-translate-y-0.5"
            >
              Cómo funciona
              <svg
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-300 ease-out-soft motion-safe:group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            </a>
            <a
              href="#servicios"
              className="press inline-flex items-center justify-center rounded-xl border border-border-strong px-7 py-4 text-[12.5px] font-bold uppercase tracking-[0.14em] text-text outline-none transition-colors duration-200 hover:border-primary hover:bg-surface-elevated focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface dark:border-cream/20 dark:text-cream/90 dark:hover:border-cream/40 dark:hover:bg-cream/[0.07] dark:hover:text-cream dark:focus-visible:ring-cream/40 dark:focus-visible:ring-offset-night"
            >
              Roles y apoyo
            </a>
          </div>

          {/* Garantías */}
          <ul className="anim-rise mt-9 flex flex-wrap items-center gap-x-6 gap-y-2.5 [animation-delay:280ms]">
            {GARANTIAS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-text-muted dark:text-cream/75"
              >
                <svg
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-primary dark:text-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* =====================================================
            PANEL DE IMPACTO
            ===================================================== */}
        <div className="anim-rise relative [animation-delay:180ms]">
          <div
            aria-hidden="true"
            className="absolute -inset-8 rounded-[3rem] bg-linear-to-br from-primary/20 via-transparent to-transparent blur-3xl dark:from-gold/20"
          />

          <div className="relative overflow-hidden rounded-[1.75rem] border border-border-strong bg-surface-elevated shadow-deep transition-colors duration-300 dark:border-cream/12 dark:bg-cream/[0.055] dark:backdrop-blur-md">
            {/* Cabecera del panel */}
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border px-4 py-4 dark:border-cream/10 sm:px-5">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-text-muted dark:text-cream/80">
                <span
                  aria-hidden="true"
                  className="motion-safe:animate-pulse-dot h-1.5 w-1.5 rounded-full bg-accent dark:bg-gold"
                />
                Impacto en la comunidad
              </span>
              <span className="rounded-full border border-primary/30 bg-primary-soft px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-primary dark:border-gold/30 dark:bg-gold/10 dark:text-gold-bright">
                Activo 24/7
              </span>
            </div>

            {/* Cifras */}
            <div className="grid grid-cols-2">
              {IMPACTO.map((item, i) => (
                <div
                  key={item.etiqueta}
                  className={`group px-4 py-5 transition-colors duration-300 hover:bg-surface dark:hover:bg-cream/[0.04] sm:px-5 sm:py-6 ${
                    i % 2 === 1 ? 'border-l border-border dark:border-cream/10' : ''
                  } ${i > 1 ? 'border-t border-border dark:border-cream/10' : ''}`}
                >
                  <p className="font-display text-[1.7rem] font-extrabold leading-none tracking-tight text-text tabular-nums dark:text-cream sm:text-[2.35rem]">
                    {item.valor}
                  </p>
                  <p className="mt-2.5 text-[9.5px] font-bold uppercase tracking-[0.2em] text-text-muted dark:text-cream/75">
                    {item.etiqueta}
                  </p>
                  <span className="mt-3 block h-1 w-full overflow-hidden rounded-full bg-surface-sunken dark:bg-cream/10">
                    <span
                      className={`block h-full rounded-full bg-linear-to-r from-primary/50 to-primary dark:from-gold/50 dark:to-gold transition-[width] duration-500 ease-out-soft ${item.avance}`}
                    />
                  </span>
                </div>
              ))}
            </div>

            {/* Pie del panel */}
            <div className="flex items-center justify-between gap-3 border-t border-border bg-surface px-5 py-3.5 dark:border-cream/10 dark:bg-night/50">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted dark:text-cream/70">
                Sede La Paz
              </span>
              <span
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-text dark:text-cream/90"
                aria-label="Valoración 4.9 sobre 5"
              >
                <svg
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-accent dark:text-gold"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
                </svg>
                4.9
                <span className="text-text-subtle dark:text-cream/50">/ 5</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          CINTA DE ÁREAS DE IMPACTO
          ===================================================== */}
      <div className="relative z-10 border-y border-border bg-surface-sunken/70 py-3.5 transition-colors duration-300 dark:border-cream/10 dark:bg-night/60">
        <div className="marquee-mask overflow-hidden">
          <div className="marquee-track flex w-max items-center hover:[animation-play-state:paused] motion-reduce:animate-none">
            {[0, 1].map((copia) => (
              <div
                key={copia}
                aria-hidden={copia === 1}
                className="flex items-center gap-8 pr-8"
              >
                {AREAS_IMPACTO.map((area) => (
                  <span
                    key={`${copia}-${area}`}
                    className="flex items-center gap-8 whitespace-nowrap text-[10.5px] font-bold uppercase tracking-[0.3em] text-text-muted dark:text-cream/70"
                  >
                    {area}
                    <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent/60 dark:bg-gold/60" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;