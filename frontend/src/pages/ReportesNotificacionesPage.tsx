import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

type Fila = Record<string, string | number | boolean | null>;
type Destinatario = { id_usuario: number; nombre: string; apellido: string; correo: string; roles: string };
type Notificacion = { id_notificacion: number; asunto: string; estado: string; programada_para: string | null; creada_en: string; total_destinatarios: number };
type Campana = { id_campana: number; nombre: string };
const hoy = new Date();
const fechaLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const fechaHoraLocal = (d: Date) => `${fechaLocal(d)}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;

export default function ReportesNotificacionesPage() {
  const { usuario } = useAuth();
  const roles = useMemo(() => (usuario?.roles?.length ? usuario.roles : [usuario?.rol || '']).map(r => String(r).toLowerCase()), [usuario]);
  const esAdmin = roles.some(r => ['admin','administrador'].includes(r));
  const esCoordinacion = esAdmin || roles.includes('coordinador') || Boolean(usuario?.es_coordinador);
  const [tipo, setTipo] = useState(() => roles.includes('voluntario') ? 'voluntariado' : roles.includes('beneficiario') ? 'solicitudes' : 'donaciones');
  const [desde, setDesde] = useState(`${hoy.getFullYear()}-01-01`);
  const [hasta, setHasta] = useState(fechaLocal(hoy));
  const [campanaId, setCampanaId] = useState('');
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [filas, setFilas] = useState<Fila[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [destinatarios, setDestinatarios] = useState<Destinatario[]>([]);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [programada, setProgramada] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [aviso, setAviso] = useState('');

  const cargarNotificaciones = useCallback(async () => {
    try { const r = await api.get('/sprint6/notificaciones'); setNotificaciones(r.data); } catch { /* el formulario mostrará el error al operar */ }
  }, []);
  useEffect(() => {
    if (esCoordinacion) {
      api.get('/sprint6/destinatarios').then(r => setDestinatarios(r.data)).catch(e => setError(e.response?.data?.error || 'No se pudieron cargar los destinatarios.'));
      api.get('/campanas').then(r => setCampanas(Array.isArray(r.data) ? r.data : (r.data?.campanas || []))).catch(() => setCampanas([]));
      void cargarNotificaciones();
    }
  }, [esCoordinacion, cargarNotificaciones]);

  const generar = async () => {
    setError(''); setAviso(''); setCargando(true);
    try { const r = await api.get('/sprint6/reportes', { params: { tipo, desde, hasta, ...(campanaId && tipo === 'donaciones' ? { campanaId } : {}) } }); setFilas(r.data.filas || []); if (!r.data.total) setAviso('No existen registros para los filtros seleccionados.'); }
    catch (e: any) { setFilas([]); setError(e.response?.data?.error || 'No se pudo generar el reporte.'); }
    finally { setCargando(false); }
  };
  const enviar = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setAviso(''); setEnviando(true);
    try {
      const r = await api.post('/sprint6/notificaciones', { asunto, mensaje, destinatarios: seleccionados, programadaPara: programada ? new Date(programada).toISOString() : null });
      setAviso(r.data.estado === 'PROGRAMADA' ? 'Notificación programada correctamente.' : 'Notificación registrada. El envío se está procesando.');
      setAsunto(''); setMensaje(''); setProgramada(''); setSeleccionados([]); await cargarNotificaciones();
    } catch (e: any) { setError(e.response?.data?.error || 'No se pudo registrar la notificación.'); }
    finally { setEnviando(false); }
  };
  const exportarPdf = async () => {
    if (!filas.length) return;
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const columnas = Object.keys(filas[0]);
    const margen = 13;
    const anchoPagina = doc.internal.pageSize.getWidth();
    const altoPagina = doc.internal.pageSize.getHeight();
    const anchoUtil = anchoPagina - margen * 2;
    const titulo = tipo === 'donaciones' ? 'Reporte de donaciones' : tipo === 'voluntariado' ? 'Reporte de voluntariado y asistencias' : tipo === 'campanas' ? 'Reporte de campañas' : 'Reporte de solicitudes de ayuda';
    const subtitulo = 'SISTEMA DE DONACIONES Y VOLUNTARIADO';
    const fechaEmision = new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
    const azul: [number, number, number] = [24, 48, 78];
    const turquesa: [number, number, number] = [22, 150, 145];
    const gris: [number, number, number] = [91, 105, 120];
    const grisClaro: [number, number, number] = [239, 244, 247];
    const anchoColumna = anchoUtil / columnas.length;
    const altoFilaMin = 8;
    let y = 0;

    const encabezadoPagina = (continuacion = false) => {
      doc.setFillColor(...azul);
      doc.rect(0, 0, anchoPagina, 31, 'F');
      doc.setFillColor(...turquesa);
      doc.rect(0, 31, anchoPagina, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(subtitulo, margen, 10);
      doc.setFontSize(17);
      doc.text(continuacion ? `${titulo} — continuación` : titulo, margen, 20);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(220, 232, 239);
      doc.text('INFORME DE CONSULTA', anchoPagina - margen, 11, { align: 'right' });
      y = 41;
    };

    const piePagina = () => {
      const paginas = doc.getNumberOfPages();
      for (let pagina = 1; pagina <= paginas; pagina++) {
        doc.setPage(pagina);
        doc.setDrawColor(218, 226, 232);
        doc.line(margen, altoPagina - 10, anchoPagina - margen, altoPagina - 10);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...gris);
        doc.text('Sistema de Donaciones y Voluntariado · Reporte generado automáticamente', margen, altoPagina - 5);
        doc.text(`Página ${pagina} de ${paginas}`, anchoPagina - margen, altoPagina - 5, { align: 'right' });
      }
    };

    encabezadoPagina();
    // Resumen del reporte en tarjetas
    const tarjetaY = y;
    const tarjetaH = 17;
    const gap = 4;
    const tarjetaW = (anchoUtil - gap * 2) / 3;
    const tarjetas = [
      { etiqueta: 'PERÍODO CONSULTADO', valor: `${desde}  —  ${hasta}` },
      { etiqueta: 'REGISTROS ENCONTRADOS', valor: String(filas.length) },
      { etiqueta: 'FECHA DE EMISIÓN', valor: fechaEmision },
    ];
    tarjetas.forEach((t, i) => {
      const x = margen + i * (tarjetaW + gap);
      doc.setFillColor(...grisClaro);
      doc.roundedRect(x, tarjetaY, tarjetaW, tarjetaH, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(...turquesa);
      doc.text(t.etiqueta, x + 3, tarjetaY + 5);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...azul);
      doc.text(doc.splitTextToSize(t.valor, tarjetaW - 6).slice(0, 1), x + 3, tarjetaY + 12);
    });
    y += tarjetaH + 9;

    const dibujarTablaEncabezado = () => {
      doc.setFillColor(...azul);
      doc.roundedRect(margen, y, anchoUtil, 9, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      columnas.forEach((col, i) => {
        const texto = doc.splitTextToSize(col.replaceAll('_', ' ').toUpperCase(), anchoColumna - 3).slice(0, 2);
        doc.text(texto, margen + i * anchoColumna + 1.5, y + 3.5);
      });
      y += 11;
    };
    dibujarTablaEncabezado();

    filas.forEach((fila, index) => {
      const celdas = columnas.map(col => doc.splitTextToSize(String(fila[col] ?? '—'), Math.max(10, anchoColumna - 4)));
      const lineas = Math.max(1, ...celdas.map(c => c.length));
      const alto = Math.max(altoFilaMin, lineas * 3.3 + 4);
      if (y + alto > altoPagina - 16) {
        doc.addPage();
        encabezadoPagina(true);
        dibujarTablaEncabezado();
      }
      if (index % 2 === 0) {
        doc.setFillColor(246, 249, 251);
        doc.rect(margen, y - 2, anchoUtil, alto, 'F');
      }
      doc.setDrawColor(226, 233, 238);
      doc.line(margen, y + alto - 1, margen + anchoUtil, y + alto - 1);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(55, 68, 82);
      celdas.forEach((lineasCelda, i) => {
        doc.text(lineasCelda, margen + i * anchoColumna + 1.5, y + 2.5, { maxWidth: anchoColumna - 4 });
      });
      y += alto;
    });

    piePagina();
    doc.save(`reporte-${tipo}-${desde}-${hasta}.pdf`);
  };
  const reintentar = async (id: number) => { try { await api.post(`/sprint6/notificaciones/${id}/reintentar`); setAviso('Se inició el reintento de envío.'); await cargarNotificaciones(); } catch (e: any) { setError(e.response?.data?.error || 'No se pudo reintentar.'); } };

  return <main className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">
    <header><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Sprint 6</p><h1 className="mt-2 text-3xl font-extrabold text-text">Reportes y notificaciones</h1><p className="mt-2 max-w-3xl text-sm text-text-muted">Consulta información según tu perfil, exporta resultados y comunica novedades a destinatarios autorizados.</p></header>
    {error && <div role="alert" className="rounded-xl border border-error/30 bg-error-soft p-3 text-sm text-error">{error}</div>}
    {aviso && <div role="status" className="rounded-xl border border-success/30 bg-success-soft p-3 text-sm text-success">{aviso}</div>}
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <h2 className="text-xl font-bold text-text">Generar reportes</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-semibold text-text">Tipo de reporte<select value={tipo} onChange={e => setTipo(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background p-2">{esCoordinacion ? <><option value="donaciones">Donaciones</option><option value="voluntariado">Voluntariado y asistencias</option><option value="campanas">Campañas</option><option value="solicitudes">Solicitudes de ayuda</option></> : <>{roles.includes('donante') && <option value="donaciones">Mis donaciones</option>}{roles.includes('voluntario') && <option value="voluntariado">Mi voluntariado y asistencias</option>}{roles.includes('beneficiario') && <option value="solicitudes">Mis solicitudes de ayuda</option>}</>}</select></label>
        <label className="text-sm font-semibold text-text">Desde<input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background p-2" /></label>
        <label className="text-sm font-semibold text-text">Hasta<input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background p-2" /></label>
        <label className="text-sm font-semibold text-text">Campaña (opcional)<select value={campanaId} onChange={e=>setCampanaId(e.target.value)} disabled={tipo !== 'donaciones'} className="mt-1 w-full rounded-lg border border-border bg-background p-2 disabled:opacity-50"><option value="">Todas las campañas</option>{campanas.map(c=><option key={c.id_campana} value={c.id_campana}>{c.nombre}</option>)}</select></label>
        <div className="flex items-end"><button onClick={() => void generar()} disabled={cargando} className="w-full rounded-lg bg-primary px-4 py-2.5 font-bold text-white disabled:opacity-50">{cargando ? 'Generando…' : 'Generar reporte'}</button></div>
      </div>
      {filas.length > 0 && <><div className="mt-4 flex items-center justify-between"><p className="text-sm text-text-muted">{filas.length} registro(s) encontrados</p><button onClick={() => void exportarPdf()} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text">Exportar PDF</button></div><div className="mt-3 max-h-[480px] overflow-auto rounded-xl border border-border"><table className="min-w-full text-left text-sm"><thead className="sticky top-0 bg-background"><tr>{Object.keys(filas[0]).map(k => <th key={k} className="whitespace-nowrap px-3 py-2 font-bold text-text">{k.replace(/_/g,' ')}</th>)}</tr></thead><tbody>{filas.map((f,i)=><tr key={i} className="border-t border-border">{Object.keys(filas[0]).map(k=><td key={k} className="whitespace-nowrap px-3 py-2 text-text-muted">{String(f[k] ?? '—')}</td>)}</tr>)}</tbody></table></div></>}
      {filas.length === 0 && <p className="mt-4 text-sm text-text-muted">Selecciona los filtros y genera un reporte para visualizar los resultados.</p>}
    </section>
    {esCoordinacion && <>
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm"><h2 className="text-xl font-bold text-text">Enviar o programar notificación</h2><p className="mt-1 text-sm text-text-muted">Los destinatarios se validan nuevamente en el servidor según tu rol.</p>
        <form onSubmit={e => void enviar(e)} className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="text-sm font-semibold text-text">Asunto<input required maxLength={180} value={asunto} onChange={e=>setAsunto(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background p-2" /></label>
          <label className="text-sm font-semibold text-text">Fecha y hora de envío (opcional)<input type="datetime-local" value={programada} onChange={e=>setProgramada(e.target.value)} min={fechaHoraLocal(new Date(Date.now()+60000))} className="mt-1 w-full rounded-lg border border-border bg-background p-2" /></label>
          <label className="text-sm font-semibold text-text lg:col-span-2">Mensaje<textarea required rows={4} maxLength={10000} value={mensaje} onChange={e=>setMensaje(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background p-2" /></label>
          <fieldset className="rounded-xl border border-border p-3 lg:col-span-2"><legend className="px-1 text-sm font-bold text-text">Destinatarios ({seleccionados.length} seleccionados)</legend><div className="max-h-52 space-y-2 overflow-auto">{destinatarios.map(d=><label key={d.id_usuario} className="flex items-center gap-2 text-sm text-text"><input type="checkbox" checked={seleccionados.includes(d.id_usuario)} onChange={e=>setSeleccionados(prev=>e.target.checked?[...prev,d.id_usuario]:prev.filter(x=>x!==d.id_usuario))} /><span>{d.nombre} {d.apellido}</span><span className="text-text-muted">({d.correo})</span></label>)}{!destinatarios.length && <p className="text-sm text-text-muted">No hay destinatarios disponibles.</p>}</div></fieldset>
          <div className="lg:col-span-2"><button type="submit" disabled={enviando || !seleccionados.length} className="rounded-lg bg-primary px-5 py-2.5 font-bold text-white disabled:opacity-50">{enviando ? 'Procesando…' : programada ? 'Programar envío' : 'Enviar notificación'}</button></div>
        </form>
      </section>
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-xl font-bold text-text">Historial de notificaciones</h2><button onClick={()=>void cargarNotificaciones()} className="text-sm font-semibold text-primary">Actualizar</button></div><div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-border text-text-muted"><th className="py-2">Asunto</th><th>Estado</th><th>Destinatarios</th><th>Programada para</th><th>Acción</th></tr></thead><tbody>{notificaciones.map(n=><tr key={n.id_notificacion} className="border-b border-border"><td className="py-3 font-semibold text-text">{n.asunto}</td><td>{n.estado}</td><td>{n.total_destinatarios}</td><td>{n.programada_para ? new Date(n.programada_para).toLocaleString() : 'Inmediato'}</td><td>{n.estado !== 'ENVIADA' && <button onClick={()=>void reintentar(n.id_notificacion)} className="font-semibold text-primary">Reintentar</button>}</td></tr>)}</tbody></table>{!notificaciones.length && <p className="py-4 text-sm text-text-muted">Todavía no hay notificaciones registradas.</p>}</div></section>
    </>}
  </main>;
}
