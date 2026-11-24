import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { campanaApi } from '../../api/campana.api';
import type { Campana } from '../../types/campana.types';
import { useAuth } from '../../context/AuthContext';

export function CampanasSection() {
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();
  const { usuario } = useAuth();

  useEffect(() => {
    campanaApi
      .listarPublicas()
      .then((data) => setCampanas(data))
      .catch((err) => console.error('Error al cargar campañas públicas:', err))
      .finally(() => setCargando(false));
  }, []);

  const handleApoyar = (campana: Campana) => {
    if (!usuario) {
      navigate('/login', { state: { returnTo: `/donaciones?campanaId=${campana.id_campana}` } });
    } else {
      navigate(`/donaciones?campanaId=${campana.id_campana}`);
    }
  };

  return (
    <section id="campanas" className="py-20 bg-surface dark:bg-surface border-b border-border dark:border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-success-soft dark:bg-success-soft text-success dark:text-success border border-success/25 dark:border-success/30 uppercase tracking-wider mb-4">
            Iniciativas de Alto Impacto
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text dark:text-text tracking-tight">
            Campañas Solidarias Activas
          </h2>
          <p className="mt-4 text-lg text-text-muted dark:text-text-subtle">
            Únete a nuestras causas colectivas para brindar apoyo inmediato ante emergencias climáticas, salud y apoyo alimentario.
          </p>
        </div>

        {cargando ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-success dark:border-success" />
          </div>
        ) : campanas.length === 0 ? (
          <div className="text-center py-12 bg-surface-elevated dark:bg-surface-elevated rounded-2xl border border-dashed border-border dark:border-border">
            <p className="text-text-muted dark:text-text-subtle font-medium">
              Actualmente no hay campañas públicas activas. ¡Pronto anunciaremos nuevas convocatorias!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campanas.map((c) => {
              const meta = c.objetivo_recaudacion || 0;
              const recaudado = c.total_recaudado || 0;
              const porcentaje = meta > 0 ? Math.min(Math.round((recaudado / meta) * 100), 100) : 0;

              return (
                <div
                  key={c.id_campana}
                  className="group bg-surface-elevated dark:bg-surface-elevated rounded-2xl border border-border dark:border-border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Portada */}
                  <div className="relative h-48 w-full overflow-hidden bg-surface-elevated dark:bg-surface-elevated">
                    <img
                      src={c.portada_url || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800'}
                      alt={c.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm bg-primary text-white">
                        {c.estado}
                      </span>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-text-muted dark:text-text-subtle mb-2">
                        <span>📅 Inicio: {c.fecha_inicio}</span>
                        {c.fecha_fin && <span>• Fin: {c.fecha_fin}</span>}
                      </div>

                      <h3 className="text-xl font-bold text-text dark:text-text group-hover:text-success dark:group-hover:text-success transition-colors line-clamp-2">
                        {c.nombre}
                      </h3>

                      <p className="mt-2.5 text-sm text-text-muted dark:text-text-subtle line-clamp-3 leading-relaxed">
                        {c.descripcion || 'Sin descripción adicional para esta campaña.'}
                      </p>
                    </div>

                    <div className="mt-6 pt-5 border-t border-border dark:border-border">
                      {meta > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs font-bold text-text dark:text-text-subtle mb-1.5">
                            <span>Recaudado: Bs. {recaudado.toLocaleString()}</span>
                            <span>{porcentaje}% de Bs. {meta.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-surface-inset dark:bg-surface-elevated rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-primary dark:bg-success h-2.5 rounded-full transition-all duration-500"
                              style={{ width: `${porcentaje}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleApoyar(c)}
                          className="w-full py-2.5 px-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold shadow-sm transition-all hover:shadow text-center flex items-center justify-center gap-1.5"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          Donar
                        </button>

                        <a
                          href="#voluntariado"
                          className="w-full py-2.5 px-3 bg-surface-elevated dark:bg-surface-elevated hover:bg-surface-inset dark:hover:bg-surface-elevated text-text dark:text-text-muted rounded-xl text-sm font-semibold transition-all text-center flex items-center justify-center gap-1"
                        >
                          Voluntariado
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
