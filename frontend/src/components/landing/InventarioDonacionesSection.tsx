export function InventarioDonacionesSection() {
  return (
    <section id="inventario" className="py-20 bg-surface dark:bg-surface border-b border-border dark:border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-primary to-primary-hover text-white rounded-3xl p-8 sm:p-14 shadow-deep relative overflow-hidden">
          {/* Fondo sutil */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-cream/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.26em] text-cream/80">
              <span aria-hidden="true" className="h-px w-8 bg-cream/50" />
              Almacén central de la asociación
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.02] tracking-[-0.03em] text-balance text-on-primary sm:text-4xl">
              Donaciones directas al inventario
            </h2>
            <p className="mt-4 text-base sm:text-lg text-on-primary/85 leading-relaxed">
              ¿Tienes ropa, calzado, frazadas o alimentos no perecederos en buen estado? Puedes entregarlos directamente a nuestro inventario general para que sean clasificados y resguardados hasta ser canalizados ante futuras emergencias o solicitudes urgentes.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface-elevated/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xs">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-on-primary">
                    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 21V5a2 2 0 012-2h8a2 2 0 012 2v16M4 21h16M16 21V9h2a2 2 0 012 2v10M8 7h4M8 11h4M8 15h4" />
                    </svg>
                  </span>
                  <h4 className="font-bold text-white">Modalidad Exclusivamente Presencial</h4>
                </div>
                <p className="text-xs text-on-primary/80 leading-relaxed">
                  Para garantizar la calidad e higiene de los bienes, estas donaciones se reciben <strong>únicamente de manera física en nuestra sucursal central</strong>.
                </p>
              </div>

              <div className="bg-surface-elevated/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xs">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-on-primary">
                    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </span>
                  <h4 className="font-bold text-white">Registro y Trazabilidad Oficial</h4>
                </div>
                <p className="text-xs text-on-primary/80 leading-relaxed">
                  Un <strong>administrador autorizado</strong> inspecciona los artículos, genera el comprobante digital y lo asocia formalmente a tu cuenta de donante en el sistema.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-on-primary/80 uppercase tracking-wider">Centro de Acopio e Inventario General</p>
                <p className="text-sm font-bold text-white mt-1">Av. Busch esq. Villalobos #1200, Miraflores, La Paz</p>
                <p className="text-xs text-on-primary/80 mt-0.5">Horario de atención: Lunes a Viernes de 08:30 a 17:30</p>
              </div>

              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 px-6 py-3 bg-cream hover:bg-white text-primary font-bold rounded-xl text-sm transition-all shadow-lg"
              >
                Ver Ubicación en Mapa
                <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M7 17L17 7M7 7h10v10" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
