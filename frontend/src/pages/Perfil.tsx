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
        return (
            <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-claro-primario dark:border-oscuro-primario border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* ==================== COLUMNA LATERAL ==================== */}
                <div className="lg:col-span-1 space-y-6">

                    {/* TARJETA AVATAR */}
                    <div className="relative flex flex-col items-center overflow-hidden rounded-3xl border border-claro-borde bg-claro-tarjeta p-6 text-center shadow-soft dark:border-oscuro-borde dark:bg-oscuro-tarjeta">
                        <span
                            aria-hidden="true"
                            className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-claro-tinte/80 to-transparent dark:from-oscuro-tinte/70"
                        />

                        <div className="relative mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-claro-primario text-3xl font-bold text-white shadow-lift ring-4 ring-claro-tarjeta dark:bg-oscuro-primario dark:text-oscuro-fondo dark:ring-oscuro-tarjeta">
                            {iniciales}
                        </div>

                        <h3 className="relative text-lg font-bold text-claro-texto dark:text-oscuro-texto">
                            {formData.nombre} {formData.paterno}
                        </h3>
                        <p className="relative mb-3 text-sm text-claro-texto2 dark:text-oscuro-texto2">{formData.correo}</p>

                        <span className="relative rounded-full border border-claro-primario/25 bg-claro-primario/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-claro-primario dark:border-oscuro-primario/30 dark:bg-oscuro-primario/15 dark:text-oscuro-primario">
                            {datosRol.rol || usuario?.rol || 'Usuario'}
                        </span>
                    </div>

                    {/* TARJETA DATOS ESPECÍFICOS DEL ROL */}
                    {(esEmpleado || esAdmin) && (
                        <div className="rounded-3xl border border-claro-borde bg-claro-tarjeta p-6 shadow-soft dark:border-oscuro-borde dark:bg-oscuro-tarjeta">
                            <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.18em] text-claro-primario dark:text-oscuro-primario">
                                {esEmpleado && 'Datos laborales'}
                                {esAdmin && 'Datos de administrador'}
                            </span>

                            <div className="space-y-3">
                                {esEmpleado && (
                                    <>
                                        <div className="flex justify-between items-center text-sm gap-3">
                                            <span className="text-claro-texto2 dark:text-oscuro-texto2 shrink-0">Cargo</span>
                                            <span className="font-medium text-claro-texto dark:text-oscuro-texto text-right">{datosRol.cargo || '—'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm gap-3">
                                            <span className="text-claro-texto2 dark:text-oscuro-texto2 shrink-0">Turno</span>
                                            <span className="font-medium text-claro-texto dark:text-oscuro-texto text-right">{datosRol.turno || '—'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm gap-3">
                                            <span className="text-claro-texto2 dark:text-oscuro-texto2 shrink-0">Fecha contratación</span>
                                            <span className="font-medium text-claro-texto dark:text-oscuro-texto text-right">
                                                {datosRol.fecha_contratacion
                                                    ? new Date(datosRol.fecha_contratacion).toLocaleDateString('es-BO')
                                                    : '—'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm gap-3">
                                            <span className="text-claro-texto2 dark:text-oscuro-texto2 shrink-0">Antigüedad</span>
                                            <span className="font-medium text-claro-texto dark:text-oscuro-texto text-right">
                                                {datosRol.antiguedad !== '' && datosRol.antiguedad !== null
                                                    ? `${datosRol.antiguedad} año(s)`
                                                    : '—'}
                                            </span>
                                        </div>
                                    </>
                                )}

                                {esAdmin && (
                                    <>
                                        <div className="flex justify-between items-center text-sm gap-3">
                                            <span className="text-claro-texto2 dark:text-oscuro-texto2 shrink-0">Nivel de acceso</span>
                                            <span className="font-medium text-claro-texto dark:text-oscuro-texto text-right">{datosRol.nivel_acceso || '—'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm gap-3">
                                            <span className="text-claro-texto2 dark:text-oscuro-texto2 shrink-0">En el cargo desde</span>
                                            <span className="font-medium text-claro-texto dark:text-oscuro-texto text-right">
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
                </div>

                {/* ==================== FORMULARIO ==================== */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="overflow-hidden rounded-3xl border border-claro-borde bg-claro-tarjeta shadow-soft dark:border-oscuro-borde dark:bg-oscuro-tarjeta" noValidate>

                        {/* === SECCIÓN 1: DATOS BÁSICOS === */}
                        <div className="border-b border-claro-borde p-6 dark:border-oscuro-borde md:p-8">
                            <h2 className="mb-1 flex items-center gap-2 text-lg font-bold tracking-tight text-claro-texto dark:text-oscuro-texto">
                                <span aria-hidden="true" className="h-4 w-1 rounded-full bg-claro-primario dark:bg-oscuro-primario" />
                                Datos personales
                            </h2>
                            <p className="mb-5 text-sm text-claro-texto2 dark:text-oscuro-texto2">Así te identificamos en la plataforma.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-1">
                                <div className="md:col-span-2">
                                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-claro-texto2 dark:text-oscuro-texto2">Nombre</label>
                                    <input
                                        type="text" name="nombre"
                                        value={formData.nombre} onChange={handleChange} onBlur={handleBlur}
                                        maxLength={50}
                                        className={claseInput(errores.nombre, touched.nombre)}
                                    />
                                    <FieldError error={errores.nombre} touched={touched.nombre} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-claro-texto2 dark:text-oscuro-texto2">Apellido Paterno</label>
                                    <input
                                        type="text" name="paterno"
                                        value={formData.paterno} onChange={handleChange} onBlur={handleBlur}
                                        maxLength={50}
                                        className={claseInput(errores.paterno, touched.paterno)}
                                    />
                                    <FieldError error={errores.paterno} touched={touched.paterno} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-claro-texto2 dark:text-oscuro-texto2">Apellido Materno</label>
                                    <input
                                        type="text" name="materno"
                                        value={formData.materno} onChange={handleChange} onBlur={handleBlur}
                                        placeholder="Opcional"
                                        maxLength={50}
                                        className={claseInput(errores.materno, touched.materno)}
                                    />
                                    <FieldError error={errores.materno} touched={touched.materno} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-claro-texto2 dark:text-oscuro-texto2">Correo electrónico</label>
                                    <input
                                        type="email" name="correo"
                                        value={formData.correo} onChange={handleChange} onBlur={handleBlur}
                                        maxLength={150}
                                        className={claseInput(errores.correo, touched.correo)}
                                    />
                                    <FieldError error={errores.correo} touched={touched.correo} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-claro-texto2 dark:text-oscuro-texto2">Celular</label>
                                    <input
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

                        {/* === SECCIÓN 2: DATOS ADICIONALES (SOLO CLIENTE) === */}
                        {esCliente && (
                            <div className="border-b border-claro-borde p-6 dark:border-oscuro-borde md:p-8">
                                <h2 className="mb-1 flex items-center gap-2 text-lg font-bold tracking-tight text-claro-texto dark:text-oscuro-texto">
                                    <span aria-hidden="true" className="h-4 w-1 rounded-full bg-claro-primario dark:bg-oscuro-primario" />
                                    Datos adicionales
                                </h2>
                                <p className="mb-5 text-sm text-claro-texto2 dark:text-oscuro-texto2">Completá tu información de identificación y dirección.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-1">
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-claro-texto2 dark:text-oscuro-texto2">CI / NIT</label>
                                        <input
                                            type="text" name="ci_nit"
                                            inputMode="numeric"
                                            value={formData.ci_nit} onChange={handleChange} onBlur={handleBlur}
                                            maxLength={15}
                                            className={claseInput(errores.ci_nit, touched.ci_nit)}
                                        />
                                        <FieldError error={errores.ci_nit} touched={touched.ci_nit} />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-claro-texto2 dark:text-oscuro-texto2">Fecha de nacimiento</label>
                                        <input
                                            type="date" name="fecha_nacimiento"
                                            value={formData.fecha_nacimiento} onChange={handleChange} onBlur={handleBlur}
                                            max={fechaMaximaStr}
                                            className={claseInput(errores.fecha_nacimiento, touched.fecha_nacimiento)}
                                        />
                                        {errores.fecha_nacimiento && touched.fecha_nacimiento ? (
                                            <FieldError error={errores.fecha_nacimiento} touched={touched.fecha_nacimiento} />
                                        ) : (
                                            <p className="text-xs mt-1 min-h-[16px] text-claro-texto2 dark:text-oscuro-texto2">
                                                {edadCalculada !== null ? (
                                                    <>Edad: <span className="font-semibold text-claro-primario dark:text-oscuro-primario">{edadCalculada} años</span></>
                                                ) : '\u00A0'}
                                            </p>
                                        )}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-claro-texto2 dark:text-oscuro-texto2">Calle / Avenida</label>
                                        <input
                                            type="text" name="calle"
                                            value={formData.calle} onChange={handleChange}
                                            maxLength={150}
                                            className={claseInput(errores.calle, touched.calle)}
                                        />
                                        <FieldError error={errores.calle} touched={touched.calle} />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-claro-texto2 dark:text-oscuro-texto2">Zona / Barrio</label>
                                        <input
                                            type="text" name="zona"
                                            value={formData.zona} onChange={handleChange}
                                            maxLength={100}
                                            className={claseInput(errores.zona, touched.zona)}
                                        />
                                        <FieldError error={errores.zona} touched={touched.zona} />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-claro-texto2 dark:text-oscuro-texto2">Ciudad</label>
                                        <input
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

                        {/* === SECCIÓN 3: CONTRASEÑA === */}
                        <div className="p-6 md:p-8">
                            <h2 className="mb-1 flex items-center gap-2 text-lg font-bold tracking-tight text-claro-texto dark:text-oscuro-texto">
                                <span aria-hidden="true" className="h-4 w-1 rounded-full bg-claro-primario dark:bg-oscuro-primario" />
                                Cambiar contraseña
                            </h2>
                            <p className="mb-5 text-sm text-claro-texto2 dark:text-oscuro-texto2">Dejá los campos vacíos si no querés cambiarla.</p>

                            <div className="space-y-1">
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-claro-texto2 dark:text-oscuro-texto2">Contraseña actual</label>
                                    <input
                                        type="password" name="passwordActual"
                                        value={formData.passwordActual} onChange={handleChange}
                                        placeholder="••••••••"
                                        maxLength={100}
                                        className={claseInput('', false)}
                                    />
                                    <FieldError error="" touched={false} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-1">
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-claro-texto2 dark:text-oscuro-texto2">Nueva contraseña</label>
                                        <input
                                            type="password" name="passwordNueva"
                                            value={formData.passwordNueva} onChange={handleChange}
                                            placeholder="Mínimo 8 caracteres"
                                            maxLength={100}
                                            className={claseInput('', false)}
                                        />
                                        <FieldError error="" touched={false} />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-claro-texto2 dark:text-oscuro-texto2">Repetir nueva</label>
                                        <input
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
                                <div className={`mt-4 rounded-xl border p-4 text-sm font-medium ${mensaje.tipo === 'error' ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800/70 dark:bg-red-900/25 dark:text-red-300' : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/70 dark:bg-emerald-900/25 dark:text-emerald-200'}`}>
                                    {mensaje.texto}
                                </div>
                            )}

                            <div className="mt-6 flex items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={cargando}
                                    className={`press rounded-xl px-6 py-2.5 font-semibold text-white shadow-[0_16px_32px_-20px_rgba(14,110,109,0.85)]
                                    ${cargando
                                        ? 'bg-claro-borde text-claro-texto2 dark:bg-oscuro-borde dark:text-oscuro-texto2 cursor-not-allowed'
                                        : 'bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:text-oscuro-fondo dark:hover:bg-oscuro-hover'}`}
                                >
                                    {cargando ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className="press rounded-xl border border-claro-borde px-6 py-2.5 font-semibold text-claro-texto2 hover:bg-claro-tinte hover:text-claro-texto dark:border-oscuro-borde dark:text-oscuro-texto2 dark:hover:bg-oscuro-tinte dark:hover:text-oscuro-texto"
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