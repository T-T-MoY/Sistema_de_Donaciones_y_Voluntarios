-- =========================================================
-- DATOS DE PRUEBA: MÓDULO GESTIÓN DE USUARIOS
-- Nota: Todas las contraseñas encriptadas corresponden a '123456'
-- =========================================================

-- 1. TABLA BASE: USUARIO (12 registros)
INSERT INTO usuario (id_usuario, nombre, apellido, correo, telefono, password, estado, fecha_creacion) VALUES
-- Administradores (IDs 1 y 2)
(1, 'Carla', 'Mamani Quispe', 'carla.admin@donacionesbo.org', '71234567', '$2a$12$SYkWhr2bVMvKyYplaVy.VeNLKFFtY6tMDp6E9MmPp2Rzqb7qgM2RO', 'Activo', '2026-01-10 09:00:00'),
(2, 'Jorge', 'Fernandez Rojas', 'jorge.admin@donacionesbo.org', '71234568', '$2a$12$SYkWhr2bVMvKyYplaVy.VeNLKFFtY6tMDp6E9MmPp2Rzqb7qgM2RO', 'Activo', '2026-01-11 09:30:00'),

-- Beneficiarios (IDs 3, 4 y 5)
(3, 'Rosa', 'Chambi Aguilar', 'rosa.chambi@gmail.com', '76001121', '$2a$12$SYkWhr2bVMvKyYplaVy.VeNLKFFtY6tMDp6E9MmPp2Rzqb7qgM2RO', 'Activo', '2026-02-01 10:00:00'),
(4, 'Hector', 'Poma Yujra', 'hector.poma@gmail.com', '76001122', '$2a$12$SYkWhr2bVMvKyYplaVy.VeNLKFFtY6tMDp6E9MmPp2Rzqb7qgM2RO', 'Activo', '2026-02-02 11:15:00'),
(5, 'Ana', 'Torrez Vidal', 'comedor.esperanza@gmail.com', '76001123', '$2a$12$SYkWhr2bVMvKyYplaVy.VeNLKFFtY6tMDp6E9MmPp2Rzqb7qgM2RO', 'Activo', '2026-02-03 14:20:00'),

-- Donantes (IDs 6, 7, 8 y 9)
(6, 'Diego', 'Ramirez Soto', 'diego.ramirez@gmail.com', '76002201', '$2a$12$SYkWhr2bVMvKyYplaVy.VeNLKFFtY6tMDp6E9MmPp2Rzqb7qgM2RO', 'Activo', '2026-02-05 15:00:00'),
(7, 'Sofia', 'Paredes Rivas', 'sofia.paredes@gmail.com', '76002202', '$2a$12$SYkWhr2bVMvKyYplaVy.VeNLKFFtY6tMDp6E9MmPp2Rzqb7qgM2RO', 'Activo', '2026-02-06 16:30:00'),
(8, 'Andres', 'Guzman Flores', 'andres.guzman@gmail.com', '76002203', '$2a$12$SYkWhr2bVMvKyYplaVy.VeNLKFFtY6tMDp6E9MmPp2Rzqb7qgM2RO', 'Activo', '2026-02-07 09:45:00'),
(9, 'Paola', 'Duran Vega', 'paola.duran@gmail.com', '76002204', '$2a$12$SYkWhr2bVMvKyYplaVy.VeNLKFFtY6tMDp6E9MmPp2Rzqb7qgM2RO', 'Inactivo', '2026-02-08 13:00:00'), -- Cuenta inactiva para pruebas

-- Voluntarios (IDs 10, 11 y 12)
(10, 'Luis', 'Choque Apaza', 'luis.choque@gmail.com', '76003301', '$2a$12$SYkWhr2bVMvKyYplaVy.VeNLKFFtY6tMDp6E9MmPp2Rzqb7qgM2RO', 'Activo', '2026-02-10 08:30:00'),
(11, 'Valeria', 'Nina Choque', 'valeria.nina@gmail.com', '76003302', '$2a$12$SYkWhr2bVMvKyYplaVy.VeNLKFFtY6tMDp6E9MmPp2Rzqb7qgM2RO', 'Activo', '2026-02-11 10:15:00'),
(12, 'Sebastian', 'Vega Luna', 'sebastian.vega@gmail.com', '76003303', '$2a$12$SYkWhr2bVMvKyYplaVy.VeNLKFFtY6tMDp6E9MmPp2Rzqb7qgM2RO', 'Activo', '2026-02-12 17:00:00');


-- =========================================================
-- 2. HERENCIAS / SUBTIPOS POR ROL
-- =========================================================

-- ---------- ADMINISTRADOR ----------
INSERT INTO administrador (id_usuario, nivel_acceso) VALUES
(1, 'SUPERADMIN'),
(2, 'GENERAL');

-- ---------- BENEFICIARIO ----------
INSERT INTO beneficiario (id_usuario, tipo_beneficiario, documento, direccion, necesidad, descripcion, estado) VALUES
(3, 'Persona', '5612345', 'Av. Buenos Aires #450, Zona Max Paredes, La Paz', 'Medicamentos e insumos médicos', 'Adulto mayor que requiere tratamiento mensual continuo.', 'Verificado'),
(4, 'Familia', '6123456', 'Calle 4 #120, Villa Fátima, La Paz', 'Canasta familiar y ropa de abrigo', 'Familia de 5 integrantes afectada por pérdida de empleo.', 'Pendiente'),
(5, 'Institucion', '1020304025', 'Av. Periférica #890, Zona Achachicala, La Paz', 'Alimentos no perecederos', 'Comedor popular infantil que atiende a 60 niños diariamente.', 'Verificado');

-- ---------- DONANTE ----------
INSERT INTO donante (id_usuario, direccion, ubi_latitud, ubi_longitud) VALUES
(6, 'Av. Busch #123, Miraflores, La Paz', -16.50384500, -68.12153200),
(7, 'Av. Arce #789, San Jorge, La Paz', -16.50912300, -68.12489100),
(8, 'Av. Ballivián #56, Calacoto, La Paz', -16.54123400, -68.08567800),
(9, 'Av. 6 de Agosto #300, Sopocachi, La Paz', -16.50765400, -68.12891000);

-- ---------- VOLUNTARIO ----------
INSERT INTO voluntario (id_usuario, habilidades, disponibilidad, fecha_registro) VALUES
(10, ARRAY['Logistica', 'Conduccion y Transporte', 'Carga'], 'Fines de semana', '2026-02-10 08:30:00'),
(11, ARRAY['Primeros Auxilios', 'Atencion Social', 'Organizacion'], 'Tardes (14:00 - 19:00)', '2026-02-11 10:15:00'),
(12, ARRAY['Cocina y Alimentacion', 'Inventario', 'Logistica'], 'Tiempo completo', '2026-02-12 17:00:00');


-- =========================================================
-- 3. SINCRONIZAR SECUENCIA DE IDs EN POSTGRESQL
-- =========================================================
SELECT setval('usuario_id_usuario_seq', (SELECT MAX(id_usuario) FROM usuario));