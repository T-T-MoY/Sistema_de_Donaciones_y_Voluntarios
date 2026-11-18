import { useState, ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from '../components/ui/ThemeToggle';
import FieldError from '../components/ui/FieldError';
import { esCorreoValido, claseInput } from '../utils/validaciones';
import IconLogo from '../assets/logo.svg?react';

const etiquetaCampo =
    'mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.16em] text-text-muted';

const PASOS = [
    'Ingresá el correo de tu cuenta',
    'Revisá la bandeja de entrada',
    'Definí una nueva contraseña',
];

const SolicitarRecuperacion = () => {
    const [correo, setCorreo] = useState<string>('');
    const [cargando, setCargando] = useState<boolean>(false);
    const [exito, setExito] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [errorCampo, setErrorCampo] = useState<string>('');
    const [touched, setTouched] = useState<boolean>(false);

    const validarCorreo = (valor: string): string => {
        if (!valor || !valor.trim()) return 'El correo es obligatorio.';
        if (!esCorreoValido(valor)) return 'Ingresá un correo válido.';
        if (valor.length > 150) return 'Correo demasiado largo.';
        return '';
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const valor = e.target.value;
        setCorreo(valor);
        setTouched(true);
        const err = validarCorreo(valor);
        setErrorCampo(err);
        if (error) setError('');
    };

    const handleBlur = (): void => {
        setTouched(true);
        const err = validarCorreo(correo);
        setErrorCampo(err);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');

        const err = validarCorreo(correo);
        if (err) {
            setErrorCampo(err);
            setTouched(true);
            return;
        }

        setCargando(true);
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/solicitar-recuperacion`,
                { correo: correo.toLowerCase().trim() }
            );
            setExito(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al procesar la solicitud.');
        } finally {
            setCargando(false);
        }
    };

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

                    {/* Columna izquierda: mensaje */}
                    <div className="hidden lg:block">
                        <span className="anim-rise inline-flex items-center gap-3 text-[9.5px] font-bold uppercase tracking-[0.28em] text-cream/60">
                            <span className="h-px w-10 bg-gold" />
                            Recuperar acceso
                        </span>

                        <h1 className="anim-rise mt-6 font-display text-5xl font-extrabold leading-[0.94] tracking-[-0.035em] text-balance text-cream xl:text-[3.9rem] [animation-delay:60ms]">
                            Volvé a tu
                            <br />
                            red solidaria.
                            <br />
                            <span className="text-gold-gradient">En dos pasos.</span>
                        </h1>

                        <p className="anim-rise mt-6 max-w-[420px] text-base leading-relaxed text-cream/70 [animation-delay:120ms]">
                            Te enviamos un enlace seguro para restablecer tu contraseña.
                            El enlace expira en una hora por seguridad.
                        </p>

                        <ol className="anim-rise mt-8 space-y-3.5 [animation-delay:180ms]">
                            {PASOS.map((paso, i) => (
                                <li key={paso} className="flex items-center gap-3 text-sm text-cream/75">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 font-display text-[10px] font-bold text-gold-bright">
                                        {i + 1}
                                    </span>
                                    {paso}
                                </li>
                            ))}
                        </ol>

                        <div className="anim-rise mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-[9.5px] font-bold uppercase tracking-[0.18em] text-cream/40 [animation-delay:240ms]">
                            <span>Enlace de un solo uso</span>
                            <span className="h-1 w-1 rounded-full bg-cream/25" />
                            <span>Expira en 60 min</span>
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
                                <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                                Acceso seguro
                            </span>

                            {/* Título + toggle de tema dentro de la tarjeta */}
                            <div className="mt-5 flex items-start justify-between gap-4">
                                <h2 className="font-display text-[1.6rem] font-extrabold leading-none tracking-[-0.03em] text-text">
                                    {exito ? 'Revisá tu correo' : 'Recuperar contraseña'}
                                </h2>
                                <ThemeToggle />
                            </div>

                            {!exito ? (
                                <>
                                    <p className="mt-2.5 text-sm leading-relaxed text-text-muted">
                                        Ingresá tu correo y te enviaremos un enlace para restablecer
                                        tu contraseña.
                                    </p>

                                    <form onSubmit={handleSubmit} className="mt-6 space-y-1" noValidate>

                                        <div>
                                            <label htmlFor="recuperacion-correo" className={etiquetaCampo}>
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
                                                    id="recuperacion-correo"
                                                    type="email" 
                                                    value={correo}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    placeholder="nombre@correo.com"
                                                    autoComplete="email"
                                                    inputMode="email"
                                                    autoFocus
                                                    maxLength={150}
                                                    className={`${claseInput(errorCampo, touched)} pl-11`}
                                                />
                                            </div>
                                            <FieldError error={errorCampo} touched={touched} />
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
                                            {cargando ? 'Enviando…' : 'Enviar instrucciones'}
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
                            ) : (
                                <div className="anim-fade mt-6 space-y-5">
                                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-success/25 bg-success-soft px-5 py-7 text-center">
                                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/15 text-success">
                                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </span>
                                        <p className="text-sm leading-relaxed text-text-muted">
                                            Si el correo{' '}
                                            <strong className="break-all font-bold text-text">{correo}</strong>{' '}
                                            está registrado, te enviamos un enlace para restablecer tu
                                            contraseña.
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border bg-surface px-4 py-3.5">
                                        <p className="flex items-start gap-2.5 text-[11.5px] leading-relaxed text-text-muted">
                                            <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>
                                                Si no lo ves, revisá la carpeta de{' '}
                                                <strong className="font-semibold text-text">Spam</strong>.
                                                El enlace expira en 1 hora.
                                            </span>
                                        </p>
                                    </div>

                                    <Link 
                                        to="/login" 
                                        className="press flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[12.5px] font-bold uppercase tracking-[0.14em] text-on-primary shadow-soft hover:bg-primary-hover hover:shadow-lift"
                                    >
                                        Volver al inicio de sesión
                                    </Link>
                                </div>
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

export default SolicitarRecuperacion;
