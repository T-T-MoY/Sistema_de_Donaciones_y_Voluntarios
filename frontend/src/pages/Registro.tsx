import { useState, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from '../components/ui/ThemeToggle';
import FieldError from '../components/ui/FieldError';
import IconLogo from '../assets/logo.svg?react';
import {
    validarCampo,
    validarFormularioCompleto,
    calcularEdad,
    claseInput,
    fuerzaContraseña,
    textoFuerza,
    colorFuerza
} from '../utils/validaciones';

// =====================================================
// TIPOS
// =====================================================
interface FormData {
    nombre: string;
    paterno: string;
    materno: string;
    correo: string;
    telefono: string;
    ci_nit: string;
    fecha_nacimiento: string;
    calle: string;
    zona: string;
    ciudad: string;
    contraseña: string;
}

interface Errores {
    [key: string]: string | undefined;
}

interface Touched {
    [key: string]: boolean;
}

// =====================================================
// ESTILOS COMPARTIDOS
// =====================================================
const etiquetaCampo =
    'mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.16em] text-text-muted';

const tituloSeccion =
    'flex items-center gap-2.5 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-text';

// =====================================================
// COMPONENTE
// =====================================================
const Registro = () => {
    const [formData, setFormData] = useState<FormData>({
        nombre: '',
        paterno: '',
        materno: '',
        correo: '',
        telefono: '',
        ci_nit: '',
        fecha_nacimiento: '',
        calle: '',
        zona: '',
        ciudad: '',
        contraseña: '',
    });

    const [aceptarTerminos, setAceptarTerminos] = useState<boolean>(false);
    const [mostrarContraseña, setMostrarContraseña] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [errores, setErrores] = useState<Errores>({});
    const [touched, setTouched] = useState<Touched>({});
    const [cargando, setCargando] = useState<boolean>(false);

    const navigate = useNavigate();

    // =====================================================
    // HANDLERS
    // =====================================================

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;

        let valorFiltrado = value;
        if (name === 'ci_nit' || name === 'telefono') {
            valorFiltrado = value.replace(/[^0-9]/g, '');
        }

        const nuevosDatos = { ...formData, [name]: valorFiltrado };
        setFormData(nuevosDatos);

        setTouched((prev) => ({ ...prev, [name]: true }));

        const errorCampo = validarCampo(name, valorFiltrado, nuevosDatos);
        setErrores((prev) => ({ ...prev, [name]: errorCampo }));

        if (error) setError('');
    };

    const handleBlur = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        const errorCampo = validarCampo(name, value, formData);
        setErrores((prev) => ({ ...prev, [name]: errorCampo }));
    };

    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');

        if (!aceptarTerminos) {
            setError('Debés aceptar los términos y condiciones para continuar.');
            return;
        }

        const erroresEncontrados = validarFormularioCompleto(formData, 'Cliente', false);

        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados);
            const todosTocados: Touched = {};
            Object.keys(formData).forEach((k) => { todosTocados[k] = true; });
            setTouched(todosTocados);
            setError('Revisá los campos marcados en rojo.');
            return;
        }

        const edad = calcularEdad(formData.fecha_nacimiento);
        setCargando(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
            await axios.post(`${apiUrl}/auth/registrar`, {
                ...formData,
                edad
            });
            navigate('/login');
        } catch (err: any) {
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('Ocurrió un error al crear la cuenta. Inténtalo de nuevo.');
            }
        } finally {
            setCargando(false);
        }
    };

    const edadCalculada = calcularEdad(formData.fecha_nacimiento);
    const nivelFuerza = fuerzaContraseña(formData.contraseña);

    const fechaMaxima = new Date();
    fechaMaxima.setFullYear(fechaMaxima.getFullYear() - 15);
    const fechaMaximaStr = fechaMaxima.toISOString().split('T')[0];

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-night text-cream">
            {/* =====================================================
                FONDO CONTINUO — imagen a pantalla completa (Igual al Login)
                ===================================================== */}
            <img
                src="/images/auth-complex.jpg"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
            />
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-r from-night via-night/92 to-night/45"
            />
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-t from-night via-night/30 to-night/70"
            />
            <div aria-hidden="true" className="grid-paper-light pointer-events-none absolute inset-0 opacity-40" />
            <div
                aria-hidden="true"
                className="motion-safe:animate-float-slow pointer-events-none absolute -top-40 right-[12%] h-[520px] w-[520px] rounded-full bg-gold/[0.12] blur-[140px]"
            />

            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-5 py-6 sm:px-8 lg:px-10">
                {/* Barra superior (Igual al Login) */}
                <header className="flex items-center justify-between">
                    <Link
                        to="/"
                        className="group flex items-center gap-3 rounded-xl"
                        title="Ir al inicio"
                    >
                        <IconLogo className="h-10 w-10 shrink-0 transition-transform duration-300 ease-out-soft motion-safe:group-hover:rotate-[-4deg]" />
                        <span className="flex flex-col leading-none">
                            <span className="font-display text-[13.5px] font-bold tracking-[-0.01em] text-cream">
                                Donaciones <span className="text-gold">&amp; Voluntariados</span>
                            </span>
                            <span className="mt-1.5 text-[8px] font-semibold uppercase tracking-[0.3em] text-cream/45">
                                Plataforma de gestión
                            </span>
                        </span>
                    </Link>

                    <Link
                        to="/"
                        className="press inline-flex items-center gap-2 rounded-xl border border-cream/15 bg-cream/[0.03] px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-cream/70 hover:border-cream/30 hover:bg-cream/[0.07] hover:text-cream"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver
                    </Link>
                </header>

                <main className="grid flex-1 items-start gap-12 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:py-14">
                    {/* COLUMNA IZQUIERDA: mensaje (Igual al Login) */}
                    <div className="hidden lg:block lg:sticky lg:top-24">
                        <span className="anim-rise inline-flex items-center gap-3 text-[9.5px] font-bold uppercase tracking-[0.28em] text-cream/60">
                            <span className="h-px w-10 bg-gold" />
                            Red solidaria
                        </span>

                        <h1 className="anim-rise mt-6 font-display text-5xl font-extrabold leading-[0.94] tracking-[-0.035em] text-balance text-cream xl:text-[3.9rem] [animation-delay:60ms]">
                            Una cuenta,
                            <br />
                            todo el impacto.
                        </h1>

                        <p className="anim-rise mt-6 max-w-[420px] text-base leading-relaxed text-cream/70 [animation-delay:120ms]">
                            Registrá tu perfil, seguí tus donaciones y coordiná voluntariados desde un solo lugar.
                        </p>

                        <div className="anim-rise mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-[9.5px] font-bold uppercase tracking-[0.18em] text-cream/40 [animation-delay:240ms]">
                            <span>4 roles</span>
                            <span className="h-1 w-1 rounded-full bg-cream/25" />
                            <span>Registro gratuito</span>
                            <span className="h-1 w-1 rounded-full bg-cream/25" />
                            <span>Sede La Paz</span>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: tarjeta de registro */}
                    <div className="mx-auto w-full max-w-[480px] lg:max-w-[540px]">
                        <div className="anim-rise relative overflow-hidden rounded-[1.75rem] border border-border bg-surface-elevated p-6 shadow-deep sm:p-8">
                            <span
                                aria-hidden="true"
                                className="absolute inset-x-0 top-0 h-[3px] bg-linear-to-r from-accent via-accent/40 to-transparent"
                            />

                            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-text-muted">
                                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                                Nuevo registro
                            </span>

                            {/* Título + toggle de tema dentro de la tarjeta */}
                            <div className="mt-5 flex items-start justify-between gap-4">
                                <h2 className="font-display text-[1.75rem] font-extrabold leading-none tracking-[-0.03em] text-text">
                                    Crear cuenta
                                </h2>
                                <ThemeToggle />
                            </div>

                            <p className="mt-2.5 text-sm leading-relaxed text-text-muted">
                                Completá tus datos para empezar a participar.
                            </p>

                            <form onSubmit={handleSubmit} className="mt-7 space-y-1" noValidate>

                                {/* NOMBRE */}
                                <div>
                                    <label className={etiquetaCampo} htmlFor="registro-nombre">
                                        Nombres *
                                    </label>
                                    <input
                                        id="registro-nombre"
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Ej: Juan Carlos"
                                        maxLength={50}
                                        className={claseInput(errores.nombre, touched.nombre)}
                                    />
                                    <FieldError error={errores.nombre} touched={touched.nombre} />
                                </div>

                                {/* APELLIDOS */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className={etiquetaCampo} htmlFor="registro-paterno">
                                            Apellido paterno *
                                        </label>
                                        <input
                                            id="registro-paterno"
                                            type="text"
                                            name="paterno"
                                            value={formData.paterno}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Perez"
                                            maxLength={50}
                                            className={claseInput(errores.paterno, touched.paterno)}
                                        />
                                        <FieldError error={errores.paterno} touched={touched.paterno} />
                                    </div>
                                    <div>
                                        <label className={etiquetaCampo} htmlFor="registro-materno">
                                            Apellido materno
                                        </label>
                                        <input
                                            id="registro-materno"
                                            type="text"
                                            name="materno"
                                            value={formData.materno}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Herrera (opcional)"
                                            maxLength={50}
                                            className={claseInput(errores.materno, touched.materno)}
                                        />
                                        <FieldError error={errores.materno} touched={touched.materno} />
                                    </div>
                                </div>

                                {/* CI/NIT Y TELÉFONO */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className={etiquetaCampo} htmlFor="registro-ci">
                                            CI / NIT *
                                        </label>
                                        <input
                                            id="registro-ci"
                                            type="text"
                                            name="ci_nit"
                                            inputMode="numeric"
                                            value={formData.ci_nit}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="1234567"
                                            maxLength={15}
                                            className={claseInput(errores.ci_nit, touched.ci_nit)}
                                        />
                                        <FieldError error={errores.ci_nit} touched={touched.ci_nit} />
                                    </div>
                                    <div>
                                        <label className={etiquetaCampo} htmlFor="registro-telefono">
                                            Teléfono *
                                        </label>
                                        <input
                                            id="registro-telefono"
                                            type="tel"
                                            name="telefono"
                                            inputMode="numeric"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="71234567"
                                            maxLength={8}
                                            className={claseInput(errores.telefono, touched.telefono)}
                                        />
                                        <FieldError error={errores.telefono} touched={touched.telefono} />
                                    </div>
                                </div>

                                {/* FECHA NACIMIENTO */}
                                <div>
                                    <label className={etiquetaCampo} htmlFor="registro-fecha">
                                        Fecha de nacimiento *
                                    </label>
                                    <input
                                        id="registro-fecha"
                                        type="date"
                                        name="fecha_nacimiento"
                                        value={formData.fecha_nacimiento}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        max={fechaMaximaStr}
                                        className={claseInput(errores.fecha_nacimiento, touched.fecha_nacimiento)}
                                    />
                                    {errores.fecha_nacimiento && touched.fecha_nacimiento ? (
                                        <FieldError error={errores.fecha_nacimiento} touched={touched.fecha_nacimiento} />
                                    ) : (
                                        <p className="mt-1.5 min-h-[18px] text-xs text-text-muted">
                                            {formData.fecha_nacimiento && edadCalculada !== null ? (
                                                <>Edad: <span className="font-semibold text-primary">{edadCalculada} años</span></>
                                            ) : '\u00A0'}
                                        </p>
                                    )}
                                </div>

                                {/* DIRECCIÓN */}
                                <div className="pt-4">
                                    <h3 className={tituloSeccion}>
                                        <span className="h-px w-5 bg-accent" />
                                        Dirección
                                    </h3>

                                    <div className="mt-4 space-y-1">
                                        <div>
                                            <label className={etiquetaCampo} htmlFor="registro-calle">
                                                Calle / Avenida
                                            </label>
                                            <input
                                                id="registro-calle"
                                                type="text"
                                                name="calle"
                                                value={formData.calle}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="Ej: Av. 6 de Agosto #1234"
                                                maxLength={150}
                                                className={claseInput(errores.calle, touched.calle)}
                                            />
                                            <FieldError error={errores.calle} touched={touched.calle} />
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className={etiquetaCampo} htmlFor="registro-zona">
                                                    Zona / Barrio
                                                </label>
                                                <input
                                                    id="registro-zona"
                                                    type="text"
                                                    name="zona"
                                                    value={formData.zona}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    placeholder="Ej: Sopocachi"
                                                    maxLength={100}
                                                    className={claseInput(errores.zona, touched.zona)}
                                                />
                                                <FieldError error={errores.zona} touched={touched.zona} />
                                            </div>
                                            <div>
                                                <label className={etiquetaCampo} htmlFor="registro-ciudad">
                                                    Ciudad
                                                </label>
                                                <input
                                                    id="registro-ciudad"
                                                    type="text"
                                                    name="ciudad"
                                                    value={formData.ciudad}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    placeholder="Ej: La Paz"
                                                    maxLength={100}
                                                    className={claseInput(errores.ciudad, touched.ciudad)}
                                                />
                                                <FieldError error={errores.ciudad} touched={touched.ciudad} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CUENTA */}
                                <div className="pt-4">
                                    <h3 className={tituloSeccion}>
                                        <span className="h-px w-5 bg-accent" />
                                        Cuenta
                                    </h3>

                                    <div className="mt-4 space-y-1">
                                        <div>
                                            <label className={etiquetaCampo} htmlFor="registro-correo">
                                                Correo electrónico *
                                            </label>
                                            <input
                                                id="registro-correo"
                                                type="email"
                                                name="correo"
                                                value={formData.correo}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="nombre@correo.com"
                                                maxLength={150}
                                                className={claseInput(errores.correo, touched.correo)}
                                            />
                                            <FieldError error={errores.correo} touched={touched.correo} />
                                        </div>

                                        {/* CONTRASEÑA */}
                                        <div>
                                            <label className={etiquetaCampo} htmlFor="registro-password">
                                                Contraseña *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="registro-password"
                                                    type={mostrarContraseña ? "text" : "password"}
                                                    name="contraseña"
                                                    value={formData.contraseña}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    placeholder="Mínimo 8 caracteres"
                                                    maxLength={100}
                                                    className={`${claseInput(errores.contraseña, touched.contraseña)} pr-20`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setMostrarContraseña(!mostrarContraseña)}
                                                    className="press absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-text-muted hover:bg-surface-inset hover:text-text"
                                                >
                                                    {mostrarContraseña ? 'Ocultar' : 'Mostrar'}
                                                </button>
                                            </div>
                                            <FieldError error={errores.contraseña} touched={touched.contraseña} />
                                            {formData.contraseña && (
                                                <div className="mt-1.5 flex items-center gap-2.5">
                                                    <div className="flex flex-1 gap-1">
                                                        <div className={`h-1 flex-1 rounded-full ${nivelFuerza >= 1 ? colorFuerza(nivelFuerza) : 'bg-border'}`} />
                                                        <div className={`h-1 flex-1 rounded-full ${nivelFuerza >= 2 ? colorFuerza(nivelFuerza) : 'bg-border'}`} />
                                                        <div className={`h-1 flex-1 rounded-full ${nivelFuerza >= 3 ? colorFuerza(nivelFuerza) : 'bg-border'}`} />
                                                    </div>
                                                    <span className="text-xs font-medium text-text-muted">
                                                        {textoFuerza(nivelFuerza)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div
                                        role="alert"
                                        className="anim-fade mt-2 flex items-start gap-2.5 rounded-xl border border-error/30 bg-error-soft p-3 text-sm font-medium text-error"
                                    >
                                        <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                        </svg>
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* TÉRMINOS */}
                                <div className="flex items-start gap-2.5 pt-4">
                                    <input
                                        type="checkbox"
                                        id="terminos"
                                        checked={aceptarTerminos}
                                        onChange={(e) => setAceptarTerminos(e.target.checked)}
                                        className="mt-0.5 h-4 w-4 cursor-pointer rounded border-border accent-primary"
                                    />
                                    <label htmlFor="terminos" className="cursor-pointer text-sm leading-relaxed text-text-muted">
                                        Acepto los{' '}
                                        <a href="#" className="font-semibold text-primary underline-offset-4 hover:text-accent-text hover:underline">
                                            términos y condiciones
                                        </a>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={cargando}
                                    className={`press mt-5 flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-[12.5px] font-bold uppercase tracking-[0.14em] shadow-soft
                                        ${cargando
                                            ? 'cursor-wait bg-surface-inset text-text-subtle'
                                            : 'bg-primary text-on-primary hover:bg-primary-hover hover:shadow-lift motion-safe:hover:-translate-y-0.5'
                                        }`}
                                >
                                    {cargando && (
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary/30 border-t-on-primary" />
                                    )}
                                    {cargando ? 'Creando cuenta…' : 'Crear cuenta'}
                                </button>
                            </form>

                            <p className="mt-6 border-t border-border pt-5 text-center text-[13px] text-text-muted">
                                ¿Ya tenés cuenta?{' '}
                                <Link
                                    to="/login"
                                    className="rounded font-bold text-primary underline-offset-4 hover:text-accent-text hover:underline"
                                >
                                    Iniciá sesión
                                </Link>
                            </p>
                        </div>

                        <p className="mt-4 text-center text-[9.5px] font-semibold uppercase tracking-[0.18em] text-cream/40">
                            Registro gratuito · Datos protegidos
                        </p>
                    </div>
                </main>

                <footer className="flex flex-wrap items-center justify-between gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-cream/35">
                    <span>© {new Date().getFullYear()} Donaciones y Voluntariados</span>
                    <span>Plataforma solidaria</span>
                </footer>
            </div>
        </div>
    );
};

export default Registro;