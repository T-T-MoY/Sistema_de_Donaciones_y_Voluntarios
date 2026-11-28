import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ayudaApi } from '../api/ayuda.api';
import type {
  FichaBeneficiario,
  SolicitudAyuda,
  ApoyoAyuda,
  CatalogosAyuda,
} from '../types/ayuda.types';
import BeneficiariosTab from '../components/ayudas/BeneficiariosTab';
import SolicitudesTab from '../components/ayudas/SolicitudesTab';
import ApoyosTab from '../components/ayudas/ApoyosTab';
import {
  Aviso,
  btnSecundario,
  mensajeError,
} from '../components/ayudas/Compartidos';

type Tab = 'beneficiarios' | 'solicitudes' | 'entregas';
const tabs: { id: Tab; titulo: string; personal: string }[] = [
  { id: 'beneficiarios', titulo: 'Beneficiarios', personal: 'Mi ficha' },
  {
    id: 'solicitudes',
    titulo: 'Solicitudes de ayuda',
    personal: 'Mis solicitudes',
  },
  { id: 'entregas', titulo: 'Ayudas y entregas', personal: 'Mis ayudas' },
];
export default function BeneficiariosAyudasPage() {
  const [params, setParams] = useSearchParams();
  const tab = tabs.some((t) => t.id === params.get('seccion'))
    ? (params.get('seccion') as Tab)
    : 'beneficiarios';
  const [acceso, setAcceso] = useState<{
    id: number;
    admin: boolean;
    beneficiario: boolean;
  } | null>(null);
  const [fichas, setFichas] = useState<FichaBeneficiario[]>([]),
    [solicitudes, setSolicitudes] = useState<SolicitudAyuda[]>([]),
    [apoyos, setApoyos] = useState<ApoyoAyuda[]>([]);
  const [catalogos, setCatalogos] = useState<CatalogosAyuda>({
    tipos_ayuda: [],
    campanas: [],
    responsables: [],
    usuarios: [],
  });
  const [cargando, setCargando] = useState(true),
    [error, setError] = useState('');
  const [beneficiarioInicial, setBeneficiarioInicial] = useState<number | null>(
      null,
    ),
    [solicitudInicial, setSolicitudInicial] = useState<SolicitudAyuda | null>(
      null,
    );
  const secuencia = useRef(0);
  const cargar = useCallback(async () => {
    const turno = ++secuencia.current;
    try {
      setError('');
      const a = await ayudaApi.acceso();
      if (turno !== secuencia.current) return;
      setAcceso(a);
      if (!a.admin && !a.beneficiario) return;
      const [f, s, p, c] = await Promise.all([
        ayudaApi.fichas(),
        ayudaApi.solicitudes(),
        ayudaApi.apoyos(),
        ayudaApi.catalogos(),
      ]);
      if (turno !== secuencia.current) return;
      setFichas(f);
      setSolicitudes(s);
      setApoyos(p);
      setCatalogos(c);
    } catch (e) {
      if (turno === secuencia.current) setError(mensajeError(e));
    } finally {
      if (turno === secuencia.current) setCargando(false);
    }
  }, []);
  useEffect(() => {
    void cargar();
    return () => {
      secuencia.current++;
    };
  }, [cargar]);
  const cambiarTab = (t: Tab) => setParams({ seccion: t });
  if (cargando)
    return (
      <div role="status" className="p-10 text-center text-text-muted">
        Cargando beneficiarios y ayudas…
      </div>
    );
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 md:py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
            Módulo
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.04em] text-text md:text-3xl">
            Gestión de beneficiarios y ayudas
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
            De la necesidad al apoyo recibido: fichas, solicitudes y entregas en
            un solo lugar.
          </p>
        </div>
        <button className={btnSecundario} onClick={() => void cargar()}>
          Actualizar
        </button>
      </header>
      {error && <Aviso error>{error}</Aviso>}
      {acceso && !acceso.admin && !acceso.beneficiario ? (
        <Aviso>
          Para solicitar ayuda necesitas una ficha de beneficiario. Puedes
          iniciar tu solicitud desde{' '}
          <Link className="font-bold underline" to="/dashboard">
            Inicio
          </Link>
          .
        </Aviso>
      ) : (
        acceso && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  titulo: acceso.admin
                    ? 'Beneficiarios registrados'
                    : 'Mi ficha',
                  valor: fichas.length,
                  detalle: acceso.admin
                    ? `${fichas.filter((f) => f.estado === 'Verificado').length} verificados`
                    : fichas[0]?.estado || 'Sin ficha',
                },
                {
                  titulo: 'Solicitudes pendientes',
                  valor: solicitudes.filter((s) => s.estado === 'Pendiente')
                    .length,
                  detalle: 'En espera de evaluación',
                },
                {
                  titulo: 'Ayudas entregadas',
                  valor: apoyos.filter((a) => a.estado === 'Entregada').length,
                  detalle: `${apoyos.filter((a) => a.estado !== 'Entregada').length} en preparación o pendientes`,
                },
              ].map((k) => (
                <div
                  key={k.titulo}
                  className="rounded-2xl border border-border bg-surface-elevated px-5 py-4 shadow-soft"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted">
                    {k.titulo}
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <span className="font-display text-3xl font-extrabold text-primary">
                      {k.valor}
                    </span>
                    <span className="text-right text-xs text-text-subtle">
                      {k.detalle}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div
              role="tablist"
              aria-label="Secciones de beneficiarios y ayudas"
              className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-surface p-1"
            >
              {tabs.map((t, i) => (
                <button
                  key={t.id}
                  role="tab"
                  id={`ayudas-tab-${t.id}`}
                  aria-selected={tab === t.id}
                  aria-controls={`ayudas-panel-${t.id}`}
                  tabIndex={tab === t.id ? 0 : -1}
                  onKeyDown={(e) => {
                    if (
                      ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)
                    ) {
                      e.preventDefault();
                      const next =
                        e.key === 'Home'
                          ? 0
                          : e.key === 'End'
                            ? tabs.length - 1
                            : (i +
                                (e.key === 'ArrowRight' ? 1 : -1) +
                                tabs.length) %
                              tabs.length;
                      cambiarTab(tabs[next].id);
                      document
                        .getElementById(`ayudas-tab-${tabs[next].id}`)
                        ?.focus();
                    }
                  }}
                  onClick={() => cambiarTab(t.id)}
                  className={`press flex-1 whitespace-nowrap rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] ${tab === t.id ? 'bg-primary text-on-primary shadow-soft' : 'text-text-muted hover:bg-surface-elevated'}`}
                >
                  {acceso.admin ? t.titulo : t.personal}
                </button>
              ))}
            </div>
            <div
              role="tabpanel"
              id={`ayudas-panel-${tab}`}
              aria-labelledby={`ayudas-tab-${tab}`}
            >
              {tab === 'beneficiarios' && (
                <BeneficiariosTab
                  fichas={fichas}
                  catalogos={catalogos}
                  admin={acceso.admin}
                  onActualizar={cargar}
                  onSolicitar={(id) => {
                    setBeneficiarioInicial(id);
                    cambiarTab('solicitudes');
                  }}
                />
              )}
              {tab === 'solicitudes' && (
                <SolicitudesTab
                  solicitudes={solicitudes}
                  fichas={fichas}
                  catalogos={catalogos}
                  admin={acceso.admin}
                  beneficiarioInicial={beneficiarioInicial}
                  onConsumir={() => setBeneficiarioInicial(null)}
                  onActualizar={cargar}
                  onAsignar={(s) => {
                    setSolicitudInicial(s);
                    cambiarTab('entregas');
                  }}
                />
              )}
              {tab === 'entregas' && (
                <ApoyosTab
                  apoyos={apoyos}
                  solicitudes={solicitudes}
                  catalogos={catalogos}
                  admin={acceso.admin}
                  solicitudInicial={solicitudInicial}
                  onConsumir={() => setSolicitudInicial(null)}
                  onActualizar={cargar}
                />
              )}
            </div>
          </>
        )
      )}
    </div>
  );
}
