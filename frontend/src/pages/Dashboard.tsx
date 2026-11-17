import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// =====================================================
// TIPOS
// =====================================================
interface Kpi {
    etiqueta: string;
    valor: string;
    detalle: string;
    icono: string;
    acento: string;
}

interface Modulo {
    to: string;
    titulo: string;
    descripcion: string;
    cta: string;
    icono: string;
    iconoBg: string;
    badge?: string;
    badgeClass?: string;
    enDesarrollo?: boolean;
}

// =====================================================
// DATOS
// =====================================================
const KPIS: Kpi[] = [
    {
        etiqueta: 'Campañas',
        valor: '12+',
        detalle: 'Activas este mes',
        icono: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
        acento: 'bg-claro-primario/10 text-claro-primario dark:bg-oscuro-primario/15 dark:text-oscuro-primario',
    },
    {
        etiqueta: 'Donaciones',
        valor: '24/7',
        detalle: 'Registro en línea',
        icono: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
        acento: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    },
    {
        etiqueta: 'Voluntariados',
        valor: 'Abiertos',
        detalle: 'Postulaciones activas',
        icono: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        acento: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    },
    {
        etiqueta: 'Pagos QR',
        valor: 'Seguro',
        detalle: 'Verificación manual',
        icono: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
        acento: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
    },
];

const MODULOS_ADMIN: Modulo[] = [
    {
        to: '/usuarios',
        titulo: 'Gestión de Usuarios',
        descripcion: 'Administrá roles, donantes, voluntarios y permisos de la plataforma.',
        cta: 'Ir al Panel de Usuarios',
        icono: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        iconoBg: 'bg-claro-primario/10 text-claro-primario dark:bg-oscuro-primario/15 dark:text-oscuro-primario',
        badge: 'Admin',
        badgeClass: 'bg-claro-primario/10 text-claro-primario dark:bg-oscuro-primario/15 dark:text-oscuro-primario',
    },
    {
        to: '/donaciones',
        titulo: 'Gestión de Donaciones',
        descripcion: 'Registrá y supervisá las donaciones recibidas, sus montos y su destino.',
        cta: 'Administrar Donaciones',
        icono: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
        iconoBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
        badge: 'Donaciones',
        badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        enDesarrollo: true,
    },
    {
        to: '/verificar-pagos',
        titulo: 'Verificar Pagos',
        descripcion: 'Revisá los comprobantes QR de donaciones y aprobá o rechazá pagos pendientes.',
        cta: 'Ir a Verificación de Pagos',
        icono: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        iconoBg: 'bg-purple-500/15 text-sky-700 dark:text-sky-300',
        badge: 'Finanzas',
        badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-200',
        enDesarrollo: true,
    },
    {
        to: '/gestion-campanas',
        titulo: 'Gestión de Campañas',
        descripcion: 'Creá campañas solidarias, definí metas y seguí el avance de cada una.',
        cta: 'Gestionar Campañas',
        icono: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
        iconoBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
        badge: 'Campañas',
        badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        enDesarrollo: true,
    },
    {
        to: '/gestion-voluntariados',
        titulo: 'Gestión de Voluntariados',
        descripcion: 'Coordiná postulaciones, turnos y actividad de los voluntarios.',
        cta: 'Ir a Gestión de Voluntariados',
        icono: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        iconoBg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
        badge: 'Voluntariado',
        badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
        enDesarrollo: true,
    },
    {
        to: '/reportes',
        titulo: 'Reportes y Métricas',
        descripcion: 'Analizá donaciones, campañas activas y participación de voluntarios.',
        cta: 'Ver Estadísticas',
        icono: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        iconoBg: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
        badge: 'Análisis',
        badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-200',
        enDesarrollo: true,
    },
];

const MODULOS_EMPLEADO: Modulo[] = [
    {
        to: '/verificar-pagos',
        titulo: 'Verificar Pagos',
        descripcion: 'Aprobá o rechazá comprobantes de donaciones pendientes de los donantes de manera rápida.',
        cta: 'Ir a Verificación de Pagos',
        icono: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        iconoBg: 'bg-purple-500/15 text-sky-700 dark:text-sky-300',
        enDesarrollo: true,
    },
    {
        to: '/gestion-voluntariados',
        titulo: 'Gestión de Voluntariados',
        descripcion: 'Supervisá la agenda de voluntariados, atendé a los voluntarios y gestioná cambios.',
        cta: 'Ir a Gestión de Voluntariados',
        icono: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        iconoBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
        enDesarrollo: true,
    },
    {
        to: '/gestion-campanas',
        titulo: 'Gestión de Campañas',
        descripcion: 'Consultá las campañas activas y asistí a los beneficiarios.',
        cta: 'Ir a Gestión de Campañas',
        icono: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
        iconoBg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
        enDesarrollo: true,
    },
];

const MODULOS_CLIENTE: Modulo[] = [
    {
        to: '/campanas',
        titulo: 'Campañas Solidarias',
        descripcion: 'Explorá las campañas activas y elegí a quién querés apoyar con tu donación.',
        cta: 'Explorar Campañas',
        icono: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
        iconoBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
        badge: 'En vivo',
        badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        enDesarrollo: true,
    },
    {
        to: '/donaciones',
        titulo: 'Mis Donaciones',
        descripcion: 'Revisá tus aportes, los comprobantes y el historial de tus donaciones.',
        cta: 'Ver Mis Donaciones',
        icono: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
        iconoBg: 'bg-claro-primario/10 text-claro-primario dark:bg-oscuro-primario/15 dark:text-oscuro-primario',
        badge: 'Historial',
        badgeClass: 'bg-claro-primario/10 text-claro-primario dark:bg-oscuro-primario/15 dark:text-oscuro-primario',
        enDesarrollo: true,
    },
    {
        to: '/voluntariados',
        titulo: 'Voluntariados',
        descripcion: 'Descubrí las convocatorias abiertas y postulate como voluntario.',
        cta: 'Explorar Voluntariados',
        icono: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        iconoBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
        badge: 'Activo',
        badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        enDesarrollo: true,
    },
    {
        to: '/mis-voluntariados',
        titulo: 'Mis Voluntariados',
        descripcion: 'Consultá los voluntariados en los que te inscribiste y los detalles de cada uno.',
        cta: 'Ver Postulaciones',
        icono: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        iconoBg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
        badge: 'En desarrollo',
        badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200',
        enDesarrollo: true,
    },
];

// =====================================================
// SUBCOMPONENTES
// =====================================================
const KpiCard = ({ kpi, index }: { kpi: Kpi; index: number }) => (
    <div
        className="anim-rise group relative overflow-hidden bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde shadow-soft transition-[transform,box-shadow,border-color] duration-300 ease-out-soft motion-safe:hover:-translate-y-0.5 hover:shadow-lift hover:border-claro-primario/25 dark:hover:border-oscuro-primario/35"
        style={{ animationDelay: `${60 + index * 60}ms` }}
    >
        <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase font-bold tracking-wider text-claro-texto2 dark:text-oscuro-texto2">
                {kpi.etiqueta}
            </span>
            <span className={`flex items-center justify-center w-9 h-9 rounded-xl ${kpi.acento}`}>
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={kpi.icono} />
                </svg>
            </span>
        </div>
        <div className="text-2xl md:text-[1.75rem] font-bold leading-tight tabular-nums text-claro-texto dark:text-oscuro-texto">
            {kpi.valor}
        </div>
        <p className="text-xs text-claro-texto2 dark:text-oscuro-texto2 mt-1">{kpi.detalle}</p>
    </div>
);

const ModuloCard = ({ modulo, index }: { modulo: Modulo; index: number }) => (
    <div
        className="anim-rise group bg-claro-tarjeta dark:bg-oscuro-tarjeta p-6 rounded-3xl border border-claro-borde dark:border-oscuro-borde shadow-soft flex flex-col justify-between transition-[transform,box-shadow,border-color] duration-300 ease-out-soft motion-safe:hover:-translate-y-1 hover:shadow-lift hover:border-claro-primario/35 dark:hover:border-oscuro-primario/45"
        style={{ animationDelay: `${Math.min(60 + index * 45, 320)}ms` }}
    >
        <div>
            <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${modulo.iconoBg} transition-transform duration-300 ease-out-soft motion-safe:group-hover:scale-105`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={modulo.icono} />
                </svg>
            </div>

            <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-xl font-bold leading-snug text-claro-texto dark:text-oscuro-texto">
                    {modulo.titulo}
                </h3>
                {modulo.badge && (
                    <span className={`shrink-0 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${modulo.badgeClass}`}>
                        {modulo.badge}
                    </span>
                )}
            </div>

            <p className="text-claro-texto2 dark:text-oscuro-texto2 text-sm leading-relaxed mb-6">
                {modulo.descripcion}
            </p>
        </div>

        {modulo.enDesarrollo ? (
            <span
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-center bg-claro-tinte dark:bg-oscuro-tinte text-claro-texto2/80 dark:text-oscuro-texto2/80 opacity-60 cursor-not-allowed pointer-events-none select-none"
                aria-disabled="true"
                title="Módulo en desarrollo"
            >
                En desarrollo
            </span>
        ) : (
            <Link
                to={modulo.to}
                className="press w-full py-3 px-4 rounded-xl font-semibold text-sm text-center bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo shadow-[0_14px_30px_-18px_rgba(14,110,109,0.8)] transition-colors duration-200 flex items-center justify-center gap-2"
            >
                <span>{modulo.cta}</span>
                <svg
                    className="w-4 h-4 transition-transform duration-200 ease-out-soft motion-safe:group-hover:translate-x-0.5"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </Link>
        )}
    </div>
);

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================
const Dashboard = () => {
    const { usuario } = useAuth();

    const getSaludo = () => {
        const hora = new Date().getHours();
        if (hora < 12) return 'Buenos días';
        if (hora < 19) return 'Buenas tardes';
        return 'Buenas noches';
    };

    const fechaFormateada = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const esAdmin = usuario?.rol === 'Administrador' || usuario?.rol === 'Admin';
    const esEmpleado = usuario?.rol === 'Empleado';

    const modulos = esAdmin
        ? MODULOS_ADMIN
        : esEmpleado
            ? MODULOS_EMPLEADO
            : MODULOS_CLIENTE;

    return (
        <div className="space-y-8 pb-10">

            {/* =========================================================
                1. CABECERA PERSONAL
               ========================================================= */}
            <div className="anim-rise relative overflow-hidden rounded-3xl bg-linear-to-br from-arena-base via-arena-deep to-arena-night p-8 md:p-10 text-arena-ivory shadow-lift border border-white/10">
                <div aria-hidden="true" className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-arena-accent/20 blur-3xl pointer-events-none" />
                <div aria-hidden="true" className="absolute right-32 -bottom-20 w-72 h-72 rounded-full bg-arena-wine/25 blur-3xl pointer-events-none" />
                <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none opacity-[0.06] [background-size:28px_28px] bg-[radial-gradient(#f6f3ea_1px,transparent_1px)]"
                />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-7">
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/20 text-arena-ivory">
                                <span className="w-2 h-2 rounded-full bg-arena-accent motion-safe:animate-pulse" />
                                Sesión activa
                            </span>
                            <span className="text-xs uppercase tracking-wider text-arena-ivory/65 capitalize">
                                {fechaFormateada}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-[2.9rem] font-extrabold tracking-tight leading-[1.08] text-arena-ivory text-balance">
                            {getSaludo()}, {usuario?.nombre || 'Usuario'} 👋
                        </h1>

                        <p className="text-arena-ivory/75 text-base md:text-lg max-w-xl">
                            Panel de <span className="font-semibold text-arena-accent-soft">{usuario?.rol || 'Usuario'}</span>. Supervisá usuarios, beneficiarios y actividad de la plataforma en tiempo real.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <Link
                            to="/"
                            className="press motion-safe:hover:-translate-y-0.5 inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-arena-ivory font-semibold text-sm backdrop-blur-md shadow-soft"
                            title="Volver a la página principal"
                        >
                            <svg className="w-5 h-5 text-arena-accent-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>Volver al Home</span>
                        </Link>

                        {esAdmin ? (
                            <Link
                                to="/usuarios"
                                className="press motion-safe:hover:-translate-y-0.5 inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-arena-accent hover:bg-arena-accent-hover text-arena-ink font-semibold text-sm shadow-[0_18px_36px_-18px_rgba(245,178,103,0.7)]"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span>Explorar Usuarios</span>
                            </Link>
                        ) : (
                            <span
                                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white/10 border border-white/20 text-arena-ivory font-semibold text-sm opacity-60 cursor-not-allowed pointer-events-none select-none backdrop-blur-md"
                                aria-disabled="true"
                                title="Módulo en desarrollo"
                            >
                                <svg className="w-5 h-5 text-arena-accent-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span>En desarrollo</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* =========================================================
                2. MÉTRICAS KPI
               ========================================================= */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                {KPIS.map((kpi, i) => (
                    <KpiCard key={kpi.etiqueta} kpi={kpi} index={i} />
                ))}
            </div>

            {/* =========================================================
                3. MÓDULOS DE GESTIÓN
               ========================================================= */}
            <div>
                <div className="anim-rise flex flex-wrap items-end justify-between gap-3 mb-6 [animation-delay:120ms]">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-claro-texto dark:text-oscuro-texto">
                            Módulos de gestión
                        </h2>
                        <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2">
                            Seleccioná un módulo para empezar a operar.
                        </p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full border border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta text-claro-texto2 dark:text-oscuro-texto2">
                        {modulos.length} {modulos.length === 1 ? 'módulo disponible' : 'módulos disponibles'}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                    {modulos.map((modulo, i) => (
                        <ModuloCard key={modulo.to + modulo.titulo} modulo={modulo} index={i} />
                    ))}
                </div>
            </div>

            {/* =========================================================
                4. BARRA INFORMATIVA
               ========================================================= */}
            <div className="anim-rise rounded-3xl bg-claro-tarjeta dark:bg-oscuro-tarjeta border border-claro-borde dark:border-oscuro-borde shadow-soft p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 [animation-delay:200ms]">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-claro-primario/10 dark:bg-oscuro-primario/10 text-claro-primario dark:text-oscuro-primario flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="font-bold text-claro-texto dark:text-oscuro-texto">
                            Sistema de Donaciones y Voluntariados
                        </h4>
                        <p className="text-xs leading-relaxed text-claro-texto2 dark:text-oscuro-texto2">
                            Plataforma disponible las 24 horas · Conectamos donaciones, campañas y voluntariados en un solo lugar.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                    <Link
                        to="/perfil"
                        className="press flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-semibold text-center border border-claro-borde dark:border-oscuro-borde hover:bg-claro-tinte dark:hover:bg-oscuro-tinte text-claro-primario dark:text-oscuro-primario transition-colors duration-200"
                    >
                        Mi Perfil
                    </Link>
                    <Link
                        to="/"
                        className="press flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-semibold text-center bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover text-white dark:text-oscuro-fondo shadow-[0_12px_26px_-16px_rgba(14,110,109,0.8)] transition-colors duration-200"
                    >
                        Ver Landing Page
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
