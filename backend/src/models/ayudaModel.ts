export interface ActorAyuda {
  id: number;
  admin: boolean;
}
export interface FichaBeneficiario {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string | null;
  tipo_documento: string;
  documento: string;
  tipo_beneficiario: string;
  direccion: string;
  necesidad: string;
  descripcion: string;
  estado: string;
}
export interface SolicitudCrear {
  beneficiario_usuario_id: number;
  tipo_ayuda: string;
  descripcion: string;
  prioridad: string;
  fecha_solicitud: string;
}
export interface ApoyoDatos {
  tipo_apoyo: string;
  descripcion: string;
  responsable_id: number;
  fecha_programada: string | null;
}
export const TIPOS_AYUDA = [
  'Alimentaria',
  'Material',
  'Economica',
  'Salud',
  'Vivienda',
  'Educacion',
  'Otra',
] as const;
