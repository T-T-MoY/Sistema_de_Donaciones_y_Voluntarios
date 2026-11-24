import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Header from './Header';

export default function AppLayout() {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  // Por defecto el sidebar arranca colapsado (solo iconos)
  const [sidebarColapsado, setSidebarColapsado] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sidebar-colapsado') !== 'false';
    } catch {
      return true;
    }
  });
  const location = useLocation();

  // Cierra el sidebar móvil automáticamente al cambiar de ruta
  useEffect(() => {
    setSidebarAbierto(false);
  }, [location.pathname]);

  // Recuerda la preferencia de expandido / colapsado
  useEffect(() => {
    try {
      localStorage.setItem('sidebar-colapsado', String(sidebarColapsado));
    } catch {
      // Sin acceso a localStorage: la preferencia solo dura la sesión
    }
  }, [sidebarColapsado]);

  return (
    <div className="flex h-dvh overflow-hidden bg-surface-sunken">
      {/* Sidebar (fijo a la izquierda) */}
      <Navbar
        abierto={sidebarAbierto}
        onCerrar={() => setSidebarAbierto(false)}
        colapsado={sidebarColapsado}
        onAlternarColapsado={() => setSidebarColapsado((prev) => !prev)}
      />

      {/* Columna derecha: Header arriba + contenido scrolleable */}
      <div className={`flex w-full flex-1 flex-col overflow-hidden transition-[margin] duration-300 ease-out-soft ${sidebarColapsado ? 'md:ml-[88px]' : 'md:ml-[268px]'}`}>
        <Header onAbrirMenu={() => setSidebarAbierto(true)} />

        <main className="flex-1 overflow-y-auto overscroll-contain p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] md:pb-8 md:pl-[max(2rem,env(safe-area-inset-left,0px))] md:pr-[max(2rem,env(safe-area-inset-right,0px))] md:pt-8">
          <div className="mx-auto w-full max-w-[1400px] px-3">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
  
}
