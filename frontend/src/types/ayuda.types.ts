export interface FichaBeneficiario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string | null;
  tipo_documento: string;
  documento: string;
  tipo_beneficiario: string;
  direccion: string;
  necesidad: string;
  descripcion: string | null;
  estado: string;
  estado_cuenta: string;
}
export type FichaDatos = Omit<
  FichaBeneficiario,
  'id_usuario' | 'estado_cuenta'
> & { password?: string; usuario_existente_id?: number };
export interface EvaluacionAyuda {
  id_evaluacion: number;
  estado: string;
  observaciones: string;
  fecha: string;
  administrador_nombre: string;
}
export interface AdjuntoAyuda {
  id_adjunto: number;
  nombre: string;
  mime: string;
  bytes: number;
}
export interface SolicitudAyuda {
  id_solicitud: number;
  codigo: string;
  beneficiario_usuario_id: number;
  beneficiario_nombre: string;
  documento: string;
  estado_beneficiario: string;
  necesidad: string;
  direccion: string;
  tipo_beneficiario: string;
  tipo_ayuda: string;
  descripcion: string;
  prioridad: string;
  fecha_solicitud: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada';
  creado_en: string;
  version: number;
  apoyos: number;
  evaluaciones?: EvaluacionAyuda[];
  adjuntos?: AdjuntoAyuda[];
}
export interface SolicitudDatos {
  beneficiario_usuario_id: number;
  tipo_ayuda: string;
  descripcion: string;
  prioridad: string;
  fecha_solicitud: string;
  version?: number;
}
export interface EventoApoyo {
  id_evento: number;
  estado: string;
  descripcion: string;
  actor_nombre: string;
  fecha: string;
}
export interface ApoyoAyuda {
  id_apoyo: number;
  codigo: string;
  id_solicitud: number;
  solicitud_codigo: string;
  beneficiario_usuario_id: number;
  beneficiario_nombre: string;
  documento: string;
  id_campana: number;
  campana_nombre: string;
  tipo_apoyo: string;
  descripcion: string;
  responsable_id: number;
  responsable_nombre: string;
  estado: 'Pendiente' | 'Preparada' | 'Entregada';
  fecha_programada: string | null;
  fecha_entrega: string | null;
  creado_en: string;
  version: number;
  historial?: EventoApoyo[];
  evidencias?: EvidenciaEntrega[];
}
export interface EvidenciaEntrega {
  id_evidencia: number;
  nombre: string;
  mime: string;
  bytes: number;
  descripcion: string;
  creado_en: string;
  autor_nombre: string;
}
export interface ApoyoDatos {
  id_solicitud: number;
  id_campana: number;
  tipo_apoyo: string;
  descripcion: string;
  responsable_id: number;
  fecha_programada: string | null;
  fecha_entrega?: string | null;
  estado?: string;
  version?: number;
}
export interface CatalogosAyuda {
  tipos_ayuda: string[];
  campanas: {
    id_campana: number;
    nombre: string;
    estado: string;
    fecha_inicio: string;
    fecha_fin: string | null;
  }[];
  responsables: { id_usuario: number; nombre: string }[];
  usuarios: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string | null;
  }[];
}
