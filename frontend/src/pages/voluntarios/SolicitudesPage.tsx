
import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { voluntarioSolicitudesApi } from '../../api/voluntarioSolicitudes.api';
import { useToast } from '../../context/ToastContext';
import type { HistorialVoluntario, SolicitudVoluntario } from '../../types/usuario.types';
import EstadoSolicitudBadge from '../../components/voluntarios/solicitudes/EstadoSolicitudBadge';
import SolicitudDetalleDrawer from '../../components/voluntarios/solicitudes/SolicitudDetalleDrawer';

type FiltroEstado = 'Todos' | 'Pendiente' | 'Aprobado' | 'Rechazado';

const fechaCorta = (fecha: string) => {
  const date = new Date(fecha);
  return Number.isNaN(date.getTime())
    ? 'Fecha no disponible'
    : date.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
};

const mensajeError = (error: unknown) => {
  if (error instanceof AxiosError) {
    if (error.response?.status === 404) {
      return 'La ruta de solicitudes no existe en el backend activo. Reconstruye y reinicia el contenedor del backend.';
    }
    const respuesta = error.response?.data as { error?: string; mensaje?: string } | undefined;
    return respuesta?.error || respuesta?.mensaje || error.message;
  }
  return 'No se pudo completar la operación. Inténtalo nuevamente.';
};

export default function SolicitudesPage() {
  const { exito, error: mostrarError } = useToast();
  const [solicitudes, setSolicitudes] = useState<SolicitudVoluntario[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<FiltroEstado>('Todos');
  const [seleccionadaId, setSeleccionadaId] = useState<number | null>(null);
  const [rechazoInicialId, setRechazoInicialId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [idGuardando, setIdGuardando] = useState<number | null>(null);
  const [errorCarga, setErrorCarga] = useState('');

  useEffect(() => {
    let activa = true;
    voluntarioSolicitudesApi.listar()
      .then((data) => {
        if (activa) setSolicitudes(data);
      })
      .catch((error: unknown) => {
        if (activa) setErrorCarga(mensajeError(error));
      })
      .finally(() => {
        if (activa) setCargando(false);
      });
    return () => { activa = false; };
  }, []);

  const conteos = useMemo(() => ({
    total: solicitudes.length,
    pendiente: solicitudes.filter((solicitud) => solicitud.estado === 'Pendiente').length,
    aprobado: solicitudes.filter((solicitud) => solicitud.estado === 'Aprobado').length,
    rechazado: solicitudes.filter((solicitud) => solicitud.estado === 'Rechazado').length,
  }), [solicitudes]);

  const visibles = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase();
    return solicitudes.filter((solicitud) => {
      const coincideEstado = filtro === 'Todos' || solicitud.estado === filtro;
      const nombre = `${solicitud.nombre} ${solicitud.apellido}`.toLocaleLowerCase();
      const correo = solicitud.correo.toLocaleLowerCase();
      return coincideEstado && (!termino || nombre.includes(termino) || correo.includes(termino));
    });
  }, [solicitudes, busqueda, filtro]);

  const seleccionada = seleccionadaId === null
    ? undefined
    : solicitudes.find((solicitud) => solicitud.id_usuario === seleccionadaId);

  const cambiarEstado = async (
    solicitud: SolicitudVoluntario,
    estado: 'Aprobado' | 'Rechazado',
    motivo?: string
  ): Promise<boolean> => {
    setIdGuardando(solicitud.id_usuario);
    try {
      const resultado = await voluntarioSolicitudesApi.cambiarEstado(
        solicitud.id_usuario,
        estado,
        motivo
      );
      const evento = resultado.historial;
      setSolicitudes((actuales) => actuales.map((item) => {
        if (item.id_usuario !== solicitud.id_usuario) return item;
        const historial: HistorialVoluntario[] = evento
          ? [...(item.historial ?? []), evento]
          : item.historial ?? [];
        return {
          ...item,
          estado: resultado.estado as SolicitudVoluntario['estado'],
          motivo_rechazo: estado === 'Rechazado' ? motivo ?? null : null,
          revisado_por: evento?.cambiado_por ?? item.revisado_por,
          nombre_revisor: evento?.nombre_revisor ?? item.nombre_revisor,
          fecha_revision: evento?.fecha_cambio ?? new Date().toISOString(),
          historial,
        };
      }));
      exito(estado === 'Aprobado' ? 'Solicitud aprobada correctamente.' : 'Solicitud rechazada correctamente.');
      return true;
    } catch (error) {
      mostrarError(mensajeError(error));
      return false;
    } finally {
      setIdGuardando(null);
    }
  };

  return (
    <main className="space-y-6 pb-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">
            Gestión de Solicitudes de Voluntarios
          </h2>
          <p className="mt-1 text-sm text-text-subtle">
            Revisa, evalúa y administra las postulaciones de nuevos voluntarios.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-subtle">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Rol: Administrador
        </span>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de solicitudes">
        <MetricCard label="Total de voluntarios" valor={conteos.total} tono="primary" icono="users" />
        <MetricCard label="Pendientes" valor={conteos.pendiente} tono="warning" icono="clock" />
        <MetricCard label="Aprobados" valor={conteos.aprobado} tono="success" icono="check" />
        <MetricCard label="Rechazados" valor={conteos.rechazado} tono="error" icono="close" />
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-md">
            <span className="sr-only">Buscar por nombre o correo</span>
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar nombre o correo..."
              className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-3 text-sm text-text outline-none placeholder:text-text-subtle focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
            {(['Todos', 'Pendiente', 'Aprobado', 'Rechazado'] as const).map((estado) => (
              <button
                key={estado}
                type="button"
                onClick={() => setFiltro(estado)}
                aria-pressed={filtro === estado}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  filtro === estado
                    ? 'bg-primary text-white'
                    : 'bg-surface-sunken text-text-subtle hover:text-text'
                }`}
              >
                {estado === 'Todos' ? 'Todos' : `${estado}s`}
              </button>
            ))}
          </div>
        </div>

        {errorCarga && (
          <div className="m-4 rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error" role="alert">
            <p>{errorCarga}</p>
            <p className="mt-1 text-xs">Un 404 indica una ruta no desplegada; un fallo de base de datos normalmente responde con un error 500.</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-surface text-xs uppercase tracking-wide text-text-subtle">
              <tr>
                <th scope="col" className="px-5 py-3.5 font-semibold">Voluntario</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">Fecha de registro</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">Estado</th>
                <th scope="col" className="px-5 py-3.5 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cargando ? (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-sm text-text-subtle">Cargando solicitudes…</td></tr>
              ) : visibles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center">
                    <p className="text-sm font-medium text-text">
                      {errorCarga ? 'No se pudieron cargar las solicitudes' : 'No hay solicitudes para mostrar'}
                    </p>
                    {!errorCarga && <p className="mt-1 text-xs text-text-subtle">Prueba con otro filtro o búsqueda.</p>}
                  </td>
                </tr>
              ) : visibles.map((solicitud) => (
                <tr key={solicitud.id_usuario} className="transition-colors hover:bg-surface/70">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-text">{solicitud.nombre} {solicitud.apellido}</p>
                    <p className="mt-0.5 text-sm text-text-subtle">{solicitud.correo}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-text-subtle">{fechaCorta(solicitud.fecha_registro)}</td>
                  <td className="px-5 py-4">
                    <EstadoSolicitudBadge
                      estado={solicitud.estado}
                      nombre={`${solicitud.nombre} ${solicitud.apellido}`}
                      disabled={idGuardando === solicitud.id_usuario}
                      onChange={(estado) => {
                        if (estado === 'Rechazado') {
                          setSeleccionadaId(solicitud.id_usuario);
                          setRechazoInicialId(solicitud.id_usuario);
                        } else {
                          void cambiarEstado(solicitud, estado);
                        }
                      }}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSeleccionadaId(solicitud.id_usuario)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text hover:bg-surface-sunken"
                        aria-label={`Ver detalle de ${solicitud.nombre} ${solicitud.apellido}`}
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        Ver detalle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!cargando && !errorCarga && (
          <div className="border-t border-border px-5 py-3 text-xs text-text-subtle">
            Mostrando {visibles.length} de {solicitudes.length} solicitudes
          </div>
        )}
      </section>

      {seleccionada && (
        <SolicitudDetalleDrawer
          solicitud={seleccionada}
          guardando={idGuardando === seleccionada.id_usuario}
          solicitarMotivoInicial={rechazoInicialId === seleccionada.id_usuario}
          onClose={() => {
            setSeleccionadaId(null);
            setRechazoInicialId(null);
          }}
          onAprobar={() => cambiarEstado(seleccionada, 'Aprobado')}
          onRechazar={(motivo) => cambiarEstado(seleccionada, 'Rechazado', motivo)}
        />
      )}
    </main>
  );
}

function MetricCard({
  label,
  valor,
  tono,
  icono,
}: {
  label: string;
  valor: number;
  tono: 'primary' | 'warning' | 'success' | 'error';
  icono: 'users' | 'clock' | 'check' | 'close';
}) {
  const estilos = {
    primary: 'bg-primary/10 text-primary',
    warning: 'bg-warning/10 text-warning',
    success: 'bg-success/10 text-success',
    error: 'bg-error/10 text-error',
  }[tono];

  return (
    <article className="rounded-2xl border border-border bg-surface-elevated p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-text-subtle">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-text">{valor}</p>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${estilos}`}>
          {icono === 'users' && (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm10 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          )}
          {icono === 'clock' && (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          )}
          {icono === 'check' && (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m5 12 4 4L19 6" />
            </svg>
          )}
          {icono === 'close' && (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          )}
        </span>
      </div>
    </article>
  );
}
