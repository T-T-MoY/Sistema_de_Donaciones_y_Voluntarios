import { useState, ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from '../components/ui/ThemeToggle';
import FieldError from '../components/ui/FieldError';
import { esCorreoValido, claseInput } from '../utils/validaciones';
import IconLogo from '../assets/logo.svg?react';


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
        <div className="flex h-screen w-full overflow-hidden bg-claro-fondo transition-colors duration-300 dark:bg-oscuro-fondo">
            
            {/* Columna Izquierda: Imagen */}
            <div className="auth-photo relative hidden h-full md:flex md:w-1/2 lg:w-7/12">
                <div className="absolute inset-0 bg-linear-to-b from-arena-night/80 via-arena-night/45 to-arena-base/95"></div>
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-1/4 right-0 h-72 w-72 rounded-full bg-arena-accent/15 blur-[110px]"
                />
                
                <div className="relative z-10 flex h-full w-full flex-col justify-between p-10 lg:p-16">
                    <div>
                        <Link to="/" className="inline-block transition-transform duration-300 ease-out-soft motion-safe:hover:scale-105" title="Ir al inicio">
                            <IconLogo className="w-10 h-10" />
                        </Link>
                    </div>
                    <div className="mb-8">
                        <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-arena-ivory/70">
                            <span className="h-px w-8 bg-arena-accent" />
                            Red solidaria
                        </span>
                        <h1 className="mb-4 mt-4 text-4xl font-bold leading-tight text-arena-ivory drop-shadow-md lg:text-5xl">
                            Recuperá tu acceso.
                        </h1>
                        <p className="max-w-md text-lg font-medium text-arena-ivory/80 drop-shadow-sm">
                            Te ayudamos a recuperar el acceso a tu cuenta en un par de pasos.
                        </p>
                    </div>
                </div>
            </div>

            {/* Columna Derecha: Formulario */}
            <div className="flex h-full w-full flex-col items-center overflow-y-auto p-6 sm:p-8 md:w-1/2 lg:w-5/12 lg:p-12">
                <div className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl border border-claro-borde bg-claro-tarjeta p-8 shadow-lift dark:border-oscuro-borde dark:bg-oscuro-tarjeta sm:p-10">
                    <span
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 h-[3px] bg-linear-to-r from-claro-primario via-claro-primario/40 to-transparent dark:from-oscuro-primario dark:via-oscuro-primario/40"
                    />
                    
                    <div className="mb-4 flex items-center justify-between">
                        <Link 
                            to="/" 
                            className="inline-flex items-center gap-2 text-sm font-semibold text-claro-texto2 transition-colors hover:text-claro-primario dark:text-oscuro-texto2 dark:hover:text-oscuro-primario"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Volver al inicio
                        </Link>
                        <ThemeToggle />
                    </div>

                    <h2 className="mb-2 text-2xl font-bold tracking-tight text-claro-texto dark:text-oscuro-texto">
                        Recuperar contraseña
                    </h2>

                    {!exito ? (
                        <>
                            <p className="text-claro-texto2 dark:text-oscuro-texto2 mb-4">
                                Ingresá tu correo y te enviaremos un enlace para restablecer tu contraseña.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-1" noValidate>
                                
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-claro-texto2 dark:text-oscuro-texto2">
                                        Correo electrónico
                                    </label>
                                    <input 
                                        type="email" 
                                        value={correo}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="nombre@correo.com"
                                        maxLength={150}
                                        className={claseInput(errorCampo, touched)}
                                    />
                                    <FieldError error={errorCampo} touched={touched} />
                                </div>

                                {error && (
                                    <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-800/70 dark:bg-red-900/25 dark:text-red-300">
                                        {error}
                                    </p>
                                )}

                                <button 
                                    type="submit" 
                                    disabled={cargando}
                                    className={`press mt-4 w-full rounded-xl py-3 font-semibold text-white shadow-[0_18px_36px_-20px_rgba(14,110,109,0.7)]
                                        ${cargando 
                                            ? 'bg-claro-borde text-claro-texto2 dark:bg-oscuro-borde dark:text-oscuro-texto2 cursor-not-allowed' 
                                            : 'bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:text-oscuro-fondo dark:hover:bg-oscuro-hover motion-safe:hover:-translate-y-0.5'
                                        }`}
                                >
                                    {cargando ? 'Enviando...' : 'Enviar instrucciones'}
                                </button>

                            </form>

                            <p className="text-center text-sm text-claro-texto2 dark:text-oscuro-texto2 mt-6">
                                <Link to="/login" className="text-claro-primario dark:text-oscuro-primario font-bold hover:underline">
                                    ← Volver al inicio de sesión
                                </Link>
                            </p>
                        </>
                    ) : (
                        <div className="space-y-6 pt-4">
                            {/* Ícono de éxito */}
                            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>

                            <div className="text-center">
                                <h3 className="text-lg font-bold text-claro-texto dark:text-oscuro-texto mb-2">
                                    Revisá tu correo
                                </h3>
                                <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2">
                                    Si el correo <strong className="text-claro-texto dark:text-oscuro-texto">{correo}</strong> está registrado, te enviamos un enlace para restablecer tu contraseña.
                                </p>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-xl">
                                <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                                    💡 <strong>Tip:</strong> Si no lo ves, revisá tu carpeta de <strong>Spam</strong> o correo no deseado. El enlace expira en 1 hora.
                                </p>
                            </div>

                            <Link 
                                to="/login" 
                                className="block text-center text-sm text-claro-primario dark:text-oscuro-primario font-medium hover:underline"
                            >
                                ← Volver al inicio de sesión
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SolicitarRecuperacion;