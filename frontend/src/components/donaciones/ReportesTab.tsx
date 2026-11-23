/**
 * ============================================================================
 * ARCHIVO: ReportesTab.tsx
 * PESTAÑA 3 · Reportes (solo Administrador): CU "Generar reporte de
 * donaciones". Filtros → resumen + detalle → exportación a Excel / PDF.
 * Las monedas y unidades se muestran por separado; nunca se suman entre sí.
 * ============================================================================
 */

import { useState } from 'react';
import { EstadoBadge } from './EstadoBadge';
import { useToast } from '../../context/ToastContext';
import donacionApi, { leerError } from '../../api/donacion.api';
import { exportarExcel, exportarPdf } from '../../utils/exportReporte';
import { ETIQUETA_ESTADO, ETIQUETA_TIPO, formatoCantidad, formatoFecha, formatoNumero } from '../../utils/donacionFormat';
import type { EstadoDonacion, FiltrosDonacion, ReporteDonaciones, TipoDonacion } from '../../types/donacion.types';
import { btnPrimario, btnSecundario, claseEtiqueta, claseInput, claseTituloSeccion, tarjeta } from './estilos';

const TIPOS: TipoDonacion[] = ['ALIMENTO', 'MATERIAL', 'ECONOMICO'];
const ESTADOS: EstadoDonacion[] = ['REGISTRADA', 'ASIGNADA_PARCIAL', 'ASIGNADA_TOTAL', 'ANULADA'];
const FILAS_VISIBLES = 100;

const ReportesTab = () => {
  const { error: toastError, exito } = useToast();
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [tipo, setTipo] = useState<TipoDonacion | ''>('');
  const [estado, setEstado] = useState<EstadoDonacion | ''>('');
  const [errorFiltro, setErrorFiltro] = useState('');
  const [reporte, setReporte] = useState<ReporteDonaciones | null>(null);
  const [cargando, setCargando] = useState(false);
  const [exportando, setExportando] = useState<'' | 'xlsx' | 'pdf'>('');

  const generar = async (): Promise<void> => {
    if (desde && hasta && desde > hasta) {
      setErrorFiltro('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }
    setErrorFiltro('');
    setCargando(true);
    try {
      const filtros: Partial<FiltrosDonacion> = { desde, hasta, tipo, estado };
      setReporte(await donacionApi.reporte(filtros));
    } catch (e) {
      setReporte(null);
      toastError(leerError(e).mensaje, 'No se pudo generar el reporte');
    } finally {
      setCargando(false);
    }
  };

  const exportar = async (formato: 'xlsx' | 'pdf'): Promise<void> => {
    if (!reporte) return;
    setExportando(formato);
    try {
      if (formato === 'xlsx') await exportarExcel(reporte);
      else await exportarPdf(reporte);
      exito('El archivo se descargó correctamente.', 'Exportación lista');
    } catch {
      toastError('No se pudo generar el archivo. Inténtalo nuevamente.', 'Error de exportación');
    } finally {
      setExportando('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-extrabold tracking-[-0.03em] text-text md:text-2xl">Reporte de donaciones</h2>
        <p className="mt-1 text-sm text-text-muted">Resumen por tipo, estado, moneda y unidad. Las donaciones anuladas no se cuentan salvo que filtres por ese estado.</p>
      </div>

      <form
        className={`${tarjeta} p-4 sm:p-5`}
        onSubmit={(ev) => {
          ev.preventDefault();
          void generar();
        }}
        aria-label="Filtros del reporte"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="rp-desde" className={claseEtiqueta}>Desde</label>
            <input id="rp-desde" type="date" value={desde} max={hasta || undefined} onChange={(e) => setDesde(e.target.value)} className={claseInput} />
          </div>
          <div>
            <label htmlFor="rp-hasta" className={claseEtiqueta}>Hasta</label>
            <input id="rp-hasta" type="date" value={hasta} min={desde || undefined} onChange={(e) => setHasta(e.target.value)} className={claseInput} />
          </div>
          <div>
            <label htmlFor="rp-tipo" className={claseEtiqueta}>Tipo</label>
            <select id="rp-tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoDonacion | '')} className={claseInput}>
              <option value="">Todos</option>
              {TIPOS.map((t) => (
                <option key={t} value={t}>{ETIQUETA_TIPO[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rp-estado" className={claseEtiqueta}>Estado</label>
            <select id="rp-estado" value={estado} onChange={(e) => setEstado(e.target.value as EstadoDonacion | '')} className={claseInput}>
              <option value="">Todos (sin anuladas)</option>
              {ESTADOS.map((s) => (
                <option key={s} value={s}>{ETIQUETA_ESTADO[s]}</option>
              ))}
            </select>
          </div>
        </div>
        {errorFiltro && <p role="alert" className="mt-3 text-xs font-semibold text-error">{errorFiltro}</p>}
        <div className="mt-4 flex justify-end">
          <button type="submit" className={btnPrimario} disabled={cargando}>
            {cargando ? 'Generando…' : 'Generar reporte'}
          </button>
        </div>
      </form>

      {reporte && reporte.resumen.total_donaciones === 0 && (
        <p className={`${tarjeta} px-6 py-10 text-center text-sm text-text-muted`}>No hay donaciones en el período y con los filtros seleccionados.</p>
      )}

      {reporte && reporte.resumen.total_donaciones > 0 && (
        <>
          {reporte.truncado && (
            <p role="status" className="rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm font-medium text-warning">
              El período tiene más de 5.000 donaciones: el reporte muestra las más recientes. Acota las fechas para ver el total.
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button type="button" className={btnSecundario} onClick={() => void exportar('xlsx')} disabled={exportando !== ''}>
              {exportando === 'xlsx' ? 'Generando…' : 'Exportar Excel'}
            </button>
            <button type="button" className={btnSecundario} onClick={() => void exportar('pdf')} disabled={exportando !== ''}>
              {exportando === 'pdf' ? 'Generando…' : 'Exportar PDF'}
            </button>
          </div>

          {/* Resumen */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className={`${tarjeta} p-5`}>
              <p className={claseTituloSeccion}>Total de donaciones</p>
              <p className="mt-2 font-display text-4xl font-extrabold tabular-nums text-text">{reporte.resumen.total_donaciones}</p>
              <ul className="mt-3 space-y-1 text-sm text-text-muted">
                {reporte.resumen.por_tipo.map((x) => (
                  <li key={x.tipo} className="flex justify-between"><span>{ETIQUETA_TIPO[x.tipo]}</span><span className="font-semibold tabular-nums text-text">{x.cantidad_donaciones}</span></li>
                ))}
              </ul>
            </div>

            <div className={`${tarjeta} p-5`}>
              <p className={claseTituloSeccion}>Por estado</p>
              <ul className="mt-3 space-y-2">
                {reporte.resumen.por_estado.map((x) => (
                  <li key={x.estado} className="flex items-center justify-between gap-2">
                    <EstadoBadge estado={x.estado} />
                    <span className="font-semibold tabular-nums text-text">{x.cantidad_donaciones}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`${tarjeta} p-5 md:col-span-2 xl:col-span-1`}>
              <p className={claseTituloSeccion}>Dinero (por moneda)</p>
              {reporte.resumen.economico.length === 0 ? (
                <p className="mt-3 text-sm text-text-muted">Sin donaciones económicas.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {reporte.resumen.economico.map((x) => (
                    <li key={x.moneda} className="text-sm">
                      <p className="font-display text-xl font-extrabold tabular-nums text-text">{formatoCantidad(x.registrado, x.moneda)}</p>
                      <p className="text-xs text-text-muted">Asignado {formatoNumero(x.asignado)} · Saldo {formatoNumero(x.saldo)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {reporte.resumen.bienes.length > 0 && (
            <div className={`${tarjeta} overflow-x-auto`}>
              <table className="w-full text-left">
                <caption className="border-b border-border bg-surface px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-text">Bienes (por unidad de medida)</caption>
                <thead>
                  <tr className="border-b border-border text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
                    <th scope="col" className="px-5 py-3">Tipo</th>
                    <th scope="col" className="px-3 py-3">Unidad</th>
                    <th scope="col" className="px-3 py-3 text-right">Registrado</th>
                    <th scope="col" className="px-3 py-3 text-right">Asignado</th>
                    <th scope="col" className="px-5 py-3 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm text-text">
                  {reporte.resumen.bienes.map((b) => (
                    <tr key={`${b.tipo}-${b.unidad}`}>
                      <td className="px-5 py-3">{ETIQUETA_TIPO[b.tipo]}</td>
                      <td className="px-3 py-3">{b.unidad}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{formatoNumero(b.registrado)}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{formatoNumero(b.asignado)}</td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatoNumero(b.saldo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Detalle */}
          <div className={`${tarjeta} overflow-x-auto`}>
            <table className="w-full text-left">
              <caption className="border-b border-border bg-surface px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-text">
                Detalle {reporte.filas.length > FILAS_VISIBLES ? `(primeras ${FILAS_VISIBLES} de ${reporte.filas.length}; el archivo exportado incluye todas)` : ''}
              </caption>
              <thead>
                <tr className="border-b border-border text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
                  <th scope="col" className="px-5 py-3">Código</th>
                  <th scope="col" className="px-3 py-3">Fecha</th>
                  <th scope="col" className="px-3 py-3">Tipo</th>
                  <th scope="col" className="px-3 py-3 text-right">Cantidad</th>
                  <th scope="col" className="px-3 py-3 text-right">Saldo</th>
                  <th scope="col" className="px-3 py-3">Donante</th>
                  <th scope="col" className="px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm text-text">
                {reporte.filas.slice(0, FILAS_VISIBLES).map((f) => (
                  <tr key={f.id_donacion}>
                    <td className="px-5 py-3 font-semibold tabular-nums">{f.codigo}</td>
                    <td className="px-3 py-3 text-text-muted">{formatoFecha(f.fecha_donacion)}</td>
                    <td className="px-3 py-3">{ETIQUETA_TIPO[f.tipo_donacion]}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatoCantidad(f.cantidad, f.unidad)}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-text-muted">{formatoCantidad(f.saldo, f.unidad)}</td>
                    <td className="max-w-[180px] truncate px-3 py-3 text-text-muted">{f.donante_nombre ?? '—'}</td>
                    <td className="px-5 py-3"><EstadoBadge estado={f.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportesTab;
