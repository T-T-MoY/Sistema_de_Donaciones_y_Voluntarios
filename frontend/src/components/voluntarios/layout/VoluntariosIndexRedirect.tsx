import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function VoluntariosIndexRedirect() {
  const { usuario } = useAuth();
  const roles = [
    ...(usuario?.roles ?? []),
    usuario?.rol ?? '',
  ].map((rol) => rol.toLowerCase().trim());

  if (roles.some((rol) => rol === 'admin' || rol === 'administrador')) {
    return <Navigate to="/voluntarios/solicitudes" replace />;
  }
  if (roles.includes('coordinador')) {
    return <Navigate to="/voluntarios/disponibilidad-equipo" replace />;
  }
  if (roles.some((rol) => ['voluntario', 'empleado'].includes(rol))) {
    return <Navigate to="/voluntarios/mi-disponibilidad" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}
