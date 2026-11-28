import { Link } from 'react-router-dom';

export function SolicitudesAyudaSection() {
  return (
    <section id="solicitudes" className="py-20 bg-surface dark:bg-surface border-b border-border dark:border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.26em] text-accent-text">
              <span aria-hidden="true" className="h-px w-8 bg-accent" />
              Atención directa a la comunidad
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.02] tracking-[-0.03em] text-balance text-text sm:text-4xl lg:text-[2.9rem]">
              Solicitudes de ayuda para familias e instituciones
            </h2>
            <p className="mt-4 max-w-[560px] text-base leading-relaxed text-text-muted">
              Cualquier persona en situación de necesidad, familia afectada o comedor popular puede solicitar apoyo directo. Cada solicitud pasa por una rigurosa evaluación social para garantizar que la ayuda llegue a quienes verdaderamente lo necesitan.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-4 p-4 bg-surface-elevated dark:bg-surface-elevated rounded-xl border border-border dark:border-border">
                <div className="w-10 h-10 rounded-lg bg-accent-soft dark:bg-accent-soft text-accent-text dark:text-accent-text flex items-center justify-center font-bold text-lg shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-text dark:text-text">Registro de la Solicitud</h4>
                  <p className="text-sm text-text-muted dark:text-text-subtle mt-0.5">
                    Se presenta la solicitud en persona en sucursal o en la plataforma completando los datos de necesidad y documentación.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-surface-elevated dark:bg-surface-elevated rounded-xl border border-border dark:border-border">
                <div className="w-10 h-10 rounded-lg bg-accent-soft dark:bg-accent-soft text-accent-text dark:text-accent-text flex items-center justify-center font-bold text-lg shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-text dark:text-text">Evaluación y Aprobación</h4>
                  <p className="text-sm text-text-muted dark:text-text-subtle mt-0.5">
                    El equipo administrativo verifica la situación socioeconómica, valida los documentos y aprueba el requerimiento.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-surface-elevated dark:bg-surface-elevated rounded-xl border border-border dark:border-border">
                <div className="w-10 h-10 rounded-lg bg-accent-soft dark:bg-accent-soft text-accent-text dark:text-accent-text flex items-center justify-center font-bold text-lg shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-text dark:text-text">Publicación y Apoyo Voluntario</h4>
                  <p className="text-sm text-text-muted dark:text-text-subtle mt-0.5">
                    La solicitud aprobada se vincula con donaciones y se organizan actividades de entrega directa con voluntarios acreditados.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/registro"
                className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold shadow-sm transition"
              >
                Solicitar Apoyo
              </Link>
              <a
                href="#campanas"
                className="px-6 py-3 bg-surface dark:bg-surface-elevated hover:bg-surface-elevated dark:hover:bg-surface-elevated text-text dark:text-text-muted rounded-xl text-sm font-semibold border border-border dark:border-border transition"
              >
                Ver Causas Activas
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-border dark:border-border bg-surface-elevated dark:bg-surface-elevated">
              <img
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900"
                alt="Ayuda solidaria comunitaria"
                className="w-full h-[480px] object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-surface dark:bg-surface-elevated p-6 rounded-2xl shadow-xl border border-border dark:border-border max-w-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-success-soft dark:bg-success-soft text-success dark:text-success flex items-center justify-center">
                  <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-muted dark:text-text-subtle uppercase">100% Verificado</p>
                  <p className="text-sm font-extrabold text-text dark:text-text">Transparencia en cada entrega</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
