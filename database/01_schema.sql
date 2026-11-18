-- =========================================================
-- MÓDULO: GESTIÓN DE USUARIOS (bd_donaciones_voluntariado)
-- Modelo de Herencia 1:1 en 5 Entidades
-- =========================================================

-- 1. ENTIDAD PADRE: USUARIO
-- Contiene los atributos comunes de autenticación, contacto y estado de cuenta.
CREATE TABLE usuario (
    id_usuario     SERIAL PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    apellido       VARCHAR(100) NOT NULL,
    correo         VARCHAR(150) NOT NULL UNIQUE,
    telefono       VARCHAR(20),
    password       VARCHAR(255) NOT NULL,
    estado         VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo','Inactivo','Eliminado')), -- TRUE: Activo | FALSE: Bloqueado/Inactivo
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. HERENCIA 1: ADMINISTRADOR
-- Subtipo encargado de gestionar campañas y validar usuarios.
CREATE TABLE administrador (
    id_usuario     INT PRIMARY KEY,
    nivel_acceso   VARCHAR(30) NOT NULL DEFAULT 'GENERAL'
                   CHECK (nivel_acceso IN ('SUPERADMIN', 'GENERAL')),
    CONSTRAINT fk_admin_usuario 
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) 
        ON DELETE CASCADE
);

-- 3. HERENCIA 2: BENEFICIARIO
-- Subtipo que recibe las donaciones; incluye validación documental y estado de aprobación.
CREATE TABLE beneficiario (
    id_usuario        INT PRIMARY KEY,
    tipo_beneficiario VARCHAR(30) NOT NULL 
                      CHECK (tipo_beneficiario IN ('Persona', 'Familia', 'Institucion')),
    documento         VARCHAR(30) NOT NULL UNIQUE, -- CI, NIT o Personería Jurídica
    direccion         VARCHAR(255) NOT NULL,
    necesidad         VARCHAR(150) NOT NULL,
    descripcion       TEXT,
    estado            VARCHAR(20) NOT NULL DEFAULT 'Pendiente'
                      CHECK (estado IN ('Pendiente', 'Verificado', 'Rechazado')),
    CONSTRAINT fk_beneficiario_usuario 
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) 
        ON DELETE CASCADE
);

-- 4. HERENCIA 3: DONANTE
-- Subtipo que realiza aportes; almacena ubicación geográfica para logística de recojo.
CREATE TABLE donante (
    id_usuario     INT PRIMARY KEY,
    direccion      VARCHAR(255),
    ubi_latitud    DECIMAL(10, 8),
    ubi_longitud   DECIMAL(11, 8),
    CONSTRAINT fk_donante_usuario 
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) 
        ON DELETE CASCADE,
    CONSTRAINT chk_coordenadas_validas 
        CHECK (
            (ubi_latitud BETWEEN -90 AND 90) AND 
            (ubi_longitud BETWEEN -180 AND 180)
        )
);

-- 5. HERENCIA 4: VOLUNTARIO
-- Subtipo que apoya campañas; usa arreglo nativo para habilidades atómicas.
CREATE TABLE voluntario (
    id_usuario     INT PRIMARY KEY,
    habilidades    TEXT[] NOT NULL DEFAULT '{}', -- Ej: ARRAY['Logistica', 'Primeros Auxilios']
    disponibilidad VARCHAR(100) NOT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_voluntario_usuario 
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) 
        ON DELETE CASCADE
);

-- =========================================================
-- ÍNDICES PARA CONSULTAS RÁPIDAS DEL MÓDULO DE USUARIOS
-- =========================================================
CREATE INDEX idx_usuario_correo ON usuario(correo);
CREATE INDEX idx_usuario_estado ON usuario(estado);
CREATE INDEX idx_beneficiario_documento ON beneficiario(documento);
CREATE INDEX idx_beneficiario_estado ON beneficiario(estado);