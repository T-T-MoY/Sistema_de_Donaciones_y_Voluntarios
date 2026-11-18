/**
 * ============================================================================
 * ARCHIVO: usuario.types.ts
 * TIPOS COMPARTIDOS del módulo de usuarios.
 * ============================================================================
 */

// =====================================================
// ROLES Y ESTADOS
// =====================================================
export type Rol = 'Cliente' | 'Empleado' | 'Admin' | 'Administrador' | 'Beneficiario';
export type Estado = 'Activo' | 'Inactivo';
export type Turno = 'Mañana' | 'Tarde' | 'Noche';
export type NivelAcceso = 'SUPERADMIN' | 'GENERAL';

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
  rol?: string;
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
  nivel_acceso?: NivelAcceso | null;
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
  estado_beneficiario: string;
  nivel_acceso: NivelAcceso;
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
  if (lower === 'cliente' || lower === 'donante') return 'Donante';
  if (lower === 'empleado' || lower === 'voluntario') return 'Voluntario';
  if (lower === 'admin' || lower === 'administrador') return 'Administrador';
  return rol?.trim() || '';
};

export const esActivo = (u: Usuario): boolean => {
  const est = getEstadoRaw(u).toLowerCase();
  return est === 'activo' || est === 'active' || est === 'habilitado';
};