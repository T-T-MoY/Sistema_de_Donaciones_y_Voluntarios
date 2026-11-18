/**
 * ============================================================================
 * ARCHIVO: ConfirmModal.tsx
 * COMPONENTE: Modal reutilizable de confirmación / aviso (reemplaza alert y confirm).
 * - variante "peligro": confirmación de acciones destructivas (eliminar).
 * - variante "info": avisos o errores (con mostrarCancelar={false}).
 * - Cierra con ESC y clic en el fondo (salvo mientras `cargando`).
 * - Renderiza en portal.
 * ============================================================================
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  isOpen: boolean;
  titulo: string;
  mensaje: ReactNode;
  advertencia?: ReactNode;
  textoConfirmar?: string;
  textoCancelar?: string;
  variante?: 'peligro' | 'info';
  mostrarCancelar?: boolean;
  cargando?: boolean;
  /** Botón extra entre "Cancelar" y el principal (ej. "Desactivar"). */
  accionSecundaria?: { texto: string; onClick: () => void };
  /** Cuál botón muestra "Procesando…" mientras `cargando` es true. */
  accionEnCurso?: 'confirmar' | 'secundaria';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({
  isOpen,
  titulo,
  mensaje,
  advertencia,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  variante = 'peligro',
  mostrarCancelar = true,
  cargando = false,
  accionSecundaria,
  accionEnCurso = 'confirmar',
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  const botonCancelarRef = useRef<HTMLButtonElement>(null);
  const botonConfirmarRef = useRef<HTMLButtonElement>(null);
  const esPeligro = variante === 'peligro';

  // Bloquear scroll del body mientras está abierto
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Cerrar con ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && !cargando) onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, cargando, onCancel]);

  // Foco inicial: en "Cancelar" (más seguro) o en el botón principal si no hay cancelar
  useEffect(() => {
    if (!isOpen) return;
    (mostrarCancelar ? botonCancelarRef : botonConfirmarRef).current?.focus();
  }, [isOpen, mostrarCancelar]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="anim-fade fixed inset-0 z-[60] flex items-center justify-center bg-night/70 p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-[max(1rem,env(safe-area-inset-top,0px))] backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget && !cargando) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="titulo-confirm-modal"
        className="anim-scale max-h-[90dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl border border-border bg-surface-elevated shadow-deep"
      >
        <span
          aria-hidden="true"
          className={`block h-[3px] w-full bg-linear-to-r ${
            esPeligro ? 'from-error' : 'from-info'
          } via-accent/40 to-transparent`}
        />

        <div className="px-5 pb-2 pt-6 sm:px-6">
          <div className="flex items-start gap-4">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                esPeligro ? 'bg-error-soft text-error' : 'bg-info-soft text-info'
              }`}
            >
              {esPeligro ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </span>

            <div className="min-w-0">
              <h2
                id="titulo-confirm-modal"
                className="font-display text-base font-bold tracking-[-0.02em] text-text"
              >
                {titulo}
              </h2>
              <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text-muted">
                {mensaje}
              </div>
            </div>
          </div>

          {advertencia && (
            <div className="mt-4 whitespace-pre-line rounded-xl border border-warning/30 bg-warning-soft px-3.5 py-3 text-[12.5px] leading-relaxed text-text">
              {advertencia}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 px-5 pb-6 pt-4 sm:flex-row sm:flex-wrap sm:justify-end sm:px-6">
          {mostrarCancelar && (
            <button
              ref={botonCancelarRef}
              type="button"
              onClick={onCancel}
              disabled={cargando}
              className="press rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-muted hover:border-border-strong hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
            >
              {textoCancelar}
            </button>
          )}
          {accionSecundaria && (
            <button
              type="button"
              onClick={accionSecundaria.onClick}
              disabled={cargando}
              className="press rounded-xl border border-warning/40 bg-warning-soft px-4 py-2.5 text-sm font-bold text-text hover:border-warning disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando && accionEnCurso === 'secundaria'
                ? 'Procesando…'
                : accionSecundaria.texto}
            </button>
          )}
          <button
            ref={botonConfirmarRef}
            type="button"
            onClick={onConfirm}
            disabled={cargando}
            className={`press rounded-xl px-4 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60 ${
              esPeligro
                ? 'bg-error text-white hover:opacity-90'
                : 'bg-primary text-on-primary hover:bg-primary-hover'
            }`}
          >
            {cargando && accionEnCurso === 'confirmar' ? 'Procesando…' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;