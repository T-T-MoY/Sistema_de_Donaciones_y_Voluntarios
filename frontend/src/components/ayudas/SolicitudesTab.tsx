import { useEffect, useState, type FormEvent } from 'react';
import { ayudaApi } from '../../api/ayuda.api';
import { useToast } from '../../context/ToastContext';
import type {
  FichaBeneficiario,
  SolicitudAyuda,
  SolicitudDatos,
  CatalogosAyuda,
} from '../../types/ayuda.types';
import {
  Campo,
  Panel,
  Estado,
  Aviso,
  Vacio,
  Paginacion,
  claseInput,
  btnPrimario,
  btnSecundario,
  mensajeError,
  hoy,
  fechaCorta,
} from './Compartidos';

interface Props {
  solicitudes: SolicitudAyuda[];
  fichas: FichaBeneficiario[];
  catalogos: CatalogosAyuda;
  admin: boolean;
  beneficiarioInicial: number | null;
  onConsumir: () => void;
  onActualizar: () => Promise<void>;
  onAsignar: (s: SolicitudAyuda) => void;
}
const nueva = (id = 0): SolicitudDatos => ({
  beneficiario_usuario_id: id,
  tipo_ayuda: 'Alimentaria',
  descripcion: '',
  prioridad: 'Media',
  fecha_solicitud: hoy(),
});
export default function SolicitudesTab({
  solicitudes,
  fichas,
  catalogos,
  admin,
  beneficiarioInicial,
  onConsumir,
  onActualizar,
  onAsignar,
}: Props) {
  const [abierta, setAbierta] = useState(false),
    [seleccion, setSeleccion] = useState<SolicitudAyuda | null>(null),
    [edicion, setEdicion] = useState(false);
  const [datos, setDatos] = useState<SolicitudDatos>(nueva()),
    [busqueda, setBusqueda] = useState(''),
    [estado, setEstado] = useState(''),
    [prioridad, setPrioridad] = useState(''),
    [pagina, setPagina] = useState(1);
  const [error, setError] = useState(''),
    [ocupado, setOcupado] = useState(false),
    [archivos, setArchivos] = useState<File[]>([]),
    [fileKey, setFileKey] = useState(0);
  const [resolucion, setResolucion] = useState('Pendiente'),
    [observaciones, setObservaciones] = useState(''),
    [revisada, setRevisada] = useState(false),
    [evaluada, setEvaluada] = useState(false);
  const toast = useToast();
  function limpiar() {
    setError('');
    setArchivos([]);
    setFileKey((k) => k + 1);
    setResolucion('Pendiente');
    setObservaciones('');
    setRevisada(false);
    setEvaluada(false);
  }
  function crear(id?: number) {
    setSeleccion(null);
    setDatos(nueva(id || (!admin ? fichas[0]?.id_usuario : 0)));
    setAbierta(true);
    setEdicion(true);
    limpiar();
  }
  useEffect(() => {
    if (beneficiarioInicial !== null) {
      crear(beneficiarioInicial);
      onConsumir();
    }
  }, [beneficiarioInicial]);
  const cambiar = (k: keyof SolicitudDatos, v: string | number) =>
    setDatos((d) => ({ ...d, [k]: v }));
  async function abrir(id: number) {
    setOcupado(true);
    limpiar();
    try {
      const s = await ayudaApi.solicitud(id);
      setSeleccion(s);
      setDatos(s);
      setAbierta(true);
      setEdicion(false);
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setOcupado(false);
    }
  }
  async function guardar(e: FormEvent) {
    e.preventDefault();
    setOcupado(true);
    setError('');
    try {
      const s = await ayudaApi.guardarSolicitud(
        seleccion?.id_solicitud || null,
        datos,
      );
      setSeleccion(s);
      setDatos(s);
      setEdicion(false);
      toast.exito(`Solicitud ${s.codigo} guardada.`);
      await onActualizar();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setOcupado(false);
    }
  }
  async function evaluar(e: FormEvent) {
    e.preventDefault();
    if (!seleccion) return;
    setOcupado(true);
    setError('');
    try {
      const s = await ayudaApi.evaluar(seleccion.id_solicitud, {
        estado: resolucion,
        observaciones,
        revisada,
        evaluada,
        version: seleccion.version,
      });
      setSeleccion(s);
      setDatos(s);
      setObservaciones('');
      setRevisada(false);
      setEvaluada(false);
      toast.exito(
        'Evaluación registrada. El beneficiario puede consultar el resultado.',
      );
      await onActualizar();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setOcupado(false);
    }
  }
  async function adjuntar() {
    if (!seleccion) return;
    setOcupado(true);
    setError('');
    try {
      await ayudaApi.adjuntar(seleccion.id_solicitud, archivos);
      const s = await ayudaApi.solicitud(seleccion.id_solicitud);
      setSeleccion(s);
      setDatos(s);
      setArchivos([]);
      setFileKey((k) => k + 1);
      toast.exito('Documentos adjuntados.');
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setOcupado(false);
    }
  }
  const f = fichas.find((f) => f.id_usuario === datos.beneficiario_usuario_id);
  const filtradas = solicitudes.filter(
    (s) =>
      (!estado || s.estado === estado) &&
      (!prioridad || s.prioridad === prioridad) &&
      `${s.codigo} ${s.beneficiario_nombre} ${s.documento} ${s.descripcion}`
        .toLowerCase()
        .includes(busqueda.toLowerCase()),
  );
  const page = Math.min(pagina, Math.max(1, Math.ceil(filtradas.length / 10)));
  if (abierta)
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            className={btnSecundario}
            disabled={ocupado}
            onClick={() => {
              setAbierta(false);
              setError('');
            }}
          >
            ← Volver a solicitudes
          </button>
          {seleccion && (
            <div className="flex items-center gap-3">
              <span className="font-bold text-text">{seleccion.codigo}</span>
              <Estado valor={seleccion.estado} />
            </div>
          )}
        </div>
        {error && (
          <Aviso error>
            {error}{' '}
            {seleccion && (
              <button
                className="ml-2 underline"
                disabled={ocupado}
                onClick={() => void abrir(seleccion.id_solicitud)}
              >
                Recargar detalle
              </button>
            )}
          </Aviso>
        )}
        <form onSubmit={guardar} className="space-y-5">
          <Panel
            titulo={
              seleccion
                ? 'Datos de la solicitud de ayuda'
                : 'Registrar nueva solicitud'
            }
            descripcion="Describe la necesidad y el apoyo solicitado. La solicitud se registra como pendiente de evaluación."
          >
            <fieldset disabled={!edicion || ocupado} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Campo titulo="Beneficiario *">
                  <select
                    className={claseInput}
                    required
                    disabled={!admin || !!seleccion}
                    value={datos.beneficiario_usuario_id || ''}
                    onChange={(e) =>
                      cambiar('beneficiario_usuario_id', Number(e.target.value))
                    }
                  >
                    <option value="">Selecciona una ficha</option>
                    {fichas
                      .filter(
                        (f) =>
                          (f.estado_cuenta === 'Activo' &&
                            f.estado !== 'Rechazado') ||
                          f.id_usuario === datos.beneficiario_usuario_id,
                      )
                      .map((f) => (
                        <option key={f.id_usuario} value={f.id_usuario}>
                          {f.nombre} {f.apellido} · {f.documento}
                        </option>
                      ))}
                  </select>
                </Campo>
                <Campo titulo="Tipo de ayuda *">
                  <select
                    className={claseInput}
                    required
                    value={datos.tipo_ayuda}
                    onChange={(e) => cambiar('tipo_ayuda', e.target.value)}
                  >
                    {catalogos.tipos_ayuda.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Campo>
              </div>
              {f && (
                <div className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-text">
                      {f.nombre} {f.apellido}
                    </p>
                    <Estado valor={f.estado} />
                  </div>
                  <p className="mt-2 text-sm text-text-muted">
                    {f.tipo_documento} {f.documento} · {f.necesidad}
                  </p>
                  <p className="mt-1 text-xs text-text-subtle">{f.direccion}</p>
                </div>
              )}
              <Campo
                titulo="Descripción de la necesidad *"
                ayuda="Explica la situación, el apoyo requerido y a quién beneficiará. Mínimo 10 caracteres."
              >
                <textarea
                  className={claseInput}
                  required
                  minLength={10}
                  maxLength={4000}
                  rows={4}
                  value={datos.descripcion}
                  onChange={(e) => cambiar('descripcion', e.target.value)}
                />
              </Campo>
              <div className="grid gap-5 sm:grid-cols-2">
                <Campo titulo="Prioridad *">
                  <select
                    className={claseInput}
                    value={datos.prioridad}
                    onChange={(e) => cambiar('prioridad', e.target.value)}
                  >
                    {['Baja', 'Media', 'Alta'].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </Campo>
                <Campo titulo="Fecha de solicitud *">
                  <input
                    className={claseInput}
                    type="date"
                    required
                    max={hoy()}
                    value={datos.fecha_solicitud}
                    onChange={(e) => cambiar('fecha_solicitud', e.target.value)}
                  />
                </Campo>
              </div>
            </fieldset>
            {edicion ? (
              <div className="flex flex-wrap justify-end gap-3">
                {seleccion && (
                  <button
                    className={btnSecundario}
                    type="button"
                    disabled={ocupado}
                    onClick={() => {
                      setDatos(seleccion);
                      setEdicion(false);
                    }}
                  >
                    Descartar cambios
                  </button>
                )}
                <button className={btnPrimario} disabled={ocupado}>
                  {ocupado
                    ? 'Guardando…'
                    : seleccion
                      ? 'Actualizar solicitud'
                      : 'Guardar solicitud'}
                </button>
              </div>
            ) : (
              seleccion?.estado === 'Pendiente' && (
                <button
                  type="button"
                  className={btnSecundario}
                  onClick={() => setEdicion(true)}
                >
                  Editar solicitud
                </button>
              )
            )}
          </Panel>
        </form>
        <Panel
          titulo="Documentos adjuntos"
          descripcion="Documentación privada, accesible para el beneficiario y los administradores. Hasta 5 archivos PDF, JPG o PNG de 10 MB cada uno."
        >
          {!seleccion ? (
            <p className="text-sm text-text-muted">
              Guarda la solicitud para adjuntar documentos.
            </p>
          ) : (
            <>
              <ul className="space-y-2">
                {seleccion.adjuntos?.map((a) => (
                  <li
                    key={a.id_adjunto}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
                  >
                    <span className="min-w-0 break-words text-sm text-text">
                      {a.nombre}
                      <span className="ml-2 text-xs text-text-subtle">
                        {(a.bytes / 1024).toFixed(0)} KB
                      </span>
                    </span>
                    <button
                      className={btnSecundario}
                      onClick={() =>
                        void ayudaApi
                          .descargar(a)
                          .catch((e) => setError(mensajeError(e)))
                      }
                    >
                      Descargar
                    </button>
                  </li>
                ))}
              </ul>
              {!seleccion.adjuntos?.length && (
                <p className="text-sm text-text-muted">
                  No se adjuntaron documentos.
                </p>
              )}
              {seleccion.estado === 'Pendiente' &&
                (seleccion.adjuntos?.length || 0) < 5 && (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="min-w-0 flex-1">
                      <Campo titulo="Seleccionar archivos">
                        <input
                          key={fileKey}
                          className={claseInput}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          multiple
                          disabled={ocupado}
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (
                              files.length + (seleccion.adjuntos?.length || 0) >
                                5 ||
                              files.some((f) => f.size > 10485760)
                            ) {
                              setError(
                                'Máximo 5 adjuntos por solicitud y 10 MB por archivo.',
                              );
                              setArchivos([]);
                              e.target.value = '';
                            } else {
                              setArchivos(files);
                              setError('');
                            }
                          }}
                        />
                      </Campo>
                    </div>
                    <button
                      className={btnSecundario}
                      disabled={ocupado || !archivos.length}
                      onClick={() => void adjuntar()}
                    >
                      {ocupado ? 'Subiendo…' : 'Adjuntar archivos'}
                    </button>
                  </div>
                )}
            </>
          )}
        </Panel>
        {seleccion && (
          <Panel
            titulo="Evaluación administrativa"
            descripcion="La resolución y las observaciones quedan registradas en el historial de la solicitud."
          >
            <div className="flex flex-wrap gap-4">
              <Estado valor={seleccion.estado} />
              <p className="text-sm text-text-muted">
                Registrada el {fechaCorta(seleccion.creado_en)}
              </p>
            </div>
            {seleccion.evaluaciones?.length ? (
              <ol className="space-y-3">
                {seleccion.evaluaciones.map((e) => (
                  <li
                    key={e.id_evaluacion}
                    className="border-l-2 border-primary/40 pl-4"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <Estado valor={e.estado} />
                      <span className="text-xs text-text-muted">
                        {fechaCorta(e.fecha)} · {e.administrador_nombre}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-text">
                      {e.observaciones}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-text-muted">
                Aún no se ha registrado una evaluación.
              </p>
            )}
            {admin && seleccion.estado === 'Pendiente' && !edicion && (
              <form
                onSubmit={evaluar}
                className="space-y-5 border-t border-border pt-5"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 text-sm font-semibold text-text">
                    <input
                      type="checkbox"
                      required
                      checked={revisada}
                      onChange={(e) => setRevisada(e.target.checked)}
                    />
                    Revisé los datos y documentos
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 text-sm font-semibold text-text">
                    <input
                      type="checkbox"
                      required
                      checked={evaluada}
                      onChange={(e) => setEvaluada(e.target.checked)}
                    />
                    Evalué la necesidad y pertinencia
                  </label>
                </div>
                <Campo titulo="Observaciones / motivo *">
                  <textarea
                    className={claseInput}
                    required
                    minLength={5}
                    maxLength={2000}
                    rows={3}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Justifica la decisión o indica qué información falta."
                  />
                </Campo>
                <fieldset>
                  <legend className="mb-3 text-sm font-bold text-text">
                    Resolución administrativa
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      [
                        'Aprobada',
                        'Aprobar',
                        'Continuar con la asignación de ayuda.',
                      ],
                      [
                        'Rechazada',
                        'Rechazar',
                        'Registrar el motivo de rechazo.',
                      ],
                      [
                        'Pendiente',
                        'Mantener pendiente',
                        'Solicitar información y evaluar después.',
                      ],
                    ].map(([value, label, desc]) => (
                      <label
                        key={value}
                        className={`cursor-pointer rounded-xl border p-4 ${resolucion === value ? 'border-primary bg-primary-soft' : 'border-border bg-surface'}`}
                      >
                        <span className="flex gap-2 font-semibold text-text">
                          <input
                            type="radio"
                            name="resolucion"
                            value={value}
                            checked={resolucion === value}
                            onChange={() => setResolucion(value)}
                          />
                          {label}
                        </span>
                        <span className="mt-2 block text-xs text-text-muted">
                          {desc}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="flex justify-end">
                  <button className={btnPrimario} disabled={ocupado}>
                    {ocupado ? 'Guardando…' : 'Guardar evaluación'}
                  </button>
                </div>
              </form>
            )}
            {admin && seleccion.estado === 'Aprobada' && (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-success/30 bg-success-soft p-4">
                <p className="text-sm text-text">
                  Solicitud aprobada. {seleccion.apoyos} apoyo(s) vinculado(s).
                </p>
                <button
                  className={btnPrimario}
                  onClick={() => onAsignar(seleccion)}
                >
                  Asociar campaña
                </button>
              </div>
            )}
          </Panel>
        )}
      </div>
    );
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-text">
            {admin
              ? 'Solicitud y evaluación de ayuda'
              : 'Mis solicitudes de ayuda'}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Registra necesidades y consulta el avance de cada solicitud.
          </p>
        </div>
        <button
          className={btnPrimario}
          disabled={
            ocupado ||
            !fichas.some(
              (f) => f.estado !== 'Rechazado' && f.estado_cuenta === 'Activo',
            )
          }
          onClick={() => crear()}
        >
          + Nueva solicitud
        </button>
      </div>
      {error && <Aviso error>{error}</Aviso>}
      <Panel titulo="Buscar solicitudes">
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo titulo="Código, beneficiario o necesidad">
            <input
              className={claseInput}
              value={busqueda}
              placeholder="Buscar solicitudes registradas"
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
            />
          </Campo>
          <Campo titulo="Estado">
            <select
              className={claseInput}
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value);
                setPagina(1);
              }}
            >
              <option value="">Todos</option>
              {['Pendiente', 'Aprobada', 'Rechazada'].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Campo>
          <Campo titulo="Prioridad">
            <select
              className={claseInput}
              value={prioridad}
              onChange={(e) => {
                setPrioridad(e.target.value);
                setPagina(1);
              }}
            >
              <option value="">Todas</option>
              {['Alta', 'Media', 'Baja'].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Campo>
        </div>
        <button
          className={btnSecundario}
          onClick={() => {
            setBusqueda('');
            setEstado('');
            setPrioridad('');
          }}
        >
          Limpiar filtros
        </button>
      </Panel>
      {!filtradas.length ? (
        <Vacio
          titulo="No hay solicitudes para mostrar"
          detalle="Las solicitudes aparecerán aquí con su estado y resultado de evaluación."
        />
      ) : (
        <div className="space-y-3">
          {filtradas.slice((page - 1) * 10, page * 10).map((s) => (
            <article
              key={s.id_solicitud}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-elevated p-5 shadow-soft sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold tracking-wider text-primary">
                    {s.codigo}
                  </span>
                  <Estado valor={s.estado} />
                  <span
                    className={`text-xs font-semibold ${s.prioridad === 'Alta' ? 'text-error' : 'text-text-muted'}`}
                  >
                    Prioridad {s.prioridad.toLowerCase()}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-text">
                  {s.beneficiario_nombre}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-text-muted">
                  {s.descripcion}
                </p>
                <p className="mt-2 text-xs text-text-subtle">
                  {s.tipo_ayuda} · {fechaCorta(s.fecha_solicitud)} · Documento{' '}
                  {s.documento}
                </p>
              </div>
              <button
                className={btnSecundario}
                disabled={ocupado}
                onClick={() => void abrir(s.id_solicitud)}
              >
                {admin && s.estado === 'Pendiente'
                  ? 'Revisar solicitud'
                  : 'Ver detalle'}
              </button>
            </article>
          ))}
        </div>
      )}
      <Paginacion pagina={page} total={filtradas.length} onChange={setPagina} />
    </div>
  );
}
