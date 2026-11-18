/**
 * ============================================================================
 * ARCHIVO: ToastContext.tsx
 * CONTEXTO: Notificaciones emergentes (toasts) del sistema.
 *
 * - Aparecen arriba a la derecha (en móvil, a todo el ancho).
 * - Tipos: success | error | info | warning.
 * - Se cierran solas, se pausan al pasar el cursor y también con el botón.
 * - Accesibles: role="status" / role="alert" + aria-live.
 * ============================================================================
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

export type ToastTipo = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  tipo: ToastTipo;
  titulo?: string;
  mensaje: string;
  duracion: number;
}

interface MostrarOpciones {
  titulo?: string;
  duracion?: number;
}

interface ToastContextType {
  mostrar: (tipo: ToastTipo, mensaje: string, opciones?: MostrarOpciones) => number;
  exito: (mensaje: string, titulo?: string) => number;
  error: (mensaje: string, titulo?: string) => number;
  info: (mensaje: string, titulo?: string) => number;
  advertencia: (mensaje: string, titulo?: string) => number;
  cerrar: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/** Duración por defecto según el tipo de aviso (ms). */
const DURACION: Record<ToastTipo, number> = {
  success: 4500,
  info: 5000,
  warning: 6000,
  error: 7000,
};

const MAX_VISIBLES = 4;

interface EstiloToast {
  icono: string;
  borde: string;
  titulo: string;
  path: string;
}

const ESTILOS: Record<ToastTipo, EstiloToast> = {
  success: {
    icono: 'bg-success',
    borde: 'border-success/60',
    titulo: 'Operación completada',
    path: 'M5 13l4 4L19 7',
  },
  error: {
    icono: 'bg-error',
    borde: 'border-error/60',
    titulo: 'Ocurrió un problema',
    path: 'M6 18L18 6M6 6l12 12',
  },
  info: {
    icono: 'bg-info',
    borde: 'border-info/60',
    titulo: 'Información',
    path: 'M12 11v6M12 7.5h.01',
  },
  warning: {
    icono: 'bg-warning',
    borde: 'border-warning/60',
    titulo: 'Atención',
    path: 'M12 8v5M12 16.5h.01',
  },
};

interface ToastCardProps {
  toast: Toast;
  onCerrar: (id: number) => void;
}

const ToastCard = ({ toast, onCerrar }: ToastCardProps) => {
  const [saliendo, setSaliendo] = useState(false);
  const cerrandoRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const estilo = ESTILOS[toast.tipo];
  const tieneMensaje = Boolean(toast.mensaje?.trim());

  const iniciarCierre = useCallback(() => {
    if (cerrandoRef.current) return;
    cerrandoRef.current = true;
    setSaliendo(true);
    // Espera la animación de salida antes de quitarla del DOM.
    window.setTimeout(() => onCerrar(toast.id), 180);
  }, [onCerrar, toast.id]);

  const programar = useCallback(
    (ms: number) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(iniciarCierre, ms);
    },
    [iniciarCierre]
  );

  useEffect(() => {
    programar(toast.duracion);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [programar, toast.duracion]);

  const pausar = (): void => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const reanudar = (): void => {
    if (!cerrandoRef.current) programar(toast.duracion);
  };

  return (
    <div
      role={toast.tipo === 'error' ? 'alert' : 'status'}
      aria-atomic="true"
      onPointerEnter={pausar}
      onPointerLeave={reanudar}
      className={`pointer-events-auto flex w-full items-center gap-3 rounded-2xl border bg-[#f8f9fa] p-4 shadow-soft sm:p-5 dark:bg-surface-elevated ${estilo.borde} ${
        saliendo ? 'anim-toast-out' : 'anim-toast'
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white ${estilo.icono}`}
        aria-hidden="true"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d={estilo.path} />
        </svg>
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold leading-snug text-[#333] dark:text-text sm:text-base">
          {toast.titulo || estilo.titulo}
        </p>
        {tieneMensaje && (
          <p className="mt-0.5 break-words text-[12.5px] leading-relaxed text-[#5a5a5a] dark:text-text-muted">
            {toast.mensaje}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={iniciarCierre}
        aria-label="Cerrar notificación"
        className="press flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-full text-[#8a8a8a] hover:bg-black/[0.06] hover:text-[#333] dark:text-text-subtle dark:hover:bg-white/10 dark:hover:text-text"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const cerrar = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const mostrar = useCallback(
    (tipo: ToastTipo, mensaje: string, opciones?: MostrarOpciones): number => {
      idRef.current += 1;
      const id = idRef.current;

      setToasts((prev) => [
        ...prev,
        {
          id,
          tipo,
          mensaje,
          titulo: opciones?.titulo,
          duracion: opciones?.duracion ?? DURACION[tipo],
        },
      ].slice(-MAX_VISIBLES));

      return id;
    },
    []
  );

  const exito = useCallback(
    (mensaje: string, titulo?: string) => mostrar('success', mensaje, { titulo }),
    [mostrar]
  );
  const error = useCallback(
    (mensaje: string, titulo?: string) => mostrar('error', mensaje, { titulo }),
    [mostrar]
  );
  const info = useCallback(
    (mensaje: string, titulo?: string) => mostrar('info', mensaje, { titulo }),
    [mostrar]
  );
  const advertencia = useCallback(
    (mensaje: string, titulo?: string) => mostrar('warning', mensaje, { titulo }),
    [mostrar]
  );

  return (
    <ToastContext.Provider value={{ mostrar, exito, error, info, advertencia, cerrar }}>
      {children}
      {createPortal(
        <div
          role="region"
          aria-label="Notificaciones del sistema"
          className="pointer-events-none fixed left-3 right-3 top-[calc(0.75rem+env(safe-area-inset-top,0px))] z-[100] flex flex-col gap-2.5 sm:left-auto sm:right-4 sm:top-[calc(1rem+env(safe-area-inset-top,0px))] sm:w-[440px]"
        >
          {toasts.map((toast) => (
            <ToastCard key={toast.id} toast={toast} onCerrar={cerrar} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de un <ToastProvider>');
  }
  return ctx;
};
