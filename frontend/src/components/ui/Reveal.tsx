import { useEffect, useRef, useState, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Escalón de retardo: 0 = inmediato, 1–5 = 80 ms por paso. */
  delay?: 0 | 1 | 2 | 3 | 4 | 5;
}

/**
 * Aparición suave al entrar en el viewport.
 * Solo presentación: opacidad y translateY, una única vez.
 * Con `prefers-reduced-motion` el contenido se muestra sin animación.
 */
export const Reveal = ({ children, className = '', delay = 0 }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(nodo);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${delay ? `reveal-d${delay}` : ''} ${className}`.trim()}
    >
      {children}
    </div>
  );
};

export default Reveal;
