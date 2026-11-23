/**
 * Gestión de entregas físicas a beneficiarios.
 * Se integra dentro de Inventario y asignaciones del módulo Donaciones.
 */
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import donacionApi, { leerError } from '../../api/donacion.api';
import { useToast } from '../../context/ToastContext';
import type { EntregaHistorialItem, EntregaPendienteItem } from '../../types/donacion.types';

const formatoFecha = (valor: string): string => {
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? valor : fecha.toLocaleString('es-BO');
};

const EntregasTab = () => {
  const { exito } = useToast();
  const [pendientes, setPendientes] = useState<EntregaPendienteItem[]>([]);
  const [historial, setHistorial] = useState<EntregaHistorialItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [seleccionada, setSeleccionada] = useState<EntregaPendienteItem | null>(null);
  const [cantidad, setCantidad] = useState('');
  const [lugar, setLugar] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [p, h] = await Promise.all([
        donacionApi.entregasPendientes(),
        donacionApi.historialEntregas(),
      ]);
      setPendientes(p);
      setHistorial(h);
    } catch (e) {
      setError(leerError(e).mensaje);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const abrir = (item: EntregaPendienteItem) => {
    setSeleccionada(item);
    setCantidad(String(Math.min(item.cantidad_pendiente, item.cantidad_disponible)));
    setLugar('');
    setObservaciones('');
    setErrorFormulario('');
  };

  const cerrar = () => {
    if (guardando) return;
    setSeleccionada(null);
    setErrorFormulario('');
  };

  const guardar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!seleccionada) return;
    const valor = Number(cantidad);
    if (!Number.isFinite(valor) || valor <= 0) {
      setErrorFormulario('Ingresa una cantidad mayor que cero.');
      return;
    }
    if (valor > seleccionada.cantidad_pendiente) {
      setErrorFormulario('La cantidad supera el saldo pendiente de la asignación.');
      return;
    }
    if (valor > seleccionada.cantidad_disponible) {
      setErrorFormulario('La cantidad supera las existencias disponibles en inventario.');
      return;
    }
    if (!lugar.trim()) {
      setErrorFormulario('Indica el lugar donde se realiza la entrega.');
      return;
    }

    setGuardando(true);
    setErrorFormulario('');
    try {
      const r = await donacionApi.registrarEntrega({
        id_asignacion: seleccionada.id_asignacion,
        cantidad: valor,
        lugar_entrega: lugar.trim(),
        observaciones: observaciones.trim(),
      });
      exito(`${r.mensaje} Número de entrega: ${r.id_entrega}.`, 'Entrega registrada');
      setSeleccionada(null);
      await cargar();
    } catch (e) {
      setErrorFormulario(leerError(e).mensaje);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="space-y-6 border-t border-border pt-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">Salida física del almacén</p>
          <h2 className="font-display text-xl font-extrabold text-text">Entregas a beneficiarios</h2>
          <p className="mt-1 text-sm text-text-muted">Registra entregas parciales o totales de las asignaciones activas.</p>
        </div>
        <button type="button" onClick={() => void cargar()} className="press rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-text hover:bg-surface-elevated">
          Actualizar
        </button>
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs text-text-muted">Asignaciones pendientes</p>
          <p className="mt-1 text-2xl font-extrabold text-text">{pendientes.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs text-text-muted">Entregas registradas</p>
          <p className="mt-1 text-2xl font-extrabold text-text">{historial.filter(x => x.estado === 'REGISTRADA').length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs text-text-muted">Control</p>
          <p className="mt-1 text-sm font-bold text-text">Inventario actualizado automáticamente</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="font-display text-lg font-bold text-text">Pendientes de entrega</h3>
          <p className="text-sm text-text-muted">Solo aparecen asignaciones de alimentos y materiales con saldo pendiente.</p>
        </div>
        {cargando && <p className="py-6 text-center text-sm text-text-muted">Cargando entregas...</p>}
        {!cargando && pendientes.length === 0 && !error && (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center">
            <p className="font-semibold text-text">No hay asignaciones pendientes de entrega.</p>
            <p className="mt-1 text-sm text-text-muted">Cuando existan asignaciones activas de bienes, aparecerán aquí.</p>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {pendientes.map(item => {
            const maximo = Math.min(item.cantidad_pendiente, item.cantidad_disponible);
            return (
              <article key={item.id_asignacion} className="rounded-2xl border border-border bg-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-text-muted">{item.donacion_codigo} · Asignación #{item.id_asignacion}</p>
                    <h4 className="mt-1 font-bold text-text">{item.beneficiario_nombre}</h4>
                    <p className="text-sm text-text-muted">{item.nombre_item || item.tipo_donacion}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">Pendiente</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-surface-elevated p-3">
                    <p className="text-xs text-text-muted">Asignado</p>
                    <p className="mt-1 font-bold text-text">{item.cantidad_asignada} {item.unidad}</p>
                  </div>
                  <div className="rounded-xl bg-surface-elevated p-3">
                    <p className="text-xs text-text-muted">Entregado</p>
                    <p className="mt-1 font-bold text-text">{item.cantidad_entregada} {item.unidad}</p>
                  </div>
                  <div className="rounded-xl bg-surface-elevated p-3">
                    <p className="text-xs text-text-muted">Pendiente</p>
                    <p className="mt-1 font-bold text-primary">{item.cantidad_pendiente} {item.unidad}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-text-muted">Existencia actual: {item.cantidad_disponible} {item.unidad}</p>
                <button type="button" onClick={() => abrir(item)} disabled={maximo <= 0} className="press mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary disabled:cursor-not-allowed disabled:opacity-50">
                  {maximo <= 0 ? 'Sin inventario disponible' : 'Registrar entrega'}
                </button>
              </article>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="font-display text-lg font-bold text-text">Historial de entregas</h3>
          <p className="text-sm text-text-muted">Últimas 500 entregas registradas, con beneficiario, responsable y lugar.</p>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-surface-elevated text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3">N.º</th><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Beneficiario</th><th className="px-4 py-3">Productos</th><th className="px-4 py-3">Cantidad</th><th className="px-4 py-3">Lugar</th><th className="px-4 py-3">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!cargando && historial.map(item => (
                <tr key={item.id_entrega}>
                  <td className="px-4 py-3 font-semibold text-primary">ENT-{item.id_entrega}</td>
                  <td className="px-4 py-3 text-text">{formatoFecha(item.fecha_entrega)}</td>
                  <td className="px-4 py-3 text-text">{item.beneficiario_nombre}</td>
                  <td className="px-4 py-3 text-text">{item.productos}</td>
                  <td className="px-4 py-3 font-semibold text-text">{item.cantidad_total}</td>
                  <td className="px-4 py-3 text-text-muted">{item.lugar_entrega}</td>
                  <td className="px-4 py-3 text-text-muted">{item.responsable_nombre}</td>
                </tr>
              ))}
              {!cargando && historial.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted">Todavía no hay entregas registradas.</td></tr>}
              {cargando && <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted">Cargando historial...</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {seleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <form onSubmit={guardar} className="my-auto w-full max-w-lg space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <div>
              <h3 className="font-display text-xl font-extrabold text-text">Confirmar entrega</h3>
              <p className="mt-1 text-sm text-text-muted">{seleccionada.beneficiario_nombre} · {seleccionada.nombre_item || seleccionada.tipo_donacion}</p>
              <p className="text-xs text-text-muted">Asignación #{seleccionada.id_asignacion} · {seleccionada.donacion_codigo}</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-text" htmlFor="cantidad-entrega">Cantidad que se entrega</label>
              <input id="cantidad-entrega" type="number" min="0.01" max={Math.min(seleccionada.cantidad_pendiente, seleccionada.cantidad_disponible)} step="0.01" value={cantidad} onChange={e => setCantidad(e.target.value)} required className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-text" />
              <p className="mt-1 text-xs text-text-muted">Pendiente: {seleccionada.cantidad_pendiente} {seleccionada.unidad}. Disponible: {seleccionada.cantidad_disponible} {seleccionada.unidad}.</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-text" htmlFor="lugar-entrega">Lugar de entrega</label>
              <input id="lugar-entrega" value={lugar} onChange={e => setLugar(e.target.value)} maxLength={180} required placeholder="Ej. Almacén central de la asociación" className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-text" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-text" htmlFor="obs-entrega">Observaciones</label>
              <textarea id="obs-entrega" value={observaciones} onChange={e => setObservaciones(e.target.value)} maxLength={2000} rows={3} className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-text" placeholder="Observaciones opcionales..." />
            </div>
            {errorFormulario && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{errorFormulario}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={cerrar} disabled={guardando} className="press rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text">Cancelar</button>
              <button type="submit" disabled={guardando} className="press rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-50">{guardando ? 'Guardando...' : 'Confirmar entrega'}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

export default EntregasTab;
