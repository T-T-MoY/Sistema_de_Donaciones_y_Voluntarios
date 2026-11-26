import { useState, useEffect } from 'react';
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface dark:bg-surface p-6 rounded-2xl border border-border dark:border-border shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-success dark:text-success">
            Sprint 3 · Gestión Operativa Integral
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text dark:text-text tracking-tight mt-1">
            Gestión de Campañas y Actividades
          </h1>
          <p className="text-sm text-text-muted dark:text-text-subtle mt-1">
            {esAdmin
              ? 'Administra campañas, coordina cuadrillas de voluntarios y gestiona el impacto social.'
              : esDonante
              ? 'Explora las campañas activas y revisa el impacto de todas tus donaciones.'
              : 'Descubre actividades abiertas, inscríbete y acumula horas de voluntariado certificadas.'}
          </p>
        </div>

        {esAdmin && (
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={abrirCrearCampana}
              className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <span>+</span> Nueva Campaña
            </button>
            <button
              onClick={() => abrirCrearActividad()}
              className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <span>+</span> Nueva Actividad
            </button>
          </div>
        )}
      </div>

      {/* Alertas */}
      {mensajeExito && (
        <div className="p-4 bg-success-soft dark:bg-success-soft/60 border border-success/25 dark:border-success/30 text-success dark:text-success rounded-2xl text-sm font-semibold flex items-center justify-between">
          <span>✓ {mensajeExito}</span>
          <button onClick={() => setMensajeExito(null)} className="text-success dark:text-success font-bold">✕</button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-error-soft dark:bg-error-soft border border-error/25 dark:border-error/30 text-error dark:text-error rounded-2xl text-sm font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* Pestañas de Navegación */}
      <div className="flex border-b border-border dark:border-border gap-2 overflow-x-auto">
        {tabs.includes('campanas') && (
          <button
            onClick={() => {
              setPestaña('campanas');
              setCampanaFiltroActividades(null);
            }}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              pestaña === 'campanas'
                ? 'border-success text-success dark:text-success'
                : 'border-transparent text-text-muted dark:text-text-subtle hover:text-text dark:hover:text-text'
            }`}
          >
            <span>📢</span>
            Campañas ({campanas.length})
          </button>
        )}

        {tabs.includes('mis-donaciones') && (
          <button
            onClick={() => setPestaña('mis-donaciones')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              pestaña === 'mis-donaciones'
                ? 'border-success text-success dark:text-success'
                : 'border-transparent text-text-muted dark:text-text-subtle hover:text-text dark:hover:text-text'
            }`}
          >
            <span>🎁</span>
            Mi Historial de Donaciones ({misDonaciones.length})
          </button>
        )}

        {tabs.includes('actividades') && (
          <button
            onClick={() => setPestaña('actividades')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              pestaña === 'actividades'
                ? 'border-primary text-primary dark:text-primary-hover'
                : 'border-transparent text-text-muted dark:text-text-subtle hover:text-text dark:hover:text-text'
            }`}
          >
            <span>🏃</span>
            Actividades ({actividades.length})
            {campanaFiltroActividades && (
              <span className="ml-1 text-[11px] bg-primary-soft dark:bg-primary-soft text-primary dark:text-primary-hover px-2 py-0.5 rounded-full">
                Filtradas por campaña
              </span>
            )}
          </button>
        )}

        <button
          onClick={() => setPestaña('mis-actividades')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            pestaña === 'mis-actividades'
              ? 'border-warning text-warning dark:text-warning'
              : 'border-transparent text-text-muted dark:text-text-subtle hover:text-text dark:hover:text-text'
          }`}
        >
          <span>⭐</span>
          Mis Participaciones ({misParticipaciones.length})
        </button>
      </div>

      {cargando ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-success dark:border-success" />
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
                        className="bg-surface dark:bg-surface rounded-2xl border border-border dark:border-border shadow-xs overflow-hidden flex flex-col justify-between"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                c.estado === 'Activa'
                                  ? 'bg-success-soft text-success dark:bg-success-soft dark:text-success'
                                  : c.estado === 'Planificada'
                                  ? 'bg-primary-soft text-primary dark:bg-primary-soft dark:text-primary-hover'
                                  : c.estado === 'Finalizada'
                                  ? 'bg-surface-elevated text-text dark:bg-surface-elevated dark:text-text-subtle'
                                  : 'bg-error-soft text-error dark:bg-error-soft dark:text-error'
                              }`}
                            >
                              {c.estado}
                            </span>
                            <span className="text-xs text-text-muted dark:text-text-subtle font-medium">
                              📅 {c.fecha_inicio} {c.fecha_fin ? `al ${c.fecha_fin}` : ''}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold text-text dark:text-text mb-2">{c.nombre}</h3>
                          <p className="text-sm text-text-muted dark:text-text-subtle line-clamp-3 mb-6">
                            {c.descripcion || 'Sin descripción detallada.'}
                          </p>

                          {/* Métricas clave de la campaña */}
                          <div className="grid grid-cols-3 gap-3 p-4 bg-surface-sunken dark:bg-surface-sunken/60 rounded-xl border border-border dark:border-border mb-4">
                            <div>
                              <p className="text-xs text-text-muted dark:text-text-subtle font-medium">Recaudado</p>
                              <p className="text-base font-extrabold text-text dark:text-text mt-0.5">
                                Bs. {recaudado.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-text-muted dark:text-text-subtle font-medium">Actividades</p>
                              <p className="text-base font-extrabold text-text dark:text-text mt-0.5">
                                {c.total_actividades || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-text-muted dark:text-text-subtle font-medium">Voluntarios</p>
                              <p className="text-base font-extrabold text-text dark:text-text mt-0.5">
                                {c.total_voluntarios || 0}
                              </p>
                            </div>
                          </div>

                          {meta > 0 && (
                            <div>
                              <div className="flex justify-between text-xs font-semibold text-text-muted dark:text-text-subtle mb-1">
                                <span>Meta: Bs. {meta.toLocaleString()}</span>
                                <span>{porcentaje}%</span>
                              </div>
                              <div className="w-full bg-surface-inset dark:bg-surface-elevated rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-primary dark:bg-success h-2 rounded-full transition-all"
                                  style={{ width: `${porcentaje}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Botones de acción */}
                        <div className="px-6 py-4 bg-surface-sunken dark:bg-surface-sunken/80 border-t border-border dark:border-border flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => navigate(`/donaciones?campanaId=${c.id_campana}`)}
                              className="px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                            >
                              <span>❤️</span> Donar a esta Campaña
                            </button>

                            <button
                              onClick={() => {
                                setCampanaFiltroActividades(c.id_campana);
                                setPestaña('actividades');
                              }}
                              className="px-3.5 py-2 bg-primary-soft dark:bg-primary-soft/60 hover:bg-primary-soft text-primary dark:text-primary-hover rounded-xl text-xs font-bold transition flex items-center gap-1"
                            >
                              <span>📋</span> Ver Actividades ({c.total_actividades || 0})
                            </button>
                          </div>

                          {esAdmin && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => abrirCrearActividad(c.id_campana)}
                                title="Crear actividad para esta campaña"
                                className="px-2.5 py-1.5 bg-surface-inset dark:bg-surface-elevated hover:bg-surface-inset dark:hover:bg-surface-elevated text-text dark:text-text-muted rounded-lg text-xs font-semibold transition"
                              >
                                + Actividad
                              </button>
                              <button
                                onClick={() => abrirEditarCampana(c)}
                                className="px-2.5 py-1.5 bg-surface-inset dark:bg-surface-elevated hover:bg-surface-inset dark:hover:bg-surface-elevated text-text dark:text-text-muted rounded-lg text-xs font-semibold transition"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => eliminarCampana(c.id_campana)}
                                className="px-2.5 py-1.5 bg-error-soft dark:bg-error-soft hover:bg-error-soft text-error dark:text-error rounded-lg text-xs font-semibold transition"
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
                <div className="bg-surface dark:bg-surface rounded-2xl border border-border dark:border-border shadow-xs overflow-hidden">
                  <div className="p-4 bg-surface-sunken dark:bg-surface-sunken/60 border-b border-border dark:border-border font-bold text-sm text-text dark:text-text-muted">
                    Desglose Completo de Donaciones Realizadas
                  </div>
                  <div className="overflow-x-auto">
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
                                <div className="text-xs text-text-muted dark:text-text-subtle">
                                  {esDeCampana ? (
                                    <span className="text-success dark:text-success font-semibold flex items-center gap-1">
                                      🎯 {d.campana_nombre ? `Campaña "${d.campana_nombre}"` : `Campaña #${d.campana_id}`}
                                    </span>
                                  ) : esPresencialInventario ? (
                                    <span className="text-primary dark:text-primary-hover font-semibold flex items-center gap-1">
                                      📦 Inventario Central (Presencial en Sede)
                                    </span>
                                  ) : (
                                    <span className="text-warning dark:text-warning font-semibold flex items-center gap-1">
                                      🤝 Solicitud de Ayuda Directa
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
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        filtroTipoActividad === btn.id
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-surface-elevated dark:bg-surface-elevated text-text dark:text-text-subtle hover:bg-surface-inset dark:hover:bg-surface-elevated'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {campanaFiltroActividades && (
                  <div className="flex items-center gap-2 text-xs bg-primary-soft dark:bg-primary-soft/70 border border-primary/25 dark:border-primary/30 text-primary dark:text-primary-hover px-3 py-1.5 rounded-xl">
                    <span>Filtrando por Campaña #{campanaFiltroActividades}</span>
                    <button
                      onClick={() => setCampanaFiltroActividades(null)}
                      className="font-bold hover:underline"
                    >
                      ✕ Quitar filtro
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
                        className="bg-surface dark:bg-surface rounded-2xl border border-border dark:border-border shadow-xs p-6 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                                act.tipo_actividad === 'CAMPANA'
                                  ? 'bg-success-soft text-success dark:bg-success-soft dark:text-success'
                                  : act.tipo_actividad === 'SOLICITUD_AYUDA'
                                  ? 'bg-warning-soft text-warning dark:bg-warning-soft dark:text-warning'
                                  : 'bg-primary-soft text-primary dark:bg-primary-soft dark:text-primary-hover'
                              }`}
                            >
                              {act.tipo_actividad}
                            </span>
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                sinCupos
                                  ? 'bg-error-soft text-error dark:bg-error-soft dark:text-error'
                                  : 'bg-success-soft text-success dark:bg-success-soft dark:text-success'
                              }`}
                            >
                              {act.voluntarios_inscritos || 0} / {act.max_voluntarios} inscritos
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-text dark:text-text mb-1">{act.nombre}</h3>
                          <p className="text-xs text-text-muted dark:text-text-subtle line-clamp-2 mb-4">
                            {act.descripcion || 'Sin descripción detallada.'}
                          </p>

                          <div className="space-y-1.5 text-xs text-text dark:text-text-subtle bg-surface-sunken dark:bg-surface-sunken/60 p-3 rounded-xl mb-4 border border-border dark:border-border">
                            <div>📅 <strong>{act.fecha}</strong></div>
                            <div>⏰ <strong>{act.hora_inicio} - {act.hora_fin}</strong></div>
                            <div className="truncate">📍 <strong>{act.lugar}</strong></div>
                            {act.campanas_asociadas && act.campanas_asociadas.length > 0 && (
                              <div className="text-success dark:text-success font-semibold truncate">
                                📢 Campaña: {act.campanas_asociadas.map((c) => c.nombre).join(', ')}
                                {campanaFinalizada && (
                                  <span className="ml-1 text-[11px] text-error font-bold">
                                    ({campanaFinalizada.estado})
                                  </span>
                                )}
                              </div>
                            )}
                            {act.tipo_actividad === 'SOLICITUD_AYUDA' && (
                              <div className="text-warning dark:text-warning font-semibold truncate">
                                🤝 Apoyo a Solicitud de Ayuda #{act.solicitud_ayuda_id || 1}
                              </div>
                            )}
                            {act.tipo_actividad === 'INVENTARIO' && (
                              <div className="text-primary dark:text-primary-hover font-semibold truncate">
                                📦 Almacén Central de Inventario
                              </div>
                            )}
                          </div>

                          {/* Alerta de bloqueo si la campaña o actividad está finalizada */}
                          {campanaFinalizada && (
                            <div className="mb-3 p-2 bg-error-soft/60 dark:bg-error-soft/40 border border-error/25 rounded-xl text-[11px] font-bold text-error dark:text-error flex items-center gap-1.5">
                              <span>⚠️</span>
                              <span>Campaña finalizada. No se admiten nuevas inscripciones.</span>
                            </div>
                          )}
                          {!campanaFinalizada && actividadFinalizada && (
                            <div className="mb-3 p-2 bg-surface-inset dark:bg-surface-elevated border border-border rounded-xl text-[11px] font-semibold text-text-muted dark:text-text-subtle flex items-center gap-1.5">
                              <span>🏁</span>
                              <span>Actividad {act.estado.toLowerCase()}. Convocatoria cerrada.</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 pt-2 border-t border-border dark:border-border">
                          {/* Botón de inscripción para el usuario */}
                          {yaInscrito ? (
                            <div className="flex items-center justify-between bg-success-soft dark:bg-success-soft/60 border border-success/25 dark:border-success/30 p-2.5 rounded-xl">
                              <span className="text-xs font-bold text-success dark:text-success">✓ Estás inscrito</span>
                              {!campanaFinalizada && !actividadFinalizada && (
                                <button
                                  onClick={() => cancelarInscripcion(act.id_actividad)}
                                  className="text-xs text-error dark:text-error hover:underline font-semibold"
                                >
                                  Cancelar
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              disabled={bloqueoInscripcion}
                              onClick={() => inscribirmeActividad(act.id_actividad)}
                              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold shadow-xs transition text-center ${
                                bloqueoInscripcion
                                  ? 'bg-surface-inset dark:bg-surface-elevated text-text-subtle cursor-not-allowed border border-border'
                                  : 'bg-primary hover:bg-primary-hover text-white'
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
                                className="py-2 px-2 bg-surface-elevated dark:bg-surface-elevated hover:bg-surface-inset dark:hover:bg-surface-elevated text-text dark:text-text rounded-lg text-xs font-bold transition text-center col-span-2 border border-border dark:border-border"
                              >
                                👥 Gestionar Voluntarios ({act.voluntarios_inscritos || 0})
                              </button>

                              {esAdmin && (
                                <>
                                  <button
                                    onClick={() => abrirEditarActividad(act)}
                                    className="py-1.5 px-2 bg-surface-elevated dark:bg-surface-elevated hover:bg-surface-inset dark:hover:bg-surface-elevated text-text dark:text-text-muted rounded-lg text-xs font-medium text-center"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => eliminarActividad(act.id_actividad)}
                                    className="py-1.5 px-2 bg-error-soft dark:bg-error-soft hover:bg-error-soft text-error dark:text-error rounded-lg text-xs font-medium text-center"
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
                <div className="bg-surface dark:bg-surface rounded-2xl border border-border dark:border-border shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
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
                              <div>📅 {p.actividad_fecha}</div>
                              <div className="text-text-subtle truncate max-w-xs">{p.actividad_lugar}</div>
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
      {modalCampanaAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-surface dark:bg-surface rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-border dark:border-border max-h-[90vh] overflow-y-auto text-text dark:text-text">
            <h3 className="text-xl font-bold text-text dark:text-text mb-4">
              {campanaEditando ? 'Editar Campaña' : 'Nueva Campaña Solidaria'}
            </h3>

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

              <div className="grid grid-cols-2 gap-3">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text dark:text-text-subtle uppercase mb-1">Meta Económica (Bs.)</label>
                  <input
                    type="number"
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

              <div className="flex justify-end gap-3 pt-4 border-t border-border dark:border-border">
                <button
                  type="button"
                  onClick={() => setModalCampanaAbierto(false)}
                  className="px-4 py-2 text-text-muted dark:text-text-subtle hover:bg-surface-elevated dark:hover:bg-surface-elevated rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-sm"
                >
                  Guardar Campaña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CREAR / EDITAR ACTIVIDAD */}
      {/* ===================================================================== */}
      {modalActividadAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-surface dark:bg-surface rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-border dark:border-border max-h-[90vh] overflow-y-auto text-text dark:text-text">
            <h3 className="text-xl font-bold text-text dark:text-text mb-4">
              {actividadEditando ? 'Editar Actividad' : 'Nueva Actividad'}
            </h3>

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

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-text dark:text-text-subtle uppercase mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={formActividad.fecha}
                    onChange={(e) => setFormActividad({ ...formActividad, fecha: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-border dark:border-border bg-surface-elevated dark:bg-surface-elevated text-text dark:text-text text-xs focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text dark:text-text-subtle uppercase mb-1">Hora Inicio *</label>
                  <input
                    type="time"
                    required
                    value={formActividad.hora_inicio}
                    onChange={(e) => setFormActividad({ ...formActividad, hora_inicio: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-border dark:border-border bg-surface-elevated dark:bg-surface-elevated text-text dark:text-text text-xs focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text dark:text-text-subtle uppercase mb-1">Hora Fin *</label>
                  <input
                    type="time"
                    required
                    value={formActividad.hora_fin}
                    onChange={(e) => setFormActividad({ ...formActividad, hora_fin: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-border dark:border-border bg-surface-elevated dark:bg-surface-elevated text-text dark:text-text text-xs focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text dark:text-text-subtle uppercase mb-1">Cupo de Voluntarios *</label>
                  <input
                    type="number"
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

              <div className="flex justify-end gap-3 pt-4 border-t border-border dark:border-border">
                <button
                  type="button"
                  onClick={() => setModalActividadAbierto(false)}
                  className="px-4 py-2 text-text-muted dark:text-text-subtle hover:bg-surface-elevated dark:hover:bg-surface-elevated rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-sm"
                >
                  Guardar Actividad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CONTROL Y MODIFICACIÓN DE ASISTENCIA DE VOLUNTARIOS */}
      {/* ===================================================================== */}
      {modalAsistenciaActividad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-surface dark:bg-surface rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-border dark:border-border max-h-[90vh] overflow-y-auto text-text dark:text-text">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold text-primary dark:text-primary-hover uppercase tracking-wider">
                  Control & Acreditación de Voluntarios
                </span>
                <h3 className="text-xl font-bold text-text dark:text-text mt-1">{modalAsistenciaActividad.nombre}</h3>
                <p className="text-xs text-text-muted dark:text-text-subtle">
                  📅 {modalAsistenciaActividad.fecha} • ⏰ {modalAsistenciaActividad.hora_inicio} a {modalAsistenciaActividad.hora_fin} • 📍 {modalAsistenciaActividad.lugar}
                </p>
              </div>
              <button
                onClick={() => setModalAsistenciaActividad(null)}
                className="text-text-subtle hover:text-text dark:hover:text-text p-1 rounded-lg"
              >
                ✕
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
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-success-soft text-success dark:bg-success-soft dark:text-success">
                            ✓ Asistió ({v.horas_acreditadas} hrs)
                          </span>
                          <button
                            onClick={() => marcarAsistenciaVoluntario(v, false)}
                            className="px-2 py-1 text-xs text-error dark:text-error hover:underline"
                            title="Desmarcar o rectificar asistencia"
                          >
                            Modificar
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => marcarAsistenciaVoluntario(v, true)}
                            className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold shadow-xs transition"
                          >
                            Marcar Asistió
                          </button>
                          <button
                            onClick={() => marcarAsistenciaVoluntario(v, false)}
                            className="px-3 py-1.5 bg-surface-inset dark:bg-surface-elevated hover:bg-surface-inset dark:hover:bg-surface-elevated text-text dark:text-text-subtle rounded-lg text-xs font-semibold transition"
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

            <div className="mt-6 pt-4 border-t border-border dark:border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-text-muted dark:text-text-subtle">
              <span>* Al confirmar asistencia, la base de datos promueve automáticamente al usuario a Voluntario Aprobado.</span>
              <button
                onClick={() => setModalAsistenciaActividad(null)}
                className="px-4 py-2 bg-surface-elevated dark:bg-surface-elevated hover:bg-surface-inset dark:hover:bg-surface-elevated text-text dark:text-text-muted rounded-xl font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
