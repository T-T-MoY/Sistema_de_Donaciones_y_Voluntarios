
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Props {
  roles: string[];
}

export default function RutasPorRol({ roles }: Props) {
  const { usuario, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const rolesUsuario = [
    ...(usuario?.roles ?? []),
    usuario?.rol ?? '',
    ...(usuario?.es_coordinador ? ['Coordinador'] : []),
  ].map((rol) => rol.toLowerCase().trim());

  const tienePermiso = roles.some((rol) =>
    rolesUsuario.includes(rol.toLowerCase().trim())
  );

  return tienePermiso
    ? <Outlet />
    : <Navigate to="/dashboard" replace />;
}
