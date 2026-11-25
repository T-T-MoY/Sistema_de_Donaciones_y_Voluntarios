-- Sprint 6: Gestión de Notificaciones y Reportes
-- Migración aditiva: no modifica ni elimina tablas existentes.
BEGIN;
CREATE TABLE IF NOT EXISTS sprint6_notificacion (
  id_notificacion SERIAL PRIMARY KEY,
  creado_por INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT,
  asunto VARCHAR(180) NOT NULL,
  mensaje TEXT NOT NULL,
  programada_para TIMESTAMPTZ,
  estado VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE','PROGRAMADA','ENVIADA')),
  creada_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_envio TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS sprint6_notificacion_destinatario (
  id_destinatario SERIAL PRIMARY KEY,
  id_notificacion INT NOT NULL REFERENCES sprint6_notificacion(id_notificacion) ON DELETE CASCADE,
  id_usuario INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT,
  correo VARCHAR(150) NOT NULL,
  estado VARCHAR(12) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE','ENVIADA')),
  intentos INT NOT NULL DEFAULT 0,
  error TEXT,
  fecha_envio TIMESTAMPTZ,
  UNIQUE(id_notificacion,id_usuario)
);
CREATE TABLE IF NOT EXISTS sprint6_auditoria (
  id_auditoria BIGSERIAL PRIMARY KEY,
  id_usuario INT REFERENCES usuario(id_usuario) ON DELETE SET NULL,
  accion VARCHAR(80) NOT NULL,
  entidad VARCHAR(80) NOT NULL,
  detalle JSONB NOT NULL DEFAULT '{}'::jsonb,
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sprint6_notificacion_estado ON sprint6_notificacion(estado,programada_para);
CREATE INDEX IF NOT EXISTS idx_sprint6_destinatario_notificacion ON sprint6_notificacion_destinatario(id_notificacion,estado);
CREATE INDEX IF NOT EXISTS idx_sprint6_auditoria_fecha ON sprint6_auditoria(fecha DESC);
COMMIT;
