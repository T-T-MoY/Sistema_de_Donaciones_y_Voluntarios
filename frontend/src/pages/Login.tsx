import { useState, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import IconLogo from '../assets/logo.svg?react';
import FieldError from '../components/ui/FieldError';
import ThemeToggle from '../components/ui/ThemeToggle';
import { esCorreoValido } from '../utils/validaciones';

// =====================================================
// TIPOS
// =====================================================
interface FormData {
    correo: string;
    contraseña: string;
}

interface Errores {
    [key: string]: string | undefined;
}

interface Touched {
    [key: string]: boolean;
}

type CampoLogin = 'correo' | 'contraseña';

// =====================================================
// ESTILOS DE CAMPO (sobre la tarjeta de superficie)
// =====================================================
const campoBase =
    'w-full rounded-xl border bg-surface-sunken py-3 pl-11 pr-4 text-[15px] text-text placeholder:text-text-subtle outline-none transition-[border-color,box-shadow,background-color] duration-200';

const claseCampo = (conError: boolean, conPasswordToggle = false) =>
    `${campoBase} ${conPasswordToggle ? 'pr-12' : ''} ${conError
        ? 'border-error/70 focus:border-error focus:ring-4 focus:ring-error/15'
        : 'border-border hover:border-border-strong focus:border-accent focus:ring-4 focus:ring-accent/15'
    }`;

const etiquetaCampo =
    'mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.16em] text-text-muted';

const BENEFICIOS = [
    'Gestión transparente de donaciones',
    'Registro ágil de voluntarios y beneficiarios',
    'Coordinación de campañas en tiempo real',
];

// =====================================================
// COMPONENTE
// =====================================================
const Login = () => {
    const [formData, setFormData] = useState<FormData>({
        correo: '',
        contraseña: ''
    });
    const [mostrarContraseña, setMostrarContraseña] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [errores, setErrores] = useState<Errores>({});
    const [touched, setTouched] = useState<Touched>({});
    const [cargando, setCargando] = useState<boolean>(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const validarCampoLogin = (name: string, value: string): string => {
        switch (name) {
            case 'correo':
                if (!value || !value.trim()) return 'El correo es obligatorio.';
                if (!esCorreoValido(value)) return 'Ingresá un correo válido.';
                if (value.length > 150) return 'Correo demasiado largo.';
                return '';
            case 'contraseña':
                if (!value) return 'La contraseña es obligatoria.';
                if (value.length < 6) return 'Mínimo 6 caracteres.';
                if (value.length > 100) return 'Máximo 100 caracteres.';
                return '';
            default:
                return '';
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        const nuevosDatos = { ...formData, [name]: value };
        setFormData(nuevosDatos);
        setTouched((prev) => ({ ...prev, [name]: true }));

        const errorCampo = validarCampoLogin(name, value);
        setErrores((prev) => ({ ...prev, [name]: errorCampo }));

        if (error) setError('');
    };

    const handleBlur = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        const errorCampo = validarCampoLogin(name, value);
        setErrores((prev) => ({ ...prev, [name]: errorCampo }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');

        const erroresEncontrados: Errores = {};
        (Object.keys(formData) as CampoLogin[]).forEach((campo) => {
            const err = validarCampoLogin(campo, formData[campo]);
            if (err) erroresEncontrados[campo] = err;
        });

        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados);
            setTouched({ correo: true, contraseña: true });
            return;
        }

        setCargando(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
            const respuesta = await axios.post(`${apiUrl}/auth/login`, {
                correo: formData.correo.toLowerCase().trim(),
                contraseña: formData.contraseña
            });

            login(respuesta.data.token);
            navigate('/dashboard');

        } catch (err: any) {
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('Error al conectar con el servidor.');
            }
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-night text-cream">

            {/* =====================================================
                FONDO CONTINUO — imagen a pantalla completa
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

            {/* =====================================================
                CONTENIDO
                ===================================================== */}
            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-5 py-6 sm:px-8 lg:px-10">

                {/* Barra superior */}
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

                <main className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:py-14">

                    {/* =====================================================
                        COLUMNA IZQUIERDA: mensaje
                        ===================================================== */}
                    <div className="hidden lg:block">
                        <span className="anim-rise inline-flex items-center gap-3 text-[9.5px] font-bold uppercase tracking-[0.28em] text-cream/60">
                            <span className="h-px w-10 bg-gold" />
                            Acceso a la plataforma
                        </span>

                        <h1 className="anim-rise mt-6 font-display text-5xl font-extrabold leading-[0.94] tracking-[-0.035em] text-balance text-cream xl:text-[3.9rem] [animation-delay:60ms]">
                            Sumate a la
                            <br />
                            red solidaria.
                            <br />
                            <span className="text-gold-gradient">Es tu momento.</span>
                        </h1>

                        <p className="anim-rise mt-6 max-w-[420px] text-base leading-relaxed text-cream/70 [animation-delay:120ms]">
                            Tus donaciones, voluntariados y solicitudes en un solo lugar.
                            Conexión directa y seguimiento transparente.
                        </p>

                        <ul className="anim-rise mt-8 space-y-3.5 [animation-delay:180ms]">
                            {BENEFICIOS.map((item) => (
                                <li key={item} className="flex items-center gap-3 text-sm text-cream/75">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gold text-night">
                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <div className="anim-rise mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-[9.5px] font-bold uppercase tracking-[0.18em] text-cream/40 [animation-delay:240ms]">
                            <span>Comunidad activa</span>
                            <span className="h-1 w-1 rounded-full bg-cream/25" />
                            <span>4 roles</span>
                            <span className="h-1 w-1 rounded-full bg-cream/25" />
                            <span>Sede La Paz</span>
                        </div>
                    </div>

                    {/* =====================================================
                        COLUMNA DERECHA: tarjeta de acceso
                        ===================================================== */}
                    <div className="mx-auto w-full max-w-[460px]">
                        <div className="anim-rise relative overflow-hidden rounded-[1.75rem] border border-border bg-surface-elevated p-6 shadow-deep sm:p-8">
                            <span
                                aria-hidden="true"
                                className="absolute inset-x-0 top-0 h-[3px] bg-linear-to-r from-accent via-accent/40 to-transparent"
                            />

                            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-text-muted">
                                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                                Acceso seguro
                            </span>

                            {/* Título + toggle de tema dentro de la tarjeta */}
                            <div className="mt-5 flex items-start justify-between gap-4">
                                <h2 className="font-display text-[1.75rem] font-extrabold leading-none tracking-[-0.03em] text-text">
                                    Iniciar sesión
                                </h2>
                                <ThemeToggle />
                            </div>

                            <p className="mt-2.5 text-sm leading-relaxed text-text-muted">
                                Ingresá con tu cuenta para acceder a la plataforma.
                            </p>

                            <form onSubmit={handleSubmit} className="mt-6 space-y-1" noValidate>

                                {/* CORREO */}
                                <div>
                                    <label htmlFor="login-correo" className={etiquetaCampo}>
                                        Correo electrónico
                                    </label>
                                    <div className="group relative">
                                        <svg
                                            aria-hidden="true"
                                            className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-subtle transition-colors duration-200 group-focus-within:text-accent-text"
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.9 5.26a2 2 0 002.2 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <input
                                            id="login-correo"
                                            type="email"
                                            name="correo"
                                            value={formData.correo}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="nombre@correo.com"
                                            autoComplete="email"
                                            inputMode="email"
                                            autoFocus
                                            maxLength={150}
                                            aria-invalid={Boolean(errores.correo && touched.correo)}
                                            className={claseCampo(Boolean(errores.correo))}
                                        />
                                    </div>
                                    <FieldError error={errores.correo} touched={touched.correo} />
                                </div>

                                {/* CONTRASEÑA */}
                                <div>
                                    <label htmlFor="login-contraseña" className={etiquetaCampo}>
                                        Contraseña
                                    </label>
                                    <div className="group relative">
                                        <svg
                                            aria-hidden="true"
                                            className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-subtle transition-colors duration-200 group-focus-within:text-accent-text"
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <input
                                            id="login-contraseña"
                                            type={mostrarContraseña ? 'text' : 'password'}
                                            name="contraseña"
                                            value={formData.contraseña}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                            maxLength={100}
                                            aria-invalid={Boolean(errores.contraseña && touched.contraseña)}
                                            className={claseCampo(Boolean(errores.contraseña), true)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setMostrarContraseña(!mostrarContraseña)}
                                            aria-label={mostrarContraseña ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                            aria-pressed={mostrarContraseña}
                                            className="press absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-text-subtle hover:bg-surface-inset hover:text-text"
                                        >
                                            {mostrarContraseña ? (
                                                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <FieldError error={errores.contraseña} touched={touched.contraseña} />
                                </div>

                                {error && (
                                    <div
                                        role="alert"
                                        className="anim-fade flex items-start gap-2.5 rounded-xl border border-error/30 bg-error-soft p-3 text-sm font-medium text-error"
                                    >
                                        <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                        </svg>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="flex justify-end pt-1.5">
                                    <Link
                                        to="/solicitar-recuperacion"
                                        className="rounded text-[12px] font-semibold text-accent-text underline-offset-4 hover:text-primary hover:underline"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={cargando}
                                    className={`press mt-3 flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-[12.5px] font-bold uppercase tracking-[0.14em] shadow-soft
                                        ${cargando
                                            ? 'cursor-wait bg-surface-inset text-text-subtle'
                                            : 'bg-primary text-on-primary hover:bg-primary-hover hover:shadow-lift'
                                        }`}
                                >
                                    {cargando && (
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary/30 border-t-on-primary" />
                                    )}
                                    {cargando ? 'Ingresando…' : 'Iniciar sesión'}
                                </button>

                            </form>

                            <p className="mt-6 border-t border-border pt-5 text-center text-[13px] text-text-muted">
                                ¿Todavía no tenés cuenta?{' '}
                                <Link
                                    to="/registro"
                                    className="rounded font-bold text-primary underline-offset-4 hover:text-accent-text hover:underline"
                                >
                                    Creá una gratis
                                </Link>
                            </p>
                        </div>

                        <p className="mt-4 text-center text-[9.5px] font-semibold uppercase tracking-[0.18em] text-cream/40">
                            Conexión segura · Donaciones y Voluntariados
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

export default Login;
