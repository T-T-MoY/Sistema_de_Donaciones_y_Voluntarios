import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { campanaApi } from '../../api/campana.api';
import type { Actividad } from '../../types/campana.types';
import { useAuth } from '../../context/AuthContext';

export function VoluntariadoSection() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actividadSeleccionada, setActividadSeleccionada] = useState<Actividad | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { usuario } = useAuth();

  useEffect(() => {
    campanaApi
      .listarActividadesPublicas()
      .then((data) => setActividades(data))
      .catch((err) => console.error('Error al cargar actividades públicas:', err))
      .finally(() => setCargando(false));
  }, []);

  const handleInscribirseClick = (act: Actividad) => {
    if (!usuario) {
      navigate('/login', { state: { returnTo: '/#voluntariado' } });
      return;
    }
    setActividadSeleccionada(act);
    setObservaciones('');
    setError(null);
    setMensajeExito(null);
  };

  const handleConfirmarInscripcion = async () => {
    if (!actividadSeleccionada) return;
    setEnviando(true);
    setError(null);
    try {
      await campanaApi.inscribirse(actividadSeleccionada.id_actividad, observaciones);
      setMensajeExito('¡Te has inscrito exitosamente como voluntario a esta actividad! Te esperamos.');
      setActividades((prev) =>
        prev.map((a) =>
          a.id_actividad === actividadSeleccionada.id_actividad
            ? {
                ...a,
                voluntarios_inscritos: (a.voluntarios_inscritos || 0) + 1,
                cupos_disponibles: Math.max((a.cupos_disponibles || 1) - 1, 0),
              }
            : a
        )
      );
      setTimeout(() => {
        setActividadSeleccionada(null);
        setMensajeExito(null);
      }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo completar la inscripción.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section id="voluntariado" className="py-20 bg-surface dark:bg-surface border-b border-border dark:border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary-soft dark:bg-primary-soft/70 text-primary dark:text-primary-hover border border-primary/25 dark:border-primary/30 uppercase tracking-wider mb-4">
            Participa en Terreno
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text dark:text-text tracking-tight">
            Actividades de Voluntariado Abiertas
          </h2>
          <p className="mt-4 text-lg text-text-muted dark:text-text-subtle">
            Pon tus manos y corazón al servicio. Elige una actividad, inscríbete y colabora en acopio, logística o distribución.
          </p>
        </div>

        {cargando ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary" />
          </div>
        ) : actividades.length === 0 ? (
          <div className="text-center py-12 bg-surface-elevated dark:bg-surface-elevated rounded-2xl border border-dashed border-border dark:border-border">
            <p className="text-text-muted dark:text-text-subtle font-medium">No hay actividades con cupos abiertos por el momento. ¡Vuelve pronto!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {actividades.map((act) => {
              const cupos = act.cupos_disponibles ?? act.max_voluntarios;
              const sinCupos = cupos <= 0;

              return (
                <div
                  key={act.id_actividad}
                  className="bg-surface-elevated dark:bg-surface-elevated rounded-2xl border border-border dark:border-border p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-primary-soft dark:bg-primary-soft/70 text-primary dark:text-primary-hover">
                        {act.tipo_actividad}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          sinCupos
                            ? 'bg-error-soft dark:bg-error-soft text-error dark:text-error'
                            : 'bg-success-soft dark:bg-success-soft text-success dark:text-success'
                        }`}
                      >
                        {sinCupos ? 'Cupos agotados' : `${cupos} cupos libres`}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-text dark:text-text mb-2">{act.nombre}</h3>
                    <p className="text-sm text-text-muted dark:text-text-subtle mb-4 line-clamp-2">
                      {act.descripcion || 'Sin descripción detallada.'}
                    </p>

                    <div className="space-y-2 text-xs font-medium text-text dark:text-text-subtle bg-surface dark:bg-surface p-3.5 rounded-xl border border-border dark:border-border mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-text-subtle">📅</span>
                        <span>Fecha: <strong className="text-text dark:text-text">{act.fecha}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-text-subtle">⏰</span>
                        <span>Horario: <strong className="text-text dark:text-text">{act.hora_inicio} - {act.hora_fin}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-text-subtle">📍</span>
                        <span className="truncate">Lugar: <strong className="text-text dark:text-text">{act.lugar}</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={sinCupos}
                    onClick={() => handleInscribirseClick(act)}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-bold shadow-sm transition-all text-center flex items-center justify-center gap-2 ${
                      sinCupos
                        ? 'bg-surface-inset dark:bg-surface-elevated text-text-subtle cursor-not-allowed'
                        : 'bg-primary hover:bg-primary-hover text-white hover:shadow'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    {sinCupos ? 'Sin cupos disponibles' : 'Inscribirme como Voluntario'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de Inscripción */}
        {actividadSeleccionada && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="bg-surface dark:bg-surface rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-border dark:border-border text-text dark:text-text animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-primary dark:text-primary-hover uppercase tracking-wider">Confirmar Participación</span>
                  <h3 className="text-xl font-bold text-text dark:text-text mt-1">{actividadSeleccionada.nombre}</h3>
                </div>
                <button
                  onClick={() => setActividadSeleccionada(null)}
                  className="text-text-subtle hover:text-text dark:hover:text-text p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {mensajeExito ? (
                <div className="p-4 bg-success-soft dark:bg-success-soft/60 border border-success/25 dark:border-success/30 text-success dark:text-success rounded-xl text-sm font-medium">
                  {mensajeExito}
                </div>
              ) : (
                <>
                  <p className="text-sm text-text-muted dark:text-text-subtle mb-4">
                    Al inscribirte, asumes el compromiso de asistir puntualmente. Al completar la actividad y marcar tu asistencia, tu perfil será acreditado automáticamente como Voluntario Aprobado.
                  </p>

                  {error && (
                    <div className="p-3 mb-4 bg-error-soft dark:bg-error-soft border border-error/25 dark:border-error/30 text-error dark:text-error rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  <div className="mb-5">
                    <label className="block text-xs font-bold text-text dark:text-text-subtle uppercase tracking-wider mb-2">
                      Observaciones o disponibilidad especial (Opcional)
                    </label>
                    <textarea
                      rows={3}
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      placeholder="Ej. Cuento con vehículo propio para apoyo, experiencia en primeros auxilios..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border dark:border-border bg-surface-elevated dark:bg-surface-elevated text-text dark:text-text text-sm focus:ring-2 focus:ring-primary focus:outline-hidden"
                    />
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setActividadSeleccionada(null)}
                      className="px-4 py-2.5 text-sm font-semibold text-text dark:text-text-subtle hover:bg-surface-elevated dark:hover:bg-surface-elevated rounded-xl transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={enviando}
                      onClick={handleConfirmarInscripcion}
                      className="px-5 py-2.5 text-sm font-bold bg-primary hover:bg-primary-hover text-white rounded-xl shadow-sm transition disabled:opacity-50"
                    >
                      {enviando ? 'Inscribiendo...' : 'Confirmar Inscripción'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
