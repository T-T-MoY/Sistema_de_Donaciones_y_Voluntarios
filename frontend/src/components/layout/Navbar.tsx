import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import IconLogo from '../../assets/logo.svg?react';

// =====================================================
// TIPOS
// =====================================================
type Rol = 'Administrador' | 'Empleado' | 'Cliente' | 'Usuario';

interface MenuItem {
    path: string;
    name: string;
    icon: string;
    roles: Rol[];
    enDesarrollo?: boolean;
}

interface NavbarProps {
    abierto: boolean;
    onCerrar: () => void;
}

// =====================================================
// COMPONENTE
// =====================================================
const Navbar = ({ abierto, onCerrar }: NavbarProps) => {
    const { usuario } = useAuth();

    const menuItems: MenuItem[] = [
        { 
            path: '/dashboard', 
            name: 'Inicio', 
            icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', 
            roles: ['Administrador', 'Empleado', 'Cliente', 'Usuario'] 
        },
        { 
            path: '/usuarios', 
            name: 'Usuarios', 
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', 
            roles: ['Administrador'] 
        },
        { 
            path: '/canchas', 
            name: 'En desarrollo', 
            icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', 
            roles: ['Administrador', 'Empleado', 'Cliente', 'Usuario'],
            enDesarrollo: true
        },
        { 
            path: '/reservas', 
            name: 'En desarrollo', 
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', 
            roles: ['Cliente', 'Usuario'],
            enDesarrollo: true
        },
        { 
            path: '/gestion-reservas', 
            name: 'En desarrollo', 
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', 
            roles: ['Administrador', 'Empleado'],
            enDesarrollo: true
        },
        { 
            path: '/eventos', 
            name: 'En desarrollo', 
            icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z', 
            roles: ['Administrador', 'Empleado', 'Cliente', 'Usuario'],
            enDesarrollo: true
        },
        { 
            path: '/mis-inscripciones', 
            name: 'En desarrollo', 
            icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', 
            roles: ['Cliente', 'Usuario'],
            enDesarrollo: true
        },
        { 
            path: '/gestion-eventos', 
            name: 'En desarrollo', 
            icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5', 
            roles: ['Administrador', 'Empleado'],
            enDesarrollo: true
        },
        { 
            path: '/reportes', 
            name: 'En desarrollo', 
            icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', 
            roles: ['Administrador'],
            enDesarrollo: true
        }
    ];

    const rolActual: Rol = (usuario?.rol as Rol) || 'Usuario';
    const menuFiltrado = menuItems.filter(item => item.roles.includes(rolActual));

    return (
        <>
            {/* Overlay en móvil */}
            {abierto && (
                <div 
                    className="anim-fade fixed inset-0 z-40 bg-night/70 backdrop-blur-sm md:hidden"
                    onClick={onCerrar}
                    aria-hidden="true"
                />
            )}

            <aside className={`
                fixed left-0 top-0 z-50 flex h-screen w-64 flex-col
                bg-night text-cream
                transition-transform duration-300 ease-out-soft
                ${abierto ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0
            `}>
                {/* Filo dorado */}
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-0 w-px bg-linear-to-b from-transparent via-gold/40 to-transparent"
                />
                <div aria-hidden="true" className="grid-paper-light pointer-events-none absolute inset-0 opacity-30" />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-24 top-24 h-56 w-56 rounded-full bg-gold/[0.10] blur-[90px]"
                />

                {/* Marca */}
                <Link 
                    to="/" 
                    onClick={onCerrar}
                    className="press group relative z-10 flex items-center gap-3 border-b border-cream/10 px-5 py-5"
                    title="Ir a la página principal / Home"
                >
                    <IconLogo className="h-10 w-10 shrink-0 transition-transform duration-300 ease-out-soft motion-safe:group-hover:rotate-[-4deg]" />
                    <div className="flex min-w-0 flex-col leading-none">
                        <span className="font-display text-[12.5px] font-bold tracking-[-0.01em] text-cream">
                            Donaciones <span className="text-gold">&amp; Voluntariados</span>
                        </span>
                        <span className="mt-1.5 text-[8px] font-semibold uppercase tracking-[0.26em] text-cream/40">
                            Plataforma de gestión
                        </span>
                    </div>
                </Link>

                {/* Navegación */}
                <nav className="relative z-10 flex-1 overflow-y-auto px-3 py-5">
                    <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.28em] text-cream/35">
                        Navegación
                    </p>

                    <ul className="space-y-1">
                        {menuFiltrado.map((item) => (
                            <li key={item.path}>
                                {item.enDesarrollo ? (
                                    <span
                                        className="flex cursor-not-allowed select-none items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-cream/30"
                                        aria-disabled="true"
                                        title="Módulo en desarrollo"
                                    >
                                        <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                                        </svg>
                                        <span className="truncate">{item.name}</span>
                                        <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-cream/20" />
                                    </span>
                                ) : (
                                    <NavLink 
                                        key={item.path} 
                                        to={item.path} 
                                        onClick={onCerrar}   
                                        className={({ isActive }) => `
                                            press group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors duration-200
                                            ${isActive 
                                                ? 'bg-cream/[0.08] font-semibold text-cream' 
                                                : 'font-medium text-cream/60 hover:bg-cream/[0.05] hover:text-cream'
                                            }
                                        `}
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <span
                                                    aria-hidden="true"
                                                    className={`absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-full bg-gold transition-opacity duration-200 ${
                                                        isActive ? 'opacity-100' : 'opacity-0'
                                                    }`}
                                                />
                                                <svg
                                                    className={`h-[18px] w-[18px] shrink-0 transition-colors duration-200 ${
                                                        isActive ? 'text-gold' : 'text-cream/45 group-hover:text-gold/80'
                                                    }`}
                                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                                                </svg>
                                                <span className="truncate">{item.name}</span>
                                            </>
                                        )}
                                    </NavLink>
                                )}
                            </li>
                        ))}
                    </ul>

                    <div className="mt-6 rounded-xl border border-cream/10 bg-cream/[0.04] p-3.5">
                        <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-cream/45">
                            <span className="motion-safe:animate-pulse-dot h-1.5 w-1.5 rounded-full bg-gold" />
                            Versión en curso
                        </p>
                        <p className="mt-2 text-[11px] leading-relaxed text-cream/45">
                            Los módulos marcados se habilitarán en la próxima entrega.
                        </p>
                    </div>
                </nav>

                {/* Pie del sidebar */}
                <div className="relative z-10 border-t border-cream/10 p-3">
                    <Link
                        to="/"
                        onClick={onCerrar}
                        className="press flex w-full items-center justify-center gap-2 rounded-xl border border-cream/15 bg-cream/[0.05] px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.1em] text-cream/80 hover:border-gold/45 hover:text-gold-bright"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Volver al Home
                    </Link>
                </div>
            </aside>
        </>
    );
};

export default Navbar;
