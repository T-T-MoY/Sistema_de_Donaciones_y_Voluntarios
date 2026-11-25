import { useEffect, useState, type FormEvent } from 'react';
import { ayudaApi } from '../../api/ayuda.api';
import { useToast } from '../../context/ToastContext';
import EvidenciasEntrega from './EvidenciasEntrega';
import type {
  ApoyoAyuda,
  ApoyoDatos,
  SolicitudAyuda,
  CatalogosAyuda,
} from '../../types/ayuda.types';
import {
  Campo,
  Panel,
  Estado,
  Aviso,
  Vacio,
  Pasos,
  Paginacion,
  claseInput,
  btnPrimario,
  btnSecundario,
  mensajeError,
  hoy,
  fechaCorta,
} from './Compartidos';

interface Props {
  apoyos: ApoyoAyuda[];
  solicitudes: SolicitudAyuda[];
  catalogos: CatalogosAyuda;
  admin: boolean;
  solicitudInicial: SolicitudAyuda | null;
  onConsumir: () => void;
  onActualizar: () => Promise<void>;
}
const nuevo = (): ApoyoDatos => ({
  id_solicitud: 0,
  id_campana: 0,
  tipo_apoyo: '',
  descripcion: '',
  responsable_id: 0,
  fecha_programada: null,
  fecha_entrega: null,
});
export default function ApoyosTab({
  apoyos,
  solicitudes,
  catalogos,
  admin,
  solicitudInicial,
  onConsumir,
  onActualizar,
}: Props) {
  const [abierto, setAbierto] = useState(false),
    [seleccion, setSeleccion] = useState<ApoyoAyuda | null>(null),
    [datos, setDatos] = useState<ApoyoDatos>(nuevo());
  const [error, setError] = useState(''),
    [ocupado, setOcupado] = useState(false),
    [confirma, setConfirma] = useState(false);
  const [busqueda, setBusqueda] = useState(''),
    [campana, setCampana] = useState(''),
    [estado, setEstado] = useState(''),
    [pagina, setPagina] = useState(1);
  const toast = useToast();
  function crear(s?: SolicitudAyuda) {
    setSeleccion(null);
    setDatos({ ...nuevo(), id_solicitud: s?.id_solicitud || 0 });
    setAbierto(true);
    setError('');
    setConfirma(false);
  }
  useEffect(() => {
    if (solicitudInicial) {
      crear(solicitudInicial);
      onConsumir();
    }
  }, [solicitudInicial]);
  const cambiar = (k: keyof ApoyoDatos, v: string | number | null) =>
    setDatos((d) => ({ ...d, [k]: v }));
  async function abrir(id: number) {
    setOcupado(true);
    setError('');
    setConfirma(false);
    try {
      const a = await ayudaApi.apoyo(id);
      setSeleccion(a);
      setDatos(a);
      setAbierto(true);
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setOcupado(false);
    }
  }
  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const accion =
      ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement)?.value ||
      'guardar';
    if (accion === 'entregar' && (!confirma || !datos.fecha_entrega)) {
      setError('Indica la fecha real y confirma que la ayuda fue entregada.');
      return;
    }
    setOcupado(true);
    setError('');
    try {
      const d = {
        ...datos,
        estado:
          accion === 'preparar'
            ? 'Preparada'
            : accion === 'entregar'
              ? 'Entregada'
              : seleccion?.estado || 'Pendiente',
        fecha_entrega: accion === 'entregar' ? datos.fecha_entrega : null,
        version: seleccion?.version,
      };
      const a = await ayudaApi.guardarApoyo(seleccion?.id_apoyo || null, d);
      setSeleccion(a);
      setDatos(a);
      setConfirma(false);
      toast.exito(
        accion === 'entregar'
          ? 'Entrega confirmada y registrada en el historial.'
          : accion === 'preparar'
            ? 'Entrega preparada.'
            : 'Apoyo guardado.',
      );
      await onActualizar();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setOcupado(false);
    }
  }
  const solicitud = solicitudes.find(
    (s) => s.id_solicitud === datos.id_solicitud,
  );
  const entregada = seleccion?.estado === 'Entregada';
  const filtrados = apoyos.filter(
    (a) =>
      (!estado || a.estado === estado) &&
      (!campana || String(a.id_campana) === campana) &&
      `${a.codigo} ${a.beneficiario_nombre} ${a.documento} ${a.tipo_apoyo} ${a.descripcion}`
        .toLowerCase()
        .includes(busqueda.toLowerCase()),
  );
  const page = Math.min(pagina, Math.max(1, Math.ceil(filtrados.length / 10)));
  const campanasHistorial = Array.from(
    new Map(
      apoyos.map((a) => [
        a.id_campana,
        { id: a.id_campana, nombre: a.campana_nombre },
      ]),
    ).values(),
  );
  if (abierto)
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            className={btnSecundario}
            disabled={ocupado}
            onClick={() => {
              setAbierto(false);
              setError('');
            }}
          >
            ← Volver a ayudas y entregas
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
                onClick={() => void abrir(seleccion.id_apoyo)}
              >
                Recargar detalle
              </button>
            )}
          </Aviso>
        )}
        <Pasos
          actual={
            !seleccion
              ? -1
              : seleccion.estado === 'Entregada'
                ? 2
                : seleccion.estado === 'Preparada'
                  ? 1
                  : 0
          }
        />
        <form onSubmit={guardar} className="space-y-5">
          <Panel
            titulo="Solicitud aprobada"
            descripcion="Cada apoyo queda vinculado a una solicitud, un beneficiario y una campaña."
          >
            <Campo titulo="Solicitud que recibirá apoyo *">
              <select
                className={claseInput}
                required
                disabled={!!seleccion || !admin || ocupado}
                value={datos.id_solicitud || ''}
                onChange={(e) =>
                  cambiar('id_solicitud', Number(e.target.value))
                }
              >
                <option value="">Selecciona una solicitud aprobada</option>
                {solicitudes
                  .filter(
                    (s) =>
                      s.estado === 'Aprobada' ||
                      s.id_solicitud === datos.id_solicitud,
                  )
                  .map((s) => (
                    <option key={s.id_solicitud} value={s.id_solicitud}>
                      {s.codigo} · {s.beneficiario_nombre} · {s.tipo_ayuda}
                    </option>
                  ))}
              </select>
            </Campo>
            {solicitud && (
              <div className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-text-subtle">Beneficiario</p>
                  <p className="mt-1 text-sm font-bold text-text">
                    {solicitud.beneficiario_nombre}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    Documento {solicitud.documento}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-xs text-text-subtle">
                    Estado de solicitud
                  </p>
                  <Estado valor={solicitud.estado} />
                </div>
                <div>
                  <p className="text-xs text-text-subtle">Tipo de necesidad</p>
                  <p className="mt-1 text-sm text-text">
                    {solicitud.tipo_ayuda}
                  </p>
                </div>
              </div>
            )}
          </Panel>
          <div className="grid items-start gap-5 lg:grid-cols-2">
            <Panel
              titulo="Asignación de campaña"
              descripcion="Selecciona la campaña que respalda esta ayuda."
            >
              <fieldset
                disabled={!admin || entregada || ocupado}
                className="space-y-5"
              >
                <Campo
                  titulo="Campaña *"
                  ayuda="Para nuevas asignaciones se muestran campañas activas y dentro de sus fechas."
                >
                  <select
                    className={claseInput}
                    required
                    disabled={!!seleccion}
                    value={datos.id_campana || ''}
                    onChange={(e) =>
                      cambiar('id_campana', Number(e.target.value))
                    }
                  >
                    <option value="">Selecciona una campaña</option>
                    {seleccion &&
                      !catalogos.campanas.some(
                        (c) => c.id_campana === seleccion.id_campana,
                      ) && (
                        <option value={seleccion.id_campana}>
                          {seleccion.campana_nombre}
                        </option>
                      )}
                    {catalogos.campanas.map((c) => (
                      <option key={c.id_campana} value={c.id_campana}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </Campo>
                {!seleccion && !catalogos.campanas.length && (
                  <Aviso>
                    No hay campañas disponibles. Activa una campaña vigente
                    desde Gestión de Campañas para poder vincularla.
                  </Aviso>
                )}
                <Campo titulo="Tipo de apoyo *">
                  <input
                    className={claseInput}
                    required
                    minLength={3}
                    maxLength={150}
                    value={datos.tipo_apoyo}
                    onChange={(e) => cambiar('tipo_apoyo', e.target.value)}
                    placeholder="Ej. Kit alimentario familiar"
                  />
                </Campo>
                <Campo titulo="Descripción del apoyo *">
                  <textarea
                    className={claseInput}
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={4}
                    value={datos.descripcion}
                    onChange={(e) => cambiar('descripcion', e.target.value)}
                    placeholder="Detalla el apoyo que recibirá el beneficiario."
                  />
                </Campo>
              </fieldset>
            </Panel>
            <Panel
              titulo="Preparación y entrega"
              descripcion="La fecha real se registra únicamente al confirmar la entrega."
            >
              <fieldset
                disabled={!admin || entregada || ocupado}
                className="space-y-5"
              >
                <Campo titulo="Responsable *">
                  <select
                    className={claseInput}
                    required
                    value={datos.responsable_id || ''}
                    onChange={(e) =>
                      cambiar('responsable_id', Number(e.target.value))
                    }
                  >
                    <option value="">Selecciona un responsable</option>
                    {seleccion &&
                      !catalogos.responsables.some(
                        (r) => r.id_usuario === seleccion.responsable_id,
                      ) && (
                        <option value={seleccion.responsable_id}>
                          {seleccion.responsable_nombre}
                        </option>
                      )}
                    {catalogos.responsables.map((r) => (
                      <option key={r.id_usuario} value={r.id_usuario}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </Campo>
                <Campo
                  titulo="Fecha programada"
                  ayuda="Opcional. No confirma que la ayuda se haya entregado."
                >
                  <input
                    className={claseInput}
                    type="date"
                    value={datos.fecha_programada || ''}
                    onChange={(e) =>
                      cambiar('fecha_programada', e.target.value || null)
                    }
                  />
                </Campo>
              </fieldset>
              {seleccion && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                    Estado de entrega
                  </p>
                  <Estado valor={seleccion.estado} />
                </div>
              )}
              {admin && seleccion?.estado === 'Preparada' && (
                <>
                  <Campo
                    titulo="Fecha real de entrega"
                    ayuda="Completa este dato solo cuando la ayuda haya sido entregada."
                  >
                    <input
                      className={claseInput}
                      type="date"
                      max={hoy()}
                      value={datos.fecha_entrega || ''}
                      onChange={(e) =>
                        cambiar('fecha_entrega', e.target.value || null)
                      }
                    />
                  </Campo>
                  <label className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-soft p-4 text-sm text-text">
                    <input
                      className="mt-1"
                      type="checkbox"
                      checked={confirma}
                      onChange={(e) => setConfirma(e.target.checked)}
                    />
                    Confirmo que esta ayuda fue entregada al beneficiario. La
                    confirmación quedará registrada y no podrá modificarse.
                  </label>
                </>
              )}
              {entregada && (
                <Aviso>
                  Ayuda entregada el{' '}
                  <strong>{fechaCorta(seleccion?.fecha_entrega)}</strong>.
                  Responsable: {seleccion?.responsable_nombre}.
                </Aviso>
              )}
            </Panel>
          </div>
          {admin && !entregada && (
            <div className="flex flex-wrap justify-end gap-3">
              <button
                className={btnSecundario}
                type="button"
                disabled={ocupado}
                onClick={() => setAbierto(false)}
              >
                Cancelar
              </button>
              <button
                className={btnPrimario}
                name="accion"
                value="guardar"
                disabled={ocupado || (!seleccion && !catalogos.campanas.length)}
              >
                {ocupado
                  ? 'Guardando…'
                  : seleccion
                    ? 'Actualizar apoyo'
                    : 'Registrar vínculo'}
              </button>
              {seleccion?.estado === 'Pendiente' && (
                <button
                  className={btnPrimario}
                  name="accion"
                  value="preparar"
                  disabled={ocupado}
                >
                  Preparar entrega
                </button>
              )}
              {seleccion?.estado === 'Preparada' && (
                <button
                  className={btnPrimario}
                  name="accion"
                  value="entregar"
                  disabled={ocupado || !confirma || !datos.fecha_entrega}
                >
                  Confirmar entrega
                </button>
              )}
            </div>
          )}
        </form>
        {seleccion && (
          <EvidenciasEntrega
            key={seleccion.id_apoyo}
            apoyo={seleccion}
            admin={admin}
            onGuardada={(a) => setSeleccion(a)}
          />
        )}
        {seleccion && (
          <Panel
            titulo="Historial y confirmación"
            descripcion="Seguimiento de la asignación, preparación y entrega del apoyo."
          >
            <ol className="space-y-5">
              {seleccion.historial?.map((h) => (
                <li
                  key={h.id_evento}
                  className="border-l-2 border-primary/40 pl-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Estado valor={h.estado} />
                    <span className="text-xs text-text-subtle">
                      {fechaCorta(h.fecha)} · {h.actor_nombre}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-text">
                    {h.descripcion}
                  </p>
                </li>
              ))}
            </ol>
            {entregada && (
              <div className="rounded-xl border border-success/30 bg-success-soft p-5">
                <h4 className="font-bold text-text">Entrega completada</h4>
                <p className="mt-2 text-sm text-text-muted">
                  Constancia ENT-{String(seleccion.id_apoyo).padStart(6, '0')} ·{' '}
                  {seleccion.campana_nombre}
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  {seleccion.beneficiario_nombre} ·{' '}
                  {fechaCorta(seleccion.fecha_entrega)}
                </p>
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
            {admin ? 'Asignación y entrega de ayuda' : 'Mis ayudas y entregas'}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Consulta las campañas que brindan apoyo y el historial de entregas.
          </p>
        </div>
        {admin && (
          <button
            className={btnPrimario}
            disabled={!solicitudes.some((s) => s.estado === 'Aprobada')}
            onClick={() => crear()}
          >
            + Registrar vínculo
          </button>
        )}
      </div>
      {error && <Aviso error>{error}</Aviso>}
      <Panel titulo="Buscar ayudas">
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo titulo="Beneficiario, documento o apoyo">
            <input
              className={claseInput}
              placeholder="Buscar en el historial"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
            />
          </Campo>
          <Campo titulo="Campaña">
            <select
              className={claseInput}
              value={campana}
              onChange={(e) => {
                setCampana(e.target.value);
                setPagina(1);
              }}
            >
              <option value="">Todas</option>
              {campanasHistorial.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </Campo>
          <Campo titulo="Estado de entrega">
            <select
              className={claseInput}
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value);
                setPagina(1);
              }}
            >
              <option value="">Todos</option>
              {['Pendiente', 'Preparada', 'Entregada'].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Campo>
        </div>
        <button
          className={btnSecundario}
          onClick={() => {
            setBusqueda('');
            setCampana('');
            setEstado('');
          }}
        >
          Limpiar filtros
        </button>
      </Panel>
      {!filtrados.length ? (
        <Vacio
          titulo="No hay ayudas para mostrar"
          detalle={
            admin
              ? 'Aprueba una solicitud y asocia una campaña para comenzar.'
              : 'Aquí verás tus apoyos asignados y las entregas confirmadas.'
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtrados.slice((page - 1) * 10, page * 10).map((a) => (
            <article
              key={a.id_apoyo}
              className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-soft"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-bold tracking-wider text-primary">
                  {a.codigo} · {a.solicitud_codigo}
                </p>
                <Estado valor={a.estado} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-text">
                {a.tipo_apoyo}
              </h3>
              <p className="mt-1 text-sm font-medium text-text">
                {a.beneficiario_nombre}
              </p>
              <p className="mt-1 text-sm text-text-muted">{a.campana_nombre}</p>
              <p className="mt-3 line-clamp-2 text-sm text-text-muted">
                {a.descripcion}
              </p>
              <div className="my-4 border-t border-border pt-3 text-xs text-text-subtle">
                {a.estado === 'Entregada'
                  ? `Entregada: ${fechaCorta(a.fecha_entrega)}`
                  : `Programada: ${fechaCorta(a.fecha_programada)}`}
                <p className="mt-1">Responsable: {a.responsable_nombre}</p>
              </div>
              <button
                className={btnSecundario}
                disabled={ocupado}
                onClick={() => void abrir(a.id_apoyo)}
              >
                {admin && a.estado !== 'Entregada'
                  ? 'Gestionar entrega'
                  : 'Ver detalle e historial'}
              </button>
            </article>
          ))}
        </div>
      )}
      <Paginacion pagina={page} total={filtrados.length} onChange={setPagina} />
    </div>
  );
}
