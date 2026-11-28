import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { campanaApi } from '../api/campana.api';
import api from '../api/client';
import type {
  Campana,
  CampanaFormDTO,
  Actividad,
  ActividadFormDTO,
  ParticipacionItem,
  EstadoCampana,
  TipoActividad,
} from '../types/campana.types';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface DonacionHistorial {
  id_donacion: number;
  codigo: string;
  tipo_donacion: string;
  modalidad: string;
  cantidad: number;
  cantidad_recibida: number;
  unidad: string;
  categoria: string;
  descripcion: string;
  fecha_donacion: string;
  campana_id: number | null;
  campana_nombre?: string;
  estado: string;
}

const Icono = {
  megaphone: (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  gift: (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  ),
  calendar: (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  clock: (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  pin: (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  heart: (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  list: (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  users: (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  star: (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  activity: (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  box: (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  close: (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  check: (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  alert: (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

const ETIQUETAS_TIPO_ACTIVIDAD: Record<string, string> = {
  CAMPANA: 'Campaña',
  SOLICITUD_AYUDA: 'Solicitud de Ayuda',
  INVENTARIO: 'Almacén / Inventario',
  GENERAL: 'General',
};

export default function CampanasPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const rol = (usuario?.rol || '').toLowerCase();
  const rolesArray: string[] = Array.isArray(usuario?.roles)
    ? usuario.roles.map((r: string) => r.toLowerCase())
    : [rol];
  const esAdmin = rol === 'admin' || rol === 'administrador' || rolesArray.includes('administrador');
  const esCoordinador = Boolean(usuario?.es_coordinador) || rol === 'coordinador' || esAdmin || rolesArray.includes('coordinador');
  const esVoluntario = rol === 'voluntario' || usuario?.estado_voluntario === 'Aprobado' || rolesArray.includes('voluntario');
  const esDonante = rol === 'donante' || rol === 'cliente' || rolesArray.includes('donante') || esAdmin;

  // Estados de datos
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [misParticipaciones, setMisParticipaciones] = useState<ParticipacionItem[]>([]);
  const [misDonaciones, setMisDonaciones] = useState<DonacionHistorial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Pestañas dinámicas según el rol (soporta multi-rol)
  const tabs = esAdmin
    ? ['campanas', 'actividades', 'mis-actividades', ...(misDonaciones.length > 0 ? ['mis-donaciones'] : [])]
    : esVoluntario && !esDonante && misDonaciones.length === 0
    ? ['actividades', 'mis-actividades', 'campanas']
    : ['campanas', 'mis-donaciones', 'actividades', 'mis-actividades'];

  const [pestaña, setPestaña] = useState<string>(() => {
    const solicitada = searchParams.get('seccion');
    return solicitada && tabs.includes(solicitada) ? solicitada : tabs[0];
  });

  // Filtros
  const [filtroTipoActividad, setFiltroTipoActividad] = useState<string>('TODAS');
  const [campanaFiltroActividades, setCampanaFiltroActividades] = useState<number | null>(null);

  // Modales
  const [modalCampanaAbierto, setModalCampanaAbierto] = useState(false);
  const [campanaEditando, setCampanaEditando] = useState<Campana | null>(null);
  const [formCampana, setFormCampana] = useState<CampanaFormDTO>({
    nombre: '',
    descripcion: '',
    portada_url: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: '',
    objetivo_recaudacion: '',
    estado: 'Planificada',
  });

  const [modalActividadAbierto, setModalActividadAbierto] = useState(false);
  const [actividadEditando, setActividadEditando] = useState<Actividad | null>(null);
  const [formActividad, setFormActividad] = useState<ActividadFormDTO>({
    nombre: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    hora_inicio: '09:00',
    hora_fin: '13:00',
    lugar: '',
    max_voluntarios: 10,
    tipo_actividad: 'CAMPANA',
    id_campana: '',
    estado: 'Planificada',
  });

  // Modal de Asistencia
  const [modalAsistenciaActividad, setModalAsistenciaActividad] = useState<Actividad | null>(null);
  const [voluntariosActividad, setVoluntariosActividad] = useState<ParticipacionItem[]>([]);
  const [cargandoVoluntarios, setCargandoVoluntarios] = useState(false);

  // Cargar datos
  const cargarTodo = async () => {
    setCargando(true);
    setError(null);
    try {
      const [camps, acts, misActs] = await Promise.all([
        campanaApi.listar().catch(() => []),
        campanaApi.listarActividades().catch(() => []),
        campanaApi.listarMisActividades().catch(() => []),
      ]);

      setCampanas(Array.isArray(camps) ? camps : []);
      setActividades(Array.isArray(acts) ? acts : []);
      setMisParticipaciones(Array.isArray(misActs) ? misActs : []);

      // Cargar donaciones del usuario autenticado (siempre con items de la respuesta paginada)
      try {
        const donRes = await api.get('/donaciones?limit=100');
        const raw = donRes.data;
        const donacionesData = Array.isArray(raw?.items)
          ? raw.items
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw)
          ? raw
          : [];
        setMisDonaciones(donacionesData);
      } catch (err) {
        console.warn('No se pudieron cargar donaciones en campanas:', err);
        setMisDonaciones([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar los datos del módulo.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  const notificar = (msg: string) => {
    setMensajeExito(msg);
    setTimeout(() => setMensajeExito(null), 3500);
  };

  // --- Campañas ---
  const abrirCrearCampana = () => {
    setCampanaEditando(null);
    setFormCampana({
      nombre: '',
      descripcion: '',
      portada_url: '',
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: '',
      objetivo_recaudacion: '',
      estado: 'Planificada',
    });
    setModalCampanaAbierto(true);
  };

  const abrirEditarCampana = (c: Campana) => {
    setCampanaEditando(c);
    setFormCampana({
      nombre: c.nombre,
      descripcion: c.descripcion || '',
      portada_url: c.portada_url || '',
      fecha_inicio: c.fecha_inicio,
      fecha_fin: c.fecha_fin || '',
      objetivo_recaudacion: c.objetivo_recaudacion ?? '',
      estado: c.estado,
    });
    setModalCampanaAbierto(true);
  };

  const guardarCampana = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: CampanaFormDTO = {
        ...formCampana,
        objetivo_recaudacion: formCampana.objetivo_recaudacion === '' ? undefined : Number(formCampana.objetivo_recaudacion),
        fecha_fin: formCampana.fecha_fin || undefined,
      };

      if (campanaEditando) {
        await campanaApi.actualizar(campanaEditando.id_campana, payload);
        notificar('Campaña actualizada exitosamente.');
      } else {
        await campanaApi.crear(payload);
        notificar('Campaña creada exitosamente.');
      }
      setModalCampanaAbierto(false);
      cargarTodo();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al guardar la campaña');
    }
  };

  const eliminarCampana = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas cancelar esta campaña? Quedará marcada como "Cancelada" y dejará de aparecer en la lista.')) return;
    try {
      await campanaApi.eliminar(id);
      notificar('Campaña cancelada/archivada exitosamente.');
      cargarTodo();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al cancelar la campaña');
    }
  };

  // --- Actividades ---
  const abrirCrearActividad = (idCampanaPrevia?: number) => {
    setActividadEditando(null);
    setFormActividad({
      nombre: '',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0],
      hora_inicio: '09:00',
      hora_fin: '13:00',
      lugar: '',
      max_voluntarios: 10,
      tipo_actividad: idCampanaPrevia ? 'CAMPANA' : 'CAMPANA',
      id_campana: idCampanaPrevia ?? (campanas.length > 0 ? campanas[0].id_campana : ''),
      estado: 'Planificada',
    });
    setModalActividadAbierto(true);
  };

  const abrirEditarActividad = (act: Actividad) => {
    setActividadEditando(act);
    setFormActividad({
      nombre: act.nombre,
      descripcion: act.descripcion || '',
      fecha: act.fecha,
      hora_inicio: act.hora_inicio,
      hora_fin: act.hora_fin,
      lugar: act.lugar,
      max_voluntarios: act.max_voluntarios,
      tipo_actividad: act.tipo_actividad,
      id_campana: act.campanas_asociadas && act.campanas_asociadas.length > 0 ? act.campanas_asociadas[0].id_campana : '',
      estado: act.estado,
    });
    setModalActividadAbierto(true);
  };

  const guardarActividad = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const campanaSeleccionada =
        formActividad.tipo_actividad === 'CAMPANA' && formActividad.id_campana !== ''
          ? Number(formActividad.id_campana)
          : null;

      const payload: ActividadFormDTO = {
        ...formActividad,
        max_voluntarios: Number(formActividad.max_voluntarios),
        id_campana: campanaSeleccionada as any,
      };

      if (actividadEditando) {
        await campanaApi.actualizarActividad(actividadEditando.id_actividad, payload);
        notificar('Actividad actualizada exitosamente.');
      } else {
        await campanaApi.crearActividad(payload);
        notificar('Actividad creada exitosamente.');
      }
      setModalActividadAbierto(false);
      cargarTodo();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al guardar la actividad');
    }
  };

  const eliminarActividad = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas cancelar esta actividad? Quedará marcada como "Cancelada" y no aparecerá en la lista.')) return;
    try {
      await campanaApi.eliminarActividad(id);
      notificar('Actividad cancelada exitosamente.');
      cargarTodo();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al cancelar actividad');
    }
  };

  // --- Voluntariado / Participaciones ---
  const inscribirmeActividad = async (idActividad: number) => {
    try {
      await campanaApi.inscribirse(idActividad);
      notificar('¡Te has inscrito exitosamente a esta actividad!');
      cargarTodo();
    } catch (err: any) {
      alert(err.response?.data?.error || 'No se pudo completar la inscripción');
    }
  };

  const cancelarInscripcion = async (idActividad: number) => {
    if (!window.confirm('¿Deseas cancelar tu inscripción a esta actividad?')) return;
    try {
      await campanaApi.desinscribirse(idActividad);
      notificar('Inscripción cancelada.');
      cargarTodo();
    } catch (err: any) {
      alert(err.response?.data?.error || 'No se pudo cancelar');
    }
  };

  // --- Gestión de Asistencia ---
  const abrirAsistencia = async (act: Actividad) => {
    setModalAsistenciaActividad(act);
    setCargandoVoluntarios(true);
    try {
      const vols = await campanaApi.listarVoluntariosActividad(act.id_actividad);
      setVoluntariosActividad(vols);
    } catch (err: any) {
      alert('Error al cargar la lista de voluntarios de la actividad');
    } finally {
      setCargandoVoluntarios(false);
    }
  };

  const marcarAsistenciaVoluntario = async (part: ParticipacionItem, asistio: boolean) => {
    try {
      await campanaApi.registrarAsistencia(part.id_participacion, {
        asistio,
        horas_acreditadas: asistio ? (part.horas_acreditadas > 0 ? part.horas_acreditadas : 3) : 0,
        observaciones: asistio ? 'Asistencia cumplida satisfactoriamente' : 'No asistió a la convocatoria',
      });
      notificar(`Asistencia registrada. Voluntario ${asistio ? 'acreditado y aprobado' : 'marcado como no asistió'}.`);
      if (modalAsistenciaActividad) {
        const vols = await campanaApi.listarVoluntariosActividad(modalAsistenciaActividad.id_actividad);
        setVoluntariosActividad(vols);
      }
      cargarTodo();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al registrar asistencia');
    }
  };

  // Filtrado de Actividades
  const actividadesFiltradas = actividades.filter((act) => {
    if (campanaFiltroActividades && !act.campanas_asociadas?.some((c) => c.id_campana === campanaFiltroActividades)) {
      return false;
    }
    if (filtroTipoActividad !== 'TODAS' && act.tipo_actividad !== filtroTipoActividad) {
      return false;
    }
    return true;
  });

  // Métricas de Donante separadas por los 3 tipos de donación
  const donacionesCampanas = misDonaciones.filter((d) => Boolean(d.campana_id));
  const donacionesInventario = misDonaciones.filter((d) => !d.campana_id && d.modalidad === 'PRESENCIAL');
  const donacionesSolicitudes = misDonaciones.filter((d) => !d.campana_id && d.modalidad !== 'PRESENCIAL');

  const totalHorasAcreditadas = misParticipaciones
    .filter((p) => p.asistio)
    .reduce((sum, p) => sum + Number(p.horas_acreditadas || 0), 0);

  return (
    <div className="space-y-6 pb-12 text-text dark:text-text">
      {/* Encabezado Principal adaptado a modo claro/oscuro */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface dark:bg-surface p-4 sm:p-6 rounded-2xl border border-border dark:border-border shadow-soft">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-subtle">
            Campañas y Voluntariado
          </span>
          <h1 className="text-xl sm:text-3xl font-extrabold text-text dark:text-text tracking-tight mt-1">
            Gestión de Campañas y Actividades
          </h1>
          <p className="text-xs sm:text-sm text-text-muted dark:text-text-subtle mt-1">
            {esAdmin
              ? 'Administra campañas, coordina cuadrillas de voluntarios y gestiona el impacto social.'
              : esDonante
              ? 'Explora las campañas activas y revisa el impacto de todas tus donaciones.'
              : 'Descubre actividades abiertas, inscríbete y acumula horas de voluntariado certificadas.'}
          </p>
        </div>

        {esAdmin && (
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 w-full sm:w-auto">
            <button
              onClick={abrirCrearCampana}
              className="press min-h-[42px] px-3.5 sm:px-4 py-2.5 bg-primary hover:bg-primary-hover text-on-primary rounded-xl text-xs sm:text-sm font-semibold shadow-soft flex items-center justify-center gap-1.5"
            >
              <span>+</span> Nueva Campaña
            </button>
            <button
              onClick={() => abrirCrearActividad()}
              className="press min-h-[42px] px-3.5 sm:px-4 py-2.5 bg-surface-elevated hover:bg-surface-inset/60 text-text border border-border rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5"
            >
              <span>+</span> Nueva Actividad
            </button>
          </div>
        )}
      </div>

      {/* Alertas */}
      {mensajeExito && (
        <div className="anim-toast p-4 bg-success-soft dark:bg-success-soft/60 border border-success/25 dark:border-success/30 text-success dark:text-success rounded-2xl text-sm font-semibold flex items-center justify-between shadow-soft">
          <span className="flex items-center gap-2">
            {Icono.check}
            <span>{mensajeExito}</span>
          </span>
          <button onClick={() => setMensajeExito(null)} className="press text-success dark:text-success p-1 rounded-lg hover:bg-success/10">
            {Icono.close}
          </button>
        </div>
      )}
      {error && (
        <div className="anim-toast p-4 bg-error-soft dark:bg-error-soft border border-error/25 dark:border-error/30 text-error dark:text-error rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-soft">
          {Icono.alert}
          <span>{error}</span>
        </div>
      )}

      {/* Pestañas de Navegación */}
      <div className="flex flex-wrap sm:inline-flex sm:w-auto max-w-full rounded-xl bg-surface-sunken/80 dark:bg-surface-sunken/70 p-1.5 sm:p-1 border border-border/80 gap-1.5 sm:gap-1">
        {tabs.includes('campanas') && (
          <button
            onClick={() => {
              setPestaña('campanas');
              setCampanaFiltroActividades(null);
            }}
            className={`press flex-1 basis-[calc(50%-0.375rem)] sm:basis-auto sm:flex-initial justify-center sm:justify-start min-h-[40px] px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 sm:gap-2 tabular-nums ${
              pestaña === 'campanas'
                ? 'bg-surface-elevated dark:bg-surface text-text shadow-soft'
                : 'text-text-muted dark:text-text-subtle hover:text-text'
            }`}
          >
            {Icono.megaphone}
            <span>Campañas</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-surface-sunken/80 text-text-muted">{campanas.length}</span>
          </button>
        )}

        {tabs.includes('mis-donaciones') && (
          <button
            onClick={() => setPestaña('mis-donaciones')}
            className={`press flex-1 basis-[calc(50%-0.375rem)] sm:basis-auto sm:flex-initial justify-center sm:justify-start min-h-[40px] px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 sm:gap-2 tabular-nums ${
              pestaña === 'mis-donaciones'
                ? 'bg-surface-elevated dark:bg-surface text-text shadow-soft'
                : 'text-text-muted dark:text-text-subtle hover:text-text'
            }`}
          >
            {Icono.gift}
            <span className="sm:hidden">Mis Donaciones</span>
            <span className="hidden sm:inline">Mi Historial de Donaciones</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-surface-sunken/80 text-text-muted">{misDonaciones.length}</span>
          </button>
        )}

        {tabs.includes('actividades') && (
          <button
            onClick={() => setPestaña('actividades')}
            className={`press flex-1 basis-[calc(50%-0.375rem)] sm:basis-auto sm:flex-initial justify-center sm:justify-start min-h-[40px] px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 sm:gap-2 tabular-nums ${
              pestaña === 'actividades'
                ? 'bg-surface-elevated dark:bg-surface text-text shadow-soft'
                : 'text-text-muted dark:text-text-subtle hover:text-text'
            }`}
          >
            {Icono.activity}
            <span>Actividades</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-surface-sunken/80 text-text-muted">{actividades.length}</span>
            {campanaFiltroActividades && (
              <span className="hidden sm:inline ml-0.5 text-[11px] bg-primary-soft text-primary dark:text-primary-hover px-2 py-0.5 rounded-full">
                Filtradas
              </span>
            )}
          </button>
        )}

        <button
          onClick={() => setPestaña('mis-actividades')}
          className={`press flex-1 basis-[calc(50%-0.375rem)] sm:basis-auto sm:flex-initial justify-center sm:justify-start min-h-[40px] px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 sm:gap-2 tabular-nums ${
            pestaña === 'mis-actividades'
              ? 'bg-surface-elevated dark:bg-surface text-text shadow-soft'
              : 'text-text-muted dark:text-text-subtle hover:text-text'
          }`}
        >
          {Icono.star}
          <span className="sm:hidden">Participaciones</span>
          <span className="hidden sm:inline">Mis Participaciones</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-surface-sunken/80 text-text-muted">{misParticipaciones.length}</span>
        </button>
      </div>

      {cargando ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-border border-t-primary dark:border-t-success" />
        </div>
      ) : (
        <>
          {/* ================================================================= */}
          {/* PESTAÑA 1: GESTIÓN DE CAMPAÑAS */}
          {/* ================================================================= */}
          {pestaña === 'campanas' && (
            <div className="space-y-6">
              {campanas.length === 0 ? (
                <div className="text-center py-16 bg-surface dark:bg-surface rounded-2xl border border-dashed border-border dark:border-border">
                  <p className="text-text-muted dark:text-text-subtle font-medium">No se encontraron campañas registradas.</p>
                  {esAdmin && (
                    <button
                      onClick={abrirCrearCampana}
                      className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold"
                    >
                      Crear primera campaña
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {campanas.map((c) => {
                    const meta = c.objetivo_recaudacion || 0;
                    const recaudado = c.total_recaudado || 0;
                    const porcentaje = meta > 0 ? Math.min(Math.round((recaudado / meta) * 100), 100) : 0;

                    return (
                      <div
                        key={c.id_campana}
                        className="bg-surface dark:bg-surface rounded-2xl border border-border dark:border-border shadow-soft hover:shadow-lift hover:border-border-strong/60 transition-[box-shadow,border-color] duration-200 overflow-hidden flex flex-col justify-between"
                      >
                        <div className="p-4 sm:p-6">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                c.estado === 'Activa'
                                  ? 'bg-success-soft text-success dark:bg-success-soft dark:text-success'
                                  : c.estado === 'Planificada'
                                  ? 'bg-primary-soft text-primary dark:bg-primary-soft dark:text-primary-hover'
                                  : c.estado === 'Finalizada'
                                  ? 'bg-surface-elevated text-text dark:bg-surface-elevated dark:text-text-subtle'
                                  : 'bg-error-soft text-error dark:bg-error-soft dark:text-error'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  c.estado === 'Activa'
                                    ? 'bg-success'
                                    : c.estado === 'Planificada'
                                    ? 'bg-primary'
                                    : c.estado === 'Finalizada'
                                    ? 'bg-text-subtle'
                                    : 'bg-error'
                                }`}
                              />
                              {c.estado}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs text-text-muted dark:text-text-subtle font-medium tabular-nums">
                              {Icono.calendar}
                              <span>{c.fecha_inicio} {c.fecha_fin ? `al ${c.fecha_fin}` : ''}</span>
                            </span>
                          </div>

                          <h3 className="text-lg sm:text-xl font-bold text-text dark:text-text mb-1.5">{c.nombre}</h3>
                          <p className="text-sm text-text-muted dark:text-text-subtle line-clamp-3 mb-5 leading-relaxed">
                            {c.descripcion || 'Sin descripción detallada.'}
                          </p>

                          {/* Métricas clave de la campaña */}
                          <div className="grid grid-cols-1 min-[380px]:grid-cols-3 divide-y min-[380px]:divide-y-0 min-[380px]:divide-x divide-border/70 py-2.5 sm:py-3 px-2 bg-surface-sunken/60 dark:bg-surface-sunken/50 rounded-xl border border-border/70 dark:border-border mb-4">
                            <div className="px-2.5 py-1.5 min-[380px]:py-0 min-w-0">
                              <p className="text-[10.5px] uppercase tracking-[0.06em] text-text-subtle font-semibold">Recaudado</p>
                              <p className="text-sm sm:text-base font-extrabold text-text dark:text-text mt-0.5 tabular-nums truncate">
                                Bs. {recaudado.toLocaleString()}
                              </p>
                            </div>
                            <div className="px-2.5 py-1.5 min-[380px]:py-0 min-w-0">
                              <p className="text-[10.5px] uppercase tracking-[0.06em] text-text-subtle font-semibold">Actividades</p>
                              <p className="text-sm sm:text-base font-extrabold text-text dark:text-text mt-0.5 tabular-nums">
                                {c.total_actividades || 0}
                              </p>
                            </div>
                            <div className="px-2.5 py-1.5 min-[380px]:py-0 min-w-0">
                              <p className="text-[10.5px] uppercase tracking-[0.06em] text-text-subtle font-semibold">Voluntarios</p>
                              <p className="text-sm sm:text-base font-extrabold text-text dark:text-text mt-0.5 tabular-nums">
                                {c.total_voluntarios || 0}
                              </p>
                            </div>
                          </div>

                          {meta > 0 && (
                            <div>
                              <div className="flex justify-between text-xs font-semibold text-text-muted dark:text-text-subtle mb-1.5 tabular-nums">
                                <span>Meta: Bs. {meta.toLocaleString()}</span>
                                <span>{porcentaje}%</span>
                              </div>
                              <div className="w-full bg-surface-inset dark:bg-surface-elevated rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-primary dark:bg-success h-2 rounded-full transition-[width] duration-300 ease-out-soft"
                                  style={{ width: `${porcentaje}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Botones de acción */}
                        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-surface-sunken/60 dark:bg-surface-sunken/80 border-t border-border/80 dark:border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => navigate(`/donaciones?campanaId=${c.id_campana}`)}
                              className="press min-h-[38px] px-3 py-2 bg-primary hover:bg-primary-hover text-on-primary rounded-xl text-xs font-semibold shadow-soft flex items-center justify-center gap-1.5"
                            >
                              {Icono.heart}
                              <span className="truncate">Donar</span>
                            </button>

                            <button
                              onClick={() => {
                                setCampanaFiltroActividades(c.id_campana);
                                setPestaña('actividades');
                              }}
                              className="press min-h-[38px] px-3 py-2 bg-surface-elevated dark:bg-primary-soft/60 hover:bg-primary-soft/60 text-primary dark:text-primary-hover border border-border/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 tabular-nums"
                            >
                              {Icono.list}
                              <span className="truncate">Actividades ({c.total_actividades || 0})</span>
                            </button>
                          </div>

                          {esAdmin && (
                            <div className="grid grid-cols-3 sm:flex gap-2 w-full sm:w-auto">
                              <button
                                onClick={() => abrirCrearActividad(c.id_campana)}
                                title="Crear actividad para esta campaña"
                                className="press min-h-[36px] px-2.5 py-1.5 bg-surface-elevated dark:bg-surface-elevated hover:bg-surface-inset/70 text-text dark:text-text-muted rounded-lg text-xs font-semibold border border-border/70 text-center"
                              >
                                + Actividad
                              </button>
                              <button
                                onClick={() => abrirEditarCampana(c)}
                                className="press min-h-[36px] px-2.5 py-1.5 bg-surface-elevated dark:bg-surface-elevated hover:bg-surface-inset/70 text-text dark:text-text-muted rounded-lg text-xs font-semibold border border-border/70 text-center"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => eliminarCampana(c.id_campana)}
                                className="press min-h-[36px] px-2.5 py-1.5 bg-error-soft dark:bg-error-soft hover:bg-error-soft/80 text-error dark:text-error rounded-lg text-xs font-semibold border border-error/20 text-center"
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* PESTAÑA: HISTORIAL CONSOLIDADO DE DONACIONES (Para Donantes) */}
          {/* ================================================================= */}
          {pestaña === 'mis-donaciones' && (
            <div className="space-y-6">
              {/* Tarjetas de Resumen por los 3 Tipos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-surface dark:bg-surface border border-border dark:border-border rounded-2xl p-5 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-success dark:text-success">
                    1. A Campañas Solidarias
                  </span>
                  <p className="text-2xl font-black text-text dark:text-text mt-2">
                    {donacionesCampanas.length} donaciones
                  </p>
                  <p className="text-xs text-text-muted dark:text-text-subtle mt-1">
                    Destinadas a causas específicas (incendios, invierno, comedores).
                  </p>
                </div>

                <div className="bg-surface dark:bg-surface border border-border dark:border-border rounded-2xl p-5 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-warning dark:text-warning">
                    2. A Solicitudes de Ayuda
                  </span>
                  <p className="text-2xl font-black text-text dark:text-text mt-2">
                    {donacionesSolicitudes.length} donaciones
                  </p>
                  <p className="text-xs text-text-muted dark:text-text-subtle mt-1">
                    Entregadas directamente a familias e instituciones necesitadas.
                  </p>
                </div>

                <div className="bg-surface dark:bg-surface border border-border dark:border-border rounded-2xl p-5 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-primary-hover">
                    3. Al Inventario General
                  </span>
                  <p className="text-2xl font-black text-text dark:text-text mt-2">
                    {donacionesInventario.length} entregas físicas
                  </p>
                  <p className="text-xs text-text-muted dark:text-text-subtle mt-1">
                    Bienes recibidos presencialmente en almacén central por el equipo.
                  </p>
                </div>
              </div>

              {/* Lista Detallada */}
              {misDonaciones.length === 0 ? (
                <div className="text-center py-16 bg-surface dark:bg-surface rounded-2xl border border-dashed border-border dark:border-border">
                  <p className="text-text-muted dark:text-text-subtle font-medium">Aún no has registrado donaciones en tu cuenta.</p>
                  <button
                    onClick={() => setPestaña('campanas')}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold"
                  >
                    Ver campañas para donar
                  </button>
                </div>
              ) : (
                <div className="bg-surface dark:bg-surface rounded-2xl border border-border dark:border-border shadow-soft overflow-hidden">
                  <div className="p-4 bg-surface-sunken/70 dark:bg-surface-sunken/60 border-b border-border dark:border-border font-bold text-sm text-text dark:text-text-muted">
                    Desglose Completo de Donaciones Realizadas
                  </div>

                  {/* Vista móvil en tarjetas */}
                  <div className="md:hidden divide-y divide-border/70">
                    {misDonaciones.map((d) => {
                      const esDeCampana = Boolean(d.campana_id);
                      const esPresencialInventario = !d.campana_id && d.modalidad === 'PRESENCIAL';
                      const fechaTexto = d.fecha_donacion ? d.fecha_donacion.split('T')[0] : '—';
                      const cantidadTexto =
                        d.tipo_donacion === 'ECONOMICO'
                          ? `Bs. ${Number(d.cantidad).toLocaleString()}`
                          : `${d.cantidad} ${d.unidad || ''}`;

                      return (
                        <div key={d.id_donacion} className="p-4 space-y-2.5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <span className="font-mono font-bold text-[11px] text-text-subtle">{d.codigo}</span>
                              <h4 className="font-bold text-text dark:text-text text-sm truncate">
                                {d.tipo_donacion} ({d.categoria || 'General'})
                              </h4>
                            </div>
                            <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-success-soft text-success border border-success/25">
                              {d.estado}
                            </span>
                          </div>

                          <div className="text-xs text-text-muted dark:text-text-subtle">
                            {esDeCampana ? (
                              <span className="text-success font-semibold inline-flex items-center gap-1.5">
                                {Icono.megaphone}
                                <span>{d.campana_nombre ? `Campaña "${d.campana_nombre}"` : `Campaña #${d.campana_id}`}</span>
                              </span>
                            ) : esPresencialInventario ? (
                              <span className="text-primary dark:text-primary-hover font-semibold inline-flex items-center gap-1.5">
                                {Icono.box}
                                <span>Inventario Central (Presencial)</span>
                              </span>
                            ) : (
                              <span className="text-warning font-semibold inline-flex items-center gap-1.5">
                                {Icono.heart}
                                <span>Solicitud de Ayuda Directa</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-1 text-xs">
                            <div className="flex items-center gap-3 tabular-nums">
                              <span className="font-extrabold text-text dark:text-text text-sm">{cantidadTexto}</span>
                              <span className="text-text-subtle">{fechaTexto}</span>
                            </div>
                            <button
                              onClick={() => navigate('/donaciones')}
                              className="press text-xs font-bold text-success hover:underline"
                            >
                              Ver detalle →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Vista escritorio en tabla */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-surface-sunken dark:bg-surface-sunken text-xs uppercase tracking-wider text-text-muted dark:text-text-subtle font-bold border-b border-border dark:border-border">
                        <tr>
                          <th className="p-4">Código</th>
                          <th className="p-4">Tipo & Destino</th>
                          <th className="p-4">Cantidad / Monto</th>
                          <th className="p-4">Modalidad</th>
                          <th className="p-4">Fecha</th>
                          <th className="p-4">Estado</th>
                          <th className="p-4 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border dark:divide-neutral-800">
                        {misDonaciones.map((d) => {
                          const esDeCampana = Boolean(d.campana_id);
                          const esPresencialInventario = !d.campana_id && d.modalidad === 'PRESENCIAL';
                          const fechaTexto = d.fecha_donacion ? d.fecha_donacion.split('T')[0] : '—';
                          const cantidadTexto =
                            d.tipo_donacion === 'ECONOMICO'
                              ? `Bs. ${Number(d.cantidad).toLocaleString()}`
                              : `${d.cantidad} ${d.unidad || ''}`;

                          return (
                            <tr key={d.id_donacion} className="hover:bg-surface-sunken/40 dark:hover:bg-surface-elevated/40 transition">
                              <td className="p-4 font-mono font-bold text-xs text-text dark:text-text">
                                {d.codigo}
                              </td>
                              <td className="p-4">
                                <div className="font-bold text-text dark:text-text">
                                  {d.tipo_donacion} ({d.categoria || 'General'})
                                </div>
                                <div className="text-xs text-text-muted dark:text-text-subtle mt-0.5">
                                  {esDeCampana ? (
                                    <span className="text-success dark:text-success font-semibold inline-flex items-center gap-1.5">
                                      {Icono.megaphone}
                                      <span>{d.campana_nombre ? `Campaña "${d.campana_nombre}"` : `Campaña #${d.campana_id}`}</span>
                                    </span>
                                  ) : esPresencialInventario ? (
                                    <span className="text-primary dark:text-primary-hover font-semibold inline-flex items-center gap-1.5">
                                      {Icono.box}
                                      <span>Inventario Central (Presencial en Sede)</span>
                                    </span>
                                  ) : (
                                    <span className="text-warning dark:text-warning font-semibold inline-flex items-center gap-1.5">
                                      {Icono.heart}
                                      <span>Solicitud de Ayuda Directa</span>
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 font-extrabold text-text dark:text-text tabular-nums">
                                {cantidadTexto}
                              </td>
                              <td className="p-4 text-xs font-semibold">
                                <span className={d.modalidad === 'PRESENCIAL' ? 'text-primary dark:text-primary-hover' : 'text-text-muted dark:text-text-subtle'}>
                                  {d.modalidad}
                                </span>
                              </td>
                              <td className="p-4 text-xs text-text-muted dark:text-text-subtle">
                                {fechaTexto}
                              </td>
                              <td className="p-4">
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-success-soft dark:bg-success-soft text-success dark:text-success border border-success/25 dark:border-success/30">
                                  {d.estado}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => navigate('/donaciones')}
                                  className="text-xs font-bold text-success dark:text-success hover:underline"
                                  title="Ver en Gestión de Donaciones"
                                >
                                  Ver detalle →
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* PESTAÑA 2: GESTIÓN DE ACTIVIDADES */}
          {/* ================================================================= */}
          {pestaña === 'actividades' && (
            <div className="space-y-6">
              {/* Barra de Filtros por Tipo y Campaña */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-surface dark:bg-surface rounded-2xl border border-border dark:border-border shadow-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-text-muted dark:text-text-subtle uppercase tracking-wider mr-1">
                    Origen:
                  </span>
                  {[
                    { id: 'TODAS', label: 'Todas' },
                    { id: 'CAMPANA', label: 'Campañas' },
                    { id: 'SOLICITUD_AYUDA', label: 'Solicitudes de Ayuda' },
                    { id: 'INVENTARIO', label: 'Almacén / Inventario' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setFiltroTipoActividad(btn.id)}
                      className={`press px-3 py-1.5 rounded-xl text-xs font-semibold ${
                        filtroTipoActividad === btn.id
                          ? 'bg-primary text-on-primary shadow-soft'
                          : 'bg-surface-elevated dark:bg-surface-elevated text-text dark:text-text-subtle hover:bg-surface-inset/60 dark:hover:bg-surface-elevated'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {campanaFiltroActividades && (
                  <div className="flex items-center gap-2 text-xs bg-primary-soft dark:bg-primary-soft/70 border border-primary/25 dark:border-primary/30 text-primary dark:text-primary-hover px-3 py-1.5 rounded-xl tabular-nums">
                    <span>Filtrando por Campaña #{campanaFiltroActividades}</span>
                    <button
                      onClick={() => setCampanaFiltroActividades(null)}
                      className="press font-bold hover:underline inline-flex items-center gap-1"
                    >
                      {Icono.close}
                      <span>Quitar filtro</span>
                    </button>
                  </div>
                )}
              </div>

              {actividadesFiltradas.length === 0 ? (
                <div className="text-center py-16 bg-surface dark:bg-surface rounded-2xl border border-dashed border-border dark:border-border">
                  <p className="text-text-muted dark:text-text-subtle font-medium">No se encontraron actividades con los filtros seleccionados.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {actividadesFiltradas.map((act) => {
                    const cupos = act.cupos_disponibles ?? act.max_voluntarios;
                    const sinCupos = cupos <= 0;
                    const yaInscrito = Boolean(act.mi_participacion && act.mi_participacion.estado !== 'Cancelado');

                    // Validación de campaña o actividad inactiva/finalizada
                    const campanaFinalizada = act.campanas_asociadas?.find(
                      (c) => c.estado === 'Finalizada' || c.estado === 'Cancelada'
                    );
                    const actividadFinalizada = act.estado === 'Finalizada' || act.estado === 'Cancelada';
                    const bloqueoInscripcion = Boolean(campanaFinalizada || actividadFinalizada || sinCupos);

                    return (
                      <div
                        key={act.id_actividad}
                        className="bg-surface dark:bg-surface rounded-2xl border border-border dark:border-border shadow-soft hover:shadow-lift hover:border-border-strong/60 transition-[box-shadow,border-color] duration-200 p-4 sm:p-6 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                                act.tipo_actividad === 'CAMPANA'
                                  ? 'bg-success-soft text-success dark:bg-success-soft dark:text-success'
                                  : act.tipo_actividad === 'SOLICITUD_AYUDA'
                                  ? 'bg-warning-soft text-warning dark:bg-warning-soft dark:text-warning'
                                  : 'bg-primary-soft text-primary dark:bg-primary-soft dark:text-primary-hover'
                              }`}
                            >
                              {ETIQUETAS_TIPO_ACTIVIDAD[act.tipo_actividad] || act.tipo_actividad}
                            </span>
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-full tabular-nums ${
                                sinCupos
                                  ? 'bg-error-soft text-error dark:bg-error-soft dark:text-error'
                                  : 'bg-success-soft text-success dark:bg-success-soft dark:text-success'
                              }`}
                            >
                              {act.voluntarios_inscritos || 0} / {act.max_voluntarios} inscritos
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-text dark:text-text mb-1">{act.nombre}</h3>
                          <p className="text-xs text-text-muted dark:text-text-subtle line-clamp-2 mb-4 leading-relaxed">
                            {act.descripcion || 'Sin descripción detallada.'}
                          </p>

                          <div className="space-y-2 text-xs text-text dark:text-text-subtle bg-surface-sunken/60 dark:bg-surface-sunken/50 p-3.5 rounded-xl mb-4 border border-border/70 dark:border-border">
                            <div className="flex items-center gap-2 tabular-nums">
                              <span className="text-text-subtle">{Icono.calendar}</span>
                              <strong>{act.fecha}</strong>
                            </div>
                            <div className="flex items-center gap-2 tabular-nums">
                              <span className="text-text-subtle">{Icono.clock}</span>
                              <strong>{act.hora_inicio} - {act.hora_fin}</strong>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-text-subtle">{Icono.pin}</span>
                              <strong className="truncate">{act.lugar}</strong>
                            </div>
                            {act.campanas_asociadas && act.campanas_asociadas.length > 0 && (
                              <div className="flex items-center gap-2 text-success dark:text-success font-semibold">
                                {Icono.megaphone}
                                <span className="truncate">
                                  Campaña: {act.campanas_asociadas.map((c) => c.nombre).join(', ')}
                                  {campanaFinalizada && (
                                    <span className="ml-1 text-[11px] text-error font-bold">
                                      ({campanaFinalizada.estado})
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}
                            {act.tipo_actividad === 'SOLICITUD_AYUDA' && (
                              <div className="flex items-center gap-2 text-warning dark:text-warning font-semibold">
                                {Icono.heart}
                                <span className="truncate">Apoyo a Solicitud de Ayuda #{act.solicitud_ayuda_id || 1}</span>
                              </div>
                            )}
                            {act.tipo_actividad === 'INVENTARIO' && (
                              <div className="flex items-center gap-2 text-primary dark:text-primary-hover font-semibold">
                                {Icono.box}
                                <span className="truncate">Almacén Central de Inventario</span>
                              </div>
                            )}
                          </div>

                          {/* Alerta de bloqueo si la campaña o actividad está finalizada */}
                          {campanaFinalizada && (
                            <div className="mb-3 p-2.5 bg-error-soft/60 dark:bg-error-soft/40 border border-error/25 rounded-xl text-[11px] font-bold text-error dark:text-error flex items-center gap-2">
                              {Icono.alert}
                              <span>Campaña finalizada. No se admiten nuevas inscripciones.</span>
                            </div>
                          )}
                          {!campanaFinalizada && actividadFinalizada && (
                            <div className="mb-3 p-2.5 bg-surface-inset/70 dark:bg-surface-elevated border border-border rounded-xl text-[11px] font-semibold text-text-muted dark:text-text-subtle flex items-center gap-2">
                              {Icono.clock}
                              <span>Actividad {act.estado.toLowerCase()}. Convocatoria cerrada.</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 pt-3 border-t border-border/80 dark:border-border">
                          {/* Botón de inscripción para el usuario */}
                          {yaInscrito ? (
                            <div className="flex items-center justify-between bg-success-soft dark:bg-success-soft/60 border border-success/25 dark:border-success/30 p-2.5 rounded-xl">
                              <span className="text-xs font-bold text-success dark:text-success inline-flex items-center gap-1.5">
                                {Icono.check}
                                <span>Estás inscrito</span>
                              </span>
                              {!campanaFinalizada && !actividadFinalizada && (
                                <button
                                  onClick={() => cancelarInscripcion(act.id_actividad)}
                                  className="press text-xs text-error dark:text-error hover:underline font-semibold"
                                >
                                  Cancelar
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              disabled={bloqueoInscripcion}
                              onClick={() => inscribirmeActividad(act.id_actividad)}
                              className={`press w-full py-2.5 px-3 rounded-xl text-xs font-semibold shadow-soft text-center ${
                                bloqueoInscripcion
                                  ? 'bg-surface-inset dark:bg-surface-elevated text-text-subtle cursor-not-allowed border border-border'
                                  : 'bg-primary hover:bg-primary-hover text-on-primary'
                              }`}
                            >
                              {campanaFinalizada
                                ? 'Campaña Finalizada'
                                : actividadFinalizada
                                ? `Actividad ${act.estado}`
                                : sinCupos
                                ? 'Cupos Agotados'
                                : 'Inscribirme como Voluntario'}
                            </button>
                          )}

                          {/* Acciones de administración / coordinación */}
                          {esCoordinador && (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <button
                                onClick={() => abrirAsistencia(act)}
                                className="press py-2 px-2 bg-surface-elevated dark:bg-surface-elevated hover:bg-surface-inset/70 dark:hover:bg-surface-elevated text-text dark:text-text rounded-lg text-xs font-semibold text-center col-span-2 border border-border dark:border-border inline-flex items-center justify-center gap-1.5 tabular-nums"
                              >
                                {Icono.users}
                                <span>Gestionar Voluntarios ({act.voluntarios_inscritos || 0})</span>
                              </button>

                              {esAdmin && (
                                <>
                                  <button
                                    onClick={() => abrirEditarActividad(act)}
                                    className="press py-1.5 px-2 bg-surface-elevated dark:bg-surface-elevated hover:bg-surface-inset/70 text-text dark:text-text-muted rounded-lg text-xs font-medium text-center border border-border/70"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => eliminarActividad(act.id_actividad)}
                                    className="press py-1.5 px-2 bg-error-soft dark:bg-error-soft hover:bg-error-soft/80 text-error dark:text-error rounded-lg text-xs font-medium text-center border border-error/20"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* PESTAÑA 3: MIS PARTICIPACIONES (Historial del Voluntario) */}
          {/* ================================================================= */}
          {pestaña === 'mis-actividades' && (
            <div className="space-y-6">
              {/* Tarjeta de Resumen de Horas */}
              <div className="bg-gradient-to-r from-primary to-primary dark:from-primary dark:to-primary-hover text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider font-extrabold text-on-primary/80">
                    Historial y Certificación de Voluntariado
                  </span>
                  <h3 className="text-2xl font-black mt-1">
                    {totalHorasAcreditadas} Horas de Voluntariado Acreditadas
                  </h3>
                  <p className="text-xs text-on-primary/80 mt-1">
                    Cada hora registrada representa vidas impactadas y apoyo directo en terreno.
                  </p>
                </div>
                <div className="px-4 py-2 bg-surface-elevated/20 rounded-xl backdrop-blur-xs font-bold text-sm">
                  {misParticipaciones.filter((p) => p.asistio).length} actividades completadas
                </div>
              </div>

              {misParticipaciones.length === 0 ? (
                <div className="text-center py-16 bg-surface dark:bg-surface rounded-2xl border border-dashed border-border dark:border-border">
                  <p className="text-text-muted dark:text-text-subtle font-medium">Aún no te has inscrito a ninguna actividad de voluntariado.</p>
                  <button
                    onClick={() => setPestaña('actividades')}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-xs hover:bg-primary-hover transition"
                  >
                    Ver actividades disponibles
                  </button>
                </div>
              ) : (
                <div className="bg-surface dark:bg-surface rounded-2xl border border-border dark:border-border shadow-soft overflow-hidden">
                  {/* Vista móvil en tarjetas */}
                  <div className="md:hidden divide-y divide-border/70">
                    {misParticipaciones.map((p) => (
                      <div key={p.id_participacion} className="p-4 space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-bold text-text dark:text-text text-sm leading-snug">{p.actividad_nombre}</h4>
                          <span
                            className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              p.asistio
                                ? 'bg-success-soft text-success dark:bg-success-soft dark:text-success'
                                : p.estado === 'Cancelado'
                                ? 'bg-surface-elevated text-text-muted dark:bg-surface-elevated dark:text-text-subtle'
                                : 'bg-primary-soft text-primary dark:bg-primary-soft dark:text-primary-hover'
                            }`}
                          >
                            {p.asistio ? 'Asistió' : p.estado}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted dark:text-text-subtle tabular-nums">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="text-text-subtle">{Icono.calendar}</span>
                            {p.actividad_fecha}
                          </span>
                          <span className="inline-flex items-center gap-1.5 min-w-0">
                            <span className="text-text-subtle">{Icono.pin}</span>
                            <span className="truncate">{p.actividad_lugar}</span>
                          </span>
                        </div>
                        {p.observaciones && (
                          <p className="text-xs text-text-muted dark:text-text-subtle italic">"{p.observaciones}"</p>
                        )}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-extrabold text-text dark:text-text tabular-nums">
                            {p.asistio ? `${p.horas_acreditadas} hrs acreditadas` : 'Sin horas acreditadas'}
                          </span>
                          {!p.asistio && p.estado !== 'Cancelado' && (
                            <button
                              onClick={() => cancelarInscripcion(p.id_actividad)}
                              className="press text-xs text-error dark:text-error font-semibold px-2.5 py-1 rounded-lg bg-error-soft/70"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Vista escritorio en tabla */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm text-text-muted dark:text-text-subtle">
                      <thead className="bg-surface-sunken dark:bg-surface-sunken text-xs uppercase tracking-wider text-text-muted dark:text-text-subtle font-bold border-b border-border dark:border-border">
                        <tr>
                          <th className="p-4">Actividad</th>
                          <th className="p-4">Fecha & Lugar</th>
                          <th className="p-4">Estado</th>
                          <th className="p-4">Horas</th>
                          <th className="p-4">Observaciones</th>
                          <th className="p-4 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border dark:divide-neutral-800">
                        {misParticipaciones.map((p) => (
                          <tr key={p.id_participacion} className="hover:bg-surface-sunken/40 dark:hover:bg-surface-elevated/40 transition">
                            <td className="p-4 font-bold text-text dark:text-text">{p.actividad_nombre}</td>
                            <td className="p-4 text-xs">
                              <div className="inline-flex items-center gap-1.5 tabular-nums">
                                <span className="text-text-subtle">{Icono.calendar}</span>
                                <span>{p.actividad_fecha}</span>
                              </div>
                              <div className="text-text-subtle truncate max-w-xs mt-0.5">{p.actividad_lugar}</div>
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                  p.asistio
                                    ? 'bg-success-soft text-success dark:bg-success-soft dark:text-success'
                                    : p.estado === 'Cancelado'
                                    ? 'bg-surface-elevated text-text-muted dark:bg-surface-elevated dark:text-text-subtle'
                                    : 'bg-primary-soft text-primary dark:bg-primary-soft dark:text-primary-hover'
                                }`}
                              >
                                {p.asistio ? 'Asistió' : p.estado}
                              </span>
                            </td>
                            <td className="p-4 font-extrabold text-text dark:text-text">
                              {p.asistio ? `${p.horas_acreditadas} hrs` : '-'}
                            </td>
                            <td className="p-4 text-xs text-text-muted dark:text-text-subtle italic max-w-xs truncate">
                              {p.observaciones || 'Sin observaciones'}
                            </td>
                            <td className="p-4 text-right">
                              {!p.asistio && p.estado !== 'Cancelado' && (
                                <button
                                  onClick={() => cancelarInscripcion(p.id_actividad)}
                                  className="text-xs text-error dark:text-error hover:underline font-semibold"
                                >
                                  Cancelar
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CREAR / EDITAR CAMPAÑA */}
      {/* ===================================================================== */}
      {modalCampanaAbierto &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-night/60 p-0 sm:p-4 backdrop-blur-sm animate-[overlay-in_200ms_ease-out_both]">
            <div className="anim-scale bg-surface dark:bg-surface rounded-t-2xl sm:rounded-2xl max-w-lg w-full p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:p-6 shadow-deep border border-border dark:border-border max-h-[92dvh] overflow-y-auto overscroll-contain text-text dark:text-text">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-text dark:text-text">
                  {campanaEditando ? 'Editar Campaña' : 'Nueva Campaña Solidaria'}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalCampanaAbierto(false)}
                  className="press p-1.5 rounded-lg text-text-subtle hover:text-text hover:bg-surface-elevated"
                >
                  {Icono.close}
                </button>
              </div>

            <form onSubmit={guardarCampana} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-text dark:text-text-subtle uppercase mb-1">Nombre de la Campaña *</label>
                <input
                  type="text"
                  required
                  value={formCampana.nombre}
                  onChange={(e) => setFormCampana({ ...formCampana, nombre: e.target.value })}
                  placeholder="Ej. Campaña Solidaria Incendios 2026"
                  className="w-full px-3.5 py-2 rounded-xl border border-border dark:border-border bg-surface-elevated dark:bg-surface-elevated text-text dark:text-text focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text dark:text-text-subtle uppercase mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={formCampana.descripcion}
                  onChange={(e) => setFormCampana({ ...formCampana, descripcion: e.target.value })}
                  placeholder="Objetivo, necesidades prioritarias y contexto de la campaña..."
                  className="w-full px-3.5 py-2 rounded-xl border border-border dark:border-border bg-surface-elevated dark:bg-surface-elevated text-text dark:text-text focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text dark:text-text-subtle uppercase mb-1">URL de Portada (Imagen)</label>
                <input
                  type="url"
                  value={formCampana.portada_url}
                  onChange={(e) => setFormCampana({ ...formCampana, portada_url: e.target.value })}
                  placeholder="https://ejemplo.com/foto.jpg"
                  className="w-full px-3.5 py-2 rounded-xl border border-border dark:border-border bg-surface-elevated dark:bg-surface-elevated text-text dark:text-text focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text dark:text-text-subtle uppercase mb-1">Fecha de Inicio *</label>
                  <input
                    type="date"
                    required
                    value={formCampana.fecha_inicio}
                    onChange={(e) => setFormCampana({ ...formCampana, fecha_inicio: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-border bg-surface-elevated dark:bg-surface-elevated text-text dark:text-text focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text dark:text-text-subtle uppercase mb-1">Fecha de Fin (Opcional)</label>
                  <input
                    type="date"
                    value={formCampana.fecha_fin}
                    onChange={(e) => setFormCampana({ ...formCampana, fecha_fin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-border bg-surface-elevated dark:bg-surface-elevated text-text dark:text-text focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text dark:text-text-subtle uppercase mb-1">Meta Económica (Bs.)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={formCampana.objetivo_recaudacion}
                    onChange={(e) => setFormCampana({ ...formCampana, objetivo_recaudacion: e.target.value === '' ? '' : Number(e.target.value) })}
                    placeholder="Ej. 50000"
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-border bg-surface-elevated dark:bg-surface-elevated text-text dark:text-text focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text dark:text-text-subtle uppercase mb-1">Estado</label>
                  <select
                    value={formCampana.estado}
                    onChange={(e) => setFormCampana({ ...formCampana, estado: e.target.value as EstadoCampana })}
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-border bg-surface-elevated dark:bg-surface-elevated text-text dark:text-text focus:ring-2 focus:ring-primary focus:outline-hidden"
                  >
                    <option value="Planificada">Planificada</option>
                    <option value="Activa">Activa</option>
                    <option value="Pausada">Pausada</option>
                    <option value="Finalizada">Finalizada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 pt-4 border-t border-border dark:border-border">
                <button
                  type="button"
                  onClick={() => setModalCampanaAbierto(false)}
                  className="press w-full sm:w-auto min-h-[44px] px-4 py-2 text-text-muted dark:text-text-subtle hover:bg-surface-elevated dark:hover:bg-surface-elevated rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="press w-full sm:w-auto min-h-[44px] px-5 py-2 bg-primary hover:bg-primary-hover text-on-primary rounded-xl font-semibold shadow-soft"
                >
                  Guardar Campaña
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ===================================================================== */}
      {/* MODAL: CREAR / EDITAR ACTIVIDAD */}
      {/* ===================================================================== */}
      {modalActividadAbierto &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-night/60 p-0 sm:p-4 backdrop-blur-sm animate-[overlay-in_200ms_ease-out_both]">
            <div className="anim-scale bg-surface dark:bg-surface rounded-t-2xl sm:rounded-2xl max-w-lg w-full p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:p-6 shadow-deep border border-border dark:border-border max-h-[92dvh] overflow-y-auto overscroll-contain text-text dark:text-text">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-text dark:text-text">
                  {actividadEditando ? 'Editar Actividad' : 'Nueva Actividad'}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalActividadAbierto(false)}
                  className="press p-1.5 rounded-lg text-text-subtle hover:text-text hover:bg-surface-elevated"
                >
                  {Icono.close}
                </button>
              </div>

            <form onSubmit={guardarActividad} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-text dark:text-text-subtle uppercase mb-1">Nombre de la Actividad *</label>
                <input
                  type="text"
                  required
                  value={formActividad.nombre}
                  onChange={(e) => setFormActividad({ ...formActividad, nombre: e.target.value })}
                  placeholder="Ej. Clasificación y empaque de víveres"
                  className="w-full px-3.5 py-2 rounded-xl border border-border dark:border-border bg-surface-elevated dark:bg-surface-elevated text-text dark:text-text focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text dark:text-text-subtle uppercase mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={formActividad.descripcion}
                  onChange={(e) => setFormActividad({ ...formActividad, descripcion: e.target.value })}
                  placeholder="Instrucciones para los voluntarios..."
                  className="w-full px-3.5 py-2 rounded-xl border border-border dark:border-border bg-surface-elevated dark:bg-surface-elevated text-text dark:text-text focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-2">
                <div>
                  <label className="block text-xs font-bold text-text dark:text-text-subtle uppercase mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={formActividad.fecha}
                    onChange={(e) => setFormActividad({ ...formActividad, fecha: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-border bg-surface-elevated dark:bg-surface-elevated text-text dark:text-text text-xs focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-2 sm:contents gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text dark:text-text-subtle uppercase mb-1">Hora Inicio *</label>
                    <input
                      type="time"
                      required
                      value={formActividad.hora_inicio}
                      onChange={(e) => setFormActividad({ ...formActividad, hora_inicio: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border dark:border-border bg-surface-elevated dark:bg-surface-elevated text-text dark:text-text text-xs focus:ring-2 focus:ring-primary focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text dark:text-text-subtle uppercase mb-1">Hora Fin *</label>
                    <input
                      type="time"
                      required
                      value={formActividad.hora_fin}
                      onChange={(e) => setFormActividad({ ...formActividad, hora_fin: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-border dark:border-border bg-surface-elevated dark:bg-surface-elevated text-text dark:text-text text-xs focus:ring-2 focus:ring-primary focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text dark:text-text-subtle uppercase mb-1">Lugar de Encuentro *</label>
                <input
                  type="text"
                  required
                  value={formActividad.lugar}
                  onChange={(e) => setFormActividad({ ...formActividad, lugar: e.target.value })}
                  placeholder="Ej. Sede Central Miraflores / Plaza San Francisco"
                  className="w-full px-3.5 py-2 rounded-xl border border-border dark:border-border bg-surface-elevated dark:bg-surface-elevated text-text dark:text-text focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text dark:text-text-subtle uppercase mb-1">Cupo de Voluntarios *</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    required
                    value={formActividad.max_voluntarios}
                    onChange={(e) => setFormActividad({ ...formActividad, max_voluntarios: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-border bg-surface-elevated dark:bg-surface-elevated text-text dark:text-text focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text dark:text-text-subtle uppercase mb-1">Tipo de Actividad</label>
                  <select
                    value={formActividad.tipo_actividad}
                    onChange={(e) => setFormActividad({ ...formActividad, tipo_actividad: e.target.value as TipoActividad })}
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-border bg-surface-elevated dark:bg-surface-elevated text-text dark:text-text focus:ring-2 focus:ring-primary focus:outline-hidden"
                  >
                    <option value="CAMPANA">Campaña</option>
                    <option value="INVENTARIO">Inventario / Almacén Central</option>
                    <option value="SOLICITUD_AYUDA">Solicitud de Ayuda</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>
              </div>

              {formActividad.tipo_actividad === 'CAMPANA' && (
                <div>
                  <label className="block text-xs font-bold text-text dark:text-text-subtle uppercase mb-1">Vincular a Campaña</label>
                  <select
                    value={formActividad.id_campana}
                    onChange={(e) => setFormActividad({ ...formActividad, id_campana: e.target.value === '' ? '' : Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-border bg-surface-elevated dark:bg-surface-elevated text-text dark:text-text focus:ring-2 focus:ring-primary focus:outline-hidden"
                  >
                    <option value="">-- Sin campaña asociada --</option>
                    {campanas.map((c) => (
                      <option key={c.id_campana} value={c.id_campana}>
                        {c.nombre} ({c.estado})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 pt-4 border-t border-border dark:border-border">
                <button
                  type="button"
                  onClick={() => setModalActividadAbierto(false)}
                  className="press w-full sm:w-auto min-h-[44px] px-4 py-2 text-text-muted dark:text-text-subtle hover:bg-surface-elevated dark:hover:bg-surface-elevated rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="press w-full sm:w-auto min-h-[44px] px-5 py-2 bg-primary hover:bg-primary-hover text-on-primary rounded-xl font-semibold shadow-soft"
                >
                  Guardar Actividad
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ===================================================================== */}
      {/* MODAL: CONTROL Y MODIFICACIÓN DE ASISTENCIA DE VOLUNTARIOS */}
      {/* ===================================================================== */}
      {modalAsistenciaActividad &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-night/60 p-0 sm:p-4 backdrop-blur-sm animate-[overlay-in_200ms_ease-out_both]">
            <div className="anim-scale bg-surface dark:bg-surface rounded-t-2xl sm:rounded-2xl max-w-2xl w-full p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:p-6 shadow-deep border border-border dark:border-border max-h-[92dvh] overflow-y-auto overscroll-contain text-text dark:text-text">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[11px] font-bold text-primary dark:text-primary-hover uppercase tracking-wider">
                    Control y Acreditación de Voluntarios
                  </span>
                  <h3 className="text-xl font-bold text-text dark:text-text mt-1">{modalAsistenciaActividad.nombre}</h3>
                  <p className="text-xs text-text-muted dark:text-text-subtle flex flex-wrap items-center gap-3 mt-1 tabular-nums">
                    <span className="inline-flex items-center gap-1">{Icono.calendar} {modalAsistenciaActividad.fecha}</span>
                    <span className="inline-flex items-center gap-1">{Icono.clock} {modalAsistenciaActividad.hora_inicio} a {modalAsistenciaActividad.hora_fin}</span>
                    <span className="inline-flex items-center gap-1">{Icono.pin} {modalAsistenciaActividad.lugar}</span>
                  </p>
                </div>
                <button
                  onClick={() => setModalAsistenciaActividad(null)}
                  className="press text-text-subtle hover:text-text dark:hover:text-text p-1.5 rounded-lg hover:bg-surface-elevated"
                >
                  {Icono.close}
                </button>
              </div>

            {cargandoVoluntarios ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-primary" />
              </div>
            ) : voluntariosActividad.length === 0 ? (
              <div className="text-center py-12 bg-surface-sunken dark:bg-surface-sunken/60 rounded-xl text-text-muted dark:text-text-subtle text-sm">
                No hay voluntarios inscritos en esta actividad.
              </div>
            ) : (
              <div className="divide-y divide-border dark:divide-neutral-800">
                {voluntariosActividad.map((v) => (
                  <div key={v.id_participacion} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-text dark:text-text text-sm">{v.voluntario_nombre}</p>
                      <p className="text-xs text-text-muted dark:text-text-subtle">{v.voluntario_correo} • Tel: {v.voluntario_telefono || 'No registrado'}</p>
                      {v.observaciones && <p className="text-xs text-text-muted dark:text-text-subtle italic mt-0.5">"{v.observaciones}"</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {v.asistio ? (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-success-soft text-success dark:bg-success-soft dark:text-success tabular-nums">
                            ✓ Asistió ({v.horas_acreditadas} hrs)
                          </span>
                          <button
                            onClick={() => marcarAsistenciaVoluntario(v, false)}
                            className="press px-2 py-1 text-xs text-error dark:text-error hover:underline"
                            title="Desmarcar o rectificar asistencia"
                          >
                            Modificar
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => marcarAsistenciaVoluntario(v, true)}
                            className="press px-3 py-1.5 bg-primary hover:bg-primary-hover text-on-primary rounded-lg text-xs font-semibold shadow-soft"
                          >
                            Marcar Asistió
                          </button>
                          <button
                            onClick={() => marcarAsistenciaVoluntario(v, false)}
                            className="press px-3 py-1.5 bg-surface-elevated dark:bg-surface-elevated hover:bg-surface-inset/70 text-text dark:text-text-subtle rounded-lg text-xs font-semibold border border-border/70"
                          >
                            No Asistió
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-border dark:border-border flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 text-xs text-text-muted dark:text-text-subtle">
              <span>* Al confirmar asistencia, la base de datos promueve automáticamente al usuario a Voluntario Aprobado.</span>
              <button
                onClick={() => setModalAsistenciaActividad(null)}
                className="press w-full sm:w-auto min-h-[44px] px-4 py-2 bg-surface-elevated dark:bg-surface-elevated hover:bg-surface-inset/70 text-text dark:text-text-muted rounded-xl font-semibold border border-border/70"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
