-- Iteración 5. Migración aditiva; ejecutar con ON_ERROR_STOP sobre bases existentes.
BEGIN;
-- Extensión propia del módulo; no cambia las tablas ni flujos anteriores.
CREATE TABLE IF NOT EXISTS beneficiario_ayuda_ficha (
    id_usuario INT PRIMARY KEY REFERENCES beneficiario(id_usuario),
    tipo_documento VARCHAR(25) NOT NULL CHECK (tipo_documento IN ('CI','NIT','Pasaporte','Personeria juridica'))
);

CREATE TABLE IF NOT EXISTS solicitud_ayuda (
    id_solicitud SERIAL PRIMARY KEY,
    beneficiario_usuario_id INT NOT NULL REFERENCES beneficiario(id_usuario),
    tipo_ayuda VARCHAR(30) NOT NULL CHECK (tipo_ayuda IN ('Alimentaria','Material','Economica','Salud','Vivienda','Educacion','Otra')),
    descripcion TEXT NOT NULL CHECK (length(trim(descripcion)) BETWEEN 10 AND 4000),
    prioridad VARCHAR(10) NOT NULL CHECK (prioridad IN ('Baja','Media','Alta')),
    fecha_solicitud DATE NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz')::date,
    estado VARCHAR(15) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente','Aprobada','Rechazada')),
    creado_por INT NOT NULL REFERENCES usuario(id_usuario),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    version INT NOT NULL DEFAULT 1,
    UNIQUE (id_solicitud, beneficiario_usuario_id)
);
CREATE INDEX IF NOT EXISTS idx_solicitud_ayuda_beneficiario ON solicitud_ayuda(beneficiario_usuario_id, estado);

CREATE TABLE IF NOT EXISTS evaluacion_ayuda (
    id_evaluacion SERIAL PRIMARY KEY,
    id_solicitud INT NOT NULL REFERENCES solicitud_ayuda(id_solicitud),
    administrador_id INT NOT NULL REFERENCES administrador(id_usuario),
    estado VARCHAR(15) NOT NULL CHECK (estado IN ('Pendiente','Aprobada','Rechazada')),
    observaciones TEXT NOT NULL CHECK (length(trim(observaciones)) BETWEEN 5 AND 2000),
    fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Relación CAMPAÑA–BENEFICIARIO del MER, con trazabilidad a la solicitud.
CREATE TABLE IF NOT EXISTS apoya_a (
    id_apoyo SERIAL PRIMARY KEY,
    id_solicitud INT NOT NULL,
    beneficiario_usuario_id INT NOT NULL,
    id_campana INT NOT NULL REFERENCES campana(id_campana),
    tipo_apoyo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    responsable_id INT NOT NULL REFERENCES usuario(id_usuario),
    estado VARCHAR(15) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente','Preparada','Entregada')),
    fecha_programada DATE,
    fecha_entrega DATE,
    creado_por INT NOT NULL REFERENCES administrador(id_usuario),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    version INT NOT NULL DEFAULT 1,
    FOREIGN KEY (id_solicitud, beneficiario_usuario_id) REFERENCES solicitud_ayuda(id_solicitud, beneficiario_usuario_id),
    UNIQUE (id_solicitud, id_campana),
    CHECK ((estado = 'Entregada' AND fecha_entrega IS NOT NULL) OR (estado <> 'Entregada' AND fecha_entrega IS NULL))
);
CREATE INDEX IF NOT EXISTS idx_apoya_a_beneficiario ON apoya_a(beneficiario_usuario_id, estado);

CREATE TABLE IF NOT EXISTS apoyo_historial (
    id_evento SERIAL PRIMARY KEY,
    id_apoyo INT NOT NULL REFERENCES apoya_a(id_apoyo),
    actor_id INT NOT NULL REFERENCES usuario(id_usuario),
    estado VARCHAR(15) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documentos privados: nunca se publican en /uploads.
CREATE TABLE IF NOT EXISTS solicitud_ayuda_adjunto (
    id_adjunto SERIAL PRIMARY KEY,
    id_solicitud INT NOT NULL REFERENCES solicitud_ayuda(id_solicitud),
    nombre VARCHAR(180) NOT NULL,
    mime VARCHAR(50) NOT NULL CHECK (mime IN ('application/pdf','image/jpeg','image/png')),
    contenido BYTEA NOT NULL CHECK (octet_length(contenido) <= 10485760),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;
