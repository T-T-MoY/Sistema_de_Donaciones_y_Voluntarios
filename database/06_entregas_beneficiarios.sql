-- Habilita las entregas físicas de asignaciones en bases ya creadas.
-- Aplicar después de database/01_schema.sql.
BEGIN;

CREATE TABLE IF NOT EXISTS entrega_donacion (
    id_entrega SERIAL PRIMARY KEY,
    fecha_entrega TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/La_Paz'),
    lugar_entrega VARCHAR(180) NOT NULL,
    responsable_usuario_id INT NOT NULL REFERENCES administrador(id_usuario) ON DELETE RESTRICT,
    observaciones TEXT,
    estado VARCHAR(12) NOT NULL DEFAULT 'REGISTRADA'
        CHECK (estado IN ('REGISTRADA','ANULADA'))
);

ALTER TABLE inventario_destino
    ADD COLUMN IF NOT EXISTS id_asignacion INT
        REFERENCES asignacion_donacion(id_asignacion) ON DELETE RESTRICT;
ALTER TABLE inventario_destino
    ADD COLUMN IF NOT EXISTS id_entrega INT
        REFERENCES entrega_donacion(id_entrega) ON DELETE RESTRICT;

ALTER TABLE inventario_destino
    DROP CONSTRAINT IF EXISTS chk_inventario_destino_unico;
ALTER TABLE inventario_destino
    ADD CONSTRAINT chk_inventario_destino_unico CHECK (
      (campana_id IS NOT NULL AND solicitud_ayuda_id IS NULL
       AND id_asignacion IS NULL AND id_entrega IS NULL) OR
      (campana_id IS NULL AND solicitud_ayuda_id IS NOT NULL
       AND id_asignacion IS NULL AND id_entrega IS NULL) OR
      (campana_id IS NULL AND solicitud_ayuda_id IS NULL
       AND id_asignacion IS NOT NULL AND id_entrega IS NOT NULL)
    );

CREATE OR REPLACE FUNCTION fn_controlar_salida_inventario() RETURNS trigger AS $$
DECLARE
  v_donacion INT;
  v_disponible NUMERIC(14,2);
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'No se eliminan salidas de inventario; use el estado ANULADA para conservar la trazabilidad.';
  END IF;
  -- Una salida que nace anulada no descuenta existencias.
  IF TG_OP = 'INSERT' AND NEW.estado = 'ANULADA' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF NEW.id_inventario <> OLD.id_inventario OR NEW.id_donacion <> OLD.id_donacion
       OR NEW.cantidad <> OLD.cantidad OR NEW.campana_id IS DISTINCT FROM OLD.campana_id
       OR NEW.solicitud_ayuda_id IS DISTINCT FROM OLD.solicitud_ayuda_id
       OR NEW.id_asignacion IS DISTINCT FROM OLD.id_asignacion
       OR NEW.id_entrega IS DISTINCT FROM OLD.id_entrega THEN
      RAISE EXCEPTION 'No se puede cambiar el origen, cantidad o destino de una salida; anule y registre una nueva.';
    END IF;
    IF OLD.estado = NEW.estado THEN RETURN NEW; END IF;
    IF OLD.estado = 'REGISTRADA' AND NEW.estado = 'ANULADA' THEN
      UPDATE inventario
         SET cantidad_disponible = cantidad_disponible + OLD.cantidad,
             estado = 'DISPONIBLE'
       WHERE id_inventario = OLD.id_inventario;
      RETURN NEW;
    ELSIF OLD.estado = 'ANULADA' AND NEW.estado = 'REGISTRADA' THEN
      SELECT id_donacion, cantidad_disponible INTO v_donacion, v_disponible
        FROM inventario WHERE id_inventario = NEW.id_inventario FOR UPDATE;
      IF v_donacion IS DISTINCT FROM NEW.id_donacion OR v_disponible < NEW.cantidad THEN
        RAISE EXCEPTION 'No existe saldo suficiente para reactivar esta salida.';
      END IF;
      UPDATE inventario SET cantidad_disponible = cantidad_disponible - NEW.cantidad,
        estado = CASE WHEN cantidad_disponible - NEW.cantidad = 0 THEN 'AGOTADO' ELSE 'DISPONIBLE' END
        WHERE id_inventario = NEW.id_inventario;
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Transición de estado de salida no permitida.';
  END IF;

  SELECT id_donacion, cantidad_disponible INTO v_donacion, v_disponible
    FROM inventario WHERE id_inventario = NEW.id_inventario FOR UPDATE;
  IF v_donacion IS NULL OR v_donacion <> NEW.id_donacion THEN
    RAISE EXCEPTION 'La partida de inventario no corresponde a la donación indicada.';
  END IF;
  IF v_disponible < NEW.cantidad THEN
    RAISE EXCEPTION 'La cantidad solicitada supera el inventario disponible.';
  END IF;
  UPDATE inventario SET cantidad_disponible = cantidad_disponible - NEW.cantidad,
    estado = CASE WHEN cantidad_disponible - NEW.cantidad = 0 THEN 'AGOTADO' ELSE 'DISPONIBLE' END
    WHERE id_inventario = NEW.id_inventario;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE INDEX IF NOT EXISTS idx_inventario_destino_asignacion
    ON inventario_destino(id_asignacion) WHERE id_asignacion IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventario_destino_entrega
    ON inventario_destino(id_entrega) WHERE id_entrega IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_entrega_donacion_fecha
    ON entrega_donacion(fecha_entrega DESC);

COMMIT;
