import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { API_URL } from '../api/client';
import { useAuth } from '../context/AuthContext';
import FieldError from '../components/ui/FieldError';
import MiUbicacion from '../components/mapa/MiUbicacion';
import {
    validarCampo,
    esContraseñaSegura,
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
    calle: string;
    zona: string;
    ciudad: string;
}

interface DatosRol {
    rol: string;
    habilidades: string[];
    disponibilidad: string;
    estado_voluntario: string | null;
    estado_beneficiario: string | null;
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
    foto_url?: string | null;
    direccion?: string | null;
    calle?: string;
    zona?: string;
    ciudad?: string;
    ubi_latitud?: string | number | null;
    ubi_longitud?: string | number | null;
    rol?: string;
    habilidades?: string[];
    disponibilidad?: string | null;
    estado_voluntario?: string | null;
    estado_beneficiario?: string | null;
}

interface PerfilUpdateResponse {
    token?: string;
    perfil?: Record<string, unknown>;
}

type Pestana = 'personal' | 'ubicacion' | 'seguridad';

interface Coordenadas {
    lat: number;
    lng: number;
}

interface PerfilSnapshot {
    formData: FormData;
    datosRol: DatosRol;
    coords: Coordenadas | null;
    previewFoto: string | null;
}

// =====================================================
// ESTILOS COMPARTIDOS
// =====================================================
const etiquetaCampo =
    'mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-text-muted';

const tituloSeccion =
    'flex items-center gap-2.5 font-display text-base font-bold tracking-[-0.02em] text-text';

const subtituloSeccion = 'mt-1.5 mb-5 text-sm text-text-muted';

const CAMPOS_PERSONALES = ['nombre', 'paterno', 'materno', 'correo', 'celular'];

// =====================================================
// UTILIDADES
// =====================================================
const aNumero = (valor: unknown): number | null => {
    if (valor === null || valor === undefined || valor === '') return null;
    const n = Number(valor);
    return Number.isFinite(n) ? n : null;
};

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
        calle: '',
        zona: '',
        ciudad: ''
    });

    const [mensaje, setMensaje] = useState<Mensaje>({ texto: '', tipo: '' });
    const [errores, setErrores] = useState<Errores>({});
    const [touched, setTouched] = useState<Touched>({});
    const [cargando, setCargando] = useState<boolean>(false);
    const [cargandoInicial, setCargandoInicial] = useState<boolean>(true);
    const [pestana, setPestana] = useState<Pestana>('personal');
    const [coords, setCoords] = useState<Coordenadas | null>(null);
    const [archivoFoto, setArchivoFoto] = useState<File | null>(null);
    const [previewFoto, setPreviewFoto] = useState<string | null>(null);
    const inputFotoRef = useRef<HTMLInputElement>(null);
    const perfilInicialRef = useRef<PerfilSnapshot | null>(null);

    // Datos específicos del rol
    const [datosRol, setDatosRol] = useState<DatosRol>({
        rol: '',
        habilidades: [],
        disponibilidad: '',
        estado_voluntario: null,
        estado_beneficiario: null,
    });
    const apiUrl = API_URL;

    // =====================================================
    // FLAGS DE ROL
    // =====================================================
    const rolesPerfil = (usuario?.roles || [datosRol.rol || usuario?.rol || '']).map((r) => r.toLowerCase());
    const esVoluntario = rolesPerfil.includes('voluntario') || rolesPerfil.includes('coordinador');
    const esDonante = Boolean(usuario?.es_donante) || rolesPerfil.includes('donante');

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

                const formInicial: FormData = {
                    nombre: datos.nombre || '',
                    paterno: datos.paterno || '',
                    materno: datos.materno || '',
                    correo: datos.correo || '',
                    celular: datos.telefono || '',
                    passwordActual: '', passwordNueva: '', passwordConfirmar: '',
                    calle: datos.calle || datos.direccion || '',
                    zona: datos.zona || '',
                    ciudad: datos.ciudad || ''
                };
                setFormData(formInicial);

                // Los DECIMAL suelen llegar como texto desde el backend
                const lat = aNumero(datos.ubi_latitud);
                const lng = aNumero(datos.ubi_longitud);
                const coordsIniciales = lat !== null && lng !== null ? { lat, lng } : null;
                setCoords(coordsIniciales);

                let fotoInicial: string | null = null;
                if (datos.foto_url) {
                    const baseUrl = apiUrl.replace(/\/api\/?$/, '');
                    fotoInicial = datos.foto_url.startsWith('http') ? datos.foto_url : `${baseUrl}${datos.foto_url}`;
                }
                setPreviewFoto(fotoInicial);

                const rolInicial: DatosRol = {
                    rol: datos.rol || '',
                    habilidades: datos.habilidades || [],
                    disponibilidad: datos.disponibilidad || '',
                    estado_voluntario: datos.estado_voluntario ?? null,
                    estado_beneficiario: datos.estado_beneficiario ?? null,
                };
                setDatosRol(rolInicial);
                perfilInicialRef.current = { formData: formInicial, datosRol: rolInicial, coords: coordsIniciales, previewFoto: fotoInicial };

            } catch (error) {
                console.error("Error al cargar perfil", error);
                setMensaje({ texto: 'No se pudo cargar tu perfil. Revisá tu conexión e intentá nuevamente.', tipo: 'error' });
            } finally {
                setCargandoInicial(false);
            }
        };

        if (token) void fetchPerfil();
        else setCargandoInicial(false);
    }, [token]);

    // =====================================================
    // HANDLERS
    // =====================================================

    const handleFotoSeleccionada = (e: ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setMensaje({ texto: 'Por favor seleccioná un archivo de imagen válido.', tipo: 'error' });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setMensaje({ texto: 'La imagen no debe superar los 5MB.', tipo: 'error' });
            return;
        }
        setArchivoFoto(file);
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setPreviewFoto(reader.result);
            }
        };
        reader.readAsDataURL(file);
        setMensaje({ texto: 'Foto seleccionada. Guardá los cambios para actualizar tu perfil.', tipo: 'exito' });
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;

        let valorFiltrado = value;
        if (name === 'celular') {
            valorFiltrado = value.replace(/[^0-9]/g, '');
        }

        const nuevosDatos = { ...formData, [name]: valorFiltrado };
        setFormData(nuevosDatos);
        setTouched((prev) => ({ ...prev, [name]: true }));

        const camposValidables = ['nombre', 'paterno', 'materno', 'correo', 'celular', 'calle', 'zona', 'ciudad'];
        if (camposValidables.includes(name)) {
            const err = validarCampo(name === 'celular' ? 'telefono' : name, valorFiltrado, nuevosDatos);
            setErrores((prev) => ({ ...prev, [name]: err }));
        }
    };

    const handleBlur = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));

        const camposValidables = ['nombre', 'paterno', 'materno', 'correo', 'celular', 'calle', 'zona', 'ciudad'];
        if (camposValidables.includes(name)) {
            const err = validarCampo(name === 'celular' ? 'telefono' : name, value, formData);
            setErrores((prev) => ({ ...prev, [name]: err }));
        }
    };

    const irASeguridad = (): void => {
        setPestana('seguridad');
        document.getElementById('perfil-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

        // Validaciones de contraseña (todos los roles)
        if (formData.passwordNueva || formData.passwordConfirmar) {
            if (!formData.passwordActual) {
                setPestana('seguridad');
                setMensaje({ texto: 'Debés ingresar tu contraseña actual para cambiarla.', tipo: 'error' });
                return;
            }
            const validPwd = esContraseñaSegura(formData.passwordNueva);
            if (!validPwd.valido) {
                setPestana('seguridad');
                setMensaje({ texto: validPwd.error ?? 'Contraseña inválida.', tipo: 'error' });
                return;
            }
            if (formData.passwordNueva !== formData.passwordConfirmar) {
                setPestana('seguridad');
                setMensaje({ texto: 'Las contraseñas nuevas no coinciden.', tipo: 'error' });
                return;
            }
        }

        if (Object.keys(erroresEncontrados).length > 0) {
            setErrores(erroresEncontrados);
            const tocados: Touched = {};
            Object.keys(erroresEncontrados).forEach((k) => { tocados[k] = true; });
            setTouched(tocados);

            // Llevar al usuario a la pestaña donde está el primer error
            const hayErrorPersonal = Object.keys(erroresEncontrados).some((k) => CAMPOS_PERSONALES.includes(k));
            setPestana(hayErrorPersonal ? 'personal' : 'ubicacion');

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

            if (esDonante) {
                dataToSend.append('calle', formData.calle);
                dataToSend.append('zona', formData.zona);
                dataToSend.append('ciudad', formData.ciudad);
            }

            if (formData.passwordActual) dataToSend.append('passwordActual', formData.passwordActual);
            if (formData.passwordNueva) dataToSend.append('passwordNueva', formData.passwordNueva);
            if (archivoFoto) dataToSend.append('foto', archivoFoto);

            const respuesta = await axios.put<PerfilUpdateResponse>(
                `${apiUrl}/usuarios/perfil`,
                dataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMensaje({ texto: 'Perfil actualizado correctamente.', tipo: 'exito' });

            if (respuesta.data.token) {
                login(respuesta.data.token);
            }

            const fotoGuardada = respuesta.data.perfil?.foto_url;
            let nuevaFotoUrl = previewFoto;
            if (typeof fotoGuardada === 'string' && fotoGuardada) {
                const baseUrl = apiUrl.replace(/\/api\/?$/, '');
                nuevaFotoUrl = /^https?:\/\//i.test(fotoGuardada) ? fotoGuardada : `${baseUrl}${fotoGuardada}`;
                setPreviewFoto(nuevaFotoUrl);
                setArchivoFoto(null);
                if (inputFotoRef.current) inputFotoRef.current.value = '';
            }
            if (perfilInicialRef.current) {
                perfilInicialRef.current = {
                    ...perfilInicialRef.current,
                    formData: {
                        ...formData,
                        passwordActual: '',
                        passwordNueva: '',
                        passwordConfirmar: '',
                    },
                    datosRol: { ...datosRol },
                    coords,
                    previewFoto: nuevaFotoUrl,
                };
            }
            window.dispatchEvent(new Event('perfil-foto-actualizada'));

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

    const cancelarCambios = (): void => {
        const inicial = perfilInicialRef.current;
        if (!inicial) return;
        setFormData({ ...inicial.formData });
        setDatosRol({ ...inicial.datosRol });
        setCoords(inicial.coords);
        setPreviewFoto(inicial.previewFoto);
        setArchivoFoto(null);
        setErrores({});
        setTouched({});
        setMensaje({ texto: '', tipo: '' });
        setPestana('personal');
        if (inputFotoRef.current) inputFotoRef.current.value = '';
    };

    const actualizarCoordenadasGuardadas = (nuevas: Coordenadas): void => {
        setCoords(nuevas);
        if (perfilInicialRef.current) {
            perfilInicialRef.current = { ...perfilInicialRef.current, coords: nuevas };
        }
    };

    // =====================================================
    // ENLACE A GOOGLE MAPS
    // Usa las coordenadas si existen; si no, busca por la dirección escrita.
    // =====================================================
    const direccionTexto = [formData.calle, formData.zona, formData.ciudad].filter(Boolean).join(', ');
    const enlaceMaps = coords
        ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
        : direccionTexto
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionTexto)}`
            : null;

    // =====================================================
    // PESTAÑAS
    // =====================================================
    const pestanas: { id: Pestana; etiqueta: string }[] = [
        { id: 'personal', etiqueta: 'Datos personales' },
        ...(esDonante ? [{ id: 'ubicacion' as Pestana, etiqueta: 'Dirección y ubicación' }] : []),
        { id: 'seguridad', etiqueta: 'Seguridad' }
    ];

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
                    <div className="relative group">
                        <div className="flex h-20 w-20 shrink-0 overflow-hidden items-center justify-center rounded-3xl border border-cream/15 bg-gold font-display text-3xl font-extrabold text-night shadow-deep sm:h-24 sm:w-24 sm:text-4xl">
                            {previewFoto ? (
                                <img src={previewFoto} alt="Perfil" className="h-full w-full object-cover" />
                            ) : (
                                iniciales
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => inputFotoRef.current?.click()}
                            title="Subir o cambiar foto de perfil"
                            aria-label="Subir foto de perfil"
                            className="press absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gold text-night shadow-lift transition hover:scale-110 hover:bg-gold-bright"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                        <input
                            ref={inputFotoRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFotoSeleccionada}
                            className="hidden"
                        />
                    </div>

                    <div className="min-w-0 flex-1">
                        <span className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/10 px-3 py-1 text-[9.5px] font-bold uppercase tracking-[0.18em] text-cream/85 backdrop-blur-md">
                            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                            {usuario?.roles?.join(' · ') || datosRol.rol || usuario?.rol || 'Usuario'}
                        </span>

                        <h1 className="mt-3 truncate font-display text-2xl font-extrabold leading-tight tracking-[-0.03em] text-cream md:text-[2rem]">
                            {formData.nombre || 'Usuario'} {formData.paterno}
                        </h1>

                        <p className="mt-1.5 truncate text-sm text-cream/60">
                            {formData.correo || 'Sin correo registrado'}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-cream/45">
                            {formData.ciudad && <span>{formData.ciudad}</span>}
                            {formData.ciudad && (
                                <span className="h-1 w-1 rounded-full bg-cream/25" />
                            )}
                            <span>Miembro de la red solidaria</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={irASeguridad}
                        className="press inline-flex shrink-0 items-center gap-2 rounded-xl border border-cream/20 bg-cream/[0.06] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-cream/85 hover:border-gold/50 hover:text-gold-bright"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Seguridad
                    </button>
                </div>
            </section>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">

                {/* =====================================================
                    COLUMNA LATERAL
                    ===================================================== */}
                <aside className="space-y-5 lg:col-span-1">

                    {esVoluntario && (
                        <div className="anim-rise rounded-2xl border border-border bg-surface-elevated p-5 shadow-soft [animation-delay:80ms]">
                            <span className="block text-[9.5px] font-bold uppercase tracking-[0.2em] text-accent-text">
                                Perfil de voluntario
                            </span>
                            <div className="mt-4 space-y-3.5">
                                <div className="text-sm">
                                    <span className="block text-text-muted">Habilidades</span>
                                    <span className="font-semibold text-text">{datosRol.habilidades.join(', ') || '—'}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3 text-sm">
                                    <span className="shrink-0 text-text-muted">Disponibilidad</span>
                                    <span className="text-right font-semibold text-text">{datosRol.disponibilidad || '—'}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3 text-sm">
                                    <span className="shrink-0 text-text-muted">Estado</span>
                                    <span className="text-right font-semibold text-text">{datosRol.estado_voluntario || '—'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {esDonante && (
                        <div className="anim-rise rounded-2xl border border-border bg-surface-elevated p-5 shadow-soft [animation-delay:80ms]">
                            <span className="block text-[9.5px] font-bold uppercase tracking-[0.2em] text-accent-text">
                                Perfil de Donante
                            </span>
                            <div className="mt-4 space-y-3.5">
                                <div className="flex items-center justify-between gap-3 text-sm">
                                    <span className="shrink-0 text-text-muted">Tipo</span>
                                    <span className="text-right font-semibold text-text">Donante Activo</span>
                                </div>
                                <div className="flex items-center justify-between gap-3 text-sm">
                                    <span className="shrink-0 text-text-muted">Geolocalización</span>
                                    <span className="text-right font-semibold text-emerald-600 dark:text-emerald-400">
                                        Puntos y Recojo
                                    </span>
                                </div>
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
                            {direccionTexto && (
                                <li className="flex items-start gap-2.5 text-sm">
                                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-text-muted">{direccionTexto}</span>
                                </li>
                            )}
                        </ul>

                        {/* Botón: abrir en Google Maps */}
                        {enlaceMaps && (
                            <a
                                href={enlaceMaps}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="press mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted hover:border-primary/50 hover:text-primary"
                            >
                                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Abrir en Google Maps
                            </a>
                        )}
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
                    FORMULARIO CON PESTAÑAS
                    ===================================================== */}
                <div id="perfil-form" className="anim-rise scroll-mt-24 lg:col-span-2 [animation-delay:60ms]">
                    <form onSubmit={(e) => void handleSubmit(e)} className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-soft" noValidate>

                        {/* Barra de pestañas */}
                        <div role="tablist" aria-label="Secciones del perfil" className="flex gap-1.5 overflow-x-auto border-b border-border p-3 md:px-6">
                            {pestanas.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    role="tab"
                                    id={`tab-${p.id}`}
                                    aria-selected={pestana === p.id}
                                    aria-controls={`panel-${p.id}`}
                                    onClick={() => setPestana(p.id)}
                                    className={`press whitespace-nowrap rounded-xl px-4 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.12em] transition-colors duration-200 ${
                                        pestana === p.id
                                            ? 'bg-primary-soft text-text'
                                            : 'text-text-muted hover:bg-surface hover:text-text'
                                    }`}
                                >
                                    {p.etiqueta}
                                </button>
                            ))}
                        </div>

                        {/* PANEL 1: DATOS PERSONALES */}
                        <div
                            role="tabpanel"
                            id="panel-personal"
                            aria-labelledby="tab-personal"
                            hidden={pestana !== 'personal'}
                            className="p-6 md:p-8"
                        >
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
                                <div>
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
                                <div>
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

                        {/* PANEL 2: DIRECCIÓN Y UBICACIÓN (CLIENTE / DONANTE) */}
                        {esDonante && (
                            <div
                                role="tabpanel"
                                id="panel-ubicacion"
                                aria-labelledby="tab-ubicacion"
                                hidden={pestana !== 'ubicacion'}
                            >
                                <div className="border-b border-border p-6 md:p-8">
                                        <h2 className={tituloSeccion}>
                                            <span aria-hidden="true" className="h-4 w-1 rounded-full bg-accent" />
                                            Dirección
                                        </h2>
                                        <p className={subtituloSeccion}>Actualizá tu dirección y ubicación en el mapa.</p>

                                        <div className="grid grid-cols-1 gap-x-5 gap-y-1 md:grid-cols-2">
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

                                <div className="p-6 md:p-8">
                                    <MiUbicacion coordenadas={coords} onActualizada={actualizarCoordenadasGuardadas} />
                                </div>
                            </div>
                        )}

                        {/* PANEL 3: CONTRASEÑA */}
                        <div
                            role="tabpanel"
                            id="panel-seguridad"
                            aria-labelledby="tab-seguridad"
                            hidden={pestana !== 'seguridad'}
                            className="p-6 md:p-8"
                        >
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
                        </div>

                        {/* PIE: MENSAJE + ACCIONES (siempre visible, sin importar la pestaña) */}
                        <div className="border-t border-border bg-surface p-6 md:px-8">
                            {mensaje.texto && (
                                <div
                                    role="alert"
                                    className={`anim-fade mb-5 flex items-start gap-2.5 rounded-xl border p-4 text-sm font-medium ${
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

                            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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
                                    onClick={cancelarCambios}
                                    className="press w-full rounded-xl border border-border bg-surface-elevated px-6 py-3 text-[12.5px] font-bold uppercase tracking-[0.1em] text-text-muted hover:border-border-strong hover:bg-surface-inset hover:text-text sm:w-auto"
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
