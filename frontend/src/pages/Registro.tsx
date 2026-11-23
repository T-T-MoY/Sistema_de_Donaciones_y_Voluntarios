import { useState, ChangeEvent, FormEvent, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from '../components/ui/ThemeToggle';
import FieldError from '../components/ui/FieldError';
import IconLogo from '../assets/logo.svg?react';
import { useToast } from '../context/ToastContext';
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
    // Campos específicos para Beneficiario
    tipo_beneficiario: 'Persona' | 'Familia' | 'Institucion';
    necesidad: string;
    descripcion: string;
    // Campos específicos para Voluntario
    habilidades: string;
    disponibilidad: string;
}

type RolParticipacion = 'Donante' | 'Voluntario' | 'Beneficiario';

interface OpcionRol {
    valor: RolParticipacion;
    titulo: string;
    detalle: string;
    requiereAprobacion: boolean;
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
    'mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted';

const tituloSeccion =
    'flex items-center gap-2.5 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-text';

// =====================================================
// ROLES DISPONIBLES (solo se puede elegir uno a la vez)
// =====================================================
const OPCIONES_ROL: OpcionRol[] = [
    { valor: 'Donante', titulo: 'Donante', detalle: 'Acceso inmediato', requiereAprobacion: false },
    { valor: 'Beneficiario', titulo: 'Beneficiario', detalle: 'Revisión de solicitud', requiereAprobacion: true },
    { valor: 'Voluntario', titulo: 'Voluntario', detalle: 'Aprobación coordinador', requiereAprobacion: true },
];

// =====================================================
// CAMPO REUTILIZABLE
// Solo ocupa espacio para el error cuando realmente hay uno
// =====================================================
interface CampoProps {
    id: string;
    name: keyof FormData;
    label: ReactNode;
    value: string;
    error?: string;
    touched?: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    maxLength?: number;
    type?: string;
    inputMode?: 'numeric' | 'text';
    max?: string;
    className?: string;
}

const Campo = ({
    id, name, label, value, error, touched, onChange, onBlur,
    placeholder, maxLength, type = 'text', inputMode, max, className = '',
}: CampoProps) => (
    <div className={className}>
        <label className={etiquetaCampo} htmlFor={id}>{label}</label>
        <input
            id={id}
            type={type}
            name={name}
            inputMode={inputMode}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            maxLength={maxLength}
            max={max}
            className={claseInput(error, touched)}
        />
        {error && touched && <FieldError error={error} touched={touched} />}
    </div>
);

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
        tipo_beneficiario: 'Persona',
        necesidad: '',
        descripcion: '',
        habilidades: '',
        disponibilidad: 'Fines de semana',
    });

    const [rolElegido, setRolElegido] = useState<RolParticipacion>('Donante');
    const [aceptarTerminos, setAceptarTerminos] = useState<boolean>(false);
    const [mostrarContraseña, setMostrarContraseña] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [errores, setErrores] = useState<Errores>({});
    const [touched, setTouched] = useState<Touched>({});
    const [cargando, setCargando] = useState<boolean>(false);

    const navigate = useNavigate();
    const { exito, advertencia } = useToast();

    // =====================================================
    // HANDLERS
    // =====================================================

    const seleccionarRol = (rol: RolParticipacion) => {
        setRolElegido(rol);
        // Limpiar errores de campos específicos al alternar rol
        setErrores((prev) => {
            const copia = { ...prev };
            delete copia.necesidad;
            delete copia.tipo_beneficiario;
            delete copia.descripcion;
            delete copia.habilidades;
            delete copia.disponibilidad;
            return copia;
        });
        if (error) setError('');
    };

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ): void => {
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

    const handleBlur = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ): void => {
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

        const direccionCompleta = [formData.calle, formData.zona, formData.ciudad]
            .map((p) => (p || '').trim())
            .filter(Boolean)
            .join(', ');

        const erroresEncontrados = validarFormularioCompleto(
            { ...formData, direccion: direccionCompleta },
            rolElegido,
            false
        );

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
            const payload: Record<string, any> = {
                nombre: formData.nombre.trim(),
                paterno: formData.paterno.trim(),
                materno: formData.materno.trim() || undefined,
                correo: formData.correo.toLowerCase().trim(),
                telefono: formData.telefono.trim(),
                contraseña: formData.contraseña,
                ci_nit: formData.ci_nit.trim() || undefined,
                calle: formData.calle.trim() || undefined,
                zona: formData.zona.trim() || undefined,
                ciudad: formData.ciudad.trim() || undefined,
                direccion: direccionCompleta || undefined,
                rol: rolElegido,
                edad,
            };

            if (rolElegido === 'Beneficiario') {
                payload.tipo_beneficiario = formData.tipo_beneficiario;
                payload.necesidad = formData.necesidad.trim();
                payload.descripcion = formData.descripcion.trim() || undefined;
            } else if (rolElegido === 'Voluntario') {
                payload.habilidades = formData.habilidades.trim() || 'General';
                payload.disponibilidad = formData.disponibilidad.trim() || 'Fines de semana';
            }

            const res = await axios.post(`${apiUrl}/auth/registrar`, payload);
            const mensajeServidor = res.data?.mensaje;

            if (rolElegido === 'Voluntario') {
                advertencia(
                    mensajeServidor || 'Tu solicitud de voluntariado quedó registrada y está pendiente de aprobación por el coordinador.',
                    'Solicitud pendiente'
                );
            } else if (rolElegido === 'Beneficiario') {
                exito(
                    mensajeServidor || 'Solicitud de beneficiario registrada con éxito. Queda en revisión.',
                    'En revisión'
                );
            } else {
                exito(
                    mensajeServidor || 'Cuenta de donante creada con éxito.',
                    '¡Bienvenido Donante!'
                );
            }

            void navigate('/login');
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

    // Props comunes de cada campo
    const comunes = { onChange: handleChange, onBlur: handleBlur };

    return (
        <div className="relative min-h-dvh w-full overflow-x-clip bg-night text-cream">
            {/* =====================================================
                FONDO CONTINUO — imagen a pantalla completa (Igual al Login)
                ===================================================== */}
            <img
                src="/images/auth-complex.jpg"
                alt=""
                aria-hidden="true"
                className="fixed inset-0 h-full w-full object-cover object-center opacity-85"
            />
            <div
                aria-hidden="true"
                className="fixed inset-0 bg-linear-to-r from-night/95 via-night/75 to-night/30"
            />
            <div
                aria-hidden="true"
                className="fixed inset-0 bg-linear-to-t from-night/85 via-night/15 to-night/50"
            />
            <div aria-hidden="true" className="grid-paper-light pointer-events-none fixed inset-0 opacity-40" />
            <div
                aria-hidden="true"
                className="motion-safe:animate-float-slow pointer-events-none fixed -top-40 right-[12%] h-[820px] w-[520px] rounded-full bg-gold/[0.12] blur-[140px]"
            />

            <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[1280px] flex-col px-5 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-[max(1rem,env(safe-area-inset-top,0px))] sm:px-8 lg:px-10">
                {/* Barra superior (Igual al Login) */}
                <header className="flex items-center justify-between">
                    <Link
                        to="/"
                        className="group flex min-w-0 items-center gap-2.5 rounded-xl sm:gap-3"
                        title="Ir al inicio"
                        aria-label="Donaciones y Voluntariados — Inicio"
                    >
                        <IconLogo className="h-9 w-9 shrink-0 transition-transform duration-300 ease-out-soft motion-safe:group-hover:rotate-[-4deg] sm:h-10 sm:w-10" />
                        <span className="hidden min-w-0 flex-col leading-none sm:flex">
                            <span className="font-display text-[13.5px] font-bold tracking-[-0.01em] text-cream">
                                Donaciones
                            </span>
                            <span className="font-display text-[13.5px] font-bold tracking-[-0.01em] text-gold">&amp; Voluntariados</span>
                        </span>
                    </Link>

                    <Link
                        to="/"
                        aria-label="Volver al inicio"
                        className="press inline-flex shrink-0 items-center gap-2 rounded-xl border border-cream/15 bg-cream/[0.03] p-2.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-cream/70 hover:border-cream/30 hover:bg-cream/[0.07] hover:text-cream sm:px-3.5 sm:py-2"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="hidden sm:inline">Volver</span>
                    </Link>
                </header>

                <main className="grid flex-1 items-center gap-10 py-4 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12 lg:py-4">
                    {/* COLUMNA IZQUIERDA: mensaje (Igual al Login) */}
                    <div className="hidden lg:block">
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
                    <div className="mx-auto w-full max-w-[480px] lg:max-w-[680px]">
                        <div className="anim-rise relative flex h-[min(680px,calc(100dvh_-_6.5rem))] min-h-0 w-full flex-col overflow-hidden rounded-[1.5rem] border border-border bg-surface-elevated p-4 shadow-deep sm:p-5">
                            <span
                                aria-hidden="true"
                                className="absolute inset-x-0 top-0 h-[3px] bg-linear-to-r from-accent via-accent/40 to-transparent"
                            />

                            {/* Encabezado: etiqueta + título + toggle en una sola fila */}
                            <div className="flex shrink-0 items-start justify-between gap-4 pb-2">
                                <div>
                                    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-text-muted">
                                        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                                        Nuevo registro
                                    </span>
                                    <h2 className="mt-1.5 font-display text-xl font-extrabold leading-none tracking-[-0.03em] text-text sm:text-[1.5rem]">
                                        Crear cuenta
                                    </h2>
                                    <p className="mt-1 text-[12px] leading-relaxed text-text-muted">
                                        Completá tus datos para empezar a participar.
                                    </p>
                                </div>
                                <ThemeToggle />
                            </div>

                            <form id="registro-form" onSubmit={(e) => void handleSubmit(e)} className="mt-2 min-h-0 flex-1 space-y-3 overflow-x-hidden overflow-y-auto overscroll-contain pb-5 pr-2 [scrollbar-gutter:stable]" noValidate>

                                {/* ROL: solo uno a la vez */}
                                <div>
                                    <h3 className={tituloSeccion}>
                                        <span className="h-px w-5 bg-accent" />
                                        Tipo de cuenta
                                    </h3>
                                    <p id="registro-rol-texto" className="mt-1.5 text-[13px] leading-relaxed text-text-muted">
                                        Seleccioná cómo deseás participar en la plataforma:
                                    </p>

                                    <div
                                        role="radiogroup"
                                        aria-labelledby="registro-rol-texto"
                                        className="mt-2.5 grid grid-cols-3 gap-2 sm:gap-3"
                                    >
                                        {OPCIONES_ROL.map((op) => {
                                            const activo = rolElegido === op.valor;
                                            return (
                                                <button
                                                    key={op.valor}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={activo}
                                                    onClick={() => seleccionarRol(op.valor)}
                                                    className={`press flex flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-2.5 text-center transition-colors
                                                        ${activo
                                                            ? 'border-primary bg-primary text-on-primary shadow-soft'
                                                            : 'border-border bg-surface text-text-muted hover:border-primary/50 hover:text-text'
                                                        }`}
                                                >
                                                    <span className="text-[12px] font-bold uppercase tracking-[0.12em]">
                                                        {op.titulo}
                                                    </span>
                                                    <span className={`hidden text-[10px] font-medium sm:block ${activo ? 'text-on-primary/80' : 'text-text-subtle'}`}>
                                                        {op.detalle}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* BANNERS SEGÚN EL ROL ELEGIDO */}
                                    {rolElegido === 'Donante' && (
                                        <div
                                            role="status"
                                            className="anim-fade mt-2.5 flex items-center gap-2 rounded-xl border border-success/30 bg-success-soft px-3 py-2 text-[12px] font-medium text-text"
                                        >
                                            <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
                                            <span>
                                                Como <strong>Donante</strong> tu cuenta se activa inmediatamente para donar y ubicar puntos de recojo en el mapa.
                                            </span>
                                        </div>
                                    )}

                                    {rolElegido === 'Beneficiario' && (
                                        <div
                                            role="status"
                                            className="anim-fade mt-2.5 flex items-center gap-2 rounded-xl border border-info/40 bg-info-soft px-3 py-2 text-[12px] font-medium text-text"
                                        >
                                            <span className="h-2 w-2 shrink-0 rounded-full bg-info" />
                                            <span>
                                                Como <strong>Beneficiario</strong> completá tus datos de solicitud para que el equipo evalúe la entrega de ayuda.
                                            </span>
                                        </div>
                                    )}

                                    {rolElegido === 'Voluntario' && (
                                        <div
                                            role="status"
                                            className="anim-fade mt-2.5 flex items-center gap-2 rounded-xl border border-warning/40 bg-warning-soft px-3 py-2 text-[12px] font-medium text-text"
                                        >
                                            <span className="h-2 w-2 shrink-0 rounded-full bg-warning" />
                                            <span>
                                                Tu cuenta quedará en <strong>solicitud pendiente</strong> hasta que el coordinador voluntario apruebe tu postulación.
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* FILA 1: NOMBRES + PATERNO + MATERNO */}
                                <div className="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-3">
                                    <Campo
                                        id="registro-nombre" name="nombre" label="Nombres *"
                                        placeholder="Ej: Juan Carlos" maxLength={50}
                                        value={formData.nombre} error={errores.nombre} touched={touched.nombre}
                                        {...comunes}
                                    />
                                    <Campo
                                        id="registro-paterno" name="paterno" label="Apellido paterno *"
                                        placeholder="Perez" maxLength={50}
                                        value={formData.paterno} error={errores.paterno} touched={touched.paterno}
                                        {...comunes}
                                    />
                                    <Campo
                                        id="registro-materno" name="materno" label="Apellido materno"
                                        placeholder="Opcional" maxLength={50}
                                        value={formData.materno} error={errores.materno} touched={touched.materno}
                                        {...comunes}
                                    />
                                </div>

                                {/* FILA 2: CI/NIT + TELÉFONO + FECHA */}
                                <div className="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-3">
                                    <Campo
                                        id="registro-ci" name="ci_nit" label="CI / NIT *" inputMode="numeric"
                                        placeholder="1234567" maxLength={15}
                                        value={formData.ci_nit} error={errores.ci_nit} touched={touched.ci_nit}
                                        {...comunes}
                                    />
                                    <Campo
                                        id="registro-telefono" name="telefono" label="Teléfono *"
                                        type="tel" inputMode="numeric"
                                        placeholder="71234567" maxLength={8}
                                        value={formData.telefono} error={errores.telefono} touched={touched.telefono}
                                        {...comunes}
                                    />
                                    <Campo
                                        id="registro-fecha" name="fecha_nacimiento" type="date"
                                        label={
                                            <>
                                                Nacimiento *
                                                {formData.fecha_nacimiento && edadCalculada !== null && (
                                                    <span className="ml-1.5 normal-case tracking-normal text-primary">
                                                        ({edadCalculada} años)
                                                    </span>
                                                )}
                                            </>
                                        }
                                        max={fechaMaximaStr}
                                        value={formData.fecha_nacimiento}
                                        error={errores.fecha_nacimiento} touched={touched.fecha_nacimiento}
                                        {...comunes}
                                    />
                                </div>

                                {/* DIRECCIÓN: CALLE (2 cols) + ZONA + CIUDAD en una sola fila */}
                                <div className="pt-1">
                                    <h3 className={tituloSeccion}>
                                        <span className="h-px w-5 bg-accent" />
                                        Dirección
                                    </h3>

                                    <div className="mt-2.5 grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-4">
                                        <Campo
                                            className="sm:col-span-2"
                                            id="registro-calle" name="calle" label="Calle / Avenida"
                                            placeholder="Ej: Av. 6 de Agosto #1234" maxLength={150}
                                            value={formData.calle} error={errores.calle} touched={touched.calle}
                                            {...comunes}
                                        />
                                        <Campo
                                            id="registro-zona" name="zona" label="Zona / Barrio"
                                            placeholder="Ej: Sopocachi" maxLength={100}
                                            value={formData.zona} error={errores.zona} touched={touched.zona}
                                            {...comunes}
                                        />
                                        <Campo
                                            id="registro-ciudad" name="ciudad" label="Ciudad"
                                            placeholder="Ej: La Paz" maxLength={100}
                                            value={formData.ciudad} error={errores.ciudad} touched={touched.ciudad}
                                            {...comunes}
                                        />
                                    </div>
                                </div>

                                {/* CAMPOS ESPECÍFICOS PARA BENEFICIARIO */}
                                {rolElegido === 'Beneficiario' && (
                                    <div className="anim-fade space-y-3 rounded-2xl border border-info/30 bg-info-soft/30 p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-info text-[11px] text-white font-bold">
                                                🤝
                                            </span>
                                            <h4 className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-text">
                                                Datos de solicitud de beneficiario
                                            </h4>
                                        </div>

                                        <div>
                                            <label className={etiquetaCampo}>Tipo de beneficiario *</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {(['Persona', 'Familia', 'Institucion'] as const).map((tipo) => {
                                                    const sel = formData.tipo_beneficiario === tipo;
                                                    return (
                                                        <button
                                                            key={tipo}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData((prev) => ({ ...prev, tipo_beneficiario: tipo }));
                                                                setTouched((prev) => ({ ...prev, tipo_beneficiario: true }));
                                                            }}
                                                            className={`press rounded-xl border py-2 text-center text-xs font-bold transition-all ${
                                                                sel
                                                                    ? 'border-primary bg-primary text-on-primary shadow-soft'
                                                                    : 'border-border bg-surface text-text-muted hover:border-border-strong hover:text-text'
                                                            }`}
                                                        >
                                                            {tipo === 'Institucion' ? 'Institución' : tipo}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {errores.tipo_beneficiario && touched.tipo_beneficiario && (
                                                <FieldError error={errores.tipo_beneficiario} touched={touched.tipo_beneficiario} />
                                            )}
                                        </div>

                                        <div>
                                            <label className={etiquetaCampo} htmlFor="registro-necesidad">
                                                Necesidad principal *
                                            </label>
                                            <input
                                                id="registro-necesidad"
                                                type="text"
                                                name="necesidad"
                                                value={formData.necesidad}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="Ej: Canasta familiar, medicamentos, ropa de abrigo..."
                                                maxLength={150}
                                                className={claseInput(errores.necesidad, touched.necesidad)}
                                            />
                                            {errores.necesidad && touched.necesidad && (
                                                <FieldError error={errores.necesidad} touched={touched.necesidad} />
                                            )}
                                        </div>

                                        <div>
                                            <label className={etiquetaCampo} htmlFor="registro-descripcion">
                                                Detalle de la situación (opcional)
                                            </label>
                                            <textarea
                                                id="registro-descripcion"
                                                name="descripcion"
                                                rows={2}
                                                value={formData.descripcion}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="Explicá brevemente tu requerimiento o situación para la evaluación..."
                                                maxLength={2000}
                                                className={claseInput(errores.descripcion, touched.descripcion)}
                                            />
                                            {errores.descripcion && touched.descripcion && (
                                                <FieldError error={errores.descripcion} touched={touched.descripcion} />
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* CAMPOS ESPECÍFICOS PARA VOLUNTARIO */}
                                {rolElegido === 'Voluntario' && (
                                    <div className="anim-fade space-y-3 rounded-2xl border border-warning/40 bg-warning-soft/30 p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-warning text-[11px] text-night font-bold">
                                                🙋
                                            </span>
                                            <h4 className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-text">
                                                Postulación de Voluntariado
                                            </h4>
                                        </div>

                                        <p className="text-xs leading-relaxed text-text-muted">
                                            Tu registro se creará como <strong className="text-text">solicitud pendiente</strong>. El coordinador de voluntarios revisará tu perfil para autorizar tu acceso.
                                        </p>

                                        <div>
                                            <label className={etiquetaCampo} htmlFor="registro-disponibilidad">
                                                Disponibilidad de tiempo *
                                            </label>
                                            <select
                                                id="registro-disponibilidad"
                                                name="disponibilidad"
                                                value={formData.disponibilidad}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className={claseInput(errores.disponibilidad, touched.disponibilidad)}
                                            >
                                                <option value="Fines de semana">Fines de semana</option>
                                                <option value="Tardes (14:00 - 19:00)">Tardes (14:00 - 19:00)</option>
                                                <option value="Mañanas (08:00 - 12:00)">Mañanas (08:00 - 12:00)</option>
                                                <option value="Tiempo completo">Tiempo completo</option>
                                                <option value="Flexible / A convenir">Flexible / A convenir</option>
                                            </select>
                                            {errores.disponibilidad && touched.disponibilidad && (
                                                <FieldError error={errores.disponibilidad} touched={touched.disponibilidad} />
                                            )}
                                        </div>

                                        <div>
                                            <label className={etiquetaCampo} htmlFor="registro-habilidades">
                                                Habilidades y áreas de apoyo * (separadas por comas)
                                            </label>
                                            <input
                                                id="registro-habilidades"
                                                type="text"
                                                name="habilidades"
                                                value={formData.habilidades}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="Ej: Logística, Primeros Auxilios, Conducción"
                                                maxLength={200}
                                                className={claseInput(errores.habilidades, touched.habilidades)}
                                            />
                                            {errores.habilidades && touched.habilidades && (
                                                <FieldError error={errores.habilidades} touched={touched.habilidades} />
                                            )}

                                            {/* Sugerencias cliqueables */}
                                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                                <span className="text-[10px] font-semibold text-text-muted">Agregar:</span>
                                                {['Logística', 'Primeros Auxilios', 'Transporte', 'Atención Social', 'Cocina', 'Organización'].map((sug) => (
                                                    <button
                                                        key={sug}
                                                        type="button"
                                                        onClick={() => {
                                                            const actual = formData.habilidades
                                                                ? formData.habilidades.split(',').map((s) => s.trim()).filter(Boolean)
                                                                : [];
                                                            if (!actual.includes(sug)) {
                                                                const nueva = [...actual, sug].join(', ');
                                                                setFormData((prev) => ({ ...prev, habilidades: nueva }));
                                                                setTouched((prev) => ({ ...prev, habilidades: true }));
                                                                const err = validarCampo('habilidades', nueva, { ...formData, habilidades: nueva });
                                                                setErrores((prev) => ({ ...prev, habilidades: err }));
                                                            }
                                                        }}
                                                        className="press rounded-lg border border-border bg-surface px-2 py-0.5 text-[10.5px] font-medium text-text-muted transition-colors hover:border-accent hover:text-text"
                                                    >
                                                        + {sug}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* CUENTA */}
                                <div className="pt-1">
                                    <h3 className={tituloSeccion}>
                                        <span className="h-px w-5 bg-accent" />
                                        Cuenta
                                    </h3>

                                    <div className="mt-2.5 grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2">
                                        <Campo
                                            id="registro-correo" name="correo" label="Correo electrónico *"
                                            type="email"
                                            placeholder="nombre@correo.com" maxLength={150}
                                            value={formData.correo} error={errores.correo} touched={touched.correo}
                                            {...comunes}
                                        />

                                        {/* CONTRASEÑA */}
                                        <div>
                                            <label className={etiquetaCampo} htmlFor="registro-password">
                                                Contraseña *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="registro-password"
                                                    type={mostrarContraseña ? 'text' : 'password'}
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
                                            {errores.contraseña && touched.contraseña && (
                                                <FieldError error={errores.contraseña} touched={touched.contraseña} />
                                            )}
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

                            </form>

                            {/* Acciones fijas: siempre accesibles mientras se desplazan los campos */}
                            <div className="mt-2 shrink-0 border-t border-border pt-3">
                                {error && (
                                    <div role="alert" className="anim-fade mb-3 flex items-start gap-2.5 rounded-xl border border-error/30 bg-error-soft p-2.5 text-xs font-medium text-error">
                                        <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                        </svg>
                                        <span>{error}</span>
                                    </div>
                                )}
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-2.5">
                                        <input
                                            type="checkbox"
                                            id="terminos"
                                            checked={aceptarTerminos}
                                            onChange={(e) => setAceptarTerminos(e.target.checked)}
                                            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary"
                                        />
                                        <label htmlFor="terminos" className="cursor-pointer text-xs leading-relaxed text-text-muted">
                                            Acepto los{' '}
                                            <span className="font-semibold text-primary">términos y condiciones</span>
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        form="registro-form"
                                        disabled={cargando}
                                        className={`press flex w-full shrink-0 items-center justify-center gap-2.5 rounded-xl px-6 py-3 text-[12px] font-bold uppercase tracking-[0.12em] shadow-soft sm:w-auto
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
                                </div>
                            </div>

                            <p className="mt-3 shrink-0 border-t border-border pt-3 text-center text-[13px] text-text-muted">
                                ¿Ya tenés cuenta?{' '}
                                <Link
                                    to="/login"
                                    className="rounded font-bold text-primary underline-offset-4 hover:text-accent-text hover:underline"
                                >
                                    Iniciá sesión
                                </Link>
                            </p>
                        </div>

                        <p className="mt-3 text-center text-[9.5px] font-semibold uppercase tracking-[0.18em] text-cream/40">
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