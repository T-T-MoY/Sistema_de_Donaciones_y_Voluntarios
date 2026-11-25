
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const opciones = [
  {
    nombre: 'Solicitudes',
    ruta: '/voluntarios/solicitudes',
    roles: ['Administrador', 'Admin', 'Coordinador'],
  },
  {
    nombre: 'Seguimiento general',
    ruta: '/voluntarios/seguimiento',
    roles: ['Administrador'],
  },
  {
    nombre: 'Disponibilidad del equipo',
    ruta: '/voluntarios/disponibilidad-equipo',
    roles: ['Coordinador'],
  },
  {
    nombre: 'Control de asistencia',
    ruta: '/voluntarios/asistencia',
    roles: ['Coordinador'],
  },
  {
    nombre: 'Mi disponibilidad',
    ruta: '/voluntarios/mi-disponibilidad',
    roles: ['Voluntario', 'Coordinador', 'Empleado'],
  },
];

export default function VoluntariosNavbar() {
  const { usuario } = useAuth();

  const rolesUsuario = [
    ...(usuario?.roles ?? []),
    usuario?.rol ?? '',
  ].map((rol) => rol.toLowerCase().trim());

  const opcionesVisibles = opciones.filter((opcion) =>
    opcion.roles.some((rol) =>
      rolesUsuario.includes(rol.toLowerCase())
    )
  );

  return (
    <nav className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
      {opcionesVisibles.map((opcion) => (
        <NavLink
          key={opcion.ruta}
          to={opcion.ruta}
          className={({ isActive }) =>
            `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary text-on-primary'
                : 'bg-surface-elevated text-text hover:bg-surface-sunken'
            }`
          }
        >
          {opcion.nombre}
        </NavLink>
      ))}
    </nav>
  );
}
