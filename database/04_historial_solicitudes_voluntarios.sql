BEGIN;

CREATE TABLE IF NOT EXISTS historial_voluntario (
    id_historial SERIAL PRIMARY KEY,
    id_voluntario INT NOT NULL,
    estado_anterior VARCHAR(20),
    estado_nuevo VARCHAR(20) NOT NULL
        CHECK (estado_nuevo IN ('Pendiente', 'Aprobado', 'Rechazado')),
    cambiado_por INT,
    motivo TEXT,
    fecha_cambio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historial_voluntario
        FOREIGN KEY (id_voluntario)
        REFERENCES voluntario(id_usuario)
        ON DELETE CASCADE,
    CONSTRAINT fk_historial_usuario
        FOREIGN KEY (cambiado_por)
        REFERENCES usuario(id_usuario)
        ON DELETE SET NULL,
    CONSTRAINT chk_historial_estado_anterior
        CHECK (
            estado_anterior IS NULL
            OR estado_anterior IN ('Pendiente', 'Aprobado', 'Rechazado')
        )
);

CREATE INDEX IF NOT EXISTS idx_historial_voluntario
    ON historial_voluntario(id_voluntario);
CREATE INDEX IF NOT EXISTS idx_historial_fecha
    ON historial_voluntario(fecha_cambio);
CREATE INDEX IF NOT EXISTS idx_historial_estado
    ON historial_voluntario(estado_nuevo);

INSERT INTO historial_voluntario
    (id_voluntario, estado_anterior, estado_nuevo, cambiado_por, motivo, fecha_cambio)
SELECT
    v.id_usuario,
    NULL,
    v.estado,
    v.revisado_por,
    v.motivo_rechazo,
    COALESCE(v.fecha_revision, v.fecha_registro, CURRENT_TIMESTAMP)
FROM voluntario v
WHERE v.estado IN ('Pendiente', 'Aprobado', 'Rechazado')
  AND NOT EXISTS (
      SELECT 1
      FROM historial_voluntario h
      WHERE h.id_voluntario = v.id_usuario
  );

CREATE OR REPLACE FUNCTION registrar_historial_voluntario_estado()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        INSERT INTO historial_voluntario
            (id_voluntario, estado_anterior, estado_nuevo, cambiado_por, motivo)
        VALUES (
            NEW.id_usuario,
            OLD.estado,
            NEW.estado,
            NEW.revisado_por,
            CASE WHEN NEW.estado = 'Rechazado' THEN NEW.motivo_rechazo ELSE NULL END
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_historial_voluntario_estado ON voluntario;
CREATE TRIGGER trg_historial_voluntario_estado
AFTER UPDATE OF estado ON voluntario
FOR EACH ROW
EXECUTE FUNCTION registrar_historial_voluntario_estado();

COMMIT;
