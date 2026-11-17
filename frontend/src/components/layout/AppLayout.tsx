import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Header from './Header';

export default function AppLayout() {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const location = useLocation();

  // Cierra el sidebar móvil automáticamente al cambiar de ruta
  useEffect(() => {
    setSidebarAbierto(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-sunken">
      {/* Sidebar (fijo a la izquierda) */}
      <Navbar
        abierto={sidebarAbierto}
        onCerrar={() => setSidebarAbierto(false)}
      />

      {/* Columna derecha: Header arriba + contenido scrolleable */}
      <div className="flex w-full flex-1 flex-col overflow-hidden md:ml-64">
        <Header onAbrirMenu={() => setSidebarAbierto(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto w-full max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
