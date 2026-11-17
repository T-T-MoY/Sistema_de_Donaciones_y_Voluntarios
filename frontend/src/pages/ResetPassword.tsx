import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from '../components/ui/ThemeToggle';
import FieldError from '../components/ui/FieldError';
import IconLogo from '../assets/logo.svg?react';
import {
    esContraseñaSegura,
    fuerzaContraseña,
    textoFuerza,
    colorFuerza,
    claseInput
} from '../utils/validaciones';

// =====================================================
// TIPOS
// =====================================================
interface FormData {
    token: string;
    nuevaContraseña: string;
    confirmar: string;
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

const REQUISITOS = [
    'Mínimo 8 caracteres',
    'Una letra mayúscula y una minúscula',
    'Al menos un número',
];

// =====================================================
// COMPONENTE
// =====================================================
const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const navigate = useNavigate();

    const [formData, setFormData] = useState<FormData>({
        token: token,
        nuevaContraseña: '',
        confirmar: ''
    });
    const [mostrar, setMostrar] = useState<boolean>(false);
    const [cargando, setCargando] = useState<boolean>(false);
    const [validando, setValidando] = useState<boolean>(true);
    const [tokenValido, setTokenValido] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [errores, setErrores] = useState<Errores>({});
    const [touched, setTouched] = useState<Touched>({});
    const [exito, setExito] = useState<boolean>(false);

    // =====================================================
    // VALIDAR TOKEN AL ENTRAR
    // =====================================================
    useEffect(() => {
        const validarToken = async (): Promise<void> => {
            if (!token) {
                setError('Falta el token en la URL. Solicitá uno nuevo.');
                setValidando(false);
                return;
            }

            try {
                await axios.get(`${import.meta.env.VITE_API_URL}/auth/validar-token/${token}`);
                setTokenValido(true);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Token inválido o expirado.');
                setTokenValido(false);
            } finally {
                setValidando(false);
            }
        };

        validarToken();
    }, [token]);

    // =====================================================
    // VALIDACIÓN POR CAMPO
    // =====================================================
    const validarCampoReset = (name: string, value: string, data: FormData = formData): string => {
        switch (name) {
            case 'nuevaContraseña': {
                if (!value) return 'La contraseña es obligatoria.';
                const resultado = esContraseñaSegura(value);
                return resultado.valido ? '' : (resultado.error ?? 'Contraseña inválida.');
            }

            case 'confirmar':
                if (!value) return 'Debés confirmar la contraseña.';
                if (value !== data.nuevaContraseña) return 'Las contraseñas no coinciden.';
                return '';

            default:
                return '';
        }
    };

    // =====================================================
    // HANDLERS
    // =====================================================
    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        const nuevosDatos = { ...formData, [name]: value };
        setFormData(nuevosDatos);

        setTouched((prev) => ({ ...prev, [name]: true }));

        const err = validarCampoReset(name, value, nuevosDatos);
        setErrores((prev) => ({ ...prev, [name]: err }));

        // Si cambio la nueva contraseña, revalidar confirmar
        if (name === 'nuevaContraseña' && nuevosDatos.confirmar) {
            const errConfirm = validarCampoReset('confirmar', nuevosDatos.confirmar, nuevosDatos);
            setErrores((prev) => ({ ...prev, confirmar: errConfirm }));
        }

        if (error) setError('');
    };

    const handleBlur = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        const err = validarCampoReset(name, value);
        setErrores((prev) => ({ ...prev, [name]: err }));
    };

    // =====================================================
    // SUBMIT
    // =====================================================
    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');

        const erroresEncontrados: Errores = {};
        const errPwd = validarCampoReset('nuevaContraseña', formData.nuevaContraseña);
        if (errPwd) erroresEncontrados.nuevaContraseña = errPwd;

        const errConfirm = validarCampoReset('confirmar', formData.confirmar);
        if (errConfirm) erroresEncontrados.confirmar = errConfirm;

        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados);
            setTouched({ nuevaContraseña: true, confirmar: true });
            return;
        }

        setCargando(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
                token: formData.token,
                nuevaContraseña: formData.nuevaContraseña
            });
            setExito(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al resetear la contraseña.');
        } finally {
            setCargando(false);
        }
    };

    const nivelFuerza = fuerzaContraseña(formData.nuevaContraseña);

    const titulo = validando
        ? 'Validando enlace'
        : exito
            ? 'Contraseña actualizada'
            : !tokenValido
                ? 'Enlace inválido'
                : 'Nueva contraseña';

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-night text-cream">

            {/* Fondo con foto */}
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

                {/* Barra superior */}
                <header className="flex items-center justify-between">
                    <Link
                        to="/"
                        className="group flex items-center gap-3 rounded-xl"
                        title="Ir al inicio"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cream/10 bg-cream/[0.05] transition-colors duration-300 group-hover:border-gold/40">
                            <IconLogo className="h-8 w-8 transition-transform duration-300 ease-out-soft motion-safe:group-hover:rotate-[-4deg]" />
                        </span>
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

                    {/* Columna izquierda: mensaje */}
                    <div className="hidden lg:block">
                        <span className="anim-rise inline-flex items-center gap-3 text-[9.5px] font-bold uppercase tracking-[0.28em] text-cream/60">
                            <span className="h-px w-10 bg-gold" />
                            Seguridad de la cuenta
                        </span>

                        <h1 className="anim-rise mt-6 font-display text-5xl font-extrabold leading-[0.94] tracking-[-0.035em] text-balance text-cream xl:text-[3.9rem] [animation-delay:60ms]">
                            Nueva clave.
                            <br />
                            Misma cuenta.
                            <br />
                            <span className="text-gold-gradient">Todo tu impacto.</span>
                        </h1>

                        <p className="anim-rise mt-6 max-w-[420px] text-base leading-relaxed text-cream/70 [animation-delay:120ms]">
                            Elegí una contraseña segura que puedas recordar. Tu acceso se
                            restablece al instante.
                        </p>

                        <ul className="anim-rise mt-8 space-y-3 [animation-delay:180ms]">
                            {REQUISITOS.map((item) => (
                                <li key={item} className="flex items-center gap-3 text-sm text-cream/75">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-gold/40 bg-gold/10 text-gold-bright">
                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <div className="anim-rise mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-[9.5px] font-bold uppercase tracking-[0.18em] text-cream/40 [animation-delay:240ms]">
                            <span>Enlace verificado</span>
                            <span className="h-1 w-1 rounded-full bg-cream/25" />
                            <span>Cifrado en tránsito</span>
                            <span className="h-1 w-1 rounded-full bg-cream/25" />
                            <span>Sede La Paz</span>
                        </div>
                    </div>

                    {/* Columna derecha: tarjeta */}
                    <div className="mx-auto w-full max-w-[460px]">
                        <div className="anim-rise relative overflow-hidden rounded-[1.75rem] border border-border bg-surface-elevated p-6 shadow-deep sm:p-8">
                            <span
                                aria-hidden="true"
                                className="absolute inset-x-0 top-0 h-[3px] bg-linear-to-r from-accent via-accent/40 to-transparent"
                            />

                            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-text-muted">
                                <span className={`h-1.5 w-1.5 rounded-full ${exito || tokenValido ? 'bg-success' : validando ? 'bg-warning' : 'bg-error'}`} />
                                Restablecer acceso
                            </span>

                            {/* Título + toggle de tema dentro de la tarjeta */}
                            <div className="mt-5 flex items-start justify-between gap-4">
                                <h2 className="font-display text-[1.6rem] font-extrabold leading-none tracking-[-0.03em] text-text">
                                    {titulo}
                                </h2>
                                <ThemeToggle />
                            </div>

                            {/* Estado 1: Validando el token */}
                            {validando && (
                                <div className="flex flex-col items-center justify-center gap-4 py-12">
                                    <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-border border-t-accent" />
                                    <p className="text-sm text-text-muted">Validando enlace…</p>
                                </div>
                            )}

                            {/* Estado 2: Éxito */}
                            {!validando && exito && (
                                <div className="anim-fade space-y-5 pt-6">
                                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-success/25 bg-success-soft px-5 py-7 text-center">
                                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/15 text-success">
                                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </span>
                                        <p className="text-sm leading-relaxed text-text-muted">
                                            Tu contraseña se actualizó correctamente.
                                            Redirigiendo al inicio de sesión…
                                        </p>
                                    </div>

                                    <Link
                                        to="/login"
                                        className="press flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[12.5px] font-bold uppercase tracking-[0.14em] text-on-primary shadow-soft hover:bg-primary-hover hover:shadow-lift"
                                    >
                                        Ir al login ahora
                                    </Link>
                                </div>
                            )}

                            {/* Estado 3: Token inválido o expirado */}
                            {!validando && !exito && !tokenValido && (
                                <div className="anim-fade space-y-5 pt-6">
                                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-error/25 bg-error-soft px-5 py-7 text-center">
                                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-error/15 text-error">
                                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </span>
                                        <p className="text-sm leading-relaxed text-text-muted">
                                            {error || 'El enlace ya expiró o fue utilizado.'}
                                        </p>
                                    </div>

                                    <Link
                                        to="/solicitar-recuperacion"
                                        className="press flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-[12.5px] font-bold uppercase tracking-[0.14em] text-on-primary shadow-soft hover:bg-primary-hover hover:shadow-lift"
                                    >
                                        Solicitar nuevo enlace
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="block text-center text-[13px] font-semibold text-text-muted underline-offset-4 hover:text-primary hover:underline"
                                    >
                                        ← Volver al inicio de sesión
                                    </Link>
                                </div>
                            )}

                            {/* Estado 4: Formulario para cambiar contraseña */}
                            {!validando && !exito && tokenValido && (
                                <>
                                    <p className="mt-2.5 text-sm leading-relaxed text-text-muted">
                                        Ingresá tu nueva contraseña. Debe tener mínimo 8 caracteres,
                                        una mayúscula, una minúscula y un número.
                                    </p>

                                    <form onSubmit={handleSubmit} className="mt-6 space-y-1" noValidate>

                                        {/* NUEVA CONTRASEÑA */}
                                        <div>
                                            <label htmlFor="reset-password" className={etiquetaCampo}>
                                                Nueva contraseña
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="reset-password"
                                                    type={mostrar ? 'text' : 'password'}
                                                    name="nuevaContraseña"
                                                    value={formData.nuevaContraseña}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    placeholder="Mínimo 8 caracteres"
                                                    autoComplete="new-password"
                                                    maxLength={100}
                                                    className={`${claseInput(errores.nuevaContraseña, touched.nuevaContraseña)} pr-20`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setMostrar(!mostrar)}
                                                    aria-label={mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                                    aria-pressed={mostrar}
                                                    className="press absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-text-muted hover:bg-surface-inset hover:text-text"
                                                >
                                                    {mostrar ? 'Ocultar' : 'Mostrar'}
                                                </button>
                                            </div>
                                            <FieldError error={errores.nuevaContraseña} touched={touched.nuevaContraseña} />
                                        </div>

                                        {/* CONFIRMAR */}
                                        <div>
                                            <label htmlFor="reset-confirmar" className={etiquetaCampo}>
                                                Confirmar contraseña
                                            </label>
                                            <input
                                                id="reset-confirmar"
                                                type={mostrar ? 'text' : 'password'}
                                                name="confirmar"
                                                value={formData.confirmar}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="Repetí la contraseña"
                                                autoComplete="new-password"
                                                maxLength={100}
                                                className={claseInput(errores.confirmar, touched.confirmar)}
                                            />
                                            <FieldError error={errores.confirmar} touched={touched.confirmar} />
                                        </div>

                                        {/* INDICADOR DE FUERZA */}
                                        {formData.nuevaContraseña && (
                                            <div className="flex items-center gap-2.5 pt-1">
                                                <div className="flex flex-1 gap-1">
                                                    <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${nivelFuerza >= 1 ? colorFuerza(nivelFuerza) : 'bg-border'}`} />
                                                    <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${nivelFuerza >= 2 ? colorFuerza(nivelFuerza) : 'bg-border'}`} />
                                                    <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${nivelFuerza >= 3 ? colorFuerza(nivelFuerza) : 'bg-border'}`} />
                                                </div>
                                                <span className="text-xs font-semibold text-text-muted">
                                                    {textoFuerza(nivelFuerza)}
                                                </span>
                                            </div>
                                        )}

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

                                        <button
                                            type="submit"
                                            disabled={cargando}
                                            className={`press mt-4 flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-[12.5px] font-bold uppercase tracking-[0.14em] shadow-soft
                                                ${cargando
                                                    ? 'cursor-wait bg-surface-inset text-text-subtle'
                                                    : 'bg-primary text-on-primary hover:bg-primary-hover hover:shadow-lift'
                                                }`}
                                        >
                                            {cargando && (
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary/30 border-t-on-primary" />
                                            )}
                                            {cargando ? 'Actualizando…' : 'Cambiar contraseña'}
                                        </button>

                                    </form>

                                    <p className="mt-6 border-t border-border pt-5 text-center text-[13px] text-text-muted">
                                        <Link
                                            to="/login"
                                            className="rounded font-bold text-primary underline-offset-4 hover:text-accent-text hover:underline"
                                        >
                                            ← Volver al inicio de sesión
                                        </Link>
                                    </p>
                                </>
                            )}
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

export default ResetPassword;