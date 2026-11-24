/**
 * ============================================================================
 * ARCHIVO: usuario.types.ts
 * TIPOS COMPARTIDOS del módulo de usuarios.
 * ============================================================================
 */

// =====================================================
// ROLES Y ESTADOS
// =====================================================
export type Rol = 'Donante' | 'Voluntario' | 'Coordinador' | 'Beneficiario' | 'Administrador';
export type Estado = 'Activo' | 'Inactivo';
export type Turno = 'Mañana' | 'Tarde' | 'Noche';

// =====================================================
// MODELO DE USUARIO (lo que devuelve el backend)
// =====================================================
export interface Usuario {
  id: number;
  id_usuario?: number;
  _id?: string | number;
  nombre?: string;
  apellidos?: string;
  paterno?: string;
  materno?: string;
  correo?: string;
  telefono?: string;
  foto_url?: string | null;
  rol?: string;
  roles?: string[];
  estado?: string;
  estado_cuenta?: string;
  ci_nit?: string | number | null;
  fecha_nacimiento?: string | null;
  calle?: string | null;
  zona?: string | null;
  ciudad?: string | null;
  fecha_contratacion?: string | null;
  cargo?: string | null;
  turno?: Turno | null;
  es_coordinador?: boolean;
  es_donante?: boolean;
  estado_voluntario?: string | null;
  estado_beneficiario?: string | null;
  habilidades?: string[];
  disponibilidad?: string | null;
  [key: string]: unknown;
}

// =====================================================
// FORM DATA del modal
// =====================================================
export interface UsuarioFormData {
  nombre: string;
  paterno: string;
  materno: string;
  correo: string;
  telefono: string;
  contraseña: string;
  rol: Rol;
  roles: Rol[];
  estado: Estado;
  ci_nit: string;
  fecha_nacimiento: string;
  calle: string;
  zona: string;
  ciudad: string;
  habilidades: string;
  disponibilidad: string;
  tipo_beneficiario: string;
  direccion: string;
  necesidad: string;
  descripcion: string;
  foto_url?: string | null;
}

// =====================================================
// MODOS DE LA LISTA
// =====================================================
export type UsuarioListModo = 'app' | 'preview';

// =====================================================
// PROPS de la lista
// =====================================================
export interface UsuarioListProps {
  modo?: UsuarioListModo;
  title?: string;
  subtitle?: string;
}

// =====================================================
// HELPERS COMPARTIDOS (usados por List, Card y Modal)
// =====================================================
export const obtenerId = (u: Usuario): number | string | undefined => {
  return u.id ?? u.id_usuario ?? u._id;
};

export const getNombreCompleto = (u: Usuario): string => {
  const nombre = u.nombre || '';
  const apellidos =
    u.apellidos || [u.paterno, u.materno].filter(Boolean).join(' ');
  return `${nombre} ${apellidos}`.trim() || 'Sin nombre';
};

export const getIniciales = (u: Usuario): string => {
  const n = u.nombre?.charAt(0) || '';
  const a = u.apellidos?.charAt(0) || u.paterno?.charAt(0) || '';
  return (n + a).toUpperCase() || '?';
};

export const getEstadoRaw = (u: Usuario): string => {
  return (u.estado || u.estado_cuenta || 'Activo').toString().trim();
};

export const getEstado = (u: Usuario): string => {
  const raw = getEstadoRaw(u);
  const lower = raw.toLowerCase();
  if (lower === 'activo') return 'Activo';
  if (lower === 'inactivo') return 'Inactivo';
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
};

/**
 * Etiqueta visible del rol.
 * El backend mapea cliente → Donante y empleado → Voluntario,
 * pero el tipo `Rol` sigue usando los identificadores originales.
 * Este helper solo traduce para el render; no modifica el dato.
 */
export const getRolDisplay = (rol?: string | null): string => {
  const lower = (rol || '').toLowerCase().trim();
  if (lower === 'coordinador') return 'Coord.';
  if (lower === 'cliente' || lower === 'donante') return 'Donante';
  if (lower === 'empleado' || lower === 'voluntario') return 'Voluntario';
  if (lower === 'admin' || lower === 'administrador') return 'Administrador';
  if (lower === 'beneficiario') return 'Beneficiario';
  return rol?.trim() || '';
};

export const getRolesDisplay = (roles?: string[] | null, rol?: string | null): string[] => {
  const lista = roles?.length ? roles : rol ? [rol] : [];
  const tieneCoordinador = lista.some((r) => r.toLowerCase().trim() === 'coordinador');
  return [...new Set(lista
    .filter((r) => !(tieneCoordinador && ['voluntario', 'empleado'].includes(r.toLowerCase().trim())))
    .map((r) => getRolDisplay(r))
    .filter(Boolean))];
};

export const esActivo = (u: Usuario): boolean => {
  const est = getEstadoRaw(u).toLowerCase();
  return est === 'activo' || est === 'active' || est === 'habilitado';
};

// =====================================================
// TIPOS DE UBICACIÓN Y MAPA
// =====================================================
export interface UbicacionUsuario {
  id: number;
  nombre: string;
  lat: number | string;
  lng: number | string;
  direccion?: string | null;
}

export interface PuntoMapa {
  id: number | string;
  nombre: string;
  lat: number;
  lng: number;
  direccion?: string | null;
}

// =====================================================
// TIPOS DE SOLICITUDES Y POSTULACIONES
// =====================================================
export interface SolicitudVoluntario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string | null;
  foto_url: string | null;
  habilidades: string[];
  disponibilidad: string;
  fecha_registro: string;
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado';
  es_coordinador: boolean;
  revisado_por: number | null;
  nombre_revisor?: string | null;
  motivo_rechazo: string | null;
}

export interface SolicitudBeneficiario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string | null;
  foto_url: string | null;
  tipo_beneficiario: 'Persona' | 'Familia' | 'Institucion' | string;
  documento: string;
  direccion: string;
  necesidad: string;
  descripcion: string | null;
  fecha_registro: string;
  estado: 'Pendiente' | 'Verificado' | 'Rechazado';
  revisado_por: number | null;
  nombre_revisor?: string | null;
  motivo_rechazo: string | null;
}
