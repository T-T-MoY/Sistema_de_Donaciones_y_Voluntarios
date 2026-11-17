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
                            Nueva contraseña.
                        </h1>
                        <p className="max-w-md text-lg font-medium text-arena-ivory/80 drop-shadow-sm">
                            Elegí una contraseña segura que puedas recordar.
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
                        Resetear contraseña
                    </h2>

                    {/* Estado 1: Validando el token */}
                    {validando && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-10 h-10 border-4 border-claro-primario dark:border-oscuro-primario border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2">
                                Validando enlace...
                            </p>
                        </div>
                    )}

                    {/* Estado 2: Éxito */}
                    {!validando && exito && (
                        <div className="space-y-6 pt-6">
                            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-claro-texto dark:text-oscuro-texto mb-2">
                                    ¡Contraseña actualizada!
                                </h3>
                                <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2">
                                    Redirigiendo al inicio de sesión...
                                </p>
                            </div>
                            <Link 
                                to="/login" 
                                className="block text-center text-sm text-claro-primario dark:text-oscuro-primario font-bold hover:underline"
                            >
                                Ir al login ahora →
                            </Link>
                        </div>
                    )}

                    {/* Estado 3: Token inválido o expirado */}
                    {!validando && !exito && !tokenValido && (
                        <div className="space-y-6 pt-6">
                            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-claro-texto dark:text-oscuro-texto mb-2">
                                    Enlace inválido
                                </h3>
                                <p className="text-sm text-claro-texto2 dark:text-oscuro-texto2 mb-6">
                                    {error || 'El enlace ya expiró o fue utilizado.'}
                                </p>
                            </div>
                            <Link 
                                to="/solicitar-recuperacion" 
                                className="press block w-full rounded-xl bg-claro-primario py-3 text-center font-semibold text-white shadow-[0_18px_36px_-20px_rgba(14,110,109,0.7)] hover:bg-claro-hover dark:bg-oscuro-primario dark:text-oscuro-fondo dark:hover:bg-oscuro-hover"
                            >
                                Solicitar nuevo enlace
                            </Link>
                            <Link 
                                to="/login" 
                                className="block text-center text-sm text-claro-texto2 dark:text-oscuro-texto2 hover:underline"
                            >
                                ← Volver al inicio de sesión
                            </Link>
                        </div>
                    )}

                    {/* Estado 4: Formulario para cambiar contraseña */}
                    {!validando && !exito && tokenValido && (
                        <>
                            <p className="text-claro-texto2 dark:text-oscuro-texto2 mb-4 text-sm">
                                Ingresá tu nueva contraseña. Debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-1" noValidate>
                                
                                {/* NUEVA CONTRASEÑA */}
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-claro-texto2 dark:text-oscuro-texto2">
                                        Nueva contraseña
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type={mostrar ? 'text' : 'password'}
                                            name="nuevaContraseña"
                                            value={formData.nuevaContraseña}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Mínimo 8 caracteres"
                                            maxLength={100}
                                            className={claseInput(errores.nuevaContraseña, touched.nuevaContraseña)}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setMostrar(!mostrar)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-primario dark:hover:text-oscuro-primario font-medium"
                                        >
                                            {mostrar ? 'Ocultar' : 'Mostrar'}
                                        </button>
                                    </div>
                                    <FieldError error={errores.nuevaContraseña} touched={touched.nuevaContraseña} />
                                </div>

                                {/* CONFIRMAR */}
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-claro-texto2 dark:text-oscuro-texto2">
                                        Confirmar contraseña
                                    </label>
                                    <input 
                                        type={mostrar ? 'text' : 'password'}
                                        name="confirmar"
                                        value={formData.confirmar}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Repetí la contraseña"
                                        maxLength={100}
                                        className={claseInput(errores.confirmar, touched.confirmar)}
                                    />
                                    <FieldError error={errores.confirmar} touched={touched.confirmar} />
                                </div>

                                {/* INDICADOR DE FUERZA */}
                                {formData.nuevaContraseña && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex gap-1 flex-1">
                                            <div className={`h-1 flex-1 rounded-full ${nivelFuerza >= 1 ? colorFuerza(nivelFuerza) : 'bg-claro-borde dark:bg-oscuro-borde'}`}></div>
                                            <div className={`h-1 flex-1 rounded-full ${nivelFuerza >= 2 ? colorFuerza(nivelFuerza) : 'bg-claro-borde dark:bg-oscuro-borde'}`}></div>
                                            <div className={`h-1 flex-1 rounded-full ${nivelFuerza >= 3 ? colorFuerza(nivelFuerza) : 'bg-claro-borde dark:bg-oscuro-borde'}`}></div>
                                        </div>
                                        <span className="text-xs text-claro-texto2 dark:text-oscuro-texto2">
                                            {textoFuerza(nivelFuerza)}
                                        </span>
                                    </div>
                                )}

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
                                    {cargando ? 'Actualizando...' : 'Cambiar contraseña'}
                                </button>

                            </form>

                            <p className="text-center text-sm text-claro-texto2 dark:text-oscuro-texto2 mt-6">
                                <Link to="/login" className="text-claro-primario dark:text-oscuro-primario font-medium hover:underline">
                                    ← Volver al inicio de sesión
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;