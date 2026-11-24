
-- =========================================================
-- MÓDULO 4: GESTIÓN DE VOLUNTARIOS
-- Archivo: 03_gestion_voluntarios.sql
-- Base de datos: bd_donaciones_voluntariado
--
-- IMPORTANTE:
-- Este script agrega tablas nuevas del Grupo 4.
-- No modifica las tablas existentes de otros grupos.
-- =========================================================

BEGIN;

-- =========================================================
-- 1. DISPONIBILIDAD_VOLUNTARIO
-- Registra los días y horarios específicos disponibles
-- de cada voluntario.
-- =========================================================

CREATE TABLE IF NOT EXISTS disponibilidad_voluntario (
    id_disponibilidad SERIAL PRIMARY KEY,

    id_voluntario INT NOT NULL,

    dia_semana VARCHAR(15) NOT NULL
        CHECK (dia_semana IN (
            'Lunes',
            'Martes',
            'Miercoles',
            'Jueves',
            'Viernes',
            'Sabado',
            'Domingo'
        )),

    hora_inicio TIME NOT NULL,

    hora_fin TIME NOT NULL,

    estado BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_disponibilidad_voluntario
        FOREIGN KEY (id_voluntario)
        REFERENCES voluntario(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT chk_disponibilidad_horas
        CHECK (hora_fin > hora_inicio)
);

CREATE INDEX IF NOT EXISTS idx_disponibilidad_voluntario
    ON disponibilidad_voluntario(id_voluntario);

CREATE INDEX IF NOT EXISTS idx_disponibilidad_dia
    ON disponibilidad_voluntario(dia_semana);


-- =========================================================
-- 2. HISTORIAL_VOLUNTARIO
-- Registra los cambios administrativos realizados sobre
-- el estado de un voluntario.
-- =========================================================

CREATE TABLE IF NOT EXISTS historial_voluntario (
    id_historial SERIAL PRIMARY KEY,

    id_voluntario INT NOT NULL,

    estado_anterior VARCHAR(20),

    estado_nuevo VARCHAR(20) NOT NULL
        CHECK (estado_nuevo IN (
            'Pendiente',
            'Aprobado',
            'Rechazado'
        )),

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
            OR estado_anterior IN (
                'Pendiente',
                'Aprobado',
                'Rechazado'
            )
        )
);

CREATE INDEX IF NOT EXISTS idx_historial_voluntario
    ON historial_voluntario(id_voluntario);

CREATE INDEX IF NOT EXISTS idx_historial_fecha
    ON historial_voluntario(fecha_cambio);

CREATE INDEX IF NOT EXISTS idx_historial_estado
    ON historial_voluntario(estado_nuevo);


-- =========================================================
-- FIN DEL MÓDULO 4: GESTIÓN DE VOLUNTARIOS
-- TABLAS CONSERVADAS:
-- 1. disponibilidad_voluntario
-- 2. historial_voluntario
-- =========================================================

COMMIT;
