// src/models/usuarioModel.ts
// ============================================================================
// CAPA: Modelo (solo tipos/contratos).
// NO contiene SQL, NO contiene lógica. Es el vocabulario compartido entre
// repositorio, servicio y controlador.
// ============================================================================

export type RolUsuario =
  | 'Administrador'
  | 'Beneficiario'
  | 'Donante'
  | 'Voluntario'
  | 'Usuario';

/** Fila cruda tal como vuelve del SELECT con JOINs. */
export interface UsuarioRow {
  id_usuario: number;
  nombre: string;
  apellido: string | null;
  correo: string;
  telefono: string | null;
  contraseña?: string;
  estado: string;
  fecha_creacion: Date | string;
  nivel_acceso: string | null;
  tipo_beneficiario: string | null;
  documento: string | null;
  direccion_beneficiario: string | null;
  necesidad: string | null;
  descripcion: string | null;
  estado_beneficiario: string | null;
  direccion_donante: string | null;
  ubi_latitud: string | number | null;
  ubi_longitud: string | number | null;
  habilidades: string[] | null;
  disponibilidad: string | null;
  fecha_registro_voluntario: Date | string | null;
  rol: RolUsuario;
}

/** Objeto de dominio que devuelve el repositorio/servicio. */
export interface UsuarioResponse {
  id_usuario: number;
  id: number;
  nombre: string;
  apellido: string;
  apellidos: string;
  paterno: string;
  materno: string;
  correo: string;
  telefono: string | null;
  contraseña?: string;
  estado: string;
  estado_cuenta: string;
  activo: boolean;
  fecha_registro?: Date | string;
  fecha_creacion?: Date | string;
  rol: RolUsuario;
  nivel_acceso?: string | null;
  tipo_beneficiario?: string | null;
  documento?: string | null;
  ci_nit?: string | null;
  direccion?: string | null;
  necesidad?: string | null;
  descripcion?: string | null;
  estado_beneficiario?: string | null;
  ubi_latitud?: number | string | null;
  ubi_longitud?: number | string | null;
  habilidades?: string[];
  disponibilidad?: string | null;
  fecha_registro_voluntario?: Date | string | null;
  token_recuperacion?: string | null;
  fecha_expiracion_token?: Date | string | null;
}

/** Datos de la tabla `usuario` (común). */
export interface UsuarioData {
  nombre: string;
  paterno: string;
  materno?: string | null;
  correo: string;
  telefono?: string | null;
  contraseña?: string;
  estado_cuenta?: string | boolean;
  rol?: string;
  estado?: string | boolean;
}

/** Datos del subtipo según el rol. */
export interface RolData {
  nivel_acceso?: string | null;
  tipo_beneficiario?: string | null;
  documento?: string | null;
  direccion?: string | null;
  necesidad?: string | null;
  descripcion?: string | null;
  estado_beneficiario?: string | null;
  ubi_latitud?: number | null;
  ubi_longitud?: number | null;
  habilidades?: string[] | null;
  disponibilidad?: string | null;
}

/** Entrada pública para crear un usuario. */
export interface CrearUsuarioInput {
  nombre: string;
  paterno: string;
  materno?: string | null;
  correo: string;
  telefono: string;
  contraseña: string;
  rol?: string;
  estado_cuenta?: string | boolean;
  // Campos del subtipo
  nivel_acceso?: string | null;
  tipo_beneficiario?: string | null;
  documento?: string | null;
  direccion?: string | null;
  necesidad?: string | null;
  descripcion?: string | null;
  estado_beneficiario?: string | null;
  ubi_latitud?: number | string | null;
  ubi_longitud?: number | string | null;
  habilidades?: string[] | string | null;
  disponibilidad?: string | null;
}