/**
 * ============================================================================
 * ARCHIVO: LandingNavbar.tsx
 * COMPONENTE: Barra de navegación pública principal
 * - Plataforma de Donaciones y Voluntariados
 * ============================================================================
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFotoPerfil } from '../../hooks/useFotoPerfil';
import ThemeToggle from '../ui/ThemeToggle';
import IconLogo from '../../assets/logo.svg?react';

const ENLACES = [
  { href: '#como-funciona', label: 'Cómo funciona', enDesarrollo: false },
  { href: '#servicios', label: 'Roles y áreas', enDesarrollo: false },
  { href: '#contacto', label: 'Contacto', enDesarrollo: false },
  { href: '#', label: 'En desarrollo', enDesarrollo: true },
];

export const LandingNavbar = () => {
  const { usuario, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const fotoUrl = useFotoPerfil();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuMovil, setMenuMovil] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = usuario?.rol === 'Admin' || usuario?.rol === 'Administrador';
  const iniciales = usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Cerrar dropdown al click fuera
  useEffect(() => {
    const handleClickFuera = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  // El menú móvil no debe quedar abierto al pasar a desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const cerrar = () => mq.matches && setMenuMovil(false);
    mq.addEventListener('change', cerrar);
    return () => mq.removeEventListener('change', cerrar);
  }, []);

  // =====================================================
  // ESTILOS COMPARTIDOS
  // =====================================================
  const enlaceNav =
    'group relative rounded-full px-3 py-2 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-cream/65 transition-colors duration-200 hover:text-cream';

  const ctaGold =
    'press inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.12em] text-night shadow-glow hover:bg-gold-bright';

  const ctaGhost =
    'press inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-5 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-cream/80 hover:border-white/30 hover:bg-white/[0.07] hover:text-cream';

  const badgeDesarrollo =
    'inline-flex items-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-cream/40 select-none';

  return (
    <header className="sticky top-0 z-50 border-b border-night-line bg-night/90 backdrop-blur-xl">
      {/* Filo dorado */}
      <div
        aria-hidden="true"
        className="h-px w-full bg-linear-to-r from-transparent via-gold/70 to-transparent"
      />

      <div className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between gap-4 px-5 md:px-8">
        {/* LOGO */}
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-3 rounded-xl"
          title="Ir a la página principal / Home"
          onClick={() => setMenuMovil(false)}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition-colors duration-300 group-hover:border-gold/40">
            <IconLogo className="h-8 w-8 transition-transform duration-300 ease-out-soft motion-safe:group-hover:rotate-[-4deg]" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[13.5px] font-bold uppercase tracking-[0.12em] text-cream">
              Donaciones <span className="text-gold">& Voluntariados</span>
            </span>
            <span className="mt-1.5 text-[8px] font-semibold uppercase tracking-[0.3em] text-cream/45">
              Plataforma de gestión
            </span>
          </span>
        </Link>

        {/* NAV PÚBLICA */}
        <nav className="hidden items-center gap-1 md:flex">
          {ENLACES.map((enlace) =>
            enlace.enDesarrollo ? (
              <span
                key={enlace.label}
                className="ml-1 inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-dashed border-white/15 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.18em] text-cream/40 select-none"
                aria-disabled="true"
              >
                <span className="h-1 w-1 rounded-full bg-gold/70" />
                {enlace.label}
              </span>
            ) : (
              <a key={enlace.href} href={enlace.href} className={enlaceNav}>
                {enlace.label}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 bottom-0.5 h-px origin-left scale-x-0 bg-gold transition-transform duration-300 ease-out-soft group-hover:scale-x-100"
                />
              </a>
            )
          )}
        </nav>

        {/* ZONA DERECHA */}
        <div className="flex items-center gap-2 md:gap-2.5">
          <ThemeToggle variant="dark" />

          {isAuthenticated ? (
            <>
              <Link to={isAdmin ? '/usuarios' : '/dashboard'} className={`${ctaGhost} hidden sm:inline-flex`}>
                {isAdmin ? 'Panel admin' : 'Mi panel'}
              </Link>

              {/* Dropdown de usuario */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuAbierto(!menuAbierto)}
                  aria-expanded={menuAbierto}
                  aria-haspopup="menu"
                  className="press flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] p-1.5 pr-2 hover:border-white/25 hover:bg-white/10"
                >
                  <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gold text-sm font-bold text-night">
                    {fotoUrl ? (
                      <img src={fotoUrl} alt="Perfil" className="h-full w-full object-cover" />
                    ) : (
                      iniciales
                    )}
                  </span>
                  <span className="hidden max-w-[110px] truncate text-xs font-semibold text-cream/85 md:block">
                    {usuario?.nombre || 'Perfil'}
                  </span>
                  <svg
                    className={`h-4 w-4 text-cream/50 transition-transform duration-200 ${menuAbierto ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {menuAbierto && (
                  <div
                    role="menu"
                    className="anim-fade absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-night-line bg-night-2/98 p-1.5 shadow-deep backdrop-blur-xl"
                  >
                    <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cream/45">
                      {usuario?.rol || 'Sesión'}
                    </p>

                    <Link
                      to={isAdmin ? '/usuarios' : '/dashboard'}
                      onClick={() => setMenuAbierto(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-cream/80 transition-colors hover:bg-white/[0.06] hover:text-cream"
                    >
                      <svg className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      {isAdmin ? 'Panel admin' : 'Mi panel'}
                    </Link>

                    <span className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-cream/35 select-none">
                      <svg className="h-4 w-4 text-cream/25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      En desarrollo
                    </span>

                    <Link
                      to="/perfil"
                      onClick={() => setMenuAbierto(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-cream/80 transition-colors hover:bg-white/[0.06] hover:text-cream"
                    >
                      <svg className="h-4 w-4 text-cream/45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Mi perfil
                    </Link>

                    <div className="my-1 h-px bg-white/10" />

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-error transition-colors hover:bg-error/10"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={`${ctaGhost} hidden sm:inline-flex`}>
                Ingresar
              </Link>
              <span className={`${ctaGold} hidden opacity-60 pointer-events-none md:inline-flex`} aria-disabled="true">
                Próximamente
              </span>
            </>
          )}

          {/* Botón menú móvil */}
          <button
            type="button"
            onClick={() => setMenuMovil(!menuMovil)}
            aria-expanded={menuMovil}
            aria-controls="menu-movil"
            aria-label={menuMovil ? 'Cerrar menú' : 'Abrir menú'}
            className="press flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-cream md:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuMovil ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h10" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* =====================================================
          MENÚ MÓVIL
          ===================================================== */}
      {menuMovil && (
        <div
          id="menu-movil"
          className="anim-fade border-t border-night-line bg-night-2/98 px-5 pb-6 pt-4 md:hidden"
        >
          <nav className="flex flex-col">
            {ENLACES.map((enlace) =>
              enlace.enDesarrollo ? (
                <span
                  key={enlace.label}
                  className="flex items-center justify-between border-b border-white/[0.06] py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-cream/40 select-none"
                  aria-disabled="true"
                >
                  {enlace.label}
                </span>
              ) : (
                <a
                  key={enlace.href}
                  href={enlace.href}
                  onClick={() => setMenuMovil(false)}
                  className="flex items-center justify-between border-b border-white/[0.06] py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-cream/80 transition-colors hover:text-cream"
                >
                  {enlace.label}
                  <svg className="h-4 w-4 text-cream/25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )
            )}
          </nav>

          <div className="mt-5 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <>
                <Link
                  to={isAdmin ? '/usuarios' : '/dashboard'}
                  onClick={() => setMenuMovil(false)}
                  className={`${ctaGold} w-full`}
                >
                  {isAdmin ? 'Ir al panel admin' : 'Ir a mi panel'}
                </Link>
                <span className={`${badgeDesarrollo} w-full justify-center`} aria-disabled="true">
                  En desarrollo
                </span>
              </>
            ) : (
              <>
                <span className={`${badgeDesarrollo} w-full justify-center`} aria-disabled="true">
                  Registro próximamente
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <Link to="/login" onClick={() => setMenuMovil(false)} className={`${ctaGhost} w-full`}>
                    Ingresar
                  </Link>
                  <Link to="/registro" onClick={() => setMenuMovil(false)} className={`${ctaGhost} w-full`}>
                    Registro
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
