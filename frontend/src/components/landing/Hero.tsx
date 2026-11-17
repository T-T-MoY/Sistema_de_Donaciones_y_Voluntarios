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
    <section className="relative isolate overflow-hidden bg-night text-cream">
      {/* Rejilla fina */}
      <div
        aria-hidden="true"
        className="grid-paper-light pointer-events-none absolute inset-0 opacity-50"
      />

      {/* Resplandores */}
      <div
        aria-hidden="true"
        className="motion-safe:animate-float-slow pointer-events-none absolute -top-56 left-[6%] h-[620px] w-[620px] rounded-full bg-gold/[0.16] blur-[150px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 right-[-8%] h-[560px] w-[560px] rounded-full bg-night-3/70 blur-[140px]"
      />

      <div className="relative z-10 mx-auto grid max-w-[1280px] items-center gap-14 px-6 pb-20 pt-16 lg:grid-cols-[1.06fr_0.94fr] lg:gap-20 lg:pb-28 lg:pt-24">
        {/* =====================================================
            MENSAJE
            ===================================================== */}
        <div>
          <span className="anim-rise inline-flex items-center gap-2.5 rounded-full border border-cream/15 bg-cream/[0.06] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-cream/80 backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
            </span>
            Plataforma solidaria activa · 2026
          </span>

          <h1 className="anim-rise mt-7 font-display text-[2.85rem] font-extrabold leading-[0.94] tracking-[-0.035em] text-balance text-cream sm:text-6xl lg:text-[4.5rem] [animation-delay:70ms]">
            Tu ayuda.
            <br />
            Tu tiempo.
            <br />
            <span className="text-gold-gradient">Tu comunidad.</span>
          </h1>

          <p className="anim-rise mt-7 max-w-[540px] text-base leading-relaxed text-cream/85 sm:text-lg [animation-delay:140ms]">
            Conectamos donantes, voluntarios y beneficiarios en una sola plataforma.
            Gestioná donaciones, sumate a campañas solidarias y generá impacto real con
            total transparencia.
          </p>

          {/* CTAs */}
          <div className="anim-rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center [animation-delay:210ms]">
            <a
              href="#como-funciona"
              className="press group inline-flex items-center justify-center gap-2.5 rounded-xl bg-gold px-7 py-4 text-[12.5px] font-bold uppercase tracking-[0.14em] text-night shadow-glow outline-none transition-transform duration-200 ease-out-soft hover:bg-gold-bright focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-night motion-safe:hover:-translate-y-0.5"
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
              className="press inline-flex items-center justify-center rounded-xl border border-cream/20 px-7 py-4 text-[12.5px] font-bold uppercase tracking-[0.14em] text-cream/90 outline-none transition-colors duration-200 hover:border-cream/40 hover:bg-cream/[0.07] hover:text-cream focus-visible:ring-2 focus-visible:ring-cream/40 focus-visible:ring-offset-2 focus-visible:ring-offset-night"
            >
              Roles y apoyo
            </a>
          </div>

          {/* Garantías */}
          <ul className="anim-rise mt-9 flex flex-wrap items-center gap-x-6 gap-y-2.5 [animation-delay:280ms]">
            {GARANTIAS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-cream/75"
              >
                <svg
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-gold"
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
            className="absolute -inset-8 rounded-[3rem] bg-linear-to-br from-gold/20 via-transparent to-transparent blur-3xl"
          />

          <div className="relative overflow-hidden rounded-[1.75rem] border border-cream/12 bg-cream/[0.055] shadow-deep backdrop-blur-md">
            {/* Cabecera del panel */}
            <div className="flex items-center justify-between gap-3 border-b border-cream/10 px-5 py-4">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-cream/80">
                <span
                  aria-hidden="true"
                  className="motion-safe:animate-pulse-dot h-1.5 w-1.5 rounded-full bg-gold"
                />
                Impacto en la comunidad
              </span>
              <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-gold-bright">
                Activo 24/7
              </span>
            </div>

            {/* Cifras */}
            <div className="grid grid-cols-2">
              {IMPACTO.map((item, i) => (
                <div
                  key={item.etiqueta}
                  className={`group px-5 py-6 transition-colors duration-300 hover:bg-cream/[0.04] ${
                    i % 2 === 1 ? 'border-l border-cream/10' : ''
                  } ${i > 1 ? 'border-t border-cream/10' : ''}`}
                >
                  <p className="font-display text-[2rem] font-extrabold leading-none tracking-tight text-cream tabular-nums sm:text-[2.35rem]">
                    {item.valor}
                  </p>
                  <p className="mt-2.5 text-[9.5px] font-bold uppercase tracking-[0.2em] text-cream/75">
                    {item.etiqueta}
                  </p>
                  <span className="mt-3 block h-1 w-full overflow-hidden rounded-full bg-cream/10">
                    <span
                      className={`block h-full rounded-full bg-linear-to-r from-gold/50 to-gold transition-[width] duration-500 ease-out-soft ${item.avance}`}
                    />
                  </span>
                </div>
              ))}
            </div>

            {/* Pie del panel */}
            <div className="flex items-center justify-between gap-3 border-t border-cream/10 bg-night/50 px-5 py-3.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/70">
                Sede La Paz
              </span>
              <span
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cream/90"
                aria-label="Valoración 4.9 sobre 5"
              >
                <svg
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-gold"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
                </svg>
                4.9
                <span className="text-cream/50">/ 5</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          CINTA DE ÁREAS DE IMPACTO
          ===================================================== */}
      <div className="relative z-10 border-y border-cream/10 bg-night/60 py-3.5">
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
                    className="flex items-center gap-8 whitespace-nowrap text-[10.5px] font-bold uppercase tracking-[0.3em] text-cream/70"
                  >
                    {area}
                    <span aria-hidden="true" className="h-1 w-1 rounded-full bg-gold/60" />
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