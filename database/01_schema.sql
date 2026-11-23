-- =========================================================
-- MÓDULO: GESTIÓN DE USUARIOS (bd_donaciones_voluntariado)
-- Herencia 1:1 con especialización solapada: un usuario puede
-- ser donante, voluntario y/o beneficiario a la vez.
-- =========================================================

-- 1. USUARIO (cuenta)
CREATE TABLE usuario (
    id_usuario     SERIAL PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    apellido       VARCHAR(100) NOT NULL,
    correo         VARCHAR(150) NOT NULL UNIQUE,
    telefono       VARCHAR(20),
    password       VARCHAR(255) NOT NULL,
    foto_url       VARCHAR(500),
    estado         VARCHAR(20) NOT NULL DEFAULT 'Activo'
                   CHECK (estado IN ('Activo','Inactivo','Eliminado')),
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. ADMINISTRADOR
CREATE TABLE administrador (
    id_usuario INT PRIMARY KEY,
    CONSTRAINT fk_admin_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- 3. DONANTE (se crea automáticamente al registrarse)
CREATE TABLE donante (
    id_usuario   INT PRIMARY KEY,
    direccion    VARCHAR(255),
    ubi_latitud  DECIMAL(10,8),
    ubi_longitud DECIMAL(11,8),
    CONSTRAINT fk_donante_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT chk_coordenadas_validas CHECK (
        (ubi_latitud  IS NULL OR ubi_latitud  BETWEEN -90 AND 90) AND
        (ubi_longitud IS NULL OR ubi_longitud BETWEEN -180 AND 180))
);

-- 4. VOLUNTARIO (la solicitud la aprueba el coordinador)
CREATE TABLE voluntario (
    id_usuario     INT PRIMARY KEY,
    habilidades    TEXT[] NOT NULL DEFAULT '{}',
    disponibilidad VARCHAR(100) NOT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    es_coordinador BOOLEAN NOT NULL DEFAULT FALSE,
    estado         VARCHAR(20) NOT NULL DEFAULT 'Pendiente'
                   CHECK (estado IN ('Pendiente','Aprobado','Rechazado')),
    revisado_por   INT,            -- coordinador que aprobó/rechazó
    fecha_revision TIMESTAMP,
    motivo_rechazo TEXT,
    CONSTRAINT fk_voluntario_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_voluntario_revisor FOREIGN KEY (revisado_por)
        REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    -- solo un voluntario aprobado puede ser coordinador
    CONSTRAINT chk_coordinador_aprobado
        CHECK (NOT es_coordinador OR estado = 'Aprobado'),
    -- nadie aprueba su propia solicitud
    CONSTRAINT chk_voluntario_no_autoaprobacion
        CHECK (revisado_por IS NULL OR revisado_por <> id_usuario)
);

-- 5. BENEFICIARIO (la solicitud la verifica el administrador)
CREATE TABLE beneficiario (
    id_usuario        INT PRIMARY KEY,
    tipo_beneficiario VARCHAR(30) NOT NULL
                      CHECK (tipo_beneficiario IN ('Persona','Familia','Institucion')),
    documento         VARCHAR(30) NOT NULL UNIQUE,  -- CI, NIT o Personería Jurídica
    direccion         VARCHAR(255) NOT NULL,
    necesidad         VARCHAR(150) NOT NULL,
    descripcion       TEXT,
    estado            VARCHAR(20) NOT NULL DEFAULT 'Pendiente'
                      CHECK (estado IN ('Pendiente','Verificado','Rechazado')),
    revisado_por      INT,           -- admin que verificó/rechazó
    fecha_revision    TIMESTAMP,
    motivo_rechazo    TEXT,
    CONSTRAINT fk_beneficiario_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_beneficiario_revisor FOREIGN KEY (revisado_por)
        REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    -- nadie verifica su propia solicitud
    CONSTRAINT chk_beneficiario_no_autoaprobacion
        CHECK (revisado_por IS NULL OR revisado_por <> id_usuario)
);

-- =========================================================
-- ÍNDICES
-- =========================================================
CREATE INDEX idx_usuario_estado         ON usuario(estado);
CREATE INDEX idx_voluntario_estado      ON voluntario(estado);
CREATE INDEX idx_beneficiario_documento ON beneficiario(documento);
CREATE INDEX idx_beneficiario_estado    ON beneficiario(estado);
-- (no hace falta índice en correo: UNIQUE ya lo crea)