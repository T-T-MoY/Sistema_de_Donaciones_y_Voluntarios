
import { Outlet } from 'react-router-dom';
import VoluntariosNavbar from './VoluntariosNavbar';

export default function VoluntariosLayout() {
  return (
    <div className="w-full">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-text">
          Gestión de Voluntarios
        </h1>

        <p className="mt-1 text-sm text-text-subtle">
          Administración y seguimiento del voluntariado.
        </p>
      </div>

      <VoluntariosNavbar />

      <Outlet />
    </div>
  );
}
