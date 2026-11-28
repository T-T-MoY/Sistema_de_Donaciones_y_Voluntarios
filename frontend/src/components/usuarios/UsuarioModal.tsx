/**
 * ============================================================================
 * ARCHIVO: UsuarioModal.tsx
 * COMPONENTE: Modal para crear / editar usuarios.
 * - Valida por rol (Donante, Voluntario, Administrador).
 * - Carga datos si recibe `usuarioId`.
 * - Renderiza en portal.
 * ============================================================================
 */

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/client';
import FieldError from '../ui/FieldError';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
    validarCampo,
    validarFormularioCompleto,
    claseInput
} from '../../utils/validaciones';
import type { Rol, UsuarioFormData } from '../../types/usuario.types';

// =====================================================
// TIPOS LOCALES (auxiliares del modal)
// =====================================================
type FormData = UsuarioFormData;

interface Errores {
    [key: string]: string | undefined;
}

interface Touched {
    [key: string]: boolean;
}

interface UsuarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    usuarioId?: number | null;
}

// =====================================================
// ESTILOS COMPARTIDOS
// =====================================================
const etiquetaCampo =
    'mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-text-muted';

const tituloSeccion =
    'flex items-center gap-2.5 font-display text-[11px] font-bold uppercase tracking-[0.16em] text-text';

const claseSelect =
    'w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text transition-[border-color,box-shadow] duration-200 hover:border-border-strong focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15';

// =====================================================
// COMPONENTE
// =====================================================
// El selector y la API usan los roles canónicos.
const rolBackendAFormulario = (rol?: string | null): Rol => {
    const r = (rol || '').toLowerCase().trim();
    if (r === 'administrador' || r === 'admin') return 'Administrador';
    if (r === 'coordinador') return 'Coordinador';
    if (r === 'voluntario' || r === 'empleado') return 'Voluntario';
    if (r === 'beneficiario') return 'Beneficiario';
    return 'Donante';
};

const UsuarioModal = ({ isOpen, onClose, onSave, usuarioId = null }: UsuarioModalProps) => {
    const modoEdicion = Boolean(usuarioId);
    const { exito } = useToast();
    const { usuario: usuarioSesion, refreshSession } = useAuth();

    const estadoInicial: FormData = {
        nombre: '',
        paterno: '',
        materno: '',
        correo: '',
        telefono: '',
        contraseña: '',
        rol: '',
        roles: [],
        estado: 'Activo',
        ci_nit: '',
        fecha_nacimiento: '',
        calle: '',
        zona: '',
        ciudad: '',
        habilidades: '',
        disponibilidad: 'Mañana',
        tipo_beneficiario: 'Persona',
        direccion: '',
        necesidad: '',
        descripcion: '',
    };

    const [formData, setFormData] = useState<FormData>(estadoInicial);
    const [errores, setErrores] = useState<Errores>({});
    const [touched, setTouched] = useState<Touched>({});
    const [cargando, setCargando] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [mostrarContraseña, setMostrarContraseña] = useState<boolean>(false);

    // =====================================================
    // FLAGS DE ROL
    // =====================================================
    const rolesNorm = formData.roles.map((rol) => rol.toLowerCase().trim());
    const esDonante = rolesNorm.includes('donante');
    const esVoluntario = rolesNorm.includes('voluntario') || rolesNorm.includes('coordinador');
    const esBeneficiario = rolesNorm.includes('beneficiario');
    const esAdministrador = rolesNorm.includes('administrador');
    // Máximo de roles combinables: Donante + (Voluntario o Coordinador) + Beneficiario.
    const rolesCompletos = !esAdministrador && formData.roles.length >= 3;

    // =====================================================
    // BLOQUEAR SCROLL DEL BODY MIENTRAS EL MODAL ESTÁ ABIERTO
    // =====================================================
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // =====================================================
    // CERRAR CON ESC
    // =====================================================
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // =====================================================
    // CARGAR DATOS SI ES EDICIÓN
    // =====================================================
    useEffect(() => {
        if (!isOpen) return;

        setMostrarContraseña(false);

        if (!usuarioId) {
            setFormData(estadoInicial);
            setErrores({});
            setTouched({});
            setError('');
            return;
        }

        const fetchUsuario = async (): Promise<void> => {
            try {
                const res = await api.get(`/usuarios/${usuarioId}`);
                const d = res.data;
                setFormData({
                    nombre: d.nombre || '',
                    paterno: d.paterno || '',
                    materno: d.materno || '',
                    correo: d.correo || '',
                    telefono: d.telefono || '',
                    contraseña: '',
                    rol: rolBackendAFormulario(d.rol),
                    roles: (() => {
                        const roles = (Array.isArray(d.roles) && d.roles.length ? d.roles : [d.rol]).map(rolBackendAFormulario);
                        // El rol Administrador es exclusivo.
                        if (roles.includes('Administrador')) return ['Administrador'];
                        return roles.includes('Coordinador') ? roles.filter((rol: Rol) => rol !== 'Voluntario') : roles;
                    })(),
                    estado: d.estado_cuenta || 'Activo',
                    ci_nit: d.ci_nit ? String(d.ci_nit) : '',
                    fecha_nacimiento: d.fecha_nacimiento
                        ? new Date(d.fecha_nacimiento).toISOString().split('T')[0]
                        : '',
                    calle: d.calle || d.direccion || '',
                    zona: d.zona || '',
                    ciudad: d.ciudad || '',
                    habilidades: Array.isArray(d.habilidades)
                        ? d.habilidades.join(', ')
                        : (d.habilidades || ''),
                    disponibilidad: d.disponibilidad || 'Mañana',
                    tipo_beneficiario: d.tipo_beneficiario || 'Persona',
                    direccion: d.direccion || '',
                    necesidad: d.necesidad || '',
                    descripcion: d.descripcion || '',
                });
                setErrores({});
                setTouched({});
            } catch (err) {
                console.error(err);
                setError('Error al cargar los datos del usuario');
            }
        };
        void fetchUsuario();
    }, [isOpen, usuarioId]);

    if (!isOpen) return null;

    // =====================================================
    // HANDLERS
    // =====================================================
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
        const { name, value } = e.target;

        let valorFiltrado = value;
        if (name === 'ci_nit' || name === 'telefono') {
            valorFiltrado = value.replace(/[^0-9]/g, '');
        }

        const nuevosDatos = { ...formData, [name]: valorFiltrado };
        setFormData(nuevosDatos);
        setTouched((prev) => ({ ...prev, [name]: true }));

        const err = validarCampo(name, valorFiltrado, nuevosDatos);
        setErrores((prev) => ({ ...prev, [name]: err }));

        if (error) setError('');
    };

    const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        const err = validarCampo(name, value, formData);
        setErrores((prev) => ({ ...prev, [name]: err }));
    };

    const handleRolChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        const nuevoRol = e.target.value as Rol;
        if (!nuevoRol) return;
        setFormData((prev) => {
            // El rol Administrador es exclusivo: no se combina con otros roles.
            if (nuevoRol === 'Administrador') {
                return { ...prev, rol: 'Administrador', roles: ['Administrador'], estado: 'Activo' };
            }
            if (prev.roles.includes('Administrador')) return prev;
            const roles = prev.roles.includes(nuevoRol) ? prev.roles : [...prev.roles, nuevoRol];
            return {
                ...prev,
                rol: prev.roles[0] || nuevoRol,
                roles,
            };
        });
        e.target.value = '';
    };

    const handleQuitarRol = (rolQuitar: Rol): void => {
        setFormData((prev) => {
            const roles = prev.roles.filter((rol) => rol !== rolQuitar);
            if (rolQuitar === 'Coordinador') roles.push('Voluntario');
            return { ...prev, roles, rol: roles[0] ?? '' };
        });
    };

    // =====================================================
    // SUBMIT
    // =====================================================
    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');

        if (!modoEdicion && formData.roles.length === 0) {
            setError('Asigná al menos un rol para crear el usuario.');
            return;
        }

        const erroresEncontrados = Object.assign(
            {},
            ...formData.roles.map((rol) => validarFormularioCompleto(formData, rol, modoEdicion))
        );

        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados);
            const tocados: Touched = {};
            Object.keys(erroresEncontrados).forEach((k) => { tocados[k] = true; });
            setTouched(tocados);
            setError('Revisá los campos marcados en rojo.');
            return;
        }

        setCargando(true);
        try {
            const payload: Record<string, unknown> = {
                nombre: formData.nombre.trim(),
                paterno: formData.paterno.trim(),
                materno: formData.materno?.trim() || '',
                correo: formData.correo.toLowerCase().trim(),
                telefono: String(formData.telefono).trim(),
                rol: formData.rol,
                roles: formData.roles,
                estado: esAdministrador ? 'Activo' : formData.estado
            };

            if (esDonante) {
                payload.calle = formData.calle?.trim() || '';
                payload.zona = formData.zona?.trim() || '';
                payload.ciudad = formData.ciudad?.trim() || '';
            }

            if (esVoluntario) {
                payload.habilidades = formData.habilidades;
                payload.disponibilidad = formData.disponibilidad?.trim() || '';
            }

            if (esBeneficiario) {
                payload.tipo_beneficiario = formData.tipo_beneficiario;
                payload.documento = formData.ci_nit ? String(formData.ci_nit).trim() : '';
                payload.direccion = formData.direccion?.trim() || '';
                payload.necesidad = formData.necesidad?.trim() || '';
                payload.descripcion = formData.descripcion?.trim() || '';
            }


            if (formData.contraseña && formData.contraseña.trim()) {
                payload.contraseña = formData.contraseña;
            } else if (!modoEdicion) {
                payload.contraseña = formData.contraseña;
            }

            if (modoEdicion) {
                await api.put(`/usuarios/${usuarioId}`, payload);
            } else {
                await api.post('/usuarios', payload);
            }

            if (modoEdicion) {
                void exito('', 'Usuario actualizado con éxito');
            } else {
                void exito('', 'Usuario creado con éxito');
            }

            if (modoEdicion && Number(usuarioSesion?.id) === Number(usuarioId)) {
                await refreshSession();
            }

            onSave();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al guardar el usuario');
        } finally {
            setCargando(false);
        }
    };

    // =====================================================
    // RENDER (portal)
    // =====================================================
    return createPortal(
        <div className="anim-fade fixed inset-0 z-50 flex items-center justify-center bg-night/70 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-[max(0.75rem,env(safe-area-inset-top,0px))] backdrop-blur-md sm:p-4">
            <button
                type="button"
                className="absolute inset-0 h-full w-full cursor-default"
                onClick={onClose}
                aria-label="Cerrar modal"
                tabIndex={-1}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-modal-usuario"
                className="relative z-10 anim-scale flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-deep"
            >
                <span
                    aria-hidden="true"
                    className="h-[3px] w-full shrink-0 bg-linear-to-r from-accent via-accent/40 to-transparent"
                />

                {/* Cabecera */}
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </span>
                        <div>
                            <h2
                                id="titulo-modal-usuario"
                                className="font-display text-base font-bold tracking-[-0.02em] text-text"
                            >
                                {modoEdicion ? 'Editar usuario' : 'Nuevo usuario'}
                            </h2>
                            <p className="mt-0.5 text-xs text-text-muted">
                                {modoEdicion
                                    ? 'Actualizá los datos del perfil seleccionado.'
                                    : 'Completá los datos para registrar una nueva cuenta.'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="press rounded-xl p-2 text-text-muted hover:bg-surface-inset hover:text-text"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Formulario scrolleable */}
                <form
                    id="form-usuario"
                    onSubmit={handleSubmit}
                    className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-4 sm:p-6"
                    noValidate
                >
                    {/* === DATOS BÁSICOS === */}
                    <h3 className={tituloSeccion}>
                        <span aria-hidden="true" className="h-3.5 w-1 rounded-full bg-accent" />
                        Datos básicos
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label htmlFor="modal-nombre" className={etiquetaCampo}>Nombre *</label>
                            <input
                                id="modal-nombre"
                                type="text" name="nombre"
                                value={formData.nombre} onChange={handleChange} onBlur={handleBlur}
                                maxLength={50}
                                className={claseInput(errores.nombre, touched.nombre)}
                            />
                            <FieldError error={errores.nombre} touched={touched.nombre} />
                        </div>
                        <div>
                            <label htmlFor="modal-paterno" className={etiquetaCampo}>Ap. paterno *</label>
                            <input
                                id="modal-paterno"
                                type="text" name="paterno"
                                value={formData.paterno} onChange={handleChange} onBlur={handleBlur}
                                maxLength={50}
                                className={claseInput(errores.paterno, touched.paterno)}
                            />
                            <FieldError error={errores.paterno} touched={touched.paterno} />
                        </div>
                        <div>
                            <label htmlFor="modal-materno" className={etiquetaCampo}>Ap. materno</label>
                            <input
                                id="modal-materno"
                                type="text" name="materno"
                                value={formData.materno} onChange={handleChange} onBlur={handleBlur}
                                maxLength={50}
                                className={claseInput(errores.materno, touched.materno)}
                            />
                            <FieldError error={errores.materno} touched={touched.materno} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label htmlFor="modal-correo" className={etiquetaCampo}>Correo *</label>
                            <input
                                id="modal-correo"
                                type="email" name="correo"
                                value={formData.correo} onChange={handleChange} onBlur={handleBlur}
                                maxLength={150}
                                className={claseInput(errores.correo, touched.correo)}
                            />
                            <FieldError error={errores.correo} touched={touched.correo} />
                        </div>
                        <div>
                            <label htmlFor="modal-telefono" className={etiquetaCampo}>Teléfono *</label>
                            <input
                                id="modal-telefono"
                                type="tel" name="telefono"
                                inputMode="numeric"
                                value={formData.telefono} onChange={handleChange} onBlur={handleBlur}
                                maxLength={8}
                                className={claseInput(errores.telefono, touched.telefono)}
                            />
                            <FieldError error={errores.telefono} touched={touched.telefono} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {!esAdministrador && (
                            <div>
                                <label htmlFor="modal-estado" className={etiquetaCampo}>Estado</label>
                                <select
                                    id="modal-estado"
                                    name="estado"
                                    value={formData.estado}
                                    onChange={handleChange}
                                    className={claseSelect}
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                </select>
                            </div>
                        )}
                        <div>
                            <label htmlFor="modal-password" className={etiquetaCampo}>
                                Contraseña {modoEdicion ? '(opcional)' : '*'}
                            </label>
                            <div className="relative">
                                <input
                                    id="modal-password"
                                    type={mostrarContraseña ? 'text' : 'password'}
                                    name="contraseña"
                                    value={formData.contraseña}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder={modoEdicion ? 'Dejar vacío' : '••••••••'}
                                    maxLength={100}
                                    className={`${claseInput(errores.contraseña, touched.contraseña)} pr-20`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarContraseña(!mostrarContraseña)}
                                    className="press absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-text-muted hover:bg-surface-inset hover:text-text"
                                    tabIndex={-1}
                                >
                                    {mostrarContraseña ? 'Ocultar' : 'Mostrar'}
                                </button>
                            </div>
                            <FieldError error={errores.contraseña} touched={touched.contraseña} />
                        </div>
                    </div>

                    <div className="pt-2">
                        <label htmlFor="modal-rol" className={etiquetaCampo}>Roles asignados</label>
                        {formData.roles.length === 0 ? (
                            <p className="mb-2 text-xs font-medium text-text-subtle">
                                Sin rol asignado. Elegí al menos uno para continuar.
                            </p>
                        ) : (
                            <div className="mb-2 flex flex-wrap gap-1.5" aria-label="Roles asignados">
                                {formData.roles.map((rol) => (
                                    <span key={rol} className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[10px] font-bold text-text">
                                        {rol === 'Coordinador' ? 'Coord.' : rol}
                                        <button
                                            type="button"
                                            onClick={() => handleQuitarRol(rol)}
                                            aria-label={`Quitar rol ${rol}`}
                                            title={`Quitar ${rol}`}
                                            className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-error/15 hover:text-error focus:outline-none focus:ring-2 focus:ring-error/30"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                        {!esAdministrador && !rolesCompletos && (
                            <select
                                id="modal-rol"
                                value=""
                                onChange={handleRolChange}
                                className={claseSelect}
                            >
                                <option value="">Añadir nuevo rol</option>
                                <option value="Donante" disabled={formData.roles.includes('Donante')}>Donante</option>
                                <option value="Voluntario" disabled={formData.roles.includes('Voluntario') || formData.roles.includes('Coordinador')}>Voluntario</option>
                                <option value="Coordinador" disabled={formData.roles.includes('Coordinador') || formData.roles.includes('Voluntario')}>Coordinador de voluntarios</option>
                                <option value="Beneficiario" disabled={formData.roles.includes('Beneficiario')}>Beneficiario</option>
                                <option value="Administrador" disabled={formData.roles.length > 0}>Administrador</option>
                            </select>
                        )}
                        {esAdministrador && (
                            <p className="mt-2 text-[11px] font-medium text-text-muted">
                                El rol Administrador es exclusivo: no se combina con otros roles y siempre es un usuario activo.
                            </p>
                        )}
                        {rolesCompletos && (
                            <p className="mt-2 text-[11px] font-medium text-text-muted">
                                Ya asignaste todos los roles disponibles.
                            </p>
                        )}
                    </div>

                    {/* === DATOS PERSONALES (SOLO CLIENTE) === */}
                    {esDonante && (
                        <>
                            <h3 className={`${tituloSeccion} pt-3`}>
                                <span aria-hidden="true" className="h-3.5 w-1 rounded-full bg-accent" />
                                Datos del donante
                            </h3>

                            <div>
                                <label htmlFor="modal-calle" className={etiquetaCampo}>Calle / Avenida</label>
                                <input
                                    id="modal-calle"
                                    type="text" name="calle"
                                    value={formData.calle} onChange={handleChange} onBlur={handleBlur}
                                    maxLength={150}
                                    className={claseInput(errores.calle, touched.calle)}
                                />
                                <FieldError error={errores.calle} touched={touched.calle} />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label htmlFor="modal-zona" className={etiquetaCampo}>Zona / Barrio</label>
                                    <input
                                        id="modal-zona"
                                        type="text" name="zona"
                                        value={formData.zona} onChange={handleChange} onBlur={handleBlur}
                                        maxLength={100}
                                        className={claseInput(errores.zona, touched.zona)}
                                    />
                                    <FieldError error={errores.zona} touched={touched.zona} />
                                </div>
                                <div>
                                    <label htmlFor="modal-ciudad" className={etiquetaCampo}>Ciudad</label>
                                    <input
                                        id="modal-ciudad"
                                        type="text" name="ciudad"
                                        value={formData.ciudad} onChange={handleChange} onBlur={handleBlur}
                                        maxLength={100}
                                        className={claseInput(errores.ciudad, touched.ciudad)}
                                    />
                                    <FieldError error={errores.ciudad} touched={touched.ciudad} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* === CAMPOS EMPLEADO === */}
                    {esVoluntario && (
                        <>
                            <h3 className={`${tituloSeccion} pt-3`}>
                                <span aria-hidden="true" className="h-3.5 w-1 rounded-full bg-accent" />
                                Datos de voluntariado
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label htmlFor="modal-habilidades" className={etiquetaCampo}>Habilidades *</label>
                                    <input
                                        id="modal-habilidades"
                                        type="text" name="habilidades"
                                        value={formData.habilidades} onChange={handleChange} onBlur={handleBlur}
                                        placeholder="Ej: Logística, Primeros auxilios"
                                        maxLength={300}
                                        className={claseInput(errores.habilidades, touched.habilidades)}
                                    />
                                    <FieldError error={errores.habilidades} touched={touched.habilidades} />
                                </div>
                                <div>
                                    <label htmlFor="modal-disponibilidad" className={etiquetaCampo}>Disponibilidad *</label>
                                    <select
                                        id="modal-disponibilidad"
                                        name="disponibilidad"
                                        value={formData.disponibilidad}
                                        onChange={handleChange}
                                        className={claseSelect}
                                    >
                                        <option value="Mañana">Mañana</option>
                                        <option value="Tarde">Tarde</option>
                                        <option value="Noche">Noche</option>
                                        <option value="Fines de semana">Fines de semana</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    {/* === CAMPOS BENEFICIARIO === */}
                    {esBeneficiario && (
                        <>
                            <h3 className={`${tituloSeccion} pt-3`}>
                                <span aria-hidden="true" className="h-3.5 w-1 rounded-full bg-accent" />
                                Datos del beneficiario
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label htmlFor="modal-tipo-benef" className={etiquetaCampo}>Tipo *</label>
                                    <select
                                        id="modal-tipo-benef"
                                        name="tipo_beneficiario"
                                        value={formData.tipo_beneficiario}
                                        onChange={handleChange}
                                        className={claseSelect}
                                    >
                                        <option value="Persona">Persona</option>
                                        <option value="Familia">Familia</option>
                                        <option value="Institucion">Institución</option>
                                    </select>
                                    <FieldError error={errores.tipo_beneficiario} touched={touched.tipo_beneficiario} />
                                </div>
                                <div>
                                    <label htmlFor="modal-documento" className={etiquetaCampo}>Documento (CI / NIT) *</label>
                                    <input
                                        id="modal-documento"
                                        type="text" name="ci_nit"
                                        inputMode="numeric"
                                        value={formData.ci_nit} onChange={handleChange} onBlur={handleBlur}
                                        maxLength={15}
                                        className={claseInput(errores.ci_nit, touched.ci_nit)}
                                    />
                                    <FieldError error={errores.ci_nit} touched={touched.ci_nit} />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="modal-direccion" className={etiquetaCampo}>Dirección *</label>
                                <input
                                    id="modal-direccion"
                                    type="text" name="direccion"
                                    value={formData.direccion} onChange={handleChange} onBlur={handleBlur}
                                    maxLength={255}
                                    className={claseInput(errores.direccion, touched.direccion)}
                                />
                                <FieldError error={errores.direccion} touched={touched.direccion} />
                            </div>

                            <div>
                                <label htmlFor="modal-necesidad" className={etiquetaCampo}>Necesidad *</label>
                                <input
                                    id="modal-necesidad"
                                    type="text" name="necesidad"
                                    value={formData.necesidad} onChange={handleChange} onBlur={handleBlur}
                                    placeholder="Ej: Alimentos, ropa, útiles escolares"
                                    maxLength={150}
                                    className={claseInput(errores.necesidad, touched.necesidad)}
                                />
                                <FieldError error={errores.necesidad} touched={touched.necesidad} />
                            </div>

                            <div>
                                <label htmlFor="modal-descripcion" className={etiquetaCampo}>Descripción</label>
                                <textarea
                                    id="modal-descripcion"
                                    name="descripcion"
                                    rows={3}
                                    value={formData.descripcion} onChange={handleChange} onBlur={handleBlur}
                                    maxLength={2000}
                                    className={claseInput(errores.descripcion, touched.descripcion)}
                                />
                                <FieldError error={errores.descripcion} touched={touched.descripcion} />
                            </div>

                        </>
                    )}

                    {error && (
                        <div
                            role="alert"
                            className="anim-fade flex items-start gap-2.5 rounded-xl border border-error/30 bg-error-soft p-3 text-sm font-medium text-error"
                        >
                            <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                            {error}
                        </div>
                    )}
                </form>

                {/* Pie con botones */}
                <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-surface px-4 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="press w-full rounded-xl border border-border bg-surface-elevated px-5 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-text-muted hover:border-border-strong hover:bg-surface-inset hover:text-text sm:w-auto"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="form-usuario"
                        disabled={cargando}
                        className={`press inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.06em] shadow-soft sm:w-auto
                            ${cargando
                                ? 'cursor-wait bg-surface-inset text-text-subtle'
                                : 'bg-primary text-on-primary hover:bg-primary-hover hover:shadow-lift'}`}
                    >
                        {cargando && (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-on-primary/30 border-t-on-primary" />
                        )}
                        {cargando ? 'Guardando…' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default UsuarioModal;
