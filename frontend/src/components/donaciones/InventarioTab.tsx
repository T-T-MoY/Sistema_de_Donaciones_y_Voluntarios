import { useCallback, useEffect, useState } from 'react';
import { donacionApi, type InventarioItem } from '../../api/donacion.api';

const InventarioTab = () => {
  const [items, setItems] = useState<InventarioItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const cargar = useCallback(async () => {
    setCargando(true); setError('');
    try { setItems(await donacionApi.inventario()); }
    catch { setError('No se pudo cargar el inventario. Verifica la conexión y que el esquema actualizado esté aplicado.'); }
    finally { setCargando(false); }
  }, []);
  useEffect(() => { void cargar(); }, [cargar]);
  const partidasDisponibles = items.filter(x => x.cantidad_disponible > 0).length;
  return <section className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">Almacén de la asociación</p><h2 className="font-display text-xl font-extrabold text-text">Inventario central</h2><p className="mt-1 max-w-2xl text-sm text-text-muted">Aquí ingresan automáticamente los bienes aceptados en cada recepción presencial o física. Las donaciones quedan trazables por su código de origen.</p></div>
      <button type="button" onClick={() => void cargar()} className="press rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-text hover:bg-surface-elevated">Actualizar</button>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-border bg-surface p-4"><p className="text-xs text-text-muted">Partidas ingresadas</p><p className="mt-1 text-2xl font-extrabold text-text">{items.length}</p></div>
      <div className="rounded-2xl border border-border bg-surface p-4"><p className="text-xs text-text-muted">Partidas con saldo disponible</p><p className="mt-1 text-2xl font-extrabold text-text">{partidasDisponibles.toLocaleString('es-BO')}</p></div>
      <div className="rounded-2xl border border-border bg-surface p-4"><p className="text-xs text-text-muted">Ubicación predeterminada</p><p className="mt-1 text-sm font-bold text-text">Almacén general de la asociación</p></div>
    </div>
    {error && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-surface-elevated text-xs uppercase tracking-wide text-text-muted"><tr><th className="px-4 py-3">Donación</th><th className="px-4 py-3">Artículo</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Ingresado</th><th className="px-4 py-3">Disponible</th><th className="px-4 py-3">Ubicación</th><th className="px-4 py-3">Estado</th></tr></thead>
      <tbody className="divide-y divide-border">{!cargando && items.map(x => <tr key={x.id_inventario}><td className="px-4 py-3 font-semibold text-primary">{x.donacion_codigo}</td><td className="px-4 py-3 text-text">{x.nombre_item || 'Artículo sin nombre'}</td><td className="px-4 py-3 text-text-muted">{x.tipo_item === 'ALIMENTO' ? 'Alimento' : 'Material'}</td><td className="px-4 py-3 tabular-nums text-text">{x.cantidad_ingresada} {x.unidad}</td><td className="px-4 py-3 font-bold tabular-nums text-text">{x.cantidad_disponible} {x.unidad}</td><td className="px-4 py-3 text-text-muted">{x.ubicacion}</td><td className="px-4 py-3"><span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">{x.estado}</span></td></tr>)}
      {!cargando && items.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-text-muted">Todavía no hay bienes aceptados en el inventario. Se agregarán al registrar una recepción aceptada.</td></tr>}
      {cargando && <tr><td colSpan={7} className="px-4 py-10 text-center text-text-muted">Cargando inventario…</td></tr>}</tbody></table>
    </div>
    <p className="text-xs leading-relaxed text-text-muted">Las salidas físicas a beneficiarios se registran desde la sección Entregas a beneficiarios, dentro de esta misma pestaña. Cada salida queda vinculada a la asignación y descuenta automáticamente las existencias.</p>
  </section>;
};
export default InventarioTab;
