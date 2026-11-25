
-- =========================================================
-- DATOS DE PRUEBA: MODULO 4 - GESTION DE VOLUNTARIOS
-- Base de datos: bd_donaciones_voluntariado
-- =========================================================

BEGIN;

-- =========================================================
-- 1. DISPONIBILIDAD DE VOLUNTARIOS
-- =========================================================

INSERT INTO disponibilidad_voluntario
(id_voluntario, dia_semana, hora_inicio, hora_fin, estado)
SELECT v.id_voluntario, v.dia, v.inicio, v.fin, TRUE
FROM (VALUES
    -- Luis Choque (Coordinador)
    (10, 'Sabado',  '08:00'::TIME, '13:00'::TIME),
    (10, 'Domingo', '08:00'::TIME, '12:00'::TIME),

    -- Valeria Nina
    (11, 'Lunes',     '14:00'::TIME, '19:00'::TIME),
    (11, 'Miercoles', '14:00'::TIME, '19:00'::TIME),
    (11, 'Viernes',   '14:00'::TIME, '19:00'::TIME),

    -- Sebastian Vega
    (12, 'Lunes',    '08:00'::TIME, '17:00'::TIME),
    (12, 'Martes',   '08:00'::TIME, '17:00'::TIME),
    (12, 'Miercoles','08:00'::TIME, '17:00'::TIME),
    (12, 'Jueves',   '08:00'::TIME, '17:00'::TIME),
    (12, 'Viernes',  '08:00'::TIME, '17:00'::TIME)

) AS v(id_voluntario, dia, inicio, fin)
WHERE NOT EXISTS (
    SELECT 1
    FROM disponibilidad_voluntario d
    WHERE d.id_voluntario = v.id_voluntario
      AND d.dia_semana = v.dia
      AND d.hora_inicio = v.inicio
      AND d.hora_fin = v.fin
);

-- =========================================================
-- 2. HISTORIAL ADMINISTRATIVO DE VOLUNTARIOS
-- =========================================================

INSERT INTO historial_voluntario
(id_voluntario, estado_anterior, estado_nuevo,
 cambiado_por, motivo, fecha_cambio)

SELECT
    v.id_voluntario,
    v.estado_anterior,
    v.estado_nuevo,
    v.cambiado_por,
    v.motivo,
    v.fecha_cambio
FROM (VALUES

    -- Luis: aprobado por la administradora Carla (ID 1)
    (10, 'Pendiente'::VARCHAR, 'Aprobado'::VARCHAR,
     1, 'Solicitud aprobada. Cuenta con habilidades de logística, conducción y transporte.',
     '2026-02-10 12:00:00'::TIMESTAMP),

    -- Valeria: aprobada por el coordinador Luis (ID 10)
    (11, 'Pendiente'::VARCHAR, 'Aprobado'::VARCHAR,
     10, 'Solicitud aprobada. Cuenta con conocimientos de primeros auxilios y atención social.',
     '2026-02-12 09:00:00'::TIMESTAMP),

    -- Sebastian: solicitud pendiente de revisión
    (12, NULL::VARCHAR, 'Pendiente'::VARCHAR,
     NULL, 'Solicitud registrada. Pendiente de revisión administrativa.',
     '2026-02-12 17:00:00'::TIMESTAMP)

) AS v(
    id_voluntario,
    estado_anterior,
    estado_nuevo,
    cambiado_por,
    motivo,
    fecha_cambio
)
WHERE NOT EXISTS (
    SELECT 1
    FROM historial_voluntario h
    WHERE h.id_voluntario = v.id_voluntario
      AND h.fecha_cambio = v.fecha_cambio
);

COMMIT;

-- =========================================================
-- FIN DEL MODULO 4
-- =========================================================
