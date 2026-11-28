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
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[640px]">
            <span className="inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.26em] text-accent-text">
              <span aria-hidden="true" className="h-px w-8 bg-accent" />
              Participa en terreno
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.02] tracking-[-0.03em] text-balance text-text sm:text-4xl lg:text-[2.9rem]">
              Actividades de voluntariado abiertas
            </h2>
            <p className="mt-4 max-w-[560px] text-base leading-relaxed text-text-muted">
              Pon tus manos y corazón al servicio. Elige una actividad, inscríbete y colabora en acopio, logística o distribución.
            </p>
          </div>

          {actividades.length > 0 && (
            <div className="hidden shrink-0 items-center gap-4 md:flex">
              <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-text-subtle">
                {actividades.length} actividades abiertas
              </span>
              <span aria-hidden="true" className="h-px w-16 bg-border-strong" />
            </div>
          )}
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
                        <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3M4 11h16M5 21h14a1 1 0 001-1V7a1 1 0 00-1-1H5a1 1 0 00-1 1v13a1 1 0 001 1z" />
                        </svg>
                        <span>Fecha: <strong className="text-text dark:text-text">{act.fecha}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 7v5l3 2" />
                        </svg>
                        <span>Horario: <strong className="text-text dark:text-text">{act.hora_inicio} - {act.hora_fin}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" />
                          <circle cx="12" cy="10" r="2.5" strokeWidth={1.8} />
                        </svg>
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
                  aria-label="Cerrar"
                  className="text-text-subtle hover:text-text dark:hover:text-text p-1 rounded-lg"
                >
                  <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
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
