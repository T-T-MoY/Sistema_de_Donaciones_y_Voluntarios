/**
 * ============================================================================
 * ARCHIVO: AsignacionesTab.tsx
 * PESTAÑA 2 · Asignaciones (solo Administrador): donaciones con saldo para
 * asignar a beneficiarios verificados + historial de asignaciones con
 * cancelación (que devuelve el saldo).
 * ============================================================================
 */

import { useCallback, useEffect, useState } from 'react';
import AsignarModal from './AsignarModal';
import MotivoModal from './MotivoModal';
import DonacionDetalleModal from './DonacionDetalleModal';
import { EstadoAsignacionBadge } from './EstadoBadge';
import { useToast } from '../../context/ToastContext';
import donacionApi, { leerError } from '../../api/donacion.api';
import { ETIQUETA_TIPO, formatoCantidad, formatoFecha, formatoFechaHora } from '../../utils/donacionFormat';
import type { AsignacionItem, DonacionListaItem, Paginado } from '../../types/donacion.types';
import { btnPeligroSuave, btnPrimario, btnSecundario, claseInput, tarjeta } from './estilos';

const AsignacionesTab = () => {
  const { exito } = useToast();

  // --- Donaciones con saldo
  const [qDon, setQDon] = useState('');
  const [pageDon, setPageDon] = useState(1);
  const [asignables, setAsignables] = useState<Paginado<DonacionListaItem> | null>(null);
  const [errDon, setErrDon] = useState('');
  const [cargandoDon, setCargandoDon] = useState(true);

  // --- Asignaciones
  const [estado, setEstado] = useState<'' | 'ACTIVA' | 'CANCELADA'>('');
  const [qAs, setQAs] = useState('');
  const [pageAs, setPageAs] = useState(1);
  const [asignaciones, setAsignaciones] = useState<Paginado<AsignacionItem> | null>(null);
  const [errAs, setErrAs] = useState('');
  const [cargandoAs, setCargandoAs] = useState(true);

  const [aAsignar, setAAsignar] = useState<DonacionListaItem | null>(null);
  const [cancelando, setCancelando] = useState<number | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [errorCancel, setErrorCancel] = useState('');
  const [detalleId, setDetalleId] = useState<number | null>(null);

  const cargarDon = useCallback(async (): Promise<void> => {
    setCargandoDon(true);
    setErrDon('');
    try {
      setAsignables(await donacionApi.asignables({ q: qDon, page: pageDon, limit: 5 }));
    } catch (e) {
      setErrDon(leerError(e).mensaje);
    } finally {
      setCargandoDon(false);
    }
  }, [qDon, pageDon]);

  const cargarAs = useCallback(async (): Promise<void> => {
    setCargandoAs(true);
    setErrAs('');
    try {
      setAsignaciones(await donacionApi.listarAsignaciones({ estado, q: qAs, page: pageAs, limit: 8 }));
    } catch (e) {
      setErrAs(leerError(e).mensaje);
    } finally {
      setCargandoAs(false);
    }
  }, [estado, qAs, pageAs]);

  useEffect(() => {
    void cargarDon();
  }, [cargarDon]);
  useEffect(() => {
    void cargarAs();
  }, [cargarAs]);

  const refrescar = (): void => {
    void cargarDon();
    void cargarAs();
  };

  const confirmarCancelacion = async (motivo: string): Promise<void> => {
    if (cancelando === null) return;
    setProcesando(true);
    setErrorCancel('');
    try {
      const r = await donacionApi.cancelarAsignacion(cancelando, motivo);
      exito(r.mensaje, 'Asignación cancelada');
      setCancelando(null);
      refrescar();
    } catch (e) {
      setErrorCancel(leerError(e).mensaje);
    } finally {
      setProcesando(false);
    }
  };

  const paginas = (p: Paginado<unknown> | null): number => (p ? Math.max(1, Math.ceil(p.total / p.limit)) : 1);

  const Paginacion = ({ pagina, total, onChange }: { pagina: number; total: number; onChange: (p: number) => void }) =>
    total > 1 ? (
      <nav className="flex items-center justify-between gap-3 border-t border-border bg-surface px-4 py-3" aria-label="Paginación">
        <button type="button" className={btnSecundario} onClick={() => onChange(pagina - 1)} disabled={pagina <= 1}>
          Anterior
        </button>
        <p className="text-xs text-text-muted">
          Página <span className="font-semibold text-text">{pagina}</span> de {total}
        </p>
        <button type="button" className={btnSecundario} onClick={() => onChange(pagina + 1)} disabled={pagina >= total}>
          Siguiente
        </button>
      </nav>
    ) : null;

  return (
    <div className="space-y-8">
      {/* Donaciones con saldo */}
      <section aria-labelledby="t-disponibles" className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="t-disponibles" className="font-display text-lg font-extrabold tracking-[-0.03em] text-text">
              Donaciones con saldo disponible
            </h2>
            <p className="text-sm text-text-muted">No incluye donaciones anuladas, totalmente asignadas ni alimentos vencidos.</p>
          </div>
          <input
            type="search"
            value={qDon}
            onChange={(e) => {
              setQDon(e.target.value);
              setPageDon(1);
            }}
            placeholder="Buscar por código o donante"
            aria-label="Buscar donaciones con saldo"
            className={`${claseInput} sm:max-w-xs`}
          />
        </div>

        <div className={`${tarjeta} overflow-hidden`}>
          {cargandoDon && !asignables ? (
            <div className="space-y-3 p-6" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-5 animate-pulse rounded-full bg-surface-sunken" />
              ))}
            </div>
          ) : errDon ? (
            <div className="flex items-center justify-between gap-3 p-6">
              <p className="font-medium text-error">{errDon}</p>
              <button type="button" className={btnSecundario} onClick={() => void cargarDon()}>
                Reintentar
              </button>
            </div>
          ) : asignables && asignables.items.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-text-muted">No hay donaciones con saldo disponible para asignar.</p>
          ) : asignables ? (
            <>
              <ul className="divide-y divide-border">
                {asignables.items.map((d) => (
                  <li key={d.id_donacion} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
                    <div className="min-w-0">
                      <button type="button" onClick={() => setDetalleId(d.id_donacion)} className="text-left text-sm font-bold text-text hover:underline">
                        {d.codigo}
                      </button>
                      <p className="text-xs text-text-muted">
                        {ETIQUETA_TIPO[d.tipo_donacion]}
                        {d.categoria ? ` · ${d.categoria}` : ''} · {formatoFecha(d.fecha_donacion)}
                        {d.donante_nombre ? ` · ${d.donante_nombre}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">Saldo</p>
                        <p className="font-display text-lg font-extrabold tabular-nums text-text">{formatoCantidad(d.saldo, d.unidad)}</p>
                      </div>
                      <button type="button" className={btnPrimario} onClick={() => setAAsignar(d)}>
                        Asignar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <Paginacion pagina={pageDon} total={paginas(asignables)} onChange={setPageDon} />
            </>
          ) : null}
        </div>
      </section>

      {/* Historial de asignaciones */}
      <section aria-labelledby="t-asignaciones" className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="t-asignaciones" className="font-display text-lg font-extrabold tracking-[-0.03em] text-text">
            Asignaciones registradas
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="search"
              value={qAs}
              onChange={(e) => {
                setQAs(e.target.value);
                setPageAs(1);
              }}
              placeholder="Código o beneficiario"
              aria-label="Buscar asignaciones"
              className={claseInput}
            />
            <select
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value as typeof estado);
                setPageAs(1);
              }}
              aria-label="Filtrar por estado"
              className={claseInput}
            >
              <option value="">Todas</option>
              <option value="ACTIVA">Activas</option>
              <option value="CANCELADA">Canceladas</option>
            </select>
          </div>
        </div>

        <div className={`${tarjeta} overflow-hidden`}>
          {cargandoAs && !asignaciones ? (
            <div className="space-y-3 p-6" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-5 animate-pulse rounded-full bg-surface-sunken" />
              ))}
            </div>
          ) : errAs ? (
            <div className="flex items-center justify-between gap-3 p-6">
              <p className="font-medium text-error">{errAs}</p>
              <button type="button" className={btnSecundario} onClick={() => void cargarAs()}>
                Reintentar
              </button>
            </div>
          ) : asignaciones && asignaciones.items.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-text-muted">No hay asignaciones para mostrar.</p>
          ) : asignaciones ? (
            <>
              <ul className="divide-y divide-border">
                {asignaciones.items.map((a) => (
                  <li key={a.id_asignacion} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text">
                        {a.beneficiario_nombre} · {formatoCantidad(a.cantidad, a.unidad)}
                      </p>
                      <p className="text-xs text-text-muted">
                        <button type="button" onClick={() => setDetalleId(a.donacion_id)} className="font-semibold hover:underline">
                          {a.donacion_codigo}
                        </button>{' '}
                        · {formatoFechaHora(a.fecha_asignacion)}
                        {a.observaciones ? ` · ${a.observaciones}` : ''}
                      </p>
                      {a.estado === 'CANCELADA' && a.motivo_cancelacion && (
                        <p className="mt-0.5 text-xs text-text-subtle">Cancelada: {a.motivo_cancelacion}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <EstadoAsignacionBadge estado={a.estado} />
                      {a.estado === 'ACTIVA' && (
                        <button type="button" className={btnPeligroSuave} onClick={() => setCancelando(a.id_asignacion)}>
                          Cancelar
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <Paginacion pagina={pageAs} total={paginas(asignaciones)} onChange={setPageAs} />
            </>
          ) : null}
        </div>
      </section>

      <AsignarModal isOpen={aAsignar !== null} donacion={aAsignar} onClose={() => setAAsignar(null)} onAsignado={refrescar} />

      <MotivoModal
        isOpen={cancelando !== null}
        titulo="Cancelar asignación"
        mensaje="La cantidad asignada volverá a estar disponible en el saldo de la donación."
        etiqueta="Motivo de cancelación"
        textoConfirmar="Cancelar asignación"
        cargando={procesando}
        errorServidor={errorCancel}
        onConfirm={(m) => void confirmarCancelacion(m)}
        onCancel={() => {
          setCancelando(null);
          setErrorCancel('');
        }}
      />

      <DonacionDetalleModal donacionId={detalleId} rol="Administrador" onClose={() => setDetalleId(null)} onCambio={refrescar} />
    </div>
  );
};

export default AsignacionesTab;
