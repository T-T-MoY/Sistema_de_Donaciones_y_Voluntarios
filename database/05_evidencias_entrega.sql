-- Fotografías privadas que documentan entregas de la quinta iteración.
BEGIN;
CREATE TABLE IF NOT EXISTS apoyo_evidencia (
    id_evidencia SERIAL PRIMARY KEY,
    id_apoyo INT NOT NULL REFERENCES apoya_a(id_apoyo),
    nombre VARCHAR(180) NOT NULL,
    mime VARCHAR(20) NOT NULL CHECK (mime IN ('image/jpeg','image/png','image/webp')),
    contenido BYTEA NOT NULL CHECK (octet_length(contenido) BETWEEN 12 AND 5242880),
    descripcion VARCHAR(500) NOT NULL DEFAULT '',
    sha256 CHAR(64) NOT NULL,
    subido_por INT NOT NULL REFERENCES administrador(id_usuario),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (id_apoyo, sha256)
);
COMMIT;
