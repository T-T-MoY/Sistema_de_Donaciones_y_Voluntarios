import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import UbicacionTest from '../components/mapa/UbicacionTest';

// =====================================================
// TIPOS
// =====================================================
interface Kpi {
    etiqueta: string;
    valor: string;
    detalle: string;
    delta: string;
    tendencia: 'up' | 'flat';
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
const ICONOS = {
    usuarios: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    corazon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    megafono: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
    documento: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    grafico: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    tendencia: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    calendario: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    reloj: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    escudo: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    perfil: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    mas: 'M12 4v16m8-8H4',
} as const;

const KPIS_ADMIN: Kpi[] = [
    {
        etiqueta: 'Campañas',
        valor: '12+',
        detalle: 'Activas este mes',
        delta: '+2',
        tendencia: 'up',
        icono: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
        acento: 'bg-primary-soft text-primary',
    },
    {
        etiqueta: 'Donaciones',
        valor: '24/7',
        detalle: 'Registro en línea',
        delta: 'En vivo',
        tendencia: 'flat',
        icono: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
        acento: 'bg-success-soft text-success',
    },
    {
        etiqueta: 'Voluntariados',
        valor: 'Abiertos',
        detalle: 'Postulaciones activas',
        delta: '+5',
        tendencia: 'up',
        icono: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        acento: 'bg-warning-soft text-warning',
    },
    {
        etiqueta: 'Pagos QR',
        valor: 'Seguro',
        detalle: 'Verificación manual',
        delta: 'Estable',
        tendencia: 'flat',
        icono: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
        acento: 'bg-info-soft text-info',
    },
];

const KPIS_DONANTE: Kpi[] = [
    {
        etiqueta: 'Donaciones',
        valor: '3',
        detalle: 'Aportes realizados',
        delta: '+1',
        tendencia: 'up',
        icono: ICONOS.corazon,
        acento: 'bg-success-soft text-success',
    },
    {
        etiqueta: 'Campañas',
        valor: '2',
        detalle: 'Apoyadas este año',
        delta: '2026',
        tendencia: 'flat',
        icono: ICONOS.megafono,
        acento: 'bg-primary-soft text-primary',
    },
    {
        etiqueta: 'Impacto',
        valor: '45',
        detalle: 'Personas alcanzadas',
        delta: '+12',
        tendencia: 'up',
        icono: ICONOS.tendencia,
        acento: 'bg-warning-soft text-warning',
    },
    {
        etiqueta: 'Voluntariados',
        valor: '1',
        detalle: 'Participación activa',
        delta: 'Activo',
        tendencia: 'flat',
        icono: ICONOS.usuarios,
        acento: 'bg-info-soft text-info',
    },
];

const KPIS_BENEFICIARIO: Kpi[] = [
    {
        etiqueta: 'Solicitudes',
        valor: '2',
        detalle: 'En revisión',
        delta: 'Activas',
        tendencia: 'flat',
        icono: ICONOS.documento,
        acento: 'bg-info-soft text-info',
    },
    {
        etiqueta: 'Ayudas recibidas',
        valor: '1',
        detalle: 'Aprobadas',
        delta: '+1',
        tendencia: 'up',
        icono: ICONOS.check,
        acento: 'bg-success-soft text-success',
    },
    {
        etiqueta: 'Campañas',
        valor: '4',
        detalle: 'Disponibles',
        delta: 'Abiertas',
        tendencia: 'flat',
        icono: ICONOS.megafono,
        acento: 'bg-primary-soft text-primary',
    },
    {
        etiqueta: 'Estado',
        valor: 'Verificado',
        detalle: 'Perfil completo',
        delta: 'Activo',
        tendencia: 'flat',
        icono: ICONOS.escudo,
        acento: 'bg-warning-soft text-warning',
    },
];

const KPIS_VOLUNTARIO: Kpi[] = [
    {
        etiqueta: 'Postulaciones',
        valor: '3',
        detalle: 'Enviadas',
        delta: '+1',
        tendencia: 'up',
        icono: ICONOS.usuarios,
        acento: 'bg-primary-soft text-primary',
    },
    {
        etiqueta: 'Horas donadas',
        valor: '24 h',
        detalle: 'Voluntariado',
        delta: '+6 h',
        tendencia: 'up',
        icono: ICONOS.reloj,
        acento: 'bg-warning-soft text-warning',
    },
    {
        etiqueta: 'Actividades',
        valor: '2',
        detalle: 'Próximas en agenda',
        delta: 'Agenda',
        tendencia: 'flat',
        icono: ICONOS.calendario,
        acento: 'bg-info-soft text-info',
    },
    {
        etiqueta: 'Convocatorias',
        valor: '8',
        detalle: 'Disponibles',
        delta: '+3',
        tendencia: 'up',
        icono: ICONOS.megafono,
        acento: 'bg-success-soft text-success',
    },
];

const MODULOS_ADMIN: Modulo[] = [
    {
        to: '/usuarios',
        titulo: 'Gestión de Usuarios',
        descripcion: 'Administrá roles, donantes, voluntarios y permisos de la plataforma.',
        cta: 'Ir al Panel de Usuarios',
        icono: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        iconoBg: 'bg-primary-soft text-primary',
        badge: 'Admin',
        badgeClass: 'bg-primary-soft text-primary',
    },
    {
        to: '/donaciones',
        titulo: 'Gestión de Donaciones',
        descripcion: 'Registrá y supervisá las donaciones recibidas, sus montos y su destino.',
        cta: 'Administrar Donaciones',
        icono: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
        iconoBg: 'bg-success-soft text-success',
        badge: 'Donaciones',
        badgeClass: 'bg-success-soft text-success',
        enDesarrollo: true,
    },
    {
        to: '/verificar-pagos',
        titulo: 'Verificar Pagos',
        descripcion: 'Revisá los comprobantes QR de donaciones y aprobá o rechazá pagos pendientes.',
        cta: 'Ir a Verificación de Pagos',
        icono: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        iconoBg: 'bg-info-soft text-info',
        badge: 'Finanzas',
        badgeClass: 'bg-info-soft text-info',
        enDesarrollo: true,
    },
    {
        to: '/gestion-campanas',
        titulo: 'Gestión de Campañas',
        descripcion: 'Creá campañas solidarias, definí metas y seguí el avance de cada una.',
        cta: 'Gestionar Campañas',
        icono: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
        iconoBg: 'bg-warning-soft text-warning',
        badge: 'Campañas',
        badgeClass: 'bg-warning-soft text-warning',
        enDesarrollo: true,
    },
    {
        to: '/gestion-voluntariados',
        titulo: 'Gestión de Voluntariados',
        descripcion: 'Coordiná postulaciones, turnos y actividad de los voluntarios.',
        cta: 'Ir a Gestión de Voluntariados',
        icono: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        iconoBg: 'bg-error-soft text-error',
        badge: 'Voluntariado',
        badgeClass: 'bg-error-soft text-error',
        enDesarrollo: true,
    },
    {
        to: '/reportes',
        titulo: 'Reportes y Métricas',
        descripcion: 'Analizá donaciones, campañas activas y participación de voluntarios.',
        cta: 'Ver Estadísticas',
        icono: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        iconoBg: 'bg-info-soft text-info',
        badge: 'Análisis',
        badgeClass: 'bg-info-soft text-info',
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
        iconoBg: 'bg-info-soft text-info',
        enDesarrollo: true,
    },
    {
        to: '/gestion-voluntariados',
        titulo: 'Gestión de Voluntariados',
        descripcion: 'Supervisá la agenda de voluntariados, atendé a los voluntarios y gestioná cambios.',
        cta: 'Ir a Gestión de Voluntariados',
        icono: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        iconoBg: 'bg-warning-soft text-warning',
        enDesarrollo: true,
    },
    {
        to: '/gestion-campanas',
        titulo: 'Gestión de Campañas',
        descripcion: 'Consultá las campañas activas y asistí a los beneficiarios.',
        cta: 'Ir a Gestión de Campañas',
        icono: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
        iconoBg: 'bg-error-soft text-error',
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
        iconoBg: 'bg-success-soft text-success',
        badge: 'En vivo',
        badgeClass: 'bg-success-soft text-success',
        enDesarrollo: true,
    },
    {
        to: '/donaciones',
        titulo: 'Mis Donaciones',
        descripcion: 'Revisá tus aportes, los comprobantes y el historial de tus donaciones.',
        cta: 'Ver Mis Donaciones',
        icono: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
        iconoBg: 'bg-primary-soft text-primary',
        badge: 'Historial',
        badgeClass: 'bg-primary-soft text-primary',
        enDesarrollo: true,
    },
    {
        to: '/voluntariados',
        titulo: 'Voluntariados',
        descripcion: 'Descubrí las convocatorias abiertas y postulate como voluntario.',
        cta: 'Explorar Voluntariados',
        icono: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        iconoBg: 'bg-warning-soft text-warning',
        badge: 'Activo',
        badgeClass: 'bg-warning-soft text-warning',
        enDesarrollo: true,
    },
    {
        to: '/mis-voluntariados',
        titulo: 'Mis Voluntariados',
        descripcion: 'Consultá los voluntariados en los que te inscribiste y los detalles de cada uno.',
        cta: 'Ver Postulaciones',
        icono: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        iconoBg: 'bg-error-soft text-error',
        badge: 'En desarrollo',
        badgeClass: 'bg-error-soft text-error',
        enDesarrollo: true,
    },
];

const MODULOS_DONANTE: Modulo[] = [
    {
        to: '/campanas',
        titulo: 'Explorar Campañas',
        descripcion: 'Descubrí las campañas solidarias activas y elegí a quién querés apoyar con tu aporte.',
        cta: 'Explorar Campañas',
        icono: ICONOS.megafono,
        iconoBg: 'bg-success-soft text-success',
        badge: 'En vivo',
        badgeClass: 'bg-success-soft text-success',
        enDesarrollo: true,
    },
    {
        to: '/donaciones',
        titulo: 'Mis Donaciones',
        descripcion: 'Consultá tus aportes, comprobantes y el historial completo de tus donaciones.',
        cta: 'Ver Mis Donaciones',
        icono: ICONOS.documento,
        iconoBg: 'bg-primary-soft text-primary',
        badge: 'Historial',
        badgeClass: 'bg-primary-soft text-primary',
        enDesarrollo: true,
    },
    {
        to: '/mi-impacto',
        titulo: 'Mi Impacto',
        descripcion: 'Mirá cuántas personas y campañas ayudaste y el alcance real de tus aportes.',
        cta: 'Ver Mi Impacto',
        icono: ICONOS.tendencia,
        iconoBg: 'bg-warning-soft text-warning',
        badge: 'Impacto',
        badgeClass: 'bg-warning-soft text-warning',
        enDesarrollo: true,
    },
    {
        to: '/voluntariados',
        titulo: 'Voluntariados',
        descripcion: 'Sumate a convocatorias abiertas y participá como voluntario en tu comunidad.',
        cta: 'Explorar Voluntariados',
        icono: ICONOS.usuarios,
        iconoBg: 'bg-info-soft text-info',
        badge: 'Comunidad',
        badgeClass: 'bg-info-soft text-info',
        enDesarrollo: true,
    },
];

const MODULOS_BENEFICIARIO: Modulo[] = [
    {
        to: '/solicitar-apoyo',
        titulo: 'Solicitar Apoyo',
        descripcion: 'Registrá una solicitud de ayuda indicando tus necesidades prioritarias.',
        cta: 'Nueva Solicitud',
        icono: ICONOS.mas,
        iconoBg: 'bg-success-soft text-success',
        badge: 'Nuevo',
        badgeClass: 'bg-success-soft text-success',
        enDesarrollo: true,
    },
    {
        to: '/mis-solicitudes',
        titulo: 'Mis Solicitudes',
        descripcion: 'Seguí el estado de tus solicitudes y revisá las respuestas recibidas.',
        cta: 'Ver Mis Solicitudes',
        icono: ICONOS.documento,
        iconoBg: 'bg-primary-soft text-primary',
        badge: 'Seguimiento',
        badgeClass: 'bg-primary-soft text-primary',
        enDesarrollo: true,
    },
    {
        to: '/campanas',
        titulo: 'Campañas Disponibles',
        descripcion: 'Explorá las campañas activas de las que podés recibir apoyo junto a tu familia.',
        cta: 'Ver Campañas',
        icono: ICONOS.megafono,
        iconoBg: 'bg-warning-soft text-warning',
        badge: 'Abiertas',
        badgeClass: 'bg-warning-soft text-warning',
        enDesarrollo: true,
    },
    {
        to: '/mi-perfil-solidario',
        titulo: 'Mi Perfil Solidario',
        descripcion: 'Completá tus datos personales para agilizar la evaluación de tus solicitudes.',
        cta: 'Completar Perfil',
        icono: ICONOS.perfil,
        iconoBg: 'bg-info-soft text-info',
        badge: 'Perfil',
        badgeClass: 'bg-info-soft text-info',
        enDesarrollo: true,
    },
];

const MODULOS_VOLUNTARIO: Modulo[] = [
    {
        to: '/convocatorias',
        titulo: 'Convocatorias',
        descripcion: 'Encontrá jornadas y actividades solidarias que necesitan voluntarios cerca de vos.',
        cta: 'Ver Convocatorias',
        icono: ICONOS.megafono,
        iconoBg: 'bg-success-soft text-success',
        badge: 'Abiertas',
        badgeClass: 'bg-success-soft text-success',
        enDesarrollo: true,
    },
    {
        to: '/mis-postulaciones',
        titulo: 'Mis Postulaciones',
        descripcion: 'Revisá las convocatorias a las que te postulaste y el estado de cada una.',
        cta: 'Ver Postulaciones',
        icono: ICONOS.check,
        iconoBg: 'bg-primary-soft text-primary',
        badge: 'Seguimiento',
        badgeClass: 'bg-primary-soft text-primary',
        enDesarrollo: true,
    },
    {
        to: '/mi-agenda',
        titulo: 'Mi Agenda',
        descripcion: 'Consultá tus próximas actividades, turnos y jornadas asignadas.',
        cta: 'Ver Mi Agenda',
        icono: ICONOS.calendario,
        iconoBg: 'bg-warning-soft text-warning',
        badge: 'Próximas',
        badgeClass: 'bg-warning-soft text-warning',
        enDesarrollo: true,
    },
    {
        to: '/mis-horas',
        titulo: 'Mis Horas',
        descripcion: 'Seguí el registro de tus horas donadas y el impacto de tu participación.',
        cta: 'Ver Mis Horas',
        icono: ICONOS.reloj,
        iconoBg: 'bg-info-soft text-info',
        badge: 'Registro',
        badgeClass: 'bg-info-soft text-info',
        enDesarrollo: true,
    },
];

// =====================================================
// PANEL POR ROL
// =====================================================
interface PanelRol {
    kpis: Kpi[];
    modulos: Modulo[];
    descripcion: string;
    cta: { etiqueta: string; to?: string; icono: string };
    seccionTitulo: string;
    seccionSubtitulo: string;
}

const PANEL_ADMIN: PanelRol = {
    kpis: KPIS_ADMIN,
    modulos: MODULOS_ADMIN,
    descripcion: 'Supervisá usuarios, beneficiarios y actividad de la plataforma en tiempo real.',
    cta: { etiqueta: 'Ver usuarios', to: '/usuarios', icono: ICONOS.usuarios },
    seccionTitulo: 'Módulos de gestión',
    seccionSubtitulo: 'Seleccioná un módulo para empezar a operar.',
};

const PANEL_EMPLEADO: PanelRol = {
    kpis: KPIS_ADMIN,
    modulos: MODULOS_EMPLEADO,
    descripcion: 'Coordiná pagos, campañas y voluntariados de la plataforma.',
    cta: { etiqueta: 'Verificar pagos', icono: ICONOS.check },
    seccionTitulo: 'Módulos de gestión',
    seccionSubtitulo: 'Seleccioná un módulo para empezar a operar.',
};

const PANEL_DONANTE: PanelRol = {
    kpis: KPIS_DONANTE,
    modulos: MODULOS_DONANTE,
    descripcion: 'Apoyá campañas solidarias y seguí el impacto de tus aportes.',
    cta: { etiqueta: 'Donar ahora', icono: ICONOS.corazon },
    seccionTitulo: 'Tus acciones como donante',
    seccionSubtitulo: 'Estos módulos estarán disponibles próximamente.',
};

const PANEL_BENEFICIARIO: PanelRol = {
    kpis: KPIS_BENEFICIARIO,
    modulos: MODULOS_BENEFICIARIO,
    descripcion: 'Gestioná tus solicitudes de apoyo y seguí el estado de cada una.',
    cta: { etiqueta: 'Solicitar apoyo', icono: ICONOS.documento },
    seccionTitulo: 'Tus acciones como beneficiario',
    seccionSubtitulo: 'Estos módulos estarán disponibles próximamente.',
};

const PANEL_VOLUNTARIO: PanelRol = {
    kpis: KPIS_VOLUNTARIO,
    modulos: MODULOS_VOLUNTARIO,
    descripcion: 'Encontrá convocatorias y organizá tu participación solidaria.',
    cta: { etiqueta: 'Postularme', icono: ICONOS.usuarios },
    seccionTitulo: 'Tus acciones como voluntario',
    seccionSubtitulo: 'Estos módulos estarán disponibles próximamente.',
};

const PANEL_USUARIO: PanelRol = {
    kpis: KPIS_ADMIN,
    modulos: MODULOS_CLIENTE,
    descripcion: 'Explorá campañas, donaciones y voluntariados de la comunidad.',
    cta: { etiqueta: 'Explorar campañas', icono: ICONOS.megafono },
    seccionTitulo: 'Tus módulos',
    seccionSubtitulo: 'Estos módulos estarán disponibles próximamente.',
};

// Retardos escalonados sin estilos inline
const RETARDOS = [
    '[animation-delay:60ms]',
    '[animation-delay:120ms]',
    '[animation-delay:180ms]',
    '[animation-delay:240ms]',
    '[animation-delay:300ms]',
];

const retardo = (i: number): string => RETARDOS[Math.min(i, RETARDOS.length - 1)];

// =====================================================
// SUBCOMPONENTES
// =====================================================
const KpiCard = ({ kpi, index }: { kpi: Kpi; index: number }) => (
    <div
        className={`anim-rise group relative overflow-hidden rounded-2xl border border-border bg-surface-elevated p-4 shadow-soft transition-[transform,box-shadow,border-color] duration-300 ease-out-soft hover:border-accent/40 hover:shadow-lift motion-safe:hover:-translate-y-0.5 sm:p-5 ${retardo(index)}`}
    >
        <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted">
                {kpi.etiqueta}
            </span>
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${kpi.acento}`}>
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={kpi.icono} />
                </svg>
            </span>
        </div>

        <div className="font-display text-2xl font-extrabold leading-tight tracking-[-0.02em] text-text tabular-nums md:text-[1.75rem]">
            {kpi.valor}
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="min-w-0 text-xs text-text-muted">{kpi.detalle}</p>
            <span
                className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    kpi.tendencia === 'up'
                        ? 'bg-success-soft text-success'
                        : 'bg-surface-inset text-text-subtle'
                }`}
            >
                {kpi.tendencia === 'up' && (
                    <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                    </svg>
                )}
                {kpi.delta}
            </span>
        </div>
    </div>
);

const ModuloCard = ({ modulo, index }: { modulo: Modulo; index: number }) => (
    <div
        className={`anim-rise group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface-elevated p-5 shadow-soft transition-[transform,box-shadow,border-color] duration-300 ease-out-soft hover:border-accent/45 hover:shadow-lift motion-safe:hover:-translate-y-1 sm:p-6 ${retardo(index)}`}
    >
        <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[2px] w-0 bg-linear-to-r from-accent to-accent/30 transition-[width] duration-300 ease-out-soft group-hover:w-full"
        />

        <div>
            <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${modulo.iconoBg} transition-transform duration-300 ease-out-soft motion-safe:group-hover:scale-105`}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={modulo.icono} />
                </svg>
            </div>

            <div className="mb-2 flex items-start justify-between gap-3">
                <h3 className="font-display text-[1.05rem] font-bold leading-snug tracking-[-0.01em] text-text">
                    {modulo.titulo}
                </h3>
                {modulo.badge && (
                    <span className={`shrink-0 rounded-full border border-current/20 px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.12em] ${modulo.badgeClass}`}>
                        {modulo.badge}
                    </span>
                )}
            </div>

            <p className="mb-6 text-sm leading-relaxed text-text-muted">
                {modulo.descripcion}
            </p>
        </div>

        {modulo.enDesarrollo ? (
            <span
                className="pointer-events-none flex w-full select-none items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface px-4 py-3 text-center text-[12px] font-semibold text-text-subtle"
                aria-disabled="true"
                title="Módulo en desarrollo"
            >
                <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                En desarrollo
            </span>
        ) : (
            <Link
                to={modulo.to}
                className="press flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-center text-[12.5px] font-bold text-on-primary shadow-soft hover:bg-primary-hover hover:shadow-lift"
            >
                <span>{modulo.cta}</span>
                <svg
                    className="h-4 w-4 transition-transform duration-200 ease-out-soft motion-safe:group-hover:translate-x-0.5"
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

    const rolNormalizado = (usuario?.rol || '').toLowerCase();

    const panel = rolNormalizado === 'administrador' || rolNormalizado === 'admin'
        ? PANEL_ADMIN
        : rolNormalizado === 'empleado'
            ? PANEL_EMPLEADO
            : rolNormalizado === 'donante'
                ? PANEL_DONANTE
                : rolNormalizado === 'beneficiario'
                    ? PANEL_BENEFICIARIO
                    : rolNormalizado === 'voluntario'
                        ? PANEL_VOLUNTARIO
                        : PANEL_USUARIO;

    return (
        <div className="pb-10">
            <div className="space-y-8">

                {/* 1. CABECERA PERSONAL */}
                    <section className="anim-rise relative overflow-hidden rounded-3xl border border-cream/10 bg-linear-to-br from-night-3 via-night-2 to-night p-5 text-cream shadow-lift sm:p-8 md:p-10">
                        <img
                            src="/images/auth-complex.jpg"
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 h-full w-full object-cover object-center opacity-85"
                        />
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 bg-linear-to-r from-night/95 via-night/75 to-night/30"
                        />
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 bg-linear-to-t from-night/85 via-night/15 to-night/50"
                        />
                        <div aria-hidden="true" className="grid-paper-light pointer-events-none absolute inset-0 opacity-40" />
                        <div
                            aria-hidden="true"
                            className="motion-safe:animate-float-slow pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-gold/25 blur-3xl"
                        />

                        <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
                            <div className="space-y-3.5">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cream backdrop-blur-md">
                                        <span className="motion-safe:animate-pulse-dot h-1.5 w-1.5 rounded-full bg-gold" />
                                        Sesión activa
                                    </span>
                                    <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-cream/50 capitalize">
                                        {fechaFormateada}
                                    </span>
                                </div>

                                <h1 className="font-display text-3xl font-extrabold leading-[1.05] tracking-[-0.035em] text-balance text-cream md:text-4xl lg:text-[2.6rem]">
                                    {getSaludo()}, {usuario?.nombre || 'Usuario'}
                                </h1>

                                <p className="max-w-xl text-sm leading-relaxed text-cream/70 md:text-base">
                                    Panel de{' '}
                                    <span className="font-semibold text-gold-bright">
                                        {usuario?.rol || 'Usuario'}
                                    </span>
                                    . {panel.descripcion}
                                </p>
                            </div>

                            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
                                <Link
                                    to="/"
                                    className="press inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-cream/20 bg-cream/[0.06] px-5 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-cream/85 backdrop-blur-md hover:border-cream/35 hover:bg-cream/[0.12] hover:text-cream sm:w-auto"
                                    title="Volver a la página principal"
                                >
                                    <svg className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span>Ir al Home</span>
                                </Link>

                                {panel.cta.to ? (
                                    <Link
                                        to={panel.cta.to}
                                        className="press inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-gold px-5 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-night shadow-glow hover:bg-gold-bright sm:w-auto"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={panel.cta.icono} />
                                        </svg>
                                        <span>{panel.cta.etiqueta}</span>
                                    </Link>
                                ) : (
                                    <span
                                        className="pointer-events-none inline-flex w-full select-none items-center justify-center gap-2.5 rounded-xl border border-cream/15 bg-cream/[0.04] px-5 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-cream/45 sm:w-auto"
                                        aria-disabled="true"
                                        title="Módulo en desarrollo"
                                    >
                                        <svg className="h-4 w-4 text-gold/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={panel.cta.icono} />
                                        </svg>
                                        <span>{panel.cta.etiqueta}</span>
                                        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                                    </span>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* 2. MÉTRICAS KPI */}
                    <section className="grid grid-cols-2 gap-4 md:gap-5 xl:grid-cols-4">
                        {panel.kpis.map((kpi, i) => (
                            <KpiCard key={kpi.etiqueta} kpi={kpi} index={i} />
                        ))}
                    </section>

                    {/* 3. MÓDULOS DE GESTIÓN */}
                    <section>
                        <div className="anim-rise mb-6 flex flex-wrap items-end justify-between gap-3 [animation-delay:120ms]">
                            <div>
                                <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-text">
                                    {panel.seccionTitulo}
                                </h2>
                                <p className="mt-1 text-sm text-text-muted">
                                    {panel.seccionSubtitulo}
                                </p>
                            </div>
                            <span className="rounded-full border border-border bg-surface-elevated px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-text-muted shadow-soft">
                                {panel.modulos.length} {panel.modulos.length === 1 ? 'módulo' : 'módulos'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                            {panel.modulos.map((modulo, i) => (
                                <ModuloCard key={modulo.to + modulo.titulo} modulo={modulo} index={i} />
                            ))}
                        </div>
                    </section>

                    {/* SECCIÓN EXCLUSIVA PARA EL ROL DE DONANTE: UBICACIÓN TEST */}
                    {rolNormalizado === 'donante' && (
                        <section className="anim-rise rounded-3xl border border-border bg-surface-elevated p-5 sm:p-6 md:p-8 shadow-soft [animation-delay:160ms]">
                            <UbicacionTest />
                        </section>
                    )}

                    {/* 4. BARRA INFORMATIVA */}
                    <section className="anim-rise flex flex-col items-start justify-between gap-5 rounded-2xl border border-border bg-surface-elevated p-5 shadow-soft [animation-delay:200ms] sm:p-6 md:flex-row md:items-center">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-display text-[0.95rem] font-bold text-text">
                                    Sistema de Donaciones y Voluntariados
                                </h4>
                                <p className="mt-1 text-xs leading-relaxed text-text-muted">
                                    Plataforma disponible las 24 horas · Conectamos donaciones,
                                    campañas y voluntariados en un solo lugar.
                                </p>
                            </div>
                        </div>

                        <div className="flex w-full shrink-0 items-center gap-3 md:w-auto">
                            <Link
                                to="/perfil"
                                className="press flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-center text-[11.5px] font-bold text-text-muted hover:border-accent/50 hover:bg-accent-soft hover:text-text md:flex-none"
                            >
                                Mi perfil
                            </Link>
                            <Link
                                to="/"
                                className="press flex-1 rounded-xl bg-primary px-4 py-2.5 text-center text-[11.5px] font-bold text-on-primary shadow-soft hover:bg-primary-hover md:flex-none"
                            >
                                Ver landing
                            </Link>
                        </div>
                    </section>
            </div>
        </div>
    );
};

export default Dashboard;
