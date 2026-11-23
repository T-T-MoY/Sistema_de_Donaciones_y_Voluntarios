/**
 * ============================================================================
 * COMPONENTE: AsignarModal
 * CU "Asignar donación a solicitud de ayuda": el administrador asigna parte o
 * todo el saldo de una donación a un beneficiario verificado.
 * El saldo se valida en el servidor dentro de una transacción con bloqueo.
 * ============================================================================
 */

import { useEffect, useState, type FormEvent } from 'react';
import ModalBase from './ModalBase';
import FieldError from '../ui/FieldError';
import { useToast } from '../../context/ToastContext';
import donacionApi, { leerError } from '../../api/donacion.api';
import { formatoCantidad, ETIQUETA_TIPO } from '../../utils/donacionFormat';
import type { BeneficiarioAsignable, TipoDonacion } from '../../types/donacion.types';
import { btnPrimario, btnSecundario, claseEtiqueta, claseInput, claseInputError } from './estilos';

export interface DonacionAsignable {
  id_donacion: number;
  codigo: string;
  tipo_donacion: TipoDonacion;
  categoria: string | null;
  unidad: string | null;
  saldo: number | null;
}

interface Props {
  isOpen: boolean;
  donacion: DonacionAsignable | null;
  onClose: () => void;
  /** Se invoca tras asignar (o ante un conflicto) para refrescar datos. */
  onAsignado: () => void;
}

const AsignarModal = ({ isOpen, donacion, onClose, onAsignado }: Props) => {
  const { exito } = useToast();
  const [beneficiarios, setBeneficiarios] = useState<BeneficiarioAsignable[]>([]);
  const [cargando, setCargando] = useState(false);
  const [beneficiario, setBeneficiario] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [intento, setIntento] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorServidor, setErrorServidor] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    let vivo = true;
    setBeneficiario('');
    setCantidad('');
    setObservaciones('');
    setIntento(false);
    setErrorServidor([]);
    setCargando(true);
    donacionApi
      .beneficiariosAsignables()
      .then((b) => vivo && setBeneficiarios(b))
      .catch((e) => vivo && setErrorServidor([leerError(e).mensaje]))
      .finally(() => vivo && setCargando(false));
    return () => {
      vivo = false;
    };
  }, [isOpen]);

  if (!donacion) return null;
  const saldo = donacion.saldo ?? 0;

  const n = Number(cantidad.replace(',', '.'));
  const errores: { beneficiario?: string; cantidad?: string } = {};
  if (!beneficiario) errores.beneficiario = 'Selecciona un beneficiario.';
  if (cantidad.trim() === '') errores.cantidad = 'La cantidad es obligatoria.';
  else if (!Number.isFinite(n)) errores.cantidad = 'Debe ser un número.';
  else if (n <= 0) errores.cantidad = 'Debe ser mayor a cero.';
  else if (Math.abs(Math.round(n * 100) - n * 100) > 1e-6) errores.cantidad = 'Máximo 2 decimales.';
  else if (Math.round(n * 100) > Math.round(saldo * 100)) {
    errores.cantidad = `No puede superar el saldo disponible (${formatoCantidad(saldo, donacion.unidad)}).`;
  }

  const enviar = async (ev: FormEvent): Promise<void> => {
    ev.preventDefault();
    setIntento(true);
    setErrorServidor([]);
    if (errores.beneficiario || errores.cantidad) return;
    setGuardando(true);
    try {
      const r = await donacionApi.asignar(donacion.id_donacion, {
        beneficiario_usuario_id: Number(beneficiario),
        cantidad: n,
        observaciones: observaciones.trim(),
      });
      exito(`${r.mensaje}. Saldo restante: ${formatoCantidad(r.saldo_restante, donacion.unidad)}.`, 'Asignación registrada');
      onAsignado();
      onClose();
    } catch (err) {
      const info = leerError(err);
      setErrorServidor(info.errores.length ? info.errores : [info.mensaje]);
      if (info.status === 409) onAsignado(); // el saldo cambió: refresca la lista
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ModalBase
      isOpen={isOpen}
      titulo={`Asignar donación ${donacion.codigo}`}
      subtitulo={`${ETIQUETA_TIPO[donacion.tipo_donacion]}${donacion.categoria ? ` · ${donacion.categoria}` : ''}`}
      ancho="md"
      bloqueado={guardando}
      onClose={onClose}
      pie={
        <>
          <button type="button" className={btnSecundario} onClick={onClose} disabled={guardando}>
            Cancelar
          </button>
          <button type="submit" form="form-asignar" className={btnPrimario} disabled={guardando || cargando || beneficiarios.length === 0 || saldo <= 0}>
            {guardando ? 'Asignando…' : 'Reservar para beneficiario'}
          </button>
        </>
      }
    >
      <div className="mb-5 rounded-2xl border border-border bg-surface px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted">Saldo recibido disponible</p>
        <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-text">{formatoCantidad(saldo, donacion.unidad)}</p>
        <p className="mt-1 text-xs leading-relaxed text-text-muted">La asignación reserva esta cantidad para el beneficiario. La entrega se tendrá que registrar en una etapa posterior.</p>
      </div>

      <form id="form-asignar" onSubmit={(ev) => void enviar(ev)} noValidate className="space-y-4">
        {errorServidor.length > 0 && (
          <div role="alert" className="rounded-xl border border-error/30 bg-error-soft px-4 py-3 text-sm font-medium text-error">
            {errorServidor.map((m) => (
              <p key={m}>{m}</p>
            ))}
          </div>
        )}

        <div>
          <label htmlFor="as-benef" className={claseEtiqueta}>
            Beneficiario verificado *
          </label>
          <select
            id="as-benef"
            value={beneficiario}
            disabled={cargando}
            onChange={(ev) => setBeneficiario(ev.target.value)}
            className={intento && errores.beneficiario ? claseInputError : claseInput}
          >
            <option value="">{cargando ? 'Cargando…' : 'Selecciona…'}</option>
            {beneficiarios.map((b) => (
              <option key={b.id_usuario} value={b.id_usuario}>
                {b.nombre} {b.apellido} · {b.tipo_beneficiario} · {b.necesidad}
              </option>
            ))}
          </select>
          <FieldError error={errores.beneficiario} touched={intento} />
          {!cargando && beneficiarios.length === 0 && (
            <p className="mt-1 rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-text-muted">No hay beneficiarios verificados y activos. No se puede registrar una asignación hasta que exista uno disponible.</p>
          )}
        </div>

        <div>
          <div className="flex items-end justify-between gap-2">
            <label htmlFor="as-cant" className={claseEtiqueta}>
              Cantidad a asignar *
            </label>
            <button
              type="button"
              className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-primary hover:underline"
              onClick={() => setCantidad(String(saldo))}
            >
              Asignar todo
            </button>
          </div>
          <input
            id="as-cant"
            type="number"
            inputMode="decimal"
            min={0.01}
            step={0.01}
            value={cantidad}
            onChange={(ev) => setCantidad(ev.target.value)}
            className={intento && errores.cantidad ? claseInputError : claseInput}
          />
          <FieldError error={errores.cantidad} touched={intento} />
        </div>

        <div>
          <label htmlFor="as-obs" className={claseEtiqueta}>
            Observaciones (opcional)
          </label>
          <textarea
            id="as-obs"
            rows={2}
            maxLength={500}
            value={observaciones}
            onChange={(ev) => setObservaciones(ev.target.value)}
            className={claseInput}
          />
        </div>
      </form>
    </ModalBase>
  );
};

export default AsignarModal;
