// src/services/donacionIntegraciones.ts
// ============================================================================
// PUNTO ÚNICO DE INTEGRACIÓN con módulos que aún no tienen esquema en el
// repositorio: Campañas y Solicitudes de Ayuda.
//
// Donaciones NO crea tablas ni lee/escribe tablas de otros módulos. Cuando
// el equipo dueño de cada módulo entregue su esquema/API, solo hay que
// reemplazar el cuerpo de estas funciones (y agregar la FK por migración):
//
//   campanasIntegracion.listarActivas()  → consultar campañas activas y en rango
//   campanasIntegracion.estaActiva(id)   → existe, activa y dentro de fechas
//   solicitudesIntegracion.estaAprobada  → solicitud evaluada y aprobada
// ============================================================================

export interface CampanaResumen {
  id_campana: number;
  nombre: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
}

export const campanasIntegracion = {
  /** Mientras no exista el módulo: no hay campañas activas. */
  async listarActivas(): Promise<CampanaResumen[]> {
    return [];
  },
  async estaActiva(_idCampana: number): Promise<boolean> {
    return false;
  },
};

export const solicitudesIntegracion = {
  disponible: false,
  async estaAprobada(_idSolicitud: number): Promise<boolean> {
    return false;
  },
};
