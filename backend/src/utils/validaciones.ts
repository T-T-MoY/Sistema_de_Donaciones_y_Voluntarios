// backend/src/utils/validaciones.ts
// =====================================================
// UTILIDADES DE VALIDACIÓN REUTILIZABLES
// =====================================================

export interface ResultadoValidacion {
    valido: boolean;
    error?: string;
    edad?: number;
}

export interface DatosUsuarioValidacion {
    nombre?: string | null;
    paterno?: string | null;
    materno?: string | null;
    correo?: string | null;
    telefono?: string | number | null;
}

export interface DatosClienteValidacion {
    ci_nit?: string | number;
    fecha_nacimiento?: string | Date;
    calle?: string;
    zona?: string;
    ciudad?: string;
}

/**
 * Valida que un texto contenga solo letras (con tildes, ñ, ü),
 * espacios, apóstrofes y guiones. No acepta números ni símbolos raros.
 */
export const esSoloLetras = (texto: any): boolean => {
    if (!texto || typeof texto !== 'string') return false;
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(texto.trim());
};

/**
 * Valida que un texto contenga solo números (sin letras ni símbolos).
 */
export const esSoloNumeros = (texto: any): boolean => {
    if (texto === null || texto === undefined) return false;
    return /^[0-9]+$/.test(String(texto).trim());
};

/**
 * Valida un correo electrónico con formato estándar.
 */
export const esCorreoValido = (correo: any): boolean => {
    if (!correo || typeof correo !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
};

/**
 * Valida un teléfono boliviano: exactamente 8 dígitos numéricos.
 */
export const esTelefonoValido = (telefono: any): boolean => {
    if (!telefono) return false;
    const limpio = String(telefono).replace(/[\s-]/g, '');
    return /^[0-9]{8}$/.test(limpio);
};

/**
 * Valida un CI/NIT: solo números, entre 5 y 15 dígitos.
 */
export const esCiNitValido = (ci_nit: any): boolean => {
    if (ci_nit === null || ci_nit === undefined) return false;
    const limpio = String(ci_nit).trim();
    if (!/^[0-9]+$/.test(limpio)) return false;
    return limpio.length >= 5 && limpio.length <= 15;
};

/**
 * Calcula la edad a partir de una fecha de nacimiento.
 * Devuelve null si la fecha es inválida.
 */
export const calcularEdad = (fechaNacimiento: string | Date | null | undefined): number | null => {
    if (!fechaNacimiento) return null;

    const nac = new Date(fechaNacimiento);
    if (isNaN(nac.getTime())) return null;

    const hoy = new Date();

    // Si la fecha es futura, no es válida
    if (nac > hoy) return null;

    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
        edad--;
    }

    return edad;
};

/**
 * Valida que la fecha de nacimiento corresponda a una edad entre 15 y 80 años.
 * Rechaza fechas futuras y fechas de hoy.
 */
export const esFechaNacimientoValida = (fechaNacimiento: string | Date | null | undefined): ResultadoValidacion => {
    if (!fechaNacimiento) {
        return { valido: false, error: 'La fecha de nacimiento es obligatoria.' };
    }

    const nac = new Date(fechaNacimiento);
    if (isNaN(nac.getTime())) {
        return { valido: false, error: 'Fecha de nacimiento inválida.' };
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const nacLimpia = new Date(nac);
    nacLimpia.setHours(0, 0, 0, 0);

    if (nacLimpia >= hoy) {
        return { valido: false, error: 'La fecha de nacimiento no puede ser hoy ni una fecha futura.' };
    }

    const edad = calcularEdad(fechaNacimiento);

    if (edad === null) {
        return { valido: false, error: 'Fecha de nacimiento inválida.' };
    }

    if (edad < 15) {
        return { valido: false, error: 'Debés tener al menos 15 años para registrarte.' };
    }

    if (edad > 80) {
        return { valido: false, error: 'La fecha de nacimiento no corresponde a una edad válida (máximo 80 años).' };
    }

    return { valido: true, edad };
};

/**
 * Valida una contraseña:
 * - Mínimo 8 caracteres
 * - Al menos 1 mayúscula
 * - Al menos 1 minúscula
 * - Al menos 1 número
 */
export const esContraseñaSegura = (contraseña: any): ResultadoValidacion => {
    if (!contraseña || typeof contraseña !== 'string') {
        return { valido: false, error: 'La contraseña es obligatoria.' };
    }

    if (contraseña.length < 8) {
        return { valido: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
    }

    if (contraseña.length > 100) {
        return { valido: false, error: 'La contraseña no puede superar los 100 caracteres.' };
    }

    if (!/[A-Z]/.test(contraseña)) {
        return { valido: false, error: 'Debe incluir al menos una letra mayúscula.' };
    }

    if (!/[a-z]/.test(contraseña)) {
        return { valido: false, error: 'Debe incluir al menos una letra minúscula.' };
    }

    if (!/[0-9]/.test(contraseña)) {
        return { valido: false, error: 'Debe incluir al menos un número.' };
    }

    return { valido: true };
};

/**
 * Valida la longitud de un string (trim aplicado).
 */
export const longitudValida = (texto: any, min: number, max: number): boolean => {
    if (!texto || typeof texto !== 'string') return false;
    const limpio = texto.trim();
    return limpio.length >= min && limpio.length <= max;
};

// =====================================================
// VALIDACIONES ESPECÍFICAS POR CAMPO
// =====================================================

/**
 * Valida el conjunto de datos de un usuario (usado en registro y en panel admin).
 * Devuelve { valido: true } o { valido: false, error: 'mensaje' }.
 */
export const validarDatosUsuario = (datos: DatosUsuarioValidacion): ResultadoValidacion => {
    const { nombre, paterno, materno, correo, telefono } = datos;

    // Nombre
    if (!nombre || !nombre.trim()) {
        return { valido: false, error: 'El nombre es obligatorio.' };
    }
    if (!longitudValida(nombre, 2, 50)) {
        return { valido: false, error: 'El nombre debe tener entre 2 y 50 caracteres.' };
    }
    if (!esSoloLetras(nombre)) {
        return { valido: false, error: 'El nombre solo puede contener letras y espacios.' };
    }

    // Apellido paterno
    if (!paterno || !paterno.trim()) {
        return { valido: false, error: 'El apellido paterno es obligatorio.' };
    }
    if (!longitudValida(paterno, 2, 50)) {
        return { valido: false, error: 'El apellido paterno debe tener entre 2 y 50 caracteres.' };
    }
    if (!esSoloLetras(paterno)) {
        return { valido: false, error: 'El apellido paterno solo puede contener letras y espacios.' };
    }

    // Apellido materno (opcional)
    if (materno && materno.trim()) {
        if (!longitudValida(materno, 2, 50)) {
            return { valido: false, error: 'El apellido materno debe tener entre 2 y 50 caracteres.' };
        }
        if (!esSoloLetras(materno)) {
            return { valido: false, error: 'El apellido materno solo puede contener letras y espacios.' };
        }
    }

    // Correo
    if (!correo || !correo.trim()) {
        return { valido: false, error: 'El correo es obligatorio.' };
    }
    if (!esCorreoValido(correo)) {
        return { valido: false, error: 'El correo no tiene un formato válido.' };
    }
    if (correo.length > 150) {
        return { valido: false, error: 'El correo no puede superar los 150 caracteres.' };
    }

    // Teléfono
    if (!telefono || !String(telefono).trim()) {
        return { valido: false, error: 'El teléfono es obligatorio.' };
    }
    if (!esTelefonoValido(telefono)) {
        return { valido: false, error: 'El teléfono debe tener exactamente 8 dígitos numéricos.' };
    }

    return { valido: true };
};

/**
 * Valida los datos del cliente (ci_nit, fecha_nacimiento, calle, zona, ciudad).
 * (Se conserva por compatibilidad con formularios antiguos.)
 */
export const validarDatosCliente = (datos: DatosClienteValidacion): ResultadoValidacion => {
    const { ci_nit, fecha_nacimiento, calle, zona, ciudad } = datos;

    // CI/NIT
    if (!ci_nit || String(ci_nit).trim() === '') {
        return { valido: false, error: 'El CI/NIT es obligatorio.' };
    }
    if (!esCiNitValido(ci_nit)) {
        return { valido: false, error: 'El CI/NIT debe tener entre 5 y 15 dígitos numéricos.' };
    }

    // Fecha de nacimiento
    const resultadoFecha = esFechaNacimientoValida(fecha_nacimiento);
    if (!resultadoFecha.valido) {
        return resultadoFecha;
    }

    // Calle (opcional pero si viene, validar)
    if (calle && calle.trim().length > 150) {
        return { valido: false, error: 'La calle no puede superar los 150 caracteres.' };
    }

    // Zona (opcional)
    if (zona && zona.trim().length > 100) {
        return { valido: false, error: 'La zona no puede superar los 100 caracteres.' };
    }

    // Ciudad (opcional)
    if (ciudad && ciudad.trim().length > 100) {
        return { valido: false, error: 'La ciudad no puede superar los 100 caracteres.' };
    }

    return { valido: true, edad: resultadoFecha.edad };
};

// =====================================================
// VALIDACIONES DEL DOMINIO: DONACIONES Y VOLUNTARIADO
// =====================================================

export type RolSistema = 'Administrador' | 'Beneficiario' | 'Donante' | 'Voluntario';

export const ROLES_VALIDOS: RolSistema[] = [
    'Administrador',
    'Beneficiario',
    'Donante',
    'Voluntario'
];

export const TIPOS_BENEFICIARIO = ['Persona', 'Familia', 'Institucion'];
export const ESTADOS_BENEFICIARIO = ['Pendiente', 'Verificado', 'Rechazado'];
export const NIVELES_ACCESO = ['SUPERADMIN', 'GENERAL'];

/**
 * Convierte un texto separado por comas en un arreglo de habilidades.
 */
export const normalizarHabilidades = (habilidades: unknown): string[] => {
    if (Array.isArray(habilidades)) {
        return habilidades
            .map((h) => String(h).trim())
            .filter((h) => h.length > 0)
            .slice(0, 20);
    }
    if (typeof habilidades === 'string') {
        return habilidades
            .split(',')
            .map((h) => h.trim())
            .filter((h) => h.length > 0)
            .slice(0, 20);
    }
    return [];
};

/**
 * Valida coordenadas geográficas opcionales.
 */
export const validarCoordenadas = (latitud: unknown, longitud: unknown): ResultadoValidacion => {
    const latVacia = latitud === undefined || latitud === null || String(latitud).trim() === '';
    const lonVacia = longitud === undefined || longitud === null || String(longitud).trim() === '';

    if (latVacia && lonVacia) return { valido: true };
    if (latVacia !== lonVacia) {
        return { valido: false, error: 'Debés completar latitud y longitud juntas.' };
    }

    const lat = Number(latitud);
    const lon = Number(longitud);

    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
        return { valido: false, error: 'La latitud debe estar entre -90 y 90.' };
    }
    if (Number.isNaN(lon) || lon < -180 || lon > 180) {
        return { valido: false, error: 'La longitud debe estar entre -180 y 180.' };
    }

    return { valido: true };
};

interface DatosBeneficiarioValidacion {
    tipo_beneficiario?: string;
    documento?: string | number;
    direccion?: string;
    necesidad?: string;
    descripcion?: string;
    estado_beneficiario?: string;
}

export const validarDatosBeneficiario = (datos: DatosBeneficiarioValidacion): ResultadoValidacion => {
    const { tipo_beneficiario, documento, direccion, necesidad, descripcion, estado_beneficiario } = datos;

    if (!tipo_beneficiario || !TIPOS_BENEFICIARIO.includes(tipo_beneficiario)) {
        return { valido: false, error: 'Seleccioná un tipo de beneficiario válido (Persona, Familia o Institución).' };
    }

    if (!documento || String(documento).trim() === '') {
        return { valido: false, error: 'El documento (CI / NIT) es obligatorio.' };
    }
    if (!esCiNitValido(documento)) {
        return { valido: false, error: 'El documento debe tener entre 5 y 15 dígitos numéricos.' };
    }

    if (!direccion || !direccion.trim()) {
        return { valido: false, error: 'La dirección es obligatoria.' };
    }
    if (direccion.trim().length > 255) {
        return { valido: false, error: 'La dirección no puede superar los 255 caracteres.' };
    }

    if (!necesidad || !necesidad.trim()) {
        return { valido: false, error: 'La necesidad es obligatoria.' };
    }
    if (necesidad.trim().length > 150) {
        return { valido: false, error: 'La necesidad no puede superar los 150 caracteres.' };
    }

    if (descripcion && descripcion.trim().length > 2000) {
        return { valido: false, error: 'La descripción no puede superar los 2000 caracteres.' };
    }

    if (estado_beneficiario && !ESTADOS_BENEFICIARIO.includes(estado_beneficiario)) {
        return { valido: false, error: 'Estado de beneficiario inválido.' };
    }

    return { valido: true };
};

interface DatosDonanteValidacion {
    direccion?: string | null;
    ubi_latitud?: number | string | null;
    ubi_longitud?: number | string | null;
}

export const validarDatosDonante = (datos: DatosDonanteValidacion): ResultadoValidacion => {
    const { direccion, ubi_latitud, ubi_longitud } = datos;

    if (direccion && direccion.trim().length > 255) {
        return { valido: false, error: 'La dirección no puede superar los 255 caracteres.' };
    }

    return validarCoordenadas(ubi_latitud, ubi_longitud);
};

interface DatosVoluntarioValidacion {
    habilidades?: string | string[];
    disponibilidad?: string;
}

export const validarDatosVoluntario = (datos: DatosVoluntarioValidacion): ResultadoValidacion => {
    const { habilidades, disponibilidad } = datos;

    const lista = normalizarHabilidades(habilidades);
    if (lista.length === 0) {
        return { valido: false, error: 'Indicá al menos una habilidad (separadas por comas).' };
    }
    if (lista.some((h) => h.length > 60)) {
        return { valido: false, error: 'Cada habilidad puede tener máximo 60 caracteres.' };
    }

    if (!disponibilidad || !disponibilidad.trim()) {
        return { valido: false, error: 'La disponibilidad es obligatoria.' };
    }
    if (disponibilidad.trim().length > 100) {
        return { valido: false, error: 'La disponibilidad no puede superar los 100 caracteres.' };
    }

    return { valido: true };
};

export const validarDatosAdministrador = (nivel_acceso?: string | null): ResultadoValidacion => {
    if (nivel_acceso && !NIVELES_ACCESO.includes(nivel_acceso)) {
        return { valido: false, error: 'Nivel de acceso inválido (SUPERADMIN o GENERAL).' };
    }
    return { valido: true };
};

export const esRolValido = (rol: unknown): rol is RolSistema =>
    typeof rol === 'string' && ROLES_VALIDOS.includes(rol as RolSistema);