import { useSeguimientoVoluntarios } from '../../hooks/useSeguimientoVoluntarios';

function formatoFecha(fecha: string) {
  if (!fecha) return '—';

  // Evita que la fecha se muestre un día antes por la zona horaria.
  const fechaCorta = fecha.slice(0, 10);
  const partes = fechaCorta.split('-');

  if (partes.length !== 3) return fechaCorta;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatoNumero(valor: number | string | null | undefined) {
  return Number(valor ?? 0).toLocaleString('es-BO', {
    maximumFractionDigits: 2,
  });
}

function textoEstado(estado: string) {
  switch (estado) {
    case 'Asistio':
      return 'Asistió';
    case 'No_Asistio':
      return 'No asistió';
    case 'Inscrito':
      return 'Pendiente';
    case 'Confirmado':
      return 'Pendiente';
    case 'Cancelado':
      return 'Cancelado';
    default:
      return estado;
  }
}

function colorEstado(estado: string) {
  switch (estado) {
    case 'Asistio':
      return 'bg-success-soft text-success';
    case 'No_Asistio':
      return 'bg-error-soft text-error';
    case 'Cancelado':
      return 'bg-surface-sunken text-text-subtle';
    default:
      return 'bg-warning-soft text-warning';
  }
}

export default function SeguimientoPage() {
  const {
    participaciones,
    estadisticas,
    evolucion,
    distribucion,
    filtros,
    actividades,
    voluntarios,
    cargando,
    cargandoFiltros,
    error,
    actualizarFiltros,
    aplicarFiltros,
    limpiarFiltros,
    historial,
    mostrarHistorial,
    cargandoHistorial,
    errorHistorial,
    abrirHistorial,
    cerrarHistorial,
  } = useSeguimientoVoluntarios();

  const maxParticipaciones = Math.max(
    ...evolucion.map((item) => Number(item.participaciones)),
    1,
  );

  const totalDistribucion = Math.max(
    ...distribucion.map((item) => Number(item.cantidad)),
    1,
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold text-text">
          Seguimiento general del voluntariado
        </h2>
        <p className="mt-2 text-text-subtle">
          Consulta las participaciones, asistencias y horas acreditadas de los
          voluntarios.
        </p>
      </div>

      {/* Filtros */}
      <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-text">
          Filtros de búsqueda
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Desde
            </label>
            <input
              type="date"
              value={filtros.desde}
              onChange={(e) =>
                actualizarFiltros({ desde: e.target.value })
              }
              className="w-full rounded-lg border border-border bg-surface-inset px-3 py-2 text-text"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Hasta
            </label>
            <input
              type="date"
              value={filtros.hasta}
              onChange={(e) =>
                actualizarFiltros({ hasta: e.target.value })
              }
              className="w-full rounded-lg border border-border bg-surface-inset px-3 py-2 text-text"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Actividad
            </label>
            <select
              value={filtros.id_actividad ?? ''}
              onChange={(e) =>
                actualizarFiltros({
                  id_actividad: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
              disabled={cargandoFiltros}
              className="w-full rounded-lg border border-border bg-surface-inset px-3 py-2 text-text"
            >
              <option value="">Todas las actividades</option>
              {actividades.map((actividad) => (
                <option
                  key={actividad.id_actividad}
                  value={actividad.id_actividad}
                >
                  {actividad.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Voluntario
            </label>
            <select
              value={filtros.id_voluntario ?? ''}
              onChange={(e) =>
                actualizarFiltros({
                  id_voluntario: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
              disabled={cargandoFiltros}
              className="w-full rounded-lg border border-border bg-surface-inset px-3 py-2 text-text"
            >
              <option value="">Todos los voluntarios</option>
              {voluntarios.map((voluntario) => (
                <option
                  key={voluntario.id_voluntario}
                  value={voluntario.id_voluntario}
                >
                  {voluntario.voluntario_nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void aplicarFiltros()}
            className="rounded-lg bg-primary px-5 py-2 font-medium text-on-primary hover:bg-primary-hover"
          >
            Aplicar filtros
          </button>

          <button
            type="button"
            onClick={() => void limpiarFiltros()}
            className="rounded-lg border border-border px-5 py-2 font-medium text-text hover:bg-surface-sunken"
          >
            Limpiar filtros
          </button>
        </div>
      </section>

      {/* Mensaje de error */}
      {error && (
        <div className="rounded-lg border border-error/30 bg-error-soft p-4 text-sm text-error">
          {error}
        </div>
      )}

      {/* Tarjetas estadísticas */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-text-subtle">Participaciones</p>
          <p className="mt-2 text-3xl font-bold text-text">
            {cargando ? '...' : formatoNumero(estadisticas?.total_participaciones)}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-text-subtle">Asistencias</p>
          <p className="mt-2 text-3xl font-bold text-success">
            {cargando ? '...' : formatoNumero(estadisticas?.total_asistencias)}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-text-subtle">Ausencias</p>
          <p className="mt-2 text-3xl font-bold text-error">
            {cargando ? '...' : formatoNumero(estadisticas?.total_ausencias)}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-text-subtle">Horas acreditadas</p>
          <p className="mt-2 text-3xl font-bold text-primary">
            {cargando ? '...' : formatoNumero(estadisticas?.total_horas)}
          </p>
        </div>
      </section>

      {/* Gráficos */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="mb-5 text-lg font-semibold text-text">
            Evolución de participaciones
          </h3>

          {cargando ? (
            <p className="text-sm text-text-subtle">Cargando gráfico...</p>
          ) : evolucion.length === 0 ? (
            <p className="text-sm text-text-subtle">
              No hay datos para mostrar en este período.
            </p>
          ) : (
            <div className="flex h-52 items-end gap-3 overflow-x-auto border-b border-border pb-2">
              {evolucion.map((item) => {
                const cantidad = Number(item.participaciones);
                const altura = Math.max(
                  (cantidad / maxParticipaciones) * 100,
                  5,
                );

                return (
                  <div
                    key={item.fecha}
                    className="flex h-full min-w-12 flex-1 flex-col items-center justify-end gap-2"
                    title={`${formatoFecha(item.fecha)}: ${cantidad} participaciones`}
                  >
                    <span className="text-xs font-semibold text-text">
                      {cantidad}
                    </span>
                    <div
                      className="w-full max-w-12 rounded-t-md bg-primary"
                      style={{ height: `${altura}%` }}
                    />
                    <span className="text-center text-xs text-text-subtle">
                      {formatoFecha(item.fecha)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="mb-5 text-lg font-semibold text-text">
            Distribución de asistencia
          </h3>

          {cargando ? (
            <p className="text-sm text-text-subtle">Cargando gráfico...</p>
          ) : distribucion.length === 0 ? (
            <p className="text-sm text-text-subtle">
              No hay datos para mostrar.
            </p>
          ) : (
            <div className="space-y-5">
              {distribucion.map((item) => {
                const cantidad = Number(item.cantidad);
                const porcentaje = (cantidad / totalDistribucion) * 100;
                const color =
                  item.estado === 'Asistencias'
                    ? 'bg-success'
                    : item.estado === 'Ausencias'
                      ? 'bg-error'
                      : 'bg-warning';

                return (
                  <div key={item.estado}>
                    <div className="mb-2 flex justify-between gap-3 text-sm">
                      <span className="font-medium text-text">
                        {item.estado}
                      </span>
                      <span className="text-text-subtle">
                        {cantidad} ({porcentaje.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-surface-sunken">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Tabla de participaciones */}
      <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border p-5">
          <h3 className="text-lg font-semibold text-text">
            Registro de participaciones
          </h3>
          <p className="mt-1 text-sm text-text-subtle">
            Consulta el registro de actividades de los voluntarios.
          </p>
        </div>

        {cargando ? (
          <p className="p-6 text-center text-text-subtle">
            Cargando participaciones...
          </p>
        ) : participaciones.length === 0 ? (
          <p className="p-6 text-center text-text-subtle">
            No se encontraron participaciones con los filtros seleccionados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-surface-sunken text-text-subtle">
                <tr>
                  <th className="px-4 py-3 font-semibold">Voluntario</th>
                  <th className="px-4 py-3 font-semibold">Actividad</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Asistencia</th>
                  <th className="px-4 py-3 font-semibold">Horas</th>
                  <th className="px-4 py-3 font-semibold">Observaciones</th>
                  <th className="px-4 py-3 font-semibold">Acción</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {participaciones.map((participacion) => (
                  <tr
                    key={participacion.id_participacion}
                    className="hover:bg-surface-sunken"
                  >
                    <td className="px-4 py-3 font-medium text-text">
                      {participacion.voluntario_nombre}
                    </td>
                    <td className="px-4 py-3 text-text">
                      {participacion.actividad_nombre}
                    </td>
                    <td className="px-4 py-3 text-text">
                      {formatoFecha(participacion.actividad_fecha)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${colorEstado(participacion.estado)}`}
                      >
                        {textoEstado(participacion.estado)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text">
                      {formatoNumero(participacion.horas_acreditadas)}
                    </td>
                    <td className="max-w-48 px-4 py-3 text-text-subtle">
                      {participacion.observaciones || 'Sin observaciones'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          void abrirHistorial(participacion.id_voluntario)
                        }
                        className="font-medium text-primary hover:underline"
                      >
                        Ver historial
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Ventana del historial individual */}
      {mostrarHistorial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-night/55 p-4"
          onClick={cerrarHistorial}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-historial"
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-surface shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h3
                  id="titulo-historial"
                  className="text-xl font-bold text-text"
                >
                  Historial del voluntario
                </h3>
                <p className="mt-1 text-sm text-text-subtle">
                  Detalle de sus participaciones y asistencias.
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarHistorial}
                aria-label="Cerrar historial"
                className="rounded-lg px-3 py-2 text-xl text-text-subtle hover:bg-surface-sunken"
              >
                ×
              </button>
            </div>

            {cargandoHistorial ? (
              <p className="p-8 text-center text-text-subtle">
                Cargando historial...
              </p>
            ) : errorHistorial ? (
              <p className="p-8 text-center text-error">
                {errorHistorial}
              </p>
            ) : historial ? (
              <div className="space-y-5 p-5">
                <div>
                  <h4 className="text-lg font-semibold text-text">
                    {historial.voluntario.voluntario_nombre}
                  </h4>
                  <p className="text-sm text-text-subtle">
                    {historial.voluntario.voluntario_correo}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="rounded-lg bg-surface-sunken p-4">
                    <p className="text-xs text-text-subtle">Participaciones</p>
                    <p className="mt-1 text-2xl font-bold text-text">
                      {formatoNumero(
                        historial.estadisticas.total_participaciones,
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface-sunken p-4">
                    <p className="text-xs text-text-subtle">Asistencias</p>
                    <p className="mt-1 text-2xl font-bold text-success">
                      {formatoNumero(
                        historial.estadisticas.total_asistencias,
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface-sunken p-4">
                    <p className="text-xs text-text-subtle">Ausencias</p>
                    <p className="mt-1 text-2xl font-bold text-error">
                      {formatoNumero(
                        historial.estadisticas.total_ausencias,
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface-sunken p-4">
                    <p className="text-xs text-text-subtle">Horas acreditadas</p>
                    <p className="mt-1 text-2xl font-bold text-primary">
                      {formatoNumero(historial.estadisticas.total_horas)}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold text-text">
                    Actividades realizadas
                  </h4>

                  {historial.participaciones.length === 0 ? (
                    <p className="text-sm text-text-subtle">
                      Este voluntario todavía no tiene participaciones.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px] text-left text-sm">
                        <thead className="bg-surface-sunken text-text-subtle">
                          <tr>
                            <th className="px-3 py-3">Actividad</th>
                            <th className="px-3 py-3">Fecha</th>
                            <th className="px-3 py-3">Estado</th>
                            <th className="px-3 py-3">Horas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {historial.participaciones.map((item) => (
                            <tr key={item.id_participacion}>
                              <td className="px-3 py-3 text-text">
                                {item.actividad_nombre}
                              </td>
                              <td className="px-3 py-3 text-text">
                                {formatoFecha(item.actividad_fecha)}
                              </td>
                              <td className="px-3 py-3">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${colorEstado(item.estado)}`}
                                >
                                  {textoEstado(item.estado)}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-text">
                                {formatoNumero(item.horas_acreditadas)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div className="flex justify-end border-t border-border p-4">
              <button
                type="button"
                onClick={cerrarHistorial}
                className="rounded-lg border border-border px-5 py-2 font-medium text-text hover:bg-surface-sunken"
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
