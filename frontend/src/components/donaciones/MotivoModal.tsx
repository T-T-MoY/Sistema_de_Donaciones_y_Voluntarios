/**
 * Modal con campo de motivo obligatorio (anular donación, cancelar asignación).
 */
import { useEffect, useState } from 'react';
import ModalBase from './ModalBase';
import FieldError from '../ui/FieldError';
import { btnPeligro, btnSecundario, claseEtiqueta, claseInput, claseInputError } from './estilos';

interface MotivoModalProps {
  isOpen: boolean;
  titulo: string;
  mensaje: string;
  etiqueta: string;
  textoConfirmar: string;
  cargando?: boolean;
  errorServidor?: string;
  onConfirm: (motivo: string) => void;
  onCancel: () => void;
}

const MotivoModal = ({ isOpen, titulo, mensaje, etiqueta, textoConfirmar, cargando = false, errorServidor, onConfirm, onCancel }: MotivoModalProps) => {
  const [motivo, setMotivo] = useState('');
  const [tocado, setTocado] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMotivo('');
      setTocado(false);
    }
  }, [isOpen]);

  const texto = motivo.trim();
  const error = texto.length === 0 ? `El ${etiqueta.toLowerCase()} es obligatorio.` : texto.length < 5 ? 'Debe tener al menos 5 caracteres.' : '';

  const confirmar = (): void => {
    setTocado(true);
    if (!error) onConfirm(texto);
  };

  return (
    <ModalBase
      isOpen={isOpen}
      titulo={titulo}
      ancho="md"
      bloqueado={cargando}
      onClose={onCancel}
      pie={
        <>
          <button type="button" className={btnSecundario} onClick={onCancel} disabled={cargando}>
            Volver
          </button>
          <button type="button" className={btnPeligro} onClick={confirmar} disabled={cargando}>
            {cargando ? 'Procesando…' : textoConfirmar}
          </button>
        </>
      }
    >
      <p className="text-sm text-text-muted">{mensaje}</p>
      <div className="mt-4">
        <label htmlFor="motivo-donacion" className={claseEtiqueta}>
          {etiqueta} *
        </label>
        <textarea
          id="motivo-donacion"
          rows={3}
          maxLength={500}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          onBlur={() => setTocado(true)}
          aria-invalid={tocado && Boolean(error)}
          className={tocado && error ? claseInputError : claseInput}
        />
        <FieldError error={error} touched={tocado} />
        {errorServidor && <p className="mt-1 text-xs font-medium text-error">{errorServidor}</p>}
      </div>
    </ModalBase>
  );
};

export default MotivoModal;
