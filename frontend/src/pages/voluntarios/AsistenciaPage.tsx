
import { useEffect, useState } from 'react';
import { campanaApi } from '../../api/campana.api';
import type {
  Actividad,
  ParticipacionItem,
} from '../../types/campana.types';

export default function AsistenciaPage() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [actividadId, setActividadId] = useState('');
  const [participaciones, setParticipaciones] = useState<
    ParticipacionItem[]
  >([]);

  const [cargando, setCargando] = useState(true);
  const [guardandoId, setGuardandoId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Cargar actividades disponibles
  useEffect(() => {
    const cargarActividades = async () => {
      try {
        setCargando(true);
        setError('');

        const datos = await campanaApi.listarActividades();

        const disponibles = datos.filter(
          (actividad) => actividad.estado !== 'Cancelada'
        );

        setActividades(disponibles);
      } catch {
        setError('No se pudieron cargar las actividades.');
      } finally {
        setCargando(false);
      }
    };

    void cargarActividades();
  }, []);

  // Cargar inscritos cuando se selecciona una actividad
  useEffect(() => {
    if (!actividadId) {
      setParticipaciones([]);
      return;
    }

    const cargarParticipaciones = async () => {
      try {
        setError('');
        setMensaje('');

        const datos =
          await campanaApi.listarVoluntariosActividad(
            Number(actividadId)
          );

        setParticipaciones(datos);
      } catch {
        setError('No se pudieron cargar los voluntarios inscritos.');
      }
    };

    void cargarParticipaciones();
  }, [actividadId]);

  const actividadSeleccionada = actividades.find(
    (actividad) => actividad.id_actividad === Number(actividadId)
  );

  // Registrar asistencia o ausencia
  const registrar = async (
    participacion: ParticipacionItem,
    asistio: boolean
  ) => {
    try {
      setGuardandoId(participacion.id_participacion);
      setError('');
      setMensaje('');

      await campanaApi.registrarAsistencia(
        participacion.id_participacion,
        {
          asistio,
          horas_acreditadas: asistio
            ? Number(participacion.horas_acreditadas) || 0
            : 0,
          observaciones: participacion.observaciones ?? '',
        }
      );

      // Actualizar la fila en pantalla
      setParticipaciones((actuales) =>
        actuales.map((item) =>
          item.id_participacion === participacion.id_participacion
            ? {
                ...item,
                asistio,
                estado: asistio ? 'Asistio' : 'No_Asistio',
                horas_acreditadas: asistio
                  ? Number(item.horas_acreditadas) || 0
                  : 0,
              }
            : item
        )
      );

      setMensaje(
        asistio
          ? 'Asistencia registrada correctamente.'
          : 'Ausencia registrada correctamente.'
      );
    } catch {
      setError('No se pudo registrar la asistencia.');
    } finally {
      setGuardandoId(null);
    }
  };

  // Editar observaciones y horas antes de registrar
  const actualizarParticipacion = (
    id: number,
    campo: 'observaciones' | 'horas_acreditadas',
    valor: string
  ) => {
    setParticipaciones((actuales) =>
      actuales.map((item) =>
        item.id_participacion === id
          ? {
              ...item,
              [campo]:
                campo === 'horas_acreditadas'
                  ? Number(valor)
                  : valor,
            }
          : item
      )
    );
  };

  const totalAsistencias = participaciones.filter(
    (p) => p.estado === 'Asistio'
  ).length;

  const totalAusencias = participaciones.filter(
    (p) => p.estado === 'No_Asistio'
  ).length;

  const totalHoras = participaciones.reduce(
    (total, p) => total + Number(p.horas_acreditadas || 0),
    0
  );

  if (cargando) {
    return (
      <div className="rounded-xl border border-border bg-surface-elevated p-6 text-sm text-text-subtle">
        <div className="flex items-center gap-3">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
          Cargando actividades...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-xl font-bold text-text">
          Control de asistencia
        </h2>
        <p className="mt-1 text-sm text-text-subtle">
          Registro de asistencia de los voluntarios por actividad.
        </p>
      </div>

      {/* Selección de actividad */}
      <section className="rounded-xl border border-border bg-surface-elevated p-5 transition-colors duration-200">
        <label
          htmlFor="actividad"
          className="mb-2 block text-sm font-semibold text-text"
        >
          Seleccionar actividad
        </label>

        <select
          id="actividad"
          value={actividadId}
          onChange={(e) => setActividadId(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Selecciona una actividad</option>

          {actividades.map((actividad) => (
            <option
              key={actividad.id_actividad}
              value={actividad.id_actividad}
            >
              {actividad.nombre} - {actividad.fecha}
            </option>
          ))}
        </select>

        {actividadSeleccionada && (
          <div className="mt-4 grid gap-2 rounded-lg bg-surface-secondary p-3 text-sm text-text-subtle">
            <p>
              <strong className="text-text">Fecha:</strong>{' '}
              {actividadSeleccionada.fecha}
            </p>
            <p>
              <strong className="text-text">Horario:</strong>{' '}
              {actividadSeleccionada.hora_inicio} -{' '}
              {actividadSeleccionada.hora_fin}
            </p>
            <p>
              <strong className="text-text">Lugar:</strong>{' '}
              {actividadSeleccionada.lugar}
            </p>
          </div>
        )}
      </section>

      {/* Mensajes */}
      {error && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
          {mensaje}
        </div>
      )}

      {actividadId && (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Tarjeta
              titulo="Inscritos"
              valor={participaciones.length}
            />
            <Tarjeta
              titulo="Asistencias"
              valor={totalAsistencias}
              color="primary"
            />
            <Tarjeta
              titulo="Ausencias"
              valor={totalAusencias}
              color="secondary"
            />
            <Tarjeta
              titulo="Horas acreditadas"
              valor={`${totalHoras.toFixed(2)} h`}
            />
          </div>

          {/* Tabla de inscritos */}
          <section className="overflow-hidden rounded-xl border border-border bg-surface-elevated">
            <div className="border-b border-border p-5">
              <h3 className="font-bold text-text">
                Voluntarios inscritos
              </h3>
              <p className="mt-1 text-xs text-text-subtle">
                Marca la asistencia de cada voluntario.
              </p>
            </div>

            {participaciones.length === 0 ? (
              <p className="p-5 text-sm text-text-subtle">
                No hay voluntarios inscritos en esta actividad.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-secondary text-text-subtle">
                    <tr>
                      <th className="p-3">Voluntario</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Horas</th>
                      <th className="p-3">Observaciones</th>
                      <th className="p-3">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {participaciones
                      .filter((p) => p.estado !== 'Cancelado')
                      .map((p) => {
                        const guardando =
                          guardandoId === p.id_participacion;

                        return (
                          <tr
                            key={p.id_participacion}
                            className="border-t border-border transition-colors duration-200 hover:bg-surface-secondary/50"
                          >
                            <td className="p-3">
                              <p className="font-semibold text-text">
                                {p.voluntario_nombre}
                              </p>
                              <p className="text-xs text-text-subtle">
                                {p.voluntario_correo}
                              </p>
                            </td>

                            <td className="p-3">
                              <EstadoAsistencia estado={p.estado} />
                            </td>

                            <td className="p-3">
                              <input
                                type="number"
                                min="0"
                                max="99"
                                step="0.25"
                                value={p.horas_acreditadas}
                                disabled={
                                  p.estado === 'No_Asistio' || guardando
                                }
                                onChange={(e) =>
                                  actualizarParticipacion(
                                    p.id_participacion,
                                    'horas_acreditadas',
                                    e.target.value
                                  )
                                }
                                className="w-20 rounded-lg border border-border bg-surface px-2 py-1 text-text outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                              />
                            </td>

                            <td className="p-3">
                              <textarea
                                value={p.observaciones ?? ''}
                                disabled={guardando}
                                onChange={(e) =>
                                  actualizarParticipacion(
                                    p.id_participacion,
                                    'observaciones',
                                    e.target.value
                                  )
                                }
                                rows={2}
                                className="min-w-40 rounded-lg border border-border bg-surface px-2 py-1 text-text outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                                placeholder="Observaciones..."
                              />
                            </td>

                            <td className="p-3">
                              <div className="flex flex-col gap-2">
                                {/* Botón Asistió */}
                                <button
                                  type="button"
                                  disabled={guardando}
                                  onClick={() => void registrar(p, true)}
                                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 hover:brightness-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
                                    p.estado === 'Asistio'
                                      ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                                      : 'bg-primary text-white hover:-translate-y-0.5'
                                  }`}
                                >
                                  {guardando ? (
                                    <span className="inline-flex items-center gap-2">
                                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                      Guardando
                                    </span>
                                  ) : p.estado === 'Asistio' ? (
                                    <span className="inline-flex items-center gap-1">
                                      ✓ Asistió
                                    </span>
                                  ) : (
                                    'Asistió'
                                  )}
                                </button>

                                {/* Botón Ausente */}
                                <button
                                  type="button"
                                  disabled={guardando}
                                  onClick={() => void registrar(p, false)}
                                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 hover:brightness-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
                                    p.estado === 'No_Asistio'
                                      ? 'bg-sky-100 text-sky-700 ring-1 ring-sky-300'
                                      : 'border border-sky-300 bg-sky-50 text-sky-700 hover:-translate-y-0.5 hover:bg-sky-100'
                                  }`}
                                >
                                  {guardando ? (
                                    <span className="inline-flex items-center gap-2">
                                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                      Guardando
                                    </span>
                                  ) : p.estado === 'No_Asistio' ? (
                                    <span className="inline-flex items-center gap-1">
                                      ⏻ Ausente
                                    </span>
                                  ) : (
                                    'Ausente'
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Tarjeta({
  titulo,
  valor,
  color = 'default',
}: {
  titulo: string;
  valor: string | number;
  color?: 'default' | 'primary' | 'secondary';
}) {
  const colorValor =
    color === 'primary'
      ? 'text-primary'
      : color === 'secondary'
        ? 'text-sky-600'
        : 'text-text';

  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
      <p className="text-xs text-text-subtle">{titulo}</p>
      <p className={`mt-2 text-2xl font-bold ${colorValor}`}>
        {valor}
      </p>
    </div>
  );
}

function EstadoAsistencia({
  estado,
}: {
  estado: string;
}) {
  if (estado === 'Asistio') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
        ✓ Asistió
      </span>
    );
  }

  if (estado === 'No_Asistio') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
        ⏻ Ausente
      </span>
    );
  }

  return (
    <span className="rounded-full bg-surface-secondary px-3 py-1 text-xs font-semibold text-text-subtle">
      Pendiente
    </span>
  );
}
