import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import FieldError from '../components/ui/FieldError';
import {
    validarCampo,
    esContraseñaSegura,
    calcularEdad,
    claseInput
} from '../utils/validaciones';

// =====================================================
// TIPOS
// =====================================================
interface FormData {
    nombre: string;
    paterno: string;
    materno: string;
    correo: string;
    celular: string;
    passwordActual: string;
    passwordNueva: string;
    passwordConfirmar: string;
    ci_nit: string;
    fecha_nacimiento: string;
    calle: string;
    zona: string;
    ciudad: string;
}

interface DatosRol {
    rol: string;
    fecha_contratacion: string;
    cargo: string;
    turno: string;
    antiguedad: string | number;
    nivel_acceso: string;
    fecha_asignacion_cargo: string;
}

interface Mensaje {
    texto: string;
    tipo: '' | 'error' | 'exito';
}

interface Errores {
    [key: string]: string | undefined;
}

interface Touched {
    [key: string]: boolean;
}

interface PerfilResponse {
    nombre?: string;
    paterno?: string;
    materno?: string;
    correo?: string;
    telefono?: string;
    ci_nit?: string | number;
    fecha_nacimiento?: string;
    calle?: string;
    zona?: string;
    ciudad?: string;
    rol?: string;
    fecha_contratacion?: string;
    cargo?: string;
    turno?: string;
    antiguedad?: string | number;
    nivel_acceso?: string;
    fecha_asignacion_cargo?: string;
}

interface PerfilUpdateResponse {
    token?: string;
    perfil?: Record<string, unknown>;
}

// =====================================================
// ESTILOS COMPARTIDOS
// =====================================================
const etiquetaCampo =
    'mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-text-muted';

const tituloSeccion =
    'flex items-center gap-2.5 font-display text-base font-bold tracking-[-0.02em] text-text';

const subtituloSeccion = 'mt-1.5 mb-5 text-sm text-text-muted';

// =====================================================
// SKELETON DE CARGA
// =====================================================
const PerfilSkeleton = () => (
    <div className="mx-auto max-w-6xl space-y-6" aria-busy="true" aria-live="polite">
        <div className="h-48 animate-pulse rounded-3xl border border-border bg-surface-elevated" />
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-5">
                <div className="h-56 animate-pulse rounded-2xl border border-border bg-surface-elevated" />
                <div className="h-36 animate-pulse rounded-2xl border border-border bg-surface-elevated" />
            </div>
            <div className="space-y-4 rounded-2xl border border-border bg-surface-elevated p-6 lg:col-span-2 md:p-8">
                <div className="h-4 w-40 animate-pulse rounded-full bg-border" />
                <div className="h-3 w-full max-w-64 animate-pulse rounded-full bg-border/70" />
                <div className="grid gap-4 pt-4 sm:grid-cols-2">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="h-11 animate-pulse rounded-xl bg-surface-sunken" />
                    ))}
                </div>
                <div className="h-11 w-full animate-pulse rounded-xl bg-surface-sunken" />
                <div className="h-11 w-40 animate-pulse rounded-xl bg-border" />
            </div>
        </div>
        <span className="sr-only">Cargando perfil…</span>
    </div>
);

// =====================================================
// COMPONENTE
// =====================================================
const Perfil = () => {
    const { usuario, token, login } = useAuth();

    const [formData, setFormData] = useState<FormData>({
        nombre: '',
        paterno: '',
        materno: '',
        correo: '',
        celular: '',
        passwordActual: '',
        passwordNueva: '',
        passwordConfirmar: '',
        ci_nit: '',
        fecha_nacimiento: '',
        calle: '',
        zona: '',
        ciudad: ''
    });

    const [mensaje, setMensaje] = useState<Mensaje>({ texto: '', tipo: '' });
    const [errores, setErrores] = useState<Errores>({});
    const [touched, setTouched] = useState<Touched>({});
    const [cargando, setCargando] = useState<boolean>(false);
    const [cargandoInicial, setCargandoInicial] = useState<boolean>(true);

    // Datos específicos del rol
    const [datosRol, setDatosRol] = useState<DatosRol>({
        rol: '',
        fecha_contratacion: '',
        cargo: '',
        turno: '',
        antiguedad: '',
        nivel_acceso: '',
        fecha_asignacion_cargo: ''
    });
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
            

    // =====================================================
    // FLAGS DE ROL
    // =====================================================
    const rolNorm = (datosRol.rol || usuario?.rol || '').toLowerCase().trim();
    const esCliente = rolNorm === 'cliente';
    const esEmpleado = rolNorm === 'empleado';
    const esAdmin = rolNorm === 'admin' || rolNorm === 'administrador';

    // =====================================================
    // CARGAR PERFIL
    // =====================================================
    useEffect(() => {
        const fetchPerfil = async (): Promise<void> => {
            try {
                const res = await axios.get<PerfilResponse>(
                    `${apiUrl}/usuarios/perfil`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const datos = res.data;

                let fechaInput = '';
                if (datos.fecha_nacimiento) {
                    fechaInput = new Date(datos.fecha_nacimiento).toISOString().split('T')[0];
                }

                setFormData(prev => ({
                    ...prev,
                    nombre: datos.nombre || '',
                    paterno: datos.paterno || '',
                    materno: datos.materno || '',
                    correo: datos.correo || '',
                    celular: datos.telefono || '',
                    ci_nit: datos.ci_nit ? String(datos.ci_nit) : '',
                    fecha_nacimiento: fechaInput,
                    calle: datos.calle || '',
                    zona: datos.zona || '',
                    ciudad: datos.ciudad || ''
                }));

                setDatosRol({
                    rol: datos.rol || '',
                    fecha_contratacion: datos.fecha_contratacion
                        ? new Date(datos.fecha_contratacion).toISOString().split('T')[0]
                        : '',
                    cargo: datos.cargo || '',
                    turno: datos.turno || '',
                    antiguedad: datos.antiguedad ?? '',
                    nivel_acceso: datos.nivel_acceso || '',
                    fecha_asignacion_cargo: datos.fecha_asignacion_cargo
                        ? new Date(datos.fecha_asignacion_cargo).toISOString().split('T')[0]
                        : ''
                });

            } catch (error) {
                console.error("Error al cargar perfil", error);
            } finally {
                setCargandoInicial(false);
            }
        };

        if (token) fetchPerfil();
    }, [token]);

    // =====================================================
    // HANDLERS
    // =====================================================

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;

        let valorFiltrado = value;
        if (name === 'ci_nit' || name === 'celular') {
            valorFiltrado = value.replace(/[^0-9]/g, '');
        }

        const nuevosDatos = { ...formData, [name]: valorFiltrado };
        setFormData(nuevosDatos);
        setTouched((prev) => ({ ...prev, [name]: true }));

        const camposValidables = ['nombre', 'paterno', 'materno', 'correo', 'celular', 'ci_nit', 'fecha_nacimiento', 'calle', 'zona', 'ciudad'];
        if (camposValidables.includes(name)) {
            const err = validarCampo(name === 'celular' ? 'telefono' : name, valorFiltrado, nuevosDatos);
            setErrores((prev) => ({ ...prev, [name]: err }));
        }
    };

    const handleBlur = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));

        const camposValidables = ['nombre', 'paterno', 'materno', 'correo', 'celular', 'ci_nit', 'fecha_nacimiento', 'calle', 'zona', 'ciudad'];
        if (camposValidables.includes(name)) {
            const err = validarCampo(name === 'celular' ? 'telefono' : name, value, formData);
            setErrores((prev) => ({ ...prev, [name]: err }));
        }
    };

    // =====================================================
    // SUBMIT
    // =====================================================
    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setMensaje({ texto: '', tipo: '' });

        const erroresEncontrados: Errores = {};

        // Validaciones comunes a todos los roles
        const errNombre = validarCampo('nombre', formData.nombre, formData);
        if (errNombre) erroresEncontrados.nombre = errNombre;

        const errPaterno = validarCampo('paterno', formData.paterno, formData);
        if (errPaterno) erroresEncontrados.paterno = errPaterno;

        const errCorreo = validarCampo('correo', formData.correo, formData);
        if (errCorreo) erroresEncontrados.correo = errCorreo;

        const errCelular = validarCampo('telefono', formData.celular, formData);
        if (errCelular) erroresEncontrados.celular = errCelular;

        // Validaciones SOLO de cliente
        if (esCliente) {
            if (formData.ci_nit) {
                const errCi = validarCampo('ci_nit', formData.ci_nit, formData);
                if (errCi) erroresEncontrados.ci_nit = errCi;
            }
            if (formData.fecha_nacimiento) {
                const errFecha = validarCampo('fecha_nacimiento', formData.fecha_nacimiento, formData);
                if (errFecha) erroresEncontrados.fecha_nacimiento = errFecha;
            }
        }

        // Validaciones de contraseña (todos los roles)
        if (formData.passwordNueva || formData.passwordConfirmar) {
            if (!formData.passwordActual) {
                setMensaje({ texto: 'Debés ingresar tu contraseña actual para cambiarla.', tipo: 'error' });
                return;
            }
            const validPwd = esContraseñaSegura(formData.passwordNueva);
            if (!validPwd.valido) {
                setMensaje({ texto: validPwd.error ?? 'Contraseña inválida.', tipo: 'error' });
                return;
            }
            if (formData.passwordNueva !== formData.passwordConfirmar) {
                setMensaje({ texto: 'Las contraseñas nuevas no coinciden.', tipo: 'error' });
                return;
            }
        }

        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados);
            const tocados: Touched = {};
            Object.keys(erroresEncontrados).forEach((k) => { tocados[k] = true; });
            setTouched(tocados);
            setMensaje({ texto: 'Revisá los campos marcados en rojo.', tipo: 'error' });
            return;
        }

        setCargando(true);
        try {
            const dataToSend = new FormData();
            dataToSend.append('nombre', formData.nombre.trim());
            dataToSend.append('paterno', formData.paterno.trim());
            dataToSend.append('materno', formData.materno?.trim() || '');
            dataToSend.append('correo', formData.correo.toLowerCase().trim());
            dataToSend.append('telefono', formData.celular);

            // Solo enviar datos de cliente si es Cliente
            if (esCliente) {
                dataToSend.append('ci_nit', formData.ci_nit);
                dataToSend.append('fecha_nacimiento', formData.fecha_nacimiento);
                dataToSend.append('calle', formData.calle);
                dataToSend.append('zona', formData.zona);
                dataToSend.append('ciudad', formData.ciudad);
            }

            if (formData.passwordActual) dataToSend.append('passwordActual', formData.passwordActual);
            if (formData.passwordNueva) dataToSend.append('passwordNueva', formData.passwordNueva);

            const respuesta = await axios.put<PerfilUpdateResponse>(
                `${import.meta.env.VITE_API_URL}/usuarios/perfil`,
                dataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setMensaje({ texto: 'Perfil actualizado correctamente.', tipo: 'exito' });

            if (respuesta.data.token) {
                login(respuesta.data.token);
            }

            setFormData(prev => ({
                ...prev,
                passwordActual: '',
                passwordNueva: '',
                passwordConfirmar: ''
            }));
        } catch (err: any) {
            setMensaje({
                texto: err.response?.data?.error || 'Error al actualizar el perfil.',
                tipo: 'error'
            });
        } finally {
            setCargando(false);
        }
    };

    const iniciales = formData.nombre ? formData.nombre.charAt(0).toUpperCase() : 'U';

    const edadCalculada = formData.fecha_nacimiento
        ? calcularEdad(formData.fecha_nacimiento)
        : null;

    const fechaMaxima = new Date();
    fechaMaxima.setFullYear(fechaMaxima.getFullYear() - 15);
    const fechaMaximaStr = fechaMaxima.toISOString().split('T')[0];

    if (cargandoInicial) {
        return <PerfilSkeleton />;
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6">

            {/* =====================================================
                HERO DE AVATAR
                ===================================================== */}
            <section className="anim-rise relative overflow-hidden rounded-3xl border border-cream/10 bg-linear-to-br from-night-3 via-night-2 to-night p-5 text-cream shadow-lift sm:p-6 md:p-8">
                <div aria-hidden="true" className="grid-paper-light pointer-events-none absolute inset-0 opacity-40" />
                <div
                    aria-hidden="true"
                    className="motion-safe:animate-float-slow pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gold/20 blur-3xl"
                />

                <div className="relative z-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                    <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-cream/15 bg-gold font-display text-3xl font-extrabold text-night shadow-deep sm:h-24 sm:w-24 sm:text-4xl">
                        {iniciales}
                    </span>

                    <div className="min-w-0 flex-1">
                        <span className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/10 px-3 py-1 text-[9.5px] font-bold uppercase tracking-[0.18em] text-cream/85 backdrop-blur-md">
                            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                            {datosRol.rol || usuario?.rol || 'Usuario'}
                        </span>

                        <h1 className="mt-3 truncate font-display text-2xl font-extrabold leading-tight tracking-[-0.03em] text-cream md:text-[2rem]">
                            {formData.nombre || 'Usuario'} {formData.paterno}
                        </h1>

                        <p className="mt-1.5 truncate text-sm text-cream/60">
                            {formData.correo || 'Sin correo registrado'}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-cream/45">
                            {formData.ciudad && <span>{formData.ciudad}</span>}
                            {formData.ciudad && edadCalculada !== null && (
                                <span className="h-1 w-1 rounded-full bg-cream/25" />
                            )}
                            {edadCalculada !== null && <span>{edadCalculada} años</span>}
                            {(formData.ciudad || edadCalculada !== null) && (
                                <span className="h-1 w-1 rounded-full bg-cream/25" />
                            )}
                            <span>Miembro de la red solidaria</span>
                        </div>
                    </div>

                    <a
                        href="#seguridad"
                        className="press inline-flex shrink-0 items-center gap-2 rounded-xl border border-cream/20 bg-cream/[0.06] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-cream/85 hover:border-gold/50 hover:text-gold-bright"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Seguridad
                    </a>
                </div>
            </section>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">

                {/* =====================================================
                    COLUMNA LATERAL
                    ===================================================== */}
                <aside className="space-y-5 lg:col-span-1">

                    {/* Datos del rol */}
                    {(esEmpleado || esAdmin) && (
                        <div className="anim-rise rounded-2xl border border-border bg-surface-elevated p-5 shadow-soft [animation-delay:80ms]">
                            <span className="block text-[9.5px] font-bold uppercase tracking-[0.2em] text-accent-text">
                                {esEmpleado && 'Datos laborales'}
                                {esAdmin && 'Datos de administrador'}
                            </span>

                            <div className="mt-4 space-y-3.5">
                                {esEmpleado && (
                                    <>
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <span className="shrink-0 text-text-muted">Cargo</span>
                                            <span className="text-right font-semibold text-text">{datosRol.cargo || '—'}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <span className="shrink-0 text-text-muted">Turno</span>
                                            <span className="text-right font-semibold text-text">{datosRol.turno || '—'}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <span className="shrink-0 text-text-muted">Fecha contratación</span>
                                            <span className="text-right font-semibold text-text">
                                                {datosRol.fecha_contratacion
                                                    ? new Date(datosRol.fecha_contratacion).toLocaleDateString('es-BO')
                                                    : '—'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <span className="shrink-0 text-text-muted">Antigüedad</span>
                                            <span className="text-right font-semibold text-text">
                                                {datosRol.antiguedad !== '' && datosRol.antiguedad !== null
                                                    ? `${datosRol.antiguedad} año(s)`
                                                    : '—'}
                                            </span>
                                        </div>
                                    </>
                                )}

                                {esAdmin && (
                                    <>
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <span className="shrink-0 text-text-muted">Nivel de acceso</span>
                                            <span className="text-right font-semibold text-text">{datosRol.nivel_acceso || '—'}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <span className="shrink-0 text-text-muted">En el cargo desde</span>
                                            <span className="text-right font-semibold text-text">
                                                {datosRol.fecha_asignacion_cargo
                                                    ? new Date(datosRol.fecha_asignacion_cargo).toLocaleDateString('es-BO')
                                                    : '—'}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Resumen de contacto */}
                    <div className="anim-rise rounded-2xl border border-border bg-surface-elevated p-5 shadow-soft [animation-delay:140ms]">
                        <span className="block text-[9.5px] font-bold uppercase tracking-[0.2em] text-text-subtle">
                            Contacto
                        </span>

                        <ul className="mt-4 space-y-3.5">
                            <li className="flex items-start gap-2.5 text-sm">
                                <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.9 5.26a2 2 0 002.2 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="min-w-0 break-words text-text-muted">
                                    {formData.correo || '—'}
                                </span>
                            </li>
                            <li className="flex items-start gap-2.5 text-sm">
                                <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h2.5a1 1 0 011 .8l1 3.5a1 1 0 01-.4 1L7.5 9.5a12 12 0 007 7l1.2-1.6a1 1 0 011-.4l3.5 1a1 1 0 01.8 1V19a2 2 0 01-2 2A16 16 0 013 5z" />
                                </svg>
                                <span className="text-text-muted">{formData.celular || '—'}</span>
                            </li>
                            {(formData.calle || formData.zona || formData.ciudad) && (
                                <li className="flex items-start gap-2.5 text-sm">
                                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-text-muted">
                                        {[formData.calle, formData.zona, formData.ciudad].filter(Boolean).join(', ')}
                                    </span>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Nota */}
                    <div className="anim-rise rounded-2xl border border-border bg-primary-soft p-5 [animation-delay:200ms]">
                        <p className="text-[11.5px] leading-relaxed text-text-muted">
                            Los datos de tu perfil se usan únicamente para coordinar donaciones y
                            voluntariados. Podés actualizarlos cuando quieras.
                        </p>
                    </div>
                </aside>

                {/* =====================================================
                    FORMULARIO
                    ===================================================== */}
                <div className="anim-rise lg:col-span-2 [animation-delay:60ms]">
                    <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-soft" noValidate>

                        {/* SECCIÓN 1: DATOS BÁSICOS */}
                        <div className="border-b border-border p-6 md:p-8">
                            <h2 className={tituloSeccion}>
                                <span aria-hidden="true" className="h-4 w-1 rounded-full bg-accent" />
                                Datos personales
                            </h2>
                            <p className={subtituloSeccion}>Así te identificamos en la plataforma.</p>

                            <div className="grid grid-cols-1 gap-x-5 gap-y-1 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label htmlFor="perfil-nombre" className={etiquetaCampo}>Nombre</label>
                                    <input
                                        id="perfil-nombre"
                                        type="text" name="nombre"
                                        value={formData.nombre} onChange={handleChange} onBlur={handleBlur}
                                        maxLength={50}
                                        className={claseInput(errores.nombre, touched.nombre)}
                                    />
                                    <FieldError error={errores.nombre} touched={touched.nombre} />
                                </div>
                                <div>
                                    <label htmlFor="perfil-paterno" className={etiquetaCampo}>Apellido paterno</label>
                                    <input
                                        id="perfil-paterno"
                                        type="text" name="paterno"
                                        value={formData.paterno} onChange={handleChange} onBlur={handleBlur}
                                        maxLength={50}
                                        className={claseInput(errores.paterno, touched.paterno)}
                                    />
                                    <FieldError error={errores.paterno} touched={touched.paterno} />
                                </div>
                                <div>
                                    <label htmlFor="perfil-materno" className={etiquetaCampo}>Apellido materno</label>
                                    <input
                                        id="perfil-materno"
                                        type="text" name="materno"
                                        value={formData.materno} onChange={handleChange} onBlur={handleBlur}
                                        placeholder="Opcional"
                                        maxLength={50}
                                        className={claseInput(errores.materno, touched.materno)}
                                    />
                                    <FieldError error={errores.materno} touched={touched.materno} />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="perfil-correo" className={etiquetaCampo}>Correo electrónico</label>
                                    <input
                                        id="perfil-correo"
                                        type="email" name="correo"
                                        value={formData.correo} onChange={handleChange} onBlur={handleBlur}
                                        maxLength={150}
                                        className={claseInput(errores.correo, touched.correo)}
                                    />
                                    <FieldError error={errores.correo} touched={touched.correo} />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="perfil-celular" className={etiquetaCampo}>Celular</label>
                                    <input
                                        id="perfil-celular"
                                        type="tel" name="celular"
                                        inputMode="numeric"
                                        value={formData.celular} onChange={handleChange} onBlur={handleBlur}
                                        maxLength={8}
                                        className={claseInput(errores.celular, touched.celular)}
                                    />
                                    <FieldError error={errores.celular} touched={touched.celular} />
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 2: DATOS ADICIONALES (SOLO CLIENTE) */}
                        {esCliente && (
                            <div className="border-b border-border p-6 md:p-8">
                                <h2 className={tituloSeccion}>
                                    <span aria-hidden="true" className="h-4 w-1 rounded-full bg-accent" />
                                    Datos adicionales
                                </h2>
                                <p className={subtituloSeccion}>Completá tu información de identificación y dirección.</p>

                                <div className="grid grid-cols-1 gap-x-5 gap-y-1 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="perfil-ci" className={etiquetaCampo}>CI / NIT</label>
                                        <input
                                            id="perfil-ci"
                                            type="text" name="ci_nit"
                                            inputMode="numeric"
                                            value={formData.ci_nit} onChange={handleChange} onBlur={handleBlur}
                                            maxLength={15}
                                            className={claseInput(errores.ci_nit, touched.ci_nit)}
                                        />
                                        <FieldError error={errores.ci_nit} touched={touched.ci_nit} />
                                    </div>
                                    <div>
                                        <label htmlFor="perfil-fecha" className={etiquetaCampo}>Fecha de nacimiento</label>
                                        <input
                                            id="perfil-fecha"
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
                                    <div className="md:col-span-2">
                                        <label htmlFor="perfil-calle" className={etiquetaCampo}>Calle / Avenida</label>
                                        <input
                                            id="perfil-calle"
                                            type="text" name="calle"
                                            value={formData.calle} onChange={handleChange}
                                            maxLength={150}
                                            className={claseInput(errores.calle, touched.calle)}
                                        />
                                        <FieldError error={errores.calle} touched={touched.calle} />
                                    </div>
                                    <div>
                                        <label htmlFor="perfil-zona" className={etiquetaCampo}>Zona / Barrio</label>
                                        <input
                                            id="perfil-zona"
                                            type="text" name="zona"
                                            value={formData.zona} onChange={handleChange}
                                            maxLength={100}
                                            className={claseInput(errores.zona, touched.zona)}
                                        />
                                        <FieldError error={errores.zona} touched={touched.zona} />
                                    </div>
                                    <div>
                                        <label htmlFor="perfil-ciudad" className={etiquetaCampo}>Ciudad</label>
                                        <input
                                            id="perfil-ciudad"
                                            type="text" name="ciudad"
                                            value={formData.ciudad} onChange={handleChange}
                                            maxLength={100}
                                            className={claseInput(errores.ciudad, touched.ciudad)}
                                        />
                                        <FieldError error={errores.ciudad} touched={touched.ciudad} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECCIÓN 3: CONTRASEÑA */}
                        <div id="seguridad" className="p-6 md:p-8">
                            <h2 className={tituloSeccion}>
                                <span aria-hidden="true" className="h-4 w-1 rounded-full bg-accent" />
                                Cambiar contraseña
                            </h2>
                            <p className={subtituloSeccion}>Dejá los campos vacíos si no querés cambiarla.</p>

                            <div className="space-y-1">
                                <div>
                                    <label htmlFor="perfil-password-actual" className={etiquetaCampo}>Contraseña actual</label>
                                    <input
                                        id="perfil-password-actual"
                                        type="password" name="passwordActual"
                                        value={formData.passwordActual} onChange={handleChange}
                                        placeholder="••••••••"
                                        maxLength={100}
                                        className={claseInput('', false)}
                                    />
                                    <FieldError error="" touched={false} />
                                </div>
                                <div className="grid grid-cols-1 gap-x-5 gap-y-1 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="perfil-password-nueva" className={etiquetaCampo}>Nueva contraseña</label>
                                        <input
                                            id="perfil-password-nueva"
                                            type="password" name="passwordNueva"
                                            value={formData.passwordNueva} onChange={handleChange}
                                            placeholder="Mínimo 8 caracteres"
                                            maxLength={100}
                                            className={claseInput('', false)}
                                        />
                                        <FieldError error="" touched={false} />
                                    </div>
                                    <div>
                                        <label htmlFor="perfil-password-confirmar" className={etiquetaCampo}>Repetir nueva</label>
                                        <input
                                            id="perfil-password-confirmar"
                                            type="password" name="passwordConfirmar"
                                            value={formData.passwordConfirmar} onChange={handleChange}
                                            placeholder="Repetí la contraseña"
                                            maxLength={100}
                                            className={claseInput('', false)}
                                        />
                                        <FieldError error="" touched={false} />
                                    </div>
                                </div>
                            </div>

                            {mensaje.texto && (
                                <div
                                    role="alert"
                                    className={`anim-fade mt-4 flex items-start gap-2.5 rounded-xl border p-4 text-sm font-medium ${
                                        mensaje.tipo === 'error'
                                            ? 'border-error/30 bg-error-soft text-error'
                                            : 'border-success/30 bg-success-soft text-success'
                                    }`}
                                >
                                    <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        {mensaje.tipo === 'error' ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        )}
                                    </svg>
                                    <span>{mensaje.texto}</span>
                                </div>
                            )}

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                                <button
                                    type="submit"
                                    disabled={cargando}
                                    className={`press inline-flex w-full items-center justify-center gap-2.5 rounded-xl px-6 py-3 text-[12.5px] font-bold uppercase tracking-[0.1em] shadow-soft sm:w-auto
                                    ${cargando
                                        ? 'cursor-wait bg-surface-inset text-text-subtle'
                                        : 'bg-primary text-on-primary hover:bg-primary-hover hover:shadow-lift'}`}
                                >
                                    {cargando && (
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary/30 border-t-on-primary" />
                                    )}
                                    {cargando ? 'Guardando…' : 'Guardar cambios'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className="press w-full rounded-xl border border-border bg-surface px-6 py-3 text-[12.5px] font-bold uppercase tracking-[0.1em] text-text-muted hover:border-border-strong hover:bg-surface-inset hover:text-text sm:w-auto"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Perfil;
