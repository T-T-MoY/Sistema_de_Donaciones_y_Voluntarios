import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFotoPerfil } from '../../hooks/useFotoPerfil';
import ThemeToggle from '../ui/ThemeToggle';

interface HeaderProps {
  onAbrirMenu?: () => void;
}

const Header = ({ onAbrirMenu }: HeaderProps) => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fotoUrl = useFotoPerfil();

  const [menuAbierto, setMenuAbierto] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const iniciales = usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U';
  const rolActual = usuario?.rol || 'Usuario';

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickFuera = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  const titulosPorRuta: Record<string, string> = {
    '/dashboard': 'Inicio',
    '/usuarios': 'Gestión de Usuarios',
    '/reportes': 'Reportes y Estadísticas',
    '/perfil': 'Mi Perfil',
  };

  const tituloActual = titulosPorRuta[location.pathname] || 'Donaciones y Voluntariados';

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-claro-borde bg-claro-tarjeta/95 px-4 backdrop-blur-md transition-colors duration-300 dark:border-oscuro-borde dark:bg-oscuro-tarjeta/95 md:px-8">

      {/* Izquierda: hamburguesa + título */}
      <div className="flex items-center gap-3">
        <button
          onClick={onAbrirMenu}
          className="press rounded-xl p-2 text-claro-texto hover:bg-claro-tinte dark:text-oscuro-texto dark:hover:bg-oscuro-tinte md:hidden"
          aria-label="Abrir menú"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h1 className="text-lg font-bold tracking-tight text-claro-texto dark:text-oscuro-texto md:text-xl">
          {tituloActual}
        </h1>
      </div>

      {/* Derecha: bienvenida + home + theme + avatar */}
      <div className="flex items-center gap-2 md:gap-4">

        <div className="mr-2 hidden border-r border-claro-borde pr-4 text-right dark:border-oscuro-borde sm:block">
          <p className="text-sm font-semibold text-claro-texto dark:text-oscuro-texto">
            ¡Bienvenido, {rolActual}!
          </p>
        </div>

        <Link
          to="/"
          title="Ir al Home (Sitio Web público)"
          className="press flex items-center gap-1.5 rounded-xl border border-claro-borde bg-claro-fondo px-3 py-2 text-xs font-semibold text-claro-primario hover:bg-claro-tinte dark:border-oscuro-borde dark:bg-oscuro-fondo dark:text-oscuro-primario dark:hover:bg-oscuro-tinte md:text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="hidden sm:inline">Ver Sitio Web</span>
        </Link>

        <ThemeToggle />

        <div className="relative ml-1 md:ml-2" ref={menuRef}>
          <div
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="press flex cursor-pointer items-center gap-2 rounded-xl p-1.5 hover:bg-claro-tinte dark:hover:bg-oscuro-tinte md:gap-3 md:p-2"
          >
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-claro-primario text-base font-bold text-white shadow-soft ring-1 ring-claro-primario/20 dark:border-oscuro-tarjeta dark:bg-oscuro-primario dark:text-oscuro-fondo dark:ring-oscuro-primario/25 md:h-10 md:w-10 md:text-lg">
              {fotoUrl ? (
                <img src={fotoUrl} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                iniciales
              )}
            </div>
            <div className="hidden md:flex items-center gap-1">
              <span className="text-sm font-medium text-claro-texto dark:text-oscuro-texto">
                {usuario?.nombre || 'Perfil'}
              </span>
              <svg className={`w-4 h-4 text-claro-texto2 dark:text-oscuro-texto2 transition-transform duration-200 ${menuAbierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          {menuAbierto && (
            <div className="animate-modal-in absolute right-0 z-50 mt-2 w-52 origin-top-right overflow-hidden rounded-2xl border border-claro-borde bg-claro-tarjeta py-2 shadow-lift dark:border-oscuro-borde dark:bg-oscuro-tarjeta">
              <Link
                to="/"
                onClick={() => setMenuAbierto(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-claro-texto dark:text-oscuro-texto hover:bg-claro-tinte dark:hover:bg-oscuro-tinte transition-colors"
              >
                <svg className="w-4 h-4 text-claro-texto2 dark:text-oscuro-texto2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Ir al Home
              </Link>
              <Link
                to="/perfil"
                onClick={() => setMenuAbierto(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-claro-texto dark:text-oscuro-texto hover:bg-claro-tinte dark:hover:bg-oscuro-tinte transition-colors"
              >
                <svg className="w-4 h-4 text-claro-texto2 dark:text-oscuro-texto2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mi perfil
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;