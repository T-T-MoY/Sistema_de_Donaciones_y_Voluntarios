import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import { usuarioApi } from '../api/usuario.api';
import ConfirmModal from '../components/ui/ConfirmModal';
import type { SolicitudVoluntario, SolicitudBeneficiario } from '../types/usuario.types';

// =====================================================
// TIPOS
// =====================================================
type RolKey = 'admin' | 'coordinador' | 'voluntario' | 'donante' | 'beneficiario' | 'usuario';

interface Kpi {
    clave: string;
    etiqueta: string;
    valor: string;
    detalle: string;
    delta: string;
    tendencia: 'up' | 'flat';
    icono: string;
    acento: string;
}

interface Modulo {
    clave: string;
    rol: RolKey;
    rolEtiqueta: string;
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
// ICONOS Y DATOS BASE
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
    tarjeta: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
} as const;

const KPIS_POR_ROL: Record<RolKey, Kpi[]> = {
    admin: [
        { clave: 'campanas', etiqueta: 'Campañas', valor: '12+', detalle: 'Activas este mes', delta: '+2', tendencia: 'up', icono: ICONOS.megafono, acento: 'bg-primary-soft text-primary' },
        { clave: 'donaciones', etiqueta: 'Donaciones', valor: '24/7', detalle: 'Registro en línea', delta: 'En vivo', tendencia: 'flat', icono: ICONOS.corazon, acento: 'bg-success-soft text-success' },
        { clave: 'voluntariados', etiqueta: 'Voluntariados', valor: 'Abiertos', detalle: 'Postulaciones activas', delta: '+5', tendencia: 'up', icono: ICONOS.usuarios, acento: 'bg-warning-soft text-warning' },
        { clave: 'pagos', etiqueta: 'Pagos QR', valor: 'Seguro', detalle: 'Verificación manual', delta: 'Estable', tendencia: 'flat', icono: ICONOS.tarjeta, acento: 'bg-info-soft text-info' },
    ],
    coordinador: [
        { clave: 'convocatorias', etiqueta: 'Convocatorias', valor: '8', detalle: 'Activas para equipo', delta: '+3', tendencia: 'up', icono: ICONOS.megafono, acento: 'bg-success-soft text-success' },
        { clave: 'actividades', etiqueta: 'Actividades', valor: '2', detalle: 'Próximas en agenda', delta: 'Agenda', tendencia: 'flat', icono: ICONOS.calendario, acento: 'bg-info-soft text-info' },
        { clave: 'horas', etiqueta: 'Horas donadas', valor: '24 h', detalle: 'Voluntariado', delta: '+6 h', tendencia: 'up', icono: ICONOS.reloj, acento: 'bg-warning-soft text-warning' },
        { clave: 'postulaciones', etiqueta: 'Postulaciones', valor: '3', detalle: 'Enviadas', delta: '+1', tendencia: 'up', icono: ICONOS.usuarios, acento: 'bg-primary-soft text-primary' },
    ],
    voluntario: [
        { clave: 'postulaciones', etiqueta: 'Postulaciones', valor: '3', detalle: 'Enviadas', delta: '+1', tendencia: 'up', icono: ICONOS.usuarios, acento: 'bg-primary-soft text-primary' },
        { clave: 'horas', etiqueta: 'Horas donadas', valor: '24 h', detalle: 'Voluntariado', delta: '+6 h', tendencia: 'up', icono: ICONOS.reloj, acento: 'bg-warning-soft text-warning' },
        { clave: 'actividades', etiqueta: 'Actividades', valor: '2', detalle: 'Próximas en agenda', delta: 'Agenda', tendencia: 'flat', icono: ICONOS.calendario, acento: 'bg-info-soft text-info' },
        { clave: 'convocatorias', etiqueta: 'Convocatorias', valor: '8', detalle: 'Disponibles', delta: '+3', tendencia: 'up', icono: ICONOS.megafono, acento: 'bg-success-soft text-success' },
    ],
    donante: [
        { clave: 'donaciones', etiqueta: 'Donaciones', valor: '3', detalle: 'Aportes realizados', delta: '+1', tendencia: 'up', icono: ICONOS.corazon, acento: 'bg-success-soft text-success' },
        { clave: 'campanas', etiqueta: 'Campañas', valor: '2', detalle: 'Apoyadas este año', delta: '2026', tendencia: 'flat', icono: ICONOS.megafono, acento: 'bg-primary-soft text-primary' },
        { clave: 'impacto', etiqueta: 'Impacto', valor: '45', detalle: 'Personas alcanzadas', delta: '+12', tendencia: 'up', icono: ICONOS.tendencia, acento: 'bg-warning-soft text-warning' },
        { clave: 'voluntariados', etiqueta: 'Voluntariados', valor: '1', detalle: 'Participación activa', delta: 'Activo', tendencia: 'flat', icono: ICONOS.usuarios, acento: 'bg-info-soft text-info' },
    ],
    beneficiario: [
        { clave: 'solicitudes', etiqueta: 'Solicitudes', valor: '2', detalle: 'En revisión', delta: 'Activas', tendencia: 'flat', icono: ICONOS.documento, acento: 'bg-info-soft text-info' },
        { clave: 'ayudas', etiqueta: 'Ayudas recibidas', valor: '1', detalle: 'Aprobadas', delta: '+1', tendencia: 'up', icono: ICONOS.check, acento: 'bg-success-soft text-success' },
        { clave: 'campanas', etiqueta: 'Campañas', valor: '4', detalle: 'Disponibles', delta: 'Abiertas', tendencia: 'flat', icono: ICONOS.megafono, acento: 'bg-primary-soft text-primary' },
        { clave: 'estado', etiqueta: 'Estado', valor: 'Verificado', detalle: 'Perfil completo', delta: 'Activo', tendencia: 'flat', icono: ICONOS.escudo, acento: 'bg-warning-soft text-warning' },
    ],
    usuario: [
        { clave: 'campanas', etiqueta: 'Campañas', valor: '12+', detalle: 'Activas este mes', delta: '+2', tendencia: 'up', icono: ICONOS.megafono, acento: 'bg-primary-soft text-primary' },
        { clave: 'donaciones', etiqueta: 'Donaciones', valor: '24/7', detalle: 'Registro en línea', delta: 'En vivo', tendencia: 'flat', icono: ICONOS.corazon, acento: 'bg-success-soft text-success' },
        { clave: 'voluntariados', etiqueta: 'Voluntariados', valor: 'Abiertos', detalle: 'Postulaciones activas', delta: '+5', tendencia: 'up', icono: ICONOS.usuarios, acento: 'bg-warning-soft text-warning' },
        { clave: 'pagos', etiqueta: 'Pagos QR', valor: 'Seguro', detalle: 'Verificación manual', delta: 'Estable', tendencia: 'flat', icono: ICONOS.tarjeta, acento: 'bg-info-soft text-info' },
    ],
};

const MODULOS_POR_ROL: Record<RolKey, Modulo[]> = {
    admin: [
        {
            clave: 'usuarios',
            rol: 'admin',
            rolEtiqueta: 'Administración',
            to: '/usuarios',
            titulo: 'Gestión de Usuarios',
            descripcion: 'Administrá roles, donantes, voluntarios y permisos de la plataforma.',
            cta: 'Ir al Panel de Usuarios',
            icono: ICONOS.usuarios,
            iconoBg: 'bg-primary-soft text-primary',
            badge: 'Admin',
            badgeClass: 'bg-primary-soft text-primary',
        },
        {
            clave: 'donaciones-admin',
            rol: 'admin',
            rolEtiqueta: 'Administración',
            to: '/donaciones',
            titulo: 'Gestión de Donaciones',
            descripcion: 'Registrá y supervisá las donaciones recibidas, sus montos y su destino.',
            cta: 'Administrar Donaciones',
            icono: ICONOS.corazon,
            iconoBg: 'bg-success-soft text-success',
            badge: 'Donaciones',
            badgeClass: 'bg-success-soft text-success',
        },
        {
            clave: 'campanas-admin',
            rol: 'admin',
            rolEtiqueta: 'Administración',
            to: '/campanas',
            titulo: 'Gestión de Campañas',
            descripcion: 'Creá campañas solidarias, definí metas y seguí el avance de cada una.',
            cta: 'Gestionar Campañas',
            icono: ICONOS.megafono,
            iconoBg: 'bg-warning-soft text-warning',
            badge: 'Campañas',
            badgeClass: 'bg-warning-soft text-warning',
        },
        {
            clave: 'voluntarios-admin',
            rol: 'admin',
            rolEtiqueta: 'Administración',
            to: '/voluntarios',
            titulo: 'Gestión de Voluntariados',
            descripcion: 'Coordiná postulaciones, turnos y actividad de los voluntarios.',
            cta: 'Ir a Voluntariados',
            icono: ICONOS.usuarios,
            iconoBg: 'bg-error-soft text-error',
            badge: 'Voluntariado',
            badgeClass: 'bg-error-soft text-error',
        },
        {
            clave: 'beneficios-admin',
            rol: 'admin',
            rolEtiqueta: 'Administración',
            to: '/beneficios',
            titulo: 'Beneficiarios y Ayudas',
            descripcion: 'Administrá fichas, solicitudes de ayuda y apoyos asignados.',
            cta: 'Gestionar Beneficiarios',
            icono: ICONOS.documento,
            iconoBg: 'bg-info-soft text-info',
            badge: 'Beneficios',
            badgeClass: 'bg-info-soft text-info',
        },
        {
            clave: 'reportes-admin',
            rol: 'admin',
            rolEtiqueta: 'Administración',
            to: '/reportes',
            titulo: 'Reportes y Métricas',
            descripcion: 'Analizá donaciones, campañas activas y participación de voluntarios.',
            cta: 'Ver Estadísticas',
            icono: ICONOS.grafico,
            iconoBg: 'bg-info-soft text-info',
            badge: 'Análisis',
            badgeClass: 'bg-info-soft text-info',
        },
    ],
    coordinador: [
        {
            clave: 'equipo-voluntarios',
            rol: 'coordinador',
            rolEtiqueta: 'Coordinación',
            to: '/voluntarios',
            titulo: 'Coordinación de Voluntarios',
            descripcion: 'Supervisá al equipo, revisá postulaciones, asistencia y disponibilidad.',
            cta: 'Gestionar Equipo',
            icono: ICONOS.usuarios,
            iconoBg: 'bg-primary-soft text-primary',
            badge: 'Coordinador',
            badgeClass: 'bg-primary-soft text-primary',
        },
        {
            clave: 'asistencia-equipo',
            rol: 'coordinador',
            rolEtiqueta: 'Coordinación',
            to: '/voluntarios/asistencia',
            titulo: 'Control de Asistencia',
            descripcion: 'Registrá y validá la asistencia de voluntarios en cada jornada.',
            cta: 'Ver Asistencia',
            icono: ICONOS.check,
            iconoBg: 'bg-success-soft text-success',
            badge: 'Jornadas',
            badgeClass: 'bg-success-soft text-success',
        },
        {
            clave: 'reportes-coordinador',
            rol: 'coordinador',
            rolEtiqueta: 'Coordinación',
            to: '/reportes',
            titulo: 'Reportes y Notificaciones',
            descripcion: 'Consulta la actividad del voluntariado y comunica avisos a tu equipo autorizado.',
            cta: 'Abrir módulo',
            icono: ICONOS.grafico,
            iconoBg: 'bg-info-soft text-info',
            badge: 'Sprint 6',
            badgeClass: 'bg-info-soft text-info',
        },
    ],
    voluntario: [
        {
            clave: 'convocatorias',
            rol: 'voluntario',
            rolEtiqueta: 'Voluntariado',
            to: '/campanas?seccion=actividades',
            titulo: 'Convocatorias Abiertas',
            descripcion: 'Encontrá jornadas y actividades solidarias que necesitan voluntarios.',
            cta: 'Ver Convocatorias',
            icono: ICONOS.megafono,
            iconoBg: 'bg-success-soft text-success',
            badge: 'Abiertas',
            badgeClass: 'bg-success-soft text-success',
        },
        {
            clave: 'mis-actividades',
            rol: 'voluntario',
            rolEtiqueta: 'Voluntariado',
            to: '/campanas?seccion=mis-actividades',
            titulo: 'Postulaciones y Horas',
            descripcion: 'Seguí el estado de tus postulaciones y el registro de horas acreditadas.',
            cta: 'Ver Mis Actividades',
            icono: ICONOS.reloj,
            iconoBg: 'bg-primary-soft text-primary',
            badge: 'Seguimiento',
            badgeClass: 'bg-primary-soft text-primary',
        },
        {
            clave: 'disponibilidad',
            rol: 'voluntario',
            rolEtiqueta: 'Voluntariado',
            to: '/mi-disponibilidad',
            titulo: 'Mi Disponibilidad Semanal',
            descripcion: 'Editá tus horarios disponibles para facilitar la coordinación de turnos.',
            cta: 'Editar Disponibilidad',
            icono: ICONOS.calendario,
            iconoBg: 'bg-warning-soft text-warning',
            badge: 'Agenda',
            badgeClass: 'bg-warning-soft text-warning',
        },
    ],
    donante: [
        {
            clave: 'campanas',
            rol: 'donante',
            rolEtiqueta: 'Donante',
            to: '/campanas',
            titulo: 'Campañas Solidarias',
            descripcion: 'Descubrí campañas activas y elegí a quién querés apoyar con tu aporte.',
            cta: 'Explorar Campañas',
            icono: ICONOS.megafono,
            iconoBg: 'bg-success-soft text-success',
            badge: 'En vivo',
            badgeClass: 'bg-success-soft text-success',
        },
        {
            clave: 'mis-donaciones',
            rol: 'donante',
            rolEtiqueta: 'Donante',
            to: '/donaciones',
            titulo: 'Mis Donaciones',
            descripcion: 'Consultá tus aportes, comprobantes y el historial completo de tus donaciones.',
            cta: 'Ver Mis Donaciones',
            icono: ICONOS.corazon,
            iconoBg: 'bg-primary-soft text-primary',
            badge: 'Historial',
            badgeClass: 'bg-primary-soft text-primary',
        },
        {
            clave: 'mi-impacto',
            rol: 'donante',
            rolEtiqueta: 'Donante',
            to: '/campanas?seccion=mis-donaciones',
            titulo: 'Mi Impacto Solidario',
            descripcion: 'Mirá cuántas personas y campañas ayudaste y el alcance real de tus aportes.',
            cta: 'Ver Impacto',
            icono: ICONOS.tendencia,
            iconoBg: 'bg-warning-soft text-warning',
            badge: 'Impacto',
            badgeClass: 'bg-warning-soft text-warning',
        },
        {
            clave: 'convocatorias',
            rol: 'donante',
            rolEtiqueta: 'Donante',
            to: '/campanas?seccion=actividades',
            titulo: 'Convocatorias Abiertas',
            descripcion: 'Sumate a jornadas abiertas y participá como voluntario en tu comunidad.',
            cta: 'Explorar Convocatorias',
            icono: ICONOS.usuarios,
            iconoBg: 'bg-info-soft text-info',
            badge: 'Comunidad',
            badgeClass: 'bg-info-soft text-info',
        },
    ],
    beneficiario: [
        {
            clave: 'solicitudes-apoyo',
            rol: 'beneficiario',
            rolEtiqueta: 'Beneficiario',
            to: '/beneficios?seccion=solicitudes',
            titulo: 'Solicitudes de Apoyo',
            descripcion: 'Registrá nuevas solicitudes de ayuda y consultá el estado de cada una.',
            cta: 'Gestionar Solicitudes',
            icono: ICONOS.documento,
            iconoBg: 'bg-primary-soft text-primary',
            badge: 'Seguimiento',
            badgeClass: 'bg-primary-soft text-primary',
        },
        {
            clave: 'campanas',
            rol: 'beneficiario',
            rolEtiqueta: 'Beneficiario',
            to: '/campanas',
            titulo: 'Campañas Disponibles',
            descripcion: 'Explorá las campañas activas de las que podés recibir apoyo junto a tu familia.',
            cta: 'Ver Campañas',
            icono: ICONOS.megafono,
            iconoBg: 'bg-warning-soft text-warning',
            badge: 'Abiertas',
            badgeClass: 'bg-warning-soft text-warning',
        },
        {
            clave: 'perfil-solidario',
            rol: 'beneficiario',
            rolEtiqueta: 'Beneficiario',
            to: '/beneficios?seccion=beneficiarios',
            titulo: 'Mi Perfil Solidario',
            descripcion: 'Mantené actualizados tus datos personales para agilizar tus solicitudes.',
            cta: 'Completar Perfil',
            icono: ICONOS.perfil,
            iconoBg: 'bg-info-soft text-info',
            badge: 'Perfil',
            badgeClass: 'bg-info-soft text-info',
        },
    ],
    usuario: [
        {
            clave: 'campanas',
            rol: 'usuario',
            rolEtiqueta: 'Comunidad',
            to: '/campanas',
            titulo: 'Campañas Solidarias',
            descripcion: 'Explorá las campañas activas y elegí a quién querés apoyar con tu donación.',
            cta: 'Explorar Campañas',
            icono: ICONOS.corazon,
            iconoBg: 'bg-success-soft text-success',
            badge: 'En vivo',
            badgeClass: 'bg-success-soft text-success',
        },
        {
            clave: 'convocatorias',
            rol: 'usuario',
            rolEtiqueta: 'Comunidad',
            to: '/campanas?seccion=actividades',
            titulo: 'Convocatorias Abiertas',
            descripcion: 'Descubrí las convocatorias abiertas y postulate como voluntario.',
            cta: 'Explorar Convocatorias',
            icono: ICONOS.usuarios,
            iconoBg: 'bg-warning-soft text-warning',
            badge: 'Activo',
            badgeClass: 'bg-warning-soft text-warning',
        },
        {
            clave: 'mis-actividades',
            rol: 'usuario',
            rolEtiqueta: 'Comunidad',
            to: '/campanas?seccion=mis-actividades',
            titulo: 'Mis Actividades',
            descripcion: 'Consultá los voluntariados en los que te inscribiste y sus detalles.',
            cta: 'Ver Postulaciones',
            icono: ICONOS.check,
            iconoBg: 'bg-error-soft text-error',
            badge: 'Participaciones',
            badgeClass: 'bg-error-soft text-error',
        },
    ],
};

const INFO_ROL: Record<RolKey, { etiqueta: string; descripcion: string; cta: { etiqueta: string; to: string; icono: string } }> = {
    admin: {
        etiqueta: 'Administración',
        descripcion: 'Supervisá usuarios, beneficiarios y actividad de la plataforma en tiempo real.',
        cta: { etiqueta: 'Ver usuarios', to: '/usuarios', icono: ICONOS.usuarios },
    },
    coordinador: {
        etiqueta: 'Coordinación',
        descripcion: 'Coordiná al equipo de voluntarios, revisá postulaciones y seguí la asistencia.',
        cta: { etiqueta: 'Gestionar equipo', to: '/voluntarios', icono: ICONOS.usuarios },
    },
    voluntario: {
        etiqueta: 'Voluntariado',
        descripcion: 'Consultá convocatorias abiertas, tus postulaciones y tu disponibilidad semanal.',
        cta: { etiqueta: 'Ver convocatorias', to: '/campanas?seccion=actividades', icono: ICONOS.megafono },
    },
    donante: {
        etiqueta: 'Donaciones',
        descripcion: 'Apoyá campañas solidarias y seguí el impacto real de cada aporte.',
        cta: { etiqueta: 'Donar ahora', to: '/donaciones', icono: ICONOS.corazon },
    },
    beneficiario: {
        etiqueta: 'Beneficiario',
        descripcion: 'Completá tu ficha, solicitá ayuda y consultá el estado de tus solicitudes.',
        cta: { etiqueta: 'Solicitar apoyo', to: '/beneficios?seccion=solicitudes', icono: ICONOS.documento },
    },
    usuario: {
        etiqueta: 'Comunidad',
        descripcion: 'Explorá campañas y actividades solidarias disponibles en la comunidad.',
        cta: { etiqueta: 'Explorar campañas', to: '/campanas', icono: ICONOS.megafono },
    },
};

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

const ModuloCard = ({
    modulo,
    index,
    mostrarRol,
}: {
    modulo: Modulo;
    index: number;
    mostrarRol: boolean;
}) => (
    <div
        className={`anim-rise group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface-elevated p-5 shadow-soft transition-[transform,box-shadow,border-color] duration-300 ease-out-soft hover:border-accent/45 hover:shadow-lift motion-safe:hover:-translate-y-1 sm:p-6 ${retardo(index)}`}
    >
        <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[2px] w-0 bg-linear-to-r from-accent to-accent/30 transition-[width] duration-300 ease-out-soft group-hover:w-full"
        />

        <div>
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${modulo.iconoBg} transition-transform duration-300 ease-out-soft motion-safe:group-hover:scale-105`}>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={modulo.icono} />
                    </svg>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-1.5">
                    {mostrarRol && (
                        <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-text-muted">
                            {modulo.rolEtiqueta}
                        </span>
                    )}
                    {modulo.badge && (
                        <span className={`shrink-0 rounded-full border border-current/20 px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.12em] ${modulo.badgeClass}`}>
                            {modulo.badge}
                        </span>
                    )}
                </div>
            </div>

            <h3 className="mb-2 font-display text-[1.05rem] font-bold leading-snug tracking-[-0.01em] text-text">
                {modulo.titulo}
            </h3>

            <p className="mb-5 text-sm leading-relaxed text-text-muted">
                {modulo.descripcion}
            </p>
        </div>

        {modulo.enDesarrollo ? (
            <span
                className="pointer-events-none flex w-full select-none items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface px-4 py-2.5 text-center text-[12px] font-semibold text-text-subtle"
                aria-disabled="true"
                title="Módulo en desarrollo"
            >
                <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                En desarrollo
            </span>
        ) : (
            <Link
                to={modulo.to}
                className="press flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-center text-[12.5px] font-bold text-on-primary shadow-soft hover:bg-primary-hover hover:shadow-lift"
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
// HELPER FOTO
// =====================================================
const getAvatarUrl = (fotoUrl?: string | null): string | null => {
    if (!fotoUrl) return null;
    if (fotoUrl.startsWith('http://') || fotoUrl.startsWith('https://')) return fotoUrl;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');
    return `${baseUrl}${fotoUrl.startsWith('/') ? '' : '/'}${fotoUrl}`;
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================
const Dashboard = () => {
    const { usuario, refreshSession } = useAuth();
    const { exito, error } = useToast();

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
        year: 'numeric',
    });

    const rolesUsuario = (usuario?.roles || [usuario?.rol || '']).map(r => r.toLowerCase()).filter(Boolean);
    const tieneRol = (rol: string) => rolesUsuario.includes(rol.toLowerCase());
    const esAdmin = tieneRol('administrador') || tieneRol('admin');
    const esCoordinador = Boolean(usuario?.es_coordinador) || tieneRol('coordinador');
    const estadoVol = String(usuario?.estado_voluntario || '');
    const estadoBen = String(usuario?.estado_beneficiario || '');
    const yaEsVoluntario = esCoordinador || tieneRol('voluntario') || tieneRol('empleado') || estadoVol === 'Aprobado';
    const yaEsBeneficiario = tieneRol('beneficiario') || estadoBen === 'Verificado';
    const yaEsDonante = tieneRol('donante') || Boolean(usuario?.es_donante);
    const puedeAprobar = esCoordinador || esAdmin;

    const puedeSolicitarVoluntario = !yaEsVoluntario && !['Pendiente', 'Aprobado'].includes(estadoVol);
    const puedeSolicitarBeneficiario = !yaEsBeneficiario && !['Pendiente', 'Verificado'].includes(estadoBen);

    // Roles activos deduplicados en orden de prioridad
    const rolesActivos = useMemo<RolKey[]>(() => {
        if (esAdmin) return ['admin'];
        const lista: RolKey[] = [];
        if (esCoordinador) lista.push('coordinador');
        if (yaEsVoluntario) lista.push('voluntario');
        if (yaEsDonante) lista.push('donante');
        if (yaEsBeneficiario) lista.push('beneficiario');
        return lista.length > 0 ? lista : ['usuario'];
    }, [esAdmin, esCoordinador, yaEsVoluntario, yaEsDonante, yaEsBeneficiario]);

    const rolPrincipal = rolesActivos[0];
    const infoPrincipal = INFO_ROL[rolPrincipal];

    // Filtro de rol en la barra unificada de módulos
    const [rolFiltro, setRolFiltro] = useState<'todos' | RolKey>('todos');

    // Resetear filtro si cambian los roles del usuario y el filtro ya no aplica
    useEffect(() => {
        if (rolFiltro !== 'todos' && !rolesActivos.includes(rolFiltro)) {
            setRolFiltro('todos');
        }
    }, [rolFiltro, rolesActivos]);

    // KPIs unificados sin duplicados (máximo 4 tarjetas arriba)
    const kpisUnificados = useMemo<Kpi[]>(() => {
        const vistos = new Set<string>();
        const resultado: Kpi[] = [];
        for (const rol of rolesActivos) {
            for (const kpi of KPIS_POR_ROL[rol]) {
                const claveNormalizada = kpi.clave === 'voluntariados' ? 'convocatorias' : kpi.clave;
                if (!vistos.has(claveNormalizada)) {
                    vistos.add(claveNormalizada);
                    resultado.push(kpi);
                }
                if (resultado.length >= 4) return resultado;
            }
        }
        return resultado;
    }, [rolesActivos]);

    // Módulos unificados y deduplicados por clave
    const modulosVisibles = useMemo<Modulo[]>(() => {
        const rolesAIncluir = rolFiltro === 'todos' ? rolesActivos : [rolFiltro];
        const vistos = new Set<string>();
        const lista: Modulo[] = [];

        for (const rol of rolesAIncluir) {
            for (const modulo of MODULOS_POR_ROL[rol]) {
                if (modulo.enDesarrollo) continue;
                if (!vistos.has(modulo.clave)) {
                    vistos.add(modulo.clave);
                    lista.push(modulo);
                }
            }
        }
        return lista;
    }, [rolesActivos, rolFiltro]);

    // Modales de postulación
    const [modalVoluntarioAbierto, setModalVoluntarioAbierto] = useState<boolean>(false);
    const [modalBeneficiarioAbierto, setModalBeneficiarioAbierto] = useState<boolean>(false);
    const [habilidadesPostulacion, setHabilidadesPostulacion] = useState<string>('');
    const [dispPostulacion, setDispPostulacion] = useState<string>('Fines de semana');
    const [tipoBenefPostulacion, setTipoBenefPostulacion] = useState<string>('Persona');
    const [docBenefPostulacion, setDocBenefPostulacion] = useState<string>('');
    const [dirBenefPostulacion, setDirBenefPostulacion] = useState<string>('');
    const [necesidadBenefPostulacion, setNecesidadBenefPostulacion] = useState<string>('');
    const [descBenefPostulacion, setDescBenefPostulacion] = useState<string>('');
    const [enviandoPostulacion, setEnviandoPostulacion] = useState<boolean>(false);

    // Bandeja de solicitudes: voluntarios para Coordinación, beneficiarios para Admin.
    const [filtroEstadoSol, setFiltroEstadoSol] = useState<string>('todos');
    const [solicitudesVol, setSolicitudesVol] = useState<SolicitudVoluntario[]>([]);
    const [solicitudesBen, setSolicitudesBen] = useState<SolicitudBeneficiario[]>([]);
    const [cargandoSol, setCargandoSol] = useState<boolean>(false);
    const [procesandoId, setProcesandoId] = useState<number | null>(null);
    const [rechazo, setRechazo] = useState<{ tipo: 'voluntario' | 'beneficiario'; id: number } | null>(null);
    const [motivoRechazo, setMotivoRechazo] = useState('');

    const cargarSolicitudes = async () => {
        if (!puedeAprobar) return;
        setCargandoSol(true);
        try {
            if (esCoordinador && !esAdmin) {
                const vols = await usuarioApi.getSolicitudesVoluntarios();
                setSolicitudesVol(vols);
            }
            if (esAdmin) {
                const bens = await usuarioApi.getSolicitudesBeneficiarios();
                setSolicitudesBen(bens);
            }
        } catch (err) {
            console.error('Error al cargar solicitudes', err);
        } finally {
            setCargandoSol(false);
        }
    };

    useEffect(() => {
        void cargarSolicitudes();
    }, [puedeAprobar, esAdmin, esCoordinador]);

    const handleRevisarVoluntario = async (id: number, nuevoEstado: 'Aprobado' | 'Rechazado') => {
        if (nuevoEstado === 'Rechazado') {
            setMotivoRechazo('');
            setRechazo({ tipo: 'voluntario', id });
            return;
        }
        setProcesandoId(id);
        try {
            await usuarioApi.revisarSolicitudVoluntario(id, { estado: nuevoEstado });
            void exito('', `Solicitud de voluntario ${nuevoEstado.toLowerCase()} con éxito.`);
            await refreshSession().catch(() => undefined);
            await cargarSolicitudes();
        } catch (err: any) {
            void error('', err.response?.data?.error || 'Error al procesar solicitud');
        } finally {
            setProcesandoId(null);
        }
    };

    const handleRevisarBeneficiario = async (id: number, nuevoEstado: 'Verificado' | 'Rechazado') => {
        if (nuevoEstado === 'Rechazado') {
            setMotivoRechazo('');
            setRechazo({ tipo: 'beneficiario', id });
            return;
        }
        setProcesandoId(id);
        try {
            await usuarioApi.revisarSolicitudBeneficiario(id, { estado: nuevoEstado });
            void exito('', `Solicitud de beneficiario ${nuevoEstado.toLowerCase()} con éxito.`);
            await refreshSession().catch(() => undefined);
            await cargarSolicitudes();
        } catch (err: any) {
            void error('', err.response?.data?.error || 'Error al procesar solicitud');
        } finally {
            setProcesandoId(null);
        }
    };

    const confirmarRechazo = async () => {
        if (!rechazo || !motivoRechazo.trim()) return;
        setProcesandoId(rechazo.id);
        try {
            const datos = { estado: 'Rechazado' as const, motivo_rechazo: motivoRechazo.trim() };
            if (rechazo.tipo === 'voluntario') await usuarioApi.revisarSolicitudVoluntario(rechazo.id, datos);
            else await usuarioApi.revisarSolicitudBeneficiario(rechazo.id, datos);
            void exito('', 'La solicitud fue rechazada.');
            setRechazo(null);
            setMotivoRechazo('');
            await cargarSolicitudes();
        } catch (err: any) {
            void error('', err.response?.data?.error || 'Error al procesar solicitud');
        } finally {
            setProcesandoId(null);
        }
    };

    const handlePostularVoluntario = async (e: React.FormEvent) => {
        e.preventDefault();
        setEnviandoPostulacion(true);
        try {
            const habilidades = habilidadesPostulacion.split(',').map(s => s.trim()).filter(Boolean);
            await usuarioApi.postularVoluntario({
                habilidades: habilidades.length ? habilidades : ['General'],
                disponibilidad: dispPostulacion,
            });
            await refreshSession();
            void exito('', '¡Tu postulación como voluntario ha sido enviada con éxito! Está en revisión.');
            setModalVoluntarioAbierto(false);
            setHabilidadesPostulacion('');
        } catch (err: any) {
            void error('', err.response?.data?.error || 'Error al enviar postulación');
        } finally {
            setEnviandoPostulacion(false);
        }
    };

    const handlePostularBeneficiario = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!docBenefPostulacion || !dirBenefPostulacion || !necesidadBenefPostulacion) {
            void error('', 'Completá los campos obligatorios (CI/NIT, dirección y necesidad)');
            return;
        }
        setEnviandoPostulacion(true);
        try {
            await usuarioApi.postularBeneficiario({
                tipo_beneficiario: tipoBenefPostulacion,
                documento: docBenefPostulacion,
                direccion: dirBenefPostulacion,
                necesidad: necesidadBenefPostulacion,
                descripcion: descBenefPostulacion || undefined,
            });
            await refreshSession();
            void exito('', '¡Tu solicitud como beneficiario ha sido enviada! El administrador la verificará.');
            setModalBeneficiarioAbierto(false);
            setDocBenefPostulacion('');
            setDirBenefPostulacion('');
            setNecesidadBenefPostulacion('');
            setDescBenefPostulacion('');
        } catch (err: any) {
            void error('', err.response?.data?.error || 'Error al enviar solicitud');
        } finally {
            setEnviandoPostulacion(false);
        }
    };

    const solicitudesVolFiltradas = solicitudesVol.filter(s => filtroEstadoSol === 'todos' || s.estado === filtroEstadoSol);
    const solicitudesBenFiltradas = solicitudesBen.filter(s => filtroEstadoSol === 'todos' || s.estado === filtroEstadoSol);

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
                                <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-cream/55 capitalize">
                                    {fechaFormateada}
                                </span>
                            </div>

                            <h1 className="font-display text-3xl font-extrabold leading-[1.05] tracking-[-0.035em] text-balance text-cream md:text-4xl lg:text-[2.6rem]">
                                {getSaludo()}, {usuario?.nombre || 'Usuario'}
                            </h1>

                            <p className="max-w-xl text-sm leading-relaxed text-cream/75 md:text-base">
                                {infoPrincipal.descripcion}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                {rolesActivos.map((rol) => (
                                    <span
                                        key={rol}
                                        className="rounded-full border border-gold/30 bg-gold/15 px-3 py-0.5 text-[11px] font-bold tracking-wide text-gold-bright backdrop-blur-sm"
                                    >
                                        {INFO_ROL[rol].etiqueta}
                                    </span>
                                ))}
                            </div>
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

                            <Link
                                to={infoPrincipal.cta.to}
                                className="press inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-gold px-5 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-night shadow-glow hover:bg-gold-bright sm:w-auto"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={infoPrincipal.cta.icono} />
                                </svg>
                                <span>{infoPrincipal.cta.etiqueta}</span>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* 2. MÉTRICAS KPI UNIFICADAS */}
                <section className="grid grid-cols-2 gap-4 md:gap-5 xl:grid-cols-4">
                    {kpisUnificados.map((kpi, i) => (
                        <KpiCard key={kpi.clave} kpi={kpi} index={i} />
                    ))}
                </section>

                {/* 3. CENTRO DE ACCIONES UNIFICADO (SIN DUPLICADOS) */}
                {modulosVisibles.length > 0 && (
                    <section>
                        <div className="anim-rise mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end [animation-delay:120ms]">
                            <div>
                                <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-text">
                                    Centro de acciones
                                </h2>
                                <p className="mt-1 text-sm text-text-muted">
                                    {rolesActivos.length > 1
                                        ? 'Todos tus módulos unificados en un solo lugar, sin duplicados.'
                                        : 'Accede rápidamente a los módulos disponibles para tu rol.'}
                                </p>
                            </div>

                            {rolesActivos.length > 1 ? (
                                <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-border bg-surface-elevated p-1 shadow-soft">
                                    <button
                                        type="button"
                                        onClick={() => setRolFiltro('todos')}
                                        className={`rounded-xl px-3 py-1.5 text-[11px] font-bold transition-colors ${
                                            rolFiltro === 'todos'
                                                ? 'bg-primary text-on-primary shadow-soft'
                                                : 'text-text-muted hover:text-text'
                                        }`}
                                    >
                                        Todos
                                    </button>
                                    {rolesActivos.map((rol) => (
                                        <button
                                            key={rol}
                                            type="button"
                                            onClick={() => setRolFiltro(rol)}
                                            className={`rounded-xl px-3 py-1.5 text-[11px] font-bold transition-colors ${
                                                rolFiltro === rol
                                                    ? 'bg-primary text-on-primary shadow-soft'
                                                    : 'text-text-muted hover:text-text'
                                            }`}
                                        >
                                            {INFO_ROL[rol].etiqueta}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <span className="self-start rounded-full border border-border bg-surface-elevated px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-text-muted shadow-soft sm:self-auto">
                                    {modulosVisibles.length} {modulosVisibles.length === 1 ? 'módulo' : 'módulos'}
                                </span>
                            )}
                        </div>

                        <div
                            className={`grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 ${
                                modulosVisibles.length > 4 ? 'xl:grid-cols-3' : ''
                            }`}
                        >
                            {modulosVisibles.map((modulo, i) => (
                                <ModuloCard
                                    key={modulo.clave}
                                    modulo={modulo}
                                    index={i}
                                    mostrarRol={rolesActivos.length > 1 && rolFiltro === 'todos'}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* 4. POSTULACIONES ACCESIBLES PARA CUALQUIER CUENTA AUTENTICADA */}
                {!esAdmin && (puedeSolicitarVoluntario || puedeSolicitarBeneficiario || !usuario?.es_donante || estadoVol === 'Pendiente' || estadoBen === 'Pendiente') && (
                    <section className="anim-rise rounded-3xl border border-border bg-surface-elevated p-5 shadow-soft sm:p-6">
                        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                            <div>
                                <h2 className="font-display text-lg font-bold text-text">
                                    ¿Querés participar de otra manera?
                                </h2>
                                <p className="mt-1 text-sm text-text-muted">
                                    {yaEsVoluntario
                                        ? 'Como voluntario, podés solicitar ser beneficiario o realizar una donación.'
                                        : 'Enviá una solicitud y el equipo correspondiente la revisará.'}
                                </p>
                                {(estadoVol === 'Pendiente' || estadoBen === 'Pendiente') && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {estadoVol === 'Pendiente' && (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold text-warning">
                                                <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                                                Postulación a voluntariado en revisión
                                            </span>
                                        )}
                                        {estadoBen === 'Pendiente' && (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold text-warning">
                                                <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                                                Solicitud de beneficiario en revisión
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                {!usuario?.es_donante && (
                                    <Link
                                        to="/donaciones"
                                        className="press inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary hover:bg-primary-hover"
                                    >
                                        Registrar una donación
                                    </Link>
                                )}
                                {puedeSolicitarVoluntario && (
                                    <button
                                        type="button"
                                        onClick={() => setModalVoluntarioAbierto(true)}
                                        className="press inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary hover:bg-primary-hover"
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a4 4 0 018 0v2zm7-13a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Solicitar ser voluntario
                                    </button>
                                )}
                                {puedeSolicitarBeneficiario && (
                                    <button
                                        type="button"
                                        onClick={() => setModalBeneficiarioAbierto(true)}
                                        className="press inline-flex items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface px-5 py-2.5 text-sm font-bold text-text hover:border-accent hover:bg-accent-soft"
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Solicitar ser beneficiario
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* 5. REVISIÓN DE SOLICITUDES SEGÚN PERMISOS */}
                {puedeAprobar && (
                    <section className="anim-rise rounded-3xl border border-border bg-surface-elevated p-5 shadow-soft sm:p-6">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                            <div>
                                <h2 className="font-display text-xl font-bold text-text">
                                    {esAdmin ? 'Solicitudes de beneficiarios' : 'Solicitudes de voluntarios'}
                                </h2>
                                <p className="mt-1 text-sm text-text-muted">
                                    {esAdmin
                                        ? 'Revisá las solicitudes de apoyo recibidas.'
                                        : 'Revisá las solicitudes para incorporarse como voluntario.'}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <select
                                    aria-label="Filtrar solicitudes por estado"
                                    value={filtroEstadoSol}
                                    onChange={e => setFiltroEstadoSol(e.target.value)}
                                    className="rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-text"
                                >
                                    <option value="todos">Todos los estados</option>
                                    <option value="Pendiente">Pendientes</option>
                                    <option value={esAdmin ? 'Verificado' : 'Aprobado'}>{esAdmin ? 'Verificadas' : 'Aprobadas'}</option>
                                    <option value="Rechazado">Rechazadas</option>
                                </select>
                            </div>
                        </div>
                        {cargandoSol ? (
                            <p className="py-8 text-center text-sm text-text-muted">Cargando solicitudes…</p>
                        ) : (
                            <div className="mt-5 grid gap-3 lg:grid-cols-2">
                                {!esAdmin && solicitudesVolFiltradas.map(s => (
                                    <article key={s.id_usuario} className="rounded-2xl border border-border bg-surface p-4">
                                        <div className="flex items-start gap-3">
                                            {getAvatarUrl(s.foto_url) ? (
                                                <img src={getAvatarUrl(s.foto_url)!} alt="" className="h-11 w-11 rounded-xl object-cover" />
                                            ) : (
                                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft font-bold text-primary">
                                                    {s.nombre[0]}{s.apellido?.[0]}
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-text">{s.nombre} {s.apellido}</h3>
                                                <p className="truncate text-xs text-text-muted">{s.correo}</p>
                                                <p className="mt-2 text-xs text-text-muted">Disponibilidad: {s.disponibilidad}</p>
                                                <p className="text-xs text-text-muted">Habilidades: {s.habilidades?.join(', ') || 'General'}</p>
                                            </div>
                                            <span className="rounded-full bg-warning-soft px-2.5 py-1 text-[10px] font-bold text-warning">
                                                {s.estado}
                                            </span>
                                        </div>
                                        {s.estado === 'Pendiente' && (
                                            <div className="mt-4 flex justify-end gap-2">
                                                <button
                                                    disabled={procesandoId === s.id_usuario}
                                                    onClick={() => void handleRevisarVoluntario(s.id_usuario, 'Rechazado')}
                                                    className="rounded-lg border border-error/30 px-3 py-2 text-xs font-bold text-error disabled:opacity-50"
                                                >
                                                    Rechazar
                                                </button>
                                                <button
                                                    disabled={procesandoId === s.id_usuario}
                                                    onClick={() => void handleRevisarVoluntario(s.id_usuario, 'Aprobado')}
                                                    className="rounded-lg bg-success px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                                                >
                                                    Aprobar
                                                </button>
                                            </div>
                                        )}
                                    </article>
                                ))}
                                {esAdmin && solicitudesBenFiltradas.map(s => (
                                    <article key={s.id_usuario} className="rounded-2xl border border-border bg-surface p-4">
                                        <div className="flex items-start gap-3">
                                            {getAvatarUrl(s.foto_url) ? (
                                                <img src={getAvatarUrl(s.foto_url)!} alt="" className="h-11 w-11 rounded-xl object-cover" />
                                            ) : (
                                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft font-bold text-primary">
                                                    {s.nombre[0]}{s.apellido?.[0]}
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-text">{s.nombre} {s.apellido}</h3>
                                                <p className="truncate text-xs text-text-muted">{s.correo} · {s.tipo_beneficiario}</p>
                                                <p className="mt-2 text-xs text-text-muted">Documento: {s.documento} · Necesidad: {s.necesidad}</p>
                                                <p className="text-xs text-text-muted">Dirección: {s.direccion}</p>
                                                {s.descripcion && <p className="mt-1 text-xs text-text-subtle">{s.descripcion}</p>}
                                            </div>
                                            <span className="rounded-full bg-warning-soft px-2.5 py-1 text-[10px] font-bold text-warning">
                                                {s.estado}
                                            </span>
                                        </div>
                                        {s.estado === 'Pendiente' && (
                                            <div className="mt-4 flex justify-end gap-2">
                                                <button
                                                    disabled={procesandoId === s.id_usuario}
                                                    onClick={() => void handleRevisarBeneficiario(s.id_usuario, 'Rechazado')}
                                                    className="rounded-lg border border-error/30 px-3 py-2 text-xs font-bold text-error disabled:opacity-50"
                                                >
                                                    Rechazar
                                                </button>
                                                <button
                                                    disabled={procesandoId === s.id_usuario}
                                                    onClick={() => void handleRevisarBeneficiario(s.id_usuario, 'Verificado')}
                                                    className="rounded-lg bg-success px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                                                >
                                                    Verificar
                                                </button>
                                            </div>
                                        )}
                                    </article>
                                ))}
                                {((!esAdmin && solicitudesVolFiltradas.length === 0)
                                    || (esAdmin && solicitudesBenFiltradas.length === 0))
                                    && <p className="py-8 text-center text-sm text-text-muted lg:col-span-2">No hay solicitudes para mostrar.</p>}
                            </div>
                        )}
                    </section>
                )}

                {/* 6. BARRA INFORMATIVA */}
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

                {/* MODALES */}
                {modalVoluntarioAbierto && (
                    <div
                        className="anim-fade fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-night/70 p-4 backdrop-blur-sm"
                        onMouseDown={e => { if (e.target === e.currentTarget) setModalVoluntarioAbierto(false); }}
                    >
                        <form
                            onSubmit={e => void handlePostularVoluntario(e)}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="modal-voluntario-titulo"
                            className="my-auto w-full max-w-lg space-y-4 rounded-2xl border border-border bg-surface-elevated p-5 shadow-deep sm:p-6"
                        >
                            <div>
                                <h2 id="modal-voluntario-titulo" className="font-display text-xl font-bold text-text">Solicitud de voluntariado</h2>
                                <p className="mt-1 text-sm text-text-muted">El coordinador de voluntarios revisará tu postulación.</p>
                            </div>
                            <label className="block text-sm font-semibold text-text">
                                Habilidades <span className="font-normal text-text-muted">(separadas por coma)</span>
                                <input
                                    value={habilidadesPostulacion}
                                    onChange={e => setHabilidadesPostulacion(e.target.value)}
                                    maxLength={500}
                                    placeholder="Logística, primeros auxilios…"
                                    className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm"
                                />
                            </label>
                            <label className="block text-sm font-semibold text-text">
                                Disponibilidad
                                <select
                                    value={dispPostulacion}
                                    onChange={e => setDispPostulacion(e.target.value)}
                                    className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm"
                                >
                                    <option>Fines de semana</option>
                                    <option>Mañanas</option>
                                    <option>Tardes</option>
                                    <option>Tiempo completo</option>
                                    <option>Flexible / A convenir</option>
                                </select>
                            </label>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setModalVoluntarioAbierto(false)}
                                    className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-text-muted"
                                >
                                    Cancelar
                                </button>
                                <button
                                    disabled={enviandoPostulacion}
                                    className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-50"
                                >
                                    {enviandoPostulacion ? 'Enviando…' : 'Enviar solicitud'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {modalBeneficiarioAbierto && (
                    <div
                        className="anim-fade fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-night/70 p-4 backdrop-blur-sm"
                        onMouseDown={e => { if (e.target === e.currentTarget) setModalBeneficiarioAbierto(false); }}
                    >
                        <form
                            onSubmit={e => void handlePostularBeneficiario(e)}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="modal-beneficiario-titulo"
                            className="my-auto w-full max-w-lg space-y-4 rounded-2xl border border-border bg-surface-elevated p-5 shadow-deep sm:p-6"
                        >
                            <div>
                                <h2 id="modal-beneficiario-titulo" className="font-display text-xl font-bold text-text">Solicitud de apoyo</h2>
                                <p className="mt-1 text-sm text-text-muted">El administrador verificará la información.</p>
                            </div>
                            <label className="block text-sm font-semibold text-text">
                                Tipo
                                <select
                                    value={tipoBenefPostulacion}
                                    onChange={e => setTipoBenefPostulacion(e.target.value)}
                                    className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm"
                                >
                                    <option value="Persona">Persona</option>
                                    <option value="Familia">Familia</option>
                                    <option value="Institucion">Institución</option>
                                </select>
                            </label>
                            <label className="block text-sm font-semibold text-text">
                                CI / NIT *
                                <input
                                    required
                                    value={docBenefPostulacion}
                                    onChange={e => setDocBenefPostulacion(e.target.value)}
                                    maxLength={30}
                                    className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm"
                                />
                            </label>
                            <label className="block text-sm font-semibold text-text">
                                Dirección *
                                <input
                                    required
                                    value={dirBenefPostulacion}
                                    onChange={e => setDirBenefPostulacion(e.target.value)}
                                    maxLength={255}
                                    className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm"
                                />
                            </label>
                            <label className="block text-sm font-semibold text-text">
                                Necesidad principal *
                                <input
                                    required
                                    value={necesidadBenefPostulacion}
                                    onChange={e => setNecesidadBenefPostulacion(e.target.value)}
                                    maxLength={150}
                                    className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm"
                                />
                            </label>
                            <label className="block text-sm font-semibold text-text">
                                Descripción
                                <textarea
                                    value={descBenefPostulacion}
                                    onChange={e => setDescBenefPostulacion(e.target.value)}
                                    maxLength={1500}
                                    rows={3}
                                    className="mt-1.5 w-full resize-y rounded-xl border border-border bg-surface px-3 py-2.5 text-sm"
                                />
                            </label>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setModalBeneficiarioAbierto(false)}
                                    className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-text-muted"
                                >
                                    Cancelar
                                </button>
                                <button
                                    disabled={enviandoPostulacion}
                                    className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-50"
                                >
                                    {enviandoPostulacion ? 'Enviando…' : 'Enviar solicitud'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <ConfirmModal
                    isOpen={Boolean(rechazo)}
                    titulo="Rechazar solicitud"
                    mensaje="Indica el motivo del rechazo. Este mensaje quedará asociado a la solicitud."
                    campoTexto={{
                        etiqueta: 'Motivo obligatorio',
                        valor: motivoRechazo,
                        onChange: setMotivoRechazo,
                        placeholder: 'Escribe el motivo…',
                        requerido: true,
                    }}
                    textoConfirmar="Rechazar"
                    variante="peligro"
                    cargando={procesandoId === rechazo?.id}
                    onConfirm={() => void confirmarRechazo()}
                    onCancel={() => { setRechazo(null); setMotivoRechazo(''); }}
                />
            </div>
        </div>
    );
};

export default Dashboard;
