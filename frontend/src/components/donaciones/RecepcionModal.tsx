import { useEffect, useState, type FormEvent } from 'react';
import ModalBase from './ModalBase';
import donacionApi, { leerError } from '../../api/donacion.api';
import { useToast } from '../../context/ToastContext';
import { btnPrimario, btnSecundario } from './estilos';
import { formatoCantidad } from '../../utils/donacionFormat';

interface Props {
  isOpen: boolean;
  donacionId: number;
  tipo: 'ALIMENTO' | 'MATERIAL' | 'ECONOMICO';
  pendiente: number;
  unidad: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const RecepcionModal = ({ isOpen, donacionId, tipo, pendiente, unidad, onClose, onSuccess }: Props) => {
  const { exito } = useToast();
  const [declarada, setDeclarada] = useState(String(pendiente));
  const [aceptada, setAceptada] = useState(String(pendiente));
  const [metodo, setMetodo] = useState('EFECTIVO');
  const [referencia, setReferencia] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const esDinero = tipo === 'ECONOMICO';

  useEffect(() => {
    setDeclarada(String(pendiente));
    setAceptada(String(pendiente));
  }, [pendiente]);

  const guardar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = Number(declarada);
    const a = Number(aceptada);
    if (!Number.isFinite(d) || d <= 0 || !Number.isFinite(a) || a < 0 || a > d || a > pendiente) {
      setError(`La cantidad aceptada debe estar entre 0 y la cantidad declarada, y no puede superar el compromiso pendiente (${pendiente}).`);
      return;
    }
    if (a < d && !motivo.trim()) {
      setError('Indica por qué se rechazó una parte o la totalidad.');
      return;
    }
    if (esDinero && metodo !== 'EFECTIVO' && !referencia.trim()) {
      setError('Registra la referencia del pago para transferencias, depósitos o QR.');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      const r = await donacionApi.registrarRecepcion(donacionId, {
        cantidad_declarada: d,
        cantidad_aceptada: a,
        ...(esDinero ? { metodo_pago: metodo, referencia: referencia.trim() || null } : {}),
        observaciones: observaciones.trim() || null,
        motivo_rechazo: motivo.trim() || null,
      });
      const titulo = r.estado === 'RECHAZADA' ? 'Recepción rechazada' : r.estado === 'PARCIAL' ? 'Recepción parcial' : 'Recepción confirmada';
      exito(r.mensaje, titulo);
      onSuccess();
      onClose();
    } catch (err) {
      setError(leerError(err).mensaje);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ModalBase isOpen={isOpen} titulo="Registrar recepción" subtitulo="Solo la cantidad aceptada pasará a estar disponible." onClose={onClose} bloqueado={guardando} ancho="lg"
      pie={<><button type="button" className={btnSecundario} onClick={onClose} disabled={guardando}>Cancelar</button><button type="submit" form="form-recepcion" className={btnPrimario} disabled={guardando}>{guardando ? 'Guardando…' : 'Confirmar recepción'}</button></>}>
      <form id="form-recepcion" onSubmit={guardar} className="space-y-4">
        <div className="rounded-xl border border-border bg-surface px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted">Pendiente de recibir</p>
          <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-text">{formatoCantidad(pendiente, unidad)}</p>
          <p className="mt-1 text-xs text-text-muted">Solo la cantidad aceptada y verificada aumentará el saldo disponible para asignaciones.</p>
        </div>
        <label className="block text-sm font-medium text-text">Cantidad que el donante entregó<input className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2" type="number" min="0.01" step="0.01" max={pendiente} value={declarada} onChange={e => { setDeclarada(e.target.value); setError(''); }} required /><span className="mt-1 block text-xs text-text-muted">No puede superar el pendiente de {formatoCantidad(pendiente, unidad)}.</span></label>
        <label className="block text-sm font-medium text-text">Cantidad aceptada después de verificar<input className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2" type="number" min="0" step="0.01" max={pendiente} value={aceptada} onChange={e => { setAceptada(e.target.value); setError(''); }} required /><span className="mt-1 block text-xs text-text-muted">Lo que no se acepte no se sumará al saldo.</span></label>
        <div className="rounded-xl border border-success/25 bg-success-soft/40 px-3 py-2 text-sm text-text"><span className="font-semibold">Se agregará al saldo:</span> {formatoCantidad(Math.max(0, Math.min(Number(aceptada) || 0, pendiente)), unidad)}</div>
        {esDinero && <>
          <label className="block text-sm font-medium text-text">Método de pago<select className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2" value={metodo} onChange={e => setMetodo(e.target.value)}><option value="EFECTIVO">Efectivo</option><option value="TRANSFERENCIA">Transferencia</option><option value="DEPOSITO">Depósito</option><option value="QR">QR</option></select></label>
          {metodo !== 'EFECTIVO' && <label className="block text-sm font-medium text-text">Referencia de pago<input className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2" value={referencia} onChange={e => setReferencia(e.target.value)} required maxLength={120} /></label>}
        </>}
        {Number(aceptada) < Number(declarada) && <label className="block text-sm font-medium text-text">Motivo del rechazo parcial o total<textarea className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2" rows={2} value={motivo} onChange={e => { setMotivo(e.target.value); setError(''); }} required maxLength={500} /></label>}
        <label className="block text-sm font-medium text-text">Observaciones (opcional)<textarea className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2" rows={2} value={observaciones} onChange={e => setObservaciones(e.target.value)} maxLength={1000} /></label>
        {error && <p role="alert" className="rounded-lg border border-error/30 bg-error-soft px-3 py-2 text-sm text-error">{error}</p>}
      </form>
    </ModalBase>
  );
};

export default RecepcionModal;
