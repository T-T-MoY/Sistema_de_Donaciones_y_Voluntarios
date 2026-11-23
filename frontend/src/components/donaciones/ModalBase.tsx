/**
 * ============================================================================
 * COMPONENTE: ModalBase
 * Contenedor de modales del módulo Donaciones: portal, ESC, bloqueo de scroll,
 * clic en el fondo para cerrar (salvo `bloqueado`), foco en el panel.
 * ============================================================================
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalBaseProps {
  isOpen: boolean;
  titulo: string;
  subtitulo?: string;
  ancho?: 'md' | 'lg' | 'xl';
  bloqueado?: boolean;
  onClose: () => void;
  children: ReactNode;
  pie?: ReactNode;
}

const anchos = { md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

const ModalBase = ({ isOpen, titulo, subtitulo, ancho = 'lg', bloqueado = false, onClose, children, pie }: ModalBaseProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    const alPresionar = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && !bloqueado) onClose();
    };
    document.addEventListener('keydown', alPresionar);
    return () => {
      document.body.style.overflow = previo;
      document.removeEventListener('keydown', alPresionar);
    };
  }, [isOpen, bloqueado, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" role="presentation">
      <div
        className="animate-overlay-in absolute inset-0 bg-night/70 backdrop-blur-sm"
        onClick={() => !bloqueado && onClose()}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className={`animate-modal-in relative flex max-h-[92dvh] w-full ${anchos[ancho]} flex-col overflow-hidden rounded-t-3xl border border-border bg-surface-elevated shadow-deep focus:outline-none sm:rounded-3xl`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border bg-surface px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="truncate font-display text-base font-bold tracking-[-0.02em] text-text sm:text-lg">{titulo}</h2>
            {subtitulo && <p className="mt-0.5 text-xs text-text-muted">{subtitulo}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={bloqueado}
            aria-label="Cerrar"
            className="press shrink-0 rounded-xl border border-border bg-surface-elevated p-2 text-text-muted hover:border-accent/50 hover:text-text disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">{children}</div>

        {pie && (
          <footer className="flex flex-col-reverse gap-2 border-t border-border bg-surface px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:flex-row sm:justify-end sm:px-6">
            {pie}
          </footer>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ModalBase;
