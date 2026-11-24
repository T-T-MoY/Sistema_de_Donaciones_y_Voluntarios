/**
 * ============================================================================
 * ARCHIVO: RutasAdmin.tsx
 * Guard de rutas exclusivas para administradores.
 * - Sin sesión → /login (lo maneja RutasProtegidas, pero se deja por seguridad).
 * - Sesión sin rol Administrador → /dashboard.
 * ============================================================================
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RutasAdmin = () => {
  const { usuario, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const roles = usuario?.roles || [usuario?.rol];
  const esAdmin = roles.includes('Administrador') || roles.includes('Admin');

  if (!esAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default RutasAdmin;
