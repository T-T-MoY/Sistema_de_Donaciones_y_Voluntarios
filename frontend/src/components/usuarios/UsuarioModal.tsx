/**
 * ============================================================================
 * ARCHIVO: UsuarioModal.tsx
 * COMPONENTE: Modal para crear / editar usuarios.
 * - Valida por rol (Donante, Voluntario, Admin).
 * - Carga datos si recibe `usuarioId`.
 * - Renderiza en portal.
 * ============================================================================
 */

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/client';                       // ← +1 ../
import FieldError from '../ui/FieldError';                    // ← +1 ../
import {
    validarCampo,
    validarFormularioCompleto,
    claseInput,
    calcularEdad
} from '../../utils/validaciones';                          // ← +1 ../
import type { Rol, UsuarioFormData } from '../../types/usuario.types';
import { getRolDisplay } from '../../types/usuario.types';

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
const UsuarioModal = ({ isOpen, onClose, onSave, usuarioId = null }: UsuarioModalProps) => {
    const modoEdicion = Boolean(usuarioId);

    const estadoInicial: FormData = {
        nombre: '',
        paterno: '',
        materno: '',
        correo: '',
        telefono: '',
        contraseña: '',
        rol: 'Cliente',
        estado: 'Activo',
        ci_nit: '',
        fecha_nacimiento: '',
        calle: '',
        zona: '',
        ciudad: '',
        fecha_contratacion: '',
        cargo: '',
        turno: 'Mañana',
        nivel_acceso: 'Total'
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
    const rolNorm = (formData.rol || '').toLowerCase().trim();
    const esCliente = rolNorm === 'cliente';
    const esEmpleado = rolNorm === 'empleado';
    const esAdmin = rolNorm === 'admin' || rolNorm === 'administrador';

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
                    rol: d.rol || 'Cliente',
                    estado: d.estado_cuenta || 'Activo',
                    ci_nit: d.ci_nit ? String(d.ci_nit) : '',
                    fecha_nacimiento: d.fecha_nacimiento
                        ? new Date(d.fecha_nacimiento).toISOString().split('T')[0]
                        : '',
                    calle: d.calle || '',
                    zona: d.zona || '',
                    ciudad: d.ciudad || '',
                    fecha_contratacion: d.fecha_contratacion
                        ? new Date(d.fecha_contratacion).toISOString().split('T')[0]
                        : '',
                    cargo: d.cargo || '',
                    turno: d.turno || 'Mañana',
                    nivel_acceso: d.nivel_acceso || 'Total'
                });
                setErrores({});
                setTouched({});
            } catch (err) {
                console.error(err);
                setError('Error al cargar los datos del usuario');
            }
        };
        fetchUsuario();
    }, [isOpen, usuarioId]);

    if (!isOpen) return null;

    // =====================================================
    // HANDLERS
    // =====================================================
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
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

    const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        const err = validarCampo(name, value, formData);
        setErrores((prev) => ({ ...prev, [name]: err }));
    };

    const handleRolChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        const nuevoRol = e.target.value as Rol;
        setFormData((prev) => ({ ...prev, rol: nuevoRol }));
        setErrores({});
        setTouched({});
    };

    // =====================================================
    // SUBMIT
    // =====================================================
    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');

        const erroresEncontrados = validarFormularioCompleto(
            formData,
            formData.rol,
            modoEdicion
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
                estado: formData.estado
            };

            if (esCliente) {
                payload.ci_nit = formData.ci_nit ? String(formData.ci_nit).trim() : '';
                payload.fecha_nacimiento = formData.fecha_nacimiento || '';
                payload.calle = formData.calle?.trim() || '';
                payload.zona = formData.zona?.trim() || '';
                payload.ciudad = formData.ciudad?.trim() || '';
            }

            if (esEmpleado) {
                payload.fecha_contratacion = formData.fecha_contratacion;
                payload.cargo = formData.cargo?.trim() || '';
                payload.turno = formData.turno;
            }

            if (esAdmin) {
                payload.nivel_acceso = formData.nivel_acceso;
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

            onSave();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al guardar el usuario');
        } finally {
            setCargando(false);
        }
    };

    const fechaMaxima = new Date();
    fechaMaxima.setFullYear(fechaMaxima.getFullYear() - 15);
    const fechaMaximaStr = fechaMaxima.toISOString().split('T')[0];

    const edadCalculada = formData.fecha_nacimiento
        ? calcularEdad(formData.fecha_nacimiento)
        : null;

    // =====================================================
    // RENDER (portal)
    // =====================================================
    return createPortal(
        <div
            className="anim-fade fixed inset-0 z-50 flex items-center justify-center bg-night/70 p-4 backdrop-blur-md"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-modal-usuario"
                className="anim-scale flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-deep"
            >
                <span
                    aria-hidden="true"
                    className="h-[3px] w-full shrink-0 bg-linear-to-r from-accent via-accent/40 to-transparent"
                />

                {/* Cabecera */}
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-6 py-4">
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
                    className="flex-1 space-y-3 overflow-y-auto p-6"
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

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label htmlFor="modal-rol" className={etiquetaCampo}>Rol *</label>
                            <select
                                id="modal-rol"
                                name="rol"
                                value={formData.rol}
                                onChange={handleRolChange}
                                className={claseSelect}
                            >
                                <option value="Cliente">{getRolDisplay('Cliente')}</option>
                                <option value="Empleado">{getRolDisplay('Empleado')}</option>
                                <option value="Admin">{getRolDisplay('Admin')}</option>
                            </select>
                        </div>
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

                    {/* === DATOS PERSONALES (SOLO CLIENTE) === */}
                    {esCliente && (
                        <>
                            <h3 className={`${tituloSeccion} pt-3`}>
                                <span aria-hidden="true" className="h-3.5 w-1 rounded-full bg-accent" />
                                Datos personales
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label htmlFor="modal-ci" className={etiquetaCampo}>CI / NIT</label>
                                    <input
                                        id="modal-ci"
                                        type="text" name="ci_nit"
                                        inputMode="numeric"
                                        value={formData.ci_nit} onChange={handleChange} onBlur={handleBlur}
                                        maxLength={15}
                                        className={claseInput(errores.ci_nit, touched.ci_nit)}
                                    />
                                    <FieldError error={errores.ci_nit} touched={touched.ci_nit} />
                                </div>
                                <div>
                                    <label htmlFor="modal-fecha-nacimiento" className={etiquetaCampo}>Fecha de nacimiento</label>
                                    <input
                                        id="modal-fecha-nacimiento"
                                        type="date" name="fecha_nacimiento"
                                        value={formData.fecha_nacimiento} onChange={handleChange} onBlur={handleBlur}
                                        max={fechaMaximaStr}
                                        className={claseInput(errores.fecha_nacimiento, touched.fecha_nacimiento)}
                                    />
                                    {errores.fecha_nacimiento && touched.fecha_nacimiento ? (
                                        <FieldError error={errores.fecha_nacimiento} touched={touched.fecha_nacimiento} />
                                    ) : (
                                        <p className="mt-1.5 min-h-[18px] text-xs text-text-muted">
                                            {edadCalculada !== null ? (
                                                <>Edad: <span className="font-semibold text-primary">{edadCalculada} años</span></>
                                            ) : '\u00A0'}
                                        </p>
                                    )}
                                </div>
                            </div>

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
                    {esEmpleado && (
                        <>
                            <h3 className={`${tituloSeccion} pt-3`}>
                                <span aria-hidden="true" className="h-3.5 w-1 rounded-full bg-accent" />
                                Datos de voluntariado
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <label htmlFor="modal-fecha-contratacion" className={etiquetaCampo}>Fecha de incorporación *</label>
                                    <input
                                        id="modal-fecha-contratacion"
                                        type="date" name="fecha_contratacion"
                                        value={formData.fecha_contratacion} onChange={handleChange} onBlur={handleBlur}
                                        className={claseInput(errores.fecha_contratacion, touched.fecha_contratacion)}
                                    />
                                    <FieldError error={errores.fecha_contratacion} touched={touched.fecha_contratacion} />
                                </div>
                                <div>
                                    <label htmlFor="modal-cargo" className={etiquetaCampo}>Cargo *</label>
                                    <input
                                        id="modal-cargo"
                                        type="text" name="cargo"
                                        value={formData.cargo} onChange={handleChange} onBlur={handleBlur}
                                        placeholder="Ej: Coordinador de voluntariado"
                                        maxLength={100}
                                        className={claseInput(errores.cargo, touched.cargo)}
                                    />
                                    <FieldError error={errores.cargo} touched={touched.cargo} />
                                </div>
                                <div>
                                    <label htmlFor="modal-turno" className={etiquetaCampo}>Turno *</label>
                                    <select
                                        id="modal-turno"
                                        name="turno"
                                        value={formData.turno}
                                        onChange={handleChange}
                                        className={claseSelect}
                                    >
                                        <option value="Mañana">Mañana</option>
                                        <option value="Tarde">Tarde</option>
                                        <option value="Noche">Noche</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    {/* === CAMPOS ADMIN === */}
                    {esAdmin && (
                        <>
                            <h3 className={`${tituloSeccion} pt-3`}>
                                <span aria-hidden="true" className="h-3.5 w-1 rounded-full bg-accent" />
                                Datos del administrador
                            </h3>
                            <div>
                                <label htmlFor="modal-nivel" className={etiquetaCampo}>Nivel de acceso *</label>
                                <select
                                    id="modal-nivel"
                                    name="nivel_acceso"
                                    value={formData.nivel_acceso}
                                    onChange={handleChange} onBlur={handleBlur}
                                    className={claseInput(errores.nivel_acceso, touched.nivel_acceso)}
                                >
                                    <option value="Total">Total (SuperAdmin)</option>
                                    <option value="Medio">Medio</option>
                                    <option value="Bajo">Bajo</option>
                                </select>
                                <FieldError error={errores.nivel_acceso} touched={touched.nivel_acceso} />
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
                <div className="flex shrink-0 justify-end gap-3 border-t border-border bg-surface px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="press rounded-xl border border-border bg-surface-elevated px-5 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-text-muted hover:border-border-strong hover:bg-surface-inset hover:text-text"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="form-usuario"
                        disabled={cargando}
                        className={`press inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.06em] shadow-soft
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
