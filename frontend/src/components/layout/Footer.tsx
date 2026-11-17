/**
 * ============================================================================
 * ARCHIVO: Footer.tsx
 * COMPONENTE: Pie de página institucional
 * ============================================================================
 */

import React from 'react';
import { Link } from 'react-router-dom';

const linkClass =
  'text-sm text-arena-ivory/65 transition-colors duration-200 hover:text-arena-accent-soft';

const tituloColumna =
  'mb-4 text-[10px] font-bold uppercase tracking-[0.24em] text-arena-ivory/50';

export const Footer: React.FC = () => {
  return (
    <footer id="contacto" className="relative mt-auto overflow-hidden bg-arena-night text-arena-ivory">
      <div aria-hidden="true" className="h-px w-full bg-linear-to-r from-transparent via-arena-accent/40 to-transparent" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 right-[-5%] h-[380px] w-[380px] rounded-full bg-arena-accent/[0.07] blur-[110px]"
      />

      <div className="relative z-10 mx-auto max-w-[1240px] px-6 pb-8 pt-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">

          {/* Marca */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-arena-accent text-arena-ink">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </span>
              <span className="text-lg font-extrabold uppercase tracking-[0.18em]">
                Donaciones <span className="text-arena-accent-soft">& Voluntariados</span>
              </span>
            </div>

            <p className="mt-4 max-w-[300px] text-sm leading-relaxed text-arena-ivory/60">
              Plataforma para coordinar y canalizar donaciones solidarias y actividades de voluntariado con total transparencia e impacto comunitario.
            </p>

            <p className="mt-5 flex items-center gap-2 text-sm text-arena-ivory/55">
              <svg className="h-4 w-4 text-arena-accent-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Av. Universitaria #450, La Paz
            </p>
          </div>

          {/* Áreas de Apoyo */}
          <div>
            <h4 className={tituloColumna}>Áreas de Apoyo</h4>
            <ul className="flex flex-col gap-3">
              <li><a href="#servicios" className={linkClass}>Donaciones en especie</a></li>
              <li><a href="#servicios" className={linkClass}>Alimentos y abrigo</a></li>
              <li><a href="#servicios" className={linkClass}>Campañas solidarias</a></li>
              <li><a href="#servicios" className={linkClass}>Voluntariado activo</a></li>
            </ul>
          </div>

          {/* Sistema */}
          <div>
            <h4 className={tituloColumna}>Sistema</h4>
            <ul className="flex flex-col gap-3">
              <li><Link to="/login" className={linkClass}>Iniciar sesión</Link></li>
              <li><Link to="/registro" className={linkClass}>Crear cuenta</Link></li>
              <li><a href="#como-funciona" className={linkClass}>Cómo funciona</a></li>
              <li><a href="#servicios" className={linkClass}>Roles y participación</a></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className={tituloColumna}>Contacto</h4>
            <ul className="flex flex-col gap-3 text-sm text-arena-ivory/65">
              <li className="flex items-center gap-2.5">
                <svg className="h-4 w-4 shrink-0 text-arena-ivory/25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h2.5a1 1 0 011 .8l1 3.5a1 1 0 01-.4 1L7.5 9.5a12 12 0 007 7l1.2-1.6a1 1 0 011-.4l3.5 1a1 1 0 01.8 1V19a2 2 0 01-2 2A16 16 0 013 5z" />
                </svg>
                +591 (2) 244-8900
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="h-4 w-4 shrink-0 text-arena-ivory/25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 3h8a2 2 0 012 2v14a2 2 0 01-2 2H8a2 2 0 01-2-2V5a2 2 0 012-2zm2 16h4" />
                </svg>
                WhatsApp +591 789-01234
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="h-4 w-4 shrink-0 text-arena-ivory/25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.9 5.26a2 2 0 002.2 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                contacto@donacionesyvoluntariado.bo
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="h-4 w-4 shrink-0 text-arena-ivory/25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 7v5l3 2" />
                </svg>
                Atención: Lun a Vie · 08:30 – 18:00
              </li>
            </ul>
          </div>
        </div>

        {/* Wordmark de cierre */}
        <div className="mt-14 select-none overflow-hidden border-t border-white/10 pt-8">
          <p
            aria-hidden="true"
            className="whitespace-nowrap text-[13vw] font-black uppercase leading-[0.8] tracking-[-0.04em] text-arena-ivory/[0.045]"
          >
            SOLIDARIDAD
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[11px] font-medium uppercase tracking-[0.14em] text-arena-ivory/45">
          <p>© {new Date().getFullYear()} Donaciones y Voluntariados · Todos los derechos reservados</p>
          <p>Proyecto Análisis y Diseño de Datos — UMSA</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
