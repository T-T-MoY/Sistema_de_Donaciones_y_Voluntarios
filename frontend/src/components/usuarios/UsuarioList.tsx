/**
 * ============================================================================
 * ARCHIVO: UsuarioList.tsx
 * COMPONENTE: Lista de usuarios con soporte de modos.
 *
 * MODOS:
 * - "app"     → Panel de admin completo (tabla desktop + cards móvil, CRUD).
 * - "preview" → Vitrina: muestra 3 usuarios sin acciones (para dashboard).
 *
 * INCLUYE:
 * - Buscador, filtros por rol y estado (case-insensitive).
 * - Botón "Limpiar filtros" siempre visible (atenuado cuando está inactivo).
 * - Contador de filtros activos con badge.
 * - Paginación numerada con elipsis.
 * - Tabla adaptativa con truncado para nombres/correos largos.
 * - Botones de acción verticales, mismo tamaño, centrados.
 * - Mensajes de error mejorados en eliminación (401/403/404/409/500).
 * ============================================================================
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usuarioApi } from '../../api/usuario.api';
import { UsuarioCard } from './UsuarioCard';
import UsuarioModal from './UsuarioModal';
import type { Usuario, UsuarioListProps } from '../../types/usuario.types';
import {
  obtenerId,
  getNombreCompleto,
  getIniciales,
  getEstado,
  esActivo,
  getRolDisplay,
} from '../../types/usuario.types';

const PREVIEW_LIMIT = 3;

/**
 * Color del badge de rol.
 * Estilos únicamente: no altera el rol ni su lógica.
 */
const getRolBadgeClass = (rol?: string): string => {
  const r = (rol || '').toLowerCase();

  if (r === 'admin' || r === 'administrador') {
    return 'bg-claro-primario/10 text-claro-primario border-claro-primario/25 dark:bg-oscuro-primario/15 dark:text-oscuro-primario dark:border-oscuro-primario/30';
  }
  if (r === 'donante' || r === 'cliente') {
    return 'bg-claro-acento/10 text-claro-acento border-claro-acento/25 dark:bg-oscuro-acento/15 dark:text-oscuro-acento dark:border-oscuro-acento/30';
  }
  if (r === 'empleado' || r === 'voluntario') {
    return 'bg-emerald-500/10 text-emerald-800 border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-400/30';
  }
  if (r === 'beneficiario') {
    return 'bg-sky-500/10 text-sky-800 border-sky-500/25 dark:bg-sky-500/15 dark:text-sky-200 dark:border-sky-400/30';
  }
  return 'bg-claro-tinte text-claro-primario border-claro-borde dark:bg-oscuro-tinte dark:text-oscuro-primario dark:border-oscuro-borde';
};

export const UsuarioList = ({
  modo = 'app',
  title = 'Usuarios',
  subtitle = 'Resumen general de las cuentas registradas.',
}: UsuarioListProps) => {
  const { token } = useAuth();
  const isPreview = modo === 'preview';

  // =====================================================
  // ESTADOS PRINCIPALES
  // =====================================================
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [eliminandoId, setEliminandoId] = useState<number | string | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroRol, setFiltroRol] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');

  // Paginación
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [porPagina, setPorPagina] = useState<number>(10);

  // Modal
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [usuarioIdEditar, setUsuarioIdEditar] = useState<number | null>(null);

  // =====================================================
  // FETCH
  // =====================================================
  const fetchUsuarios = useCallback(async (): Promise<void> => {
    try {
      setCargando(true);
      const data = await usuarioApi.getAll();
      setUsuarios(data);
      setError('');
    } catch (err) {
      setError('Error al cargar los usuarios. Verifica tu conexión al servidor.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchUsuarios();
  }, [token, fetchUsuarios]);

  // Resetear página al cambiar filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroRol, filtroEstado, porPagina]);

  // =====================================================
  // ACCIONES
  // =====================================================
  const abrirModalNuevo = (): void => {
    setUsuarioIdEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (usuario: Usuario): void => {
    const id = obtenerId(usuario);
    if (id === undefined || id === null) {
      alert('No se pudo identificar el usuario a editar.');
      return;
    }
    setUsuarioIdEditar(Number(id));
    setModalAbierto(true);
  };

  const handleGuardarUsuario = (): void => {
    fetchUsuarios();
  };

  const handleEliminar = async (user: Usuario): Promise<void> => {
    const id = obtenerId(user);
    if (id === undefined || id === null || id === '') {
      alert('No se pudo identificar el usuario a eliminar (ID inválido).');
      return;
    }

    const nombre = getNombreCompleto(user);
    const confirmar = window.confirm(
      `¿Estás seguro de eliminar a "${nombre}" de forma permanente?\n\n` +
        `⚠️ Si el usuario tiene pedidos, donaciones o historial asociado, la eliminación podría fallar.\n` +
        `En ese caso, considera cambiar su estado a "Inactivo" en lugar de borrarlo.`
    );
    if (!confirmar) return;

    setEliminandoId(id);

    try {
      await usuarioApi.delete(id);
      await fetchUsuarios();
    } catch (err: any) {
      console.error('Error al eliminar usuario:', {
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
      });

      const status = err.response?.status;
      let mensaje =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Error desconocido';

      if (status === 401 || status === 403) {
        mensaje =
          'No tienes permisos para eliminar usuarios o tu sesión expiró. ' +
          'Vuelve a iniciar sesión e inténtalo de nuevo.';
      } else if (status === 404) {
        mensaje = 'El usuario no existe o ya fue eliminado previamente.';
      } else if (status === 409 || status === 500) {
        mensaje =
          'No se puede eliminar este usuario porque tiene información asociada en el sistema ' +
          '(pedidos, donaciones, historial, etc.).\n\n' +
          'Sugerencia: cambia su estado a "Inactivo" en lugar de eliminarlo.';
      }

      alert(`No se pudo eliminar (${status ?? 'sin conexión'}):\n\n${mensaje}`);
    } finally {
      setEliminandoId(null);
    }
  };

  const limpiarFiltros = (): void => {
    setBusqueda('');
    setFiltroRol('');
    setFiltroEstado('');
    setPaginaActual(1);
  };

  const hayFiltrosActivos =
    busqueda.trim() !== '' || filtroRol !== '' || filtroEstado !== '';

  const filtrosActivos = [
    busqueda.trim() !== '',
    filtroRol !== '',
    filtroEstado !== '',
  ].filter(Boolean).length;

  // =====================================================
  // LISTAS ÚNICAS PARA FILTROS
  // =====================================================
  const rolesDisponibles = useMemo(() => {
    const set = new Set<string>();
    usuarios.forEach((u) => {
      if (u.rol) set.add(String(u.rol));
    });
    return Array.from(set).sort();
  }, [usuarios]);

  const estadosDisponibles = useMemo(() => {
    const set = new Set<string>();
    usuarios.forEach((u) => {
      const est = getEstado(u);
      if (est) set.add(est);
    });
    return Array.from(set).sort();
  }, [usuarios]);

  // =====================================================
  // FILTRADO COMBINADO
  // =====================================================
  const filtrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();

    return usuarios.filter((u) => {
      // 1. Buscador
      if (term) {
        const coincide =
          (u.nombre || '').toLowerCase().includes(term) ||
          (u.apellidos || '').toLowerCase().includes(term) ||
          (u.paterno || '').toLowerCase().includes(term) ||
          (u.materno || '').toLowerCase().includes(term) ||
          (u.correo || '').toLowerCase().includes(term);
        if (!coincide) return false;
      }

      // 2. Filtro rol
      if (filtroRol) {
        const rolUsuario = (u.rol || '').toLowerCase();
        const rolFiltro = filtroRol.toLowerCase();
        const coincide =
          rolUsuario === rolFiltro ||
          (rolFiltro === 'admin' && rolUsuario === 'administrador') ||
          (rolFiltro === 'administrador' && rolUsuario === 'admin');
        if (!coincide) return false;
      }

      // 3. Filtro estado (case-insensitive)
      if (filtroEstado) {
        if (getEstado(u).toLowerCase() !== filtroEstado.toLowerCase()) return false;
      }

      return true;
    });
  }, [usuarios, busqueda, filtroRol, filtroEstado]);

  // =====================================================
  // PAGINACIÓN
  // =====================================================
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));

  useEffect(() => {
    if (paginaActual > totalPaginas) setPaginaActual(totalPaginas);
  }, [paginaActual, totalPaginas]);

  const usuariosPaginados = useMemo(() => {
    if (isPreview) return filtrados.slice(0, PREVIEW_LIMIT);
    const inicio = (paginaActual - 1) * porPagina;
    return filtrados.slice(inicio, inicio + porPagina);
  }, [filtrados, paginaActual, porPagina, isPreview]);

  const indiceInicio =
    filtrados.length === 0 ? 0 : (paginaActual - 1) * porPagina + 1;
  const indiceFin = Math.min(paginaActual * porPagina, filtrados.length);

  const numerosPagina = useMemo(() => {
    const paginas: (number | '...')[] = [];
    const maxVisible = 5;

    if (totalPaginas <= maxVisible + 2) {
      for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
    } else {
      paginas.push(1);
      let inicio = Math.max(2, paginaActual - 1);
      let fin = Math.min(totalPaginas - 1, paginaActual + 1);

      if (paginaActual <= 3) {
        inicio = 2;
        fin = 4;
      }
      if (paginaActual >= totalPaginas - 2) {
        inicio = totalPaginas - 3;
        fin = totalPaginas - 1;
      }

      if (inicio > 2) paginas.push('...');
      for (let i = inicio; i <= fin; i++) paginas.push(i);
      if (fin < totalPaginas - 1) paginas.push('...');
      paginas.push(totalPaginas);
    }

    return paginas;
  }, [totalPaginas, paginaActual]);

  // =====================================================
  // ESTADÍSTICAS (solo modo app)
  // =====================================================
  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter((u) => esActivo(u)).length;
  const usuariosSuspendidos = usuarios.filter((u) => {
    const est = getEstado(u).toLowerCase();
    return est === 'inactivo' || est === 'suspendido' || est === 'bloqueado';
  }).length;
  const admins = usuarios.filter((u) => {
    const rol = (u.rol || '').toLowerCase();
    return rol === 'admin' || rol === 'administrador';
  }).length;

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-claro-primario dark:text-oscuro-primario">
            Administración
          </span>
          <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-claro-texto dark:text-oscuro-texto">
            {title}
          </h1>
          <p className="text-claro-texto2 dark:text-oscuro-texto2 text-sm mt-1">
            {subtitle}
          </p>
        </div>
        {!isPreview && (
          <button
            onClick={abrirModalNuevo}
            className="press px-5 py-2.5 bg-claro-primario hover:bg-claro-hover dark:bg-oscuro-primario dark:hover:bg-oscuro-hover dark:text-oscuro-fondo text-white font-semibold rounded-xl shadow-[0_14px_30px_-18px_rgba(14,110,109,0.8)] flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo usuario
          </button>
        )}
      </div>

      {/* Estadísticas */}
      {!isPreview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde border-l-4 border-l-claro-primario dark:border-l-oscuro-primario shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-wider text-claro-texto2 dark:text-oscuro-texto2">
              Total registrados
            </p>
            <h3 className="text-3xl font-bold text-claro-texto dark:text-oscuro-texto mt-2 tabular-nums">
              {totalUsuarios}
            </h3>
          </div>
          <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde border-l-4 border-l-emerald-500 shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-wider text-claro-texto2 dark:text-oscuro-texto2">
              Activos
            </p>
            <h3 className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mt-2 tabular-nums">
              {usuariosActivos}
            </h3>
          </div>
          <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde border-l-4 border-l-claro-acento dark:border-l-oscuro-acento shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-wider text-claro-texto2 dark:text-oscuro-texto2">
              Roles de Admin
            </p>
            <h3 className="text-3xl font-bold text-claro-acento dark:text-oscuro-acento mt-2 tabular-nums">
              {admins}
            </h3>
          </div>
          <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta p-5 rounded-2xl border border-claro-borde dark:border-oscuro-borde border-l-4 border-l-red-500 shadow-soft">
            <p className="text-[11px] font-bold uppercase tracking-wider text-claro-texto2 dark:text-oscuro-texto2">
              Suspendidos
            </p>
            <h3 className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2 tabular-nums">
              {usuariosSuspendidos}
            </h3>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* CONTENEDOR PRINCIPAL                          */}
      {/* ============================================ */}
      <div className="bg-claro-tarjeta dark:bg-oscuro-tarjeta border border-claro-borde dark:border-oscuro-borde rounded-3xl shadow-soft overflow-hidden">
        {!isPreview && (
          <div className="px-6 py-4 border-b border-claro-borde dark:border-oscuro-borde bg-claro-fondo/50 dark:bg-oscuro-fondo/50 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-claro-texto dark:text-oscuro-texto flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-claro-primario/10 text-claro-primario dark:bg-oscuro-primario/15 dark:text-oscuro-primario">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </span>
              Administrar usuarios
            </h2>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-claro-texto2 dark:text-oscuro-texto2">
              {filtrados.length} de {totalUsuarios}
            </span>
          </div>
        )}

        {/* ============================================ */}
        {/* BARRA DE BÚSQUEDA Y FILTROS                    */}
        {/* ============================================ */}
        {!isPreview && (
          <div className="px-4 sm:px-6 py-4 border-b border-claro-borde dark:border-oscuro-borde bg-claro-tarjeta dark:bg-oscuro-tarjeta">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
              {/* Buscador */}
              <div className="relative lg:col-span-5 min-w-0">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-claro-texto2 dark:text-oscuro-texto2 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre, apellidos o correo..."
                  className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto placeholder:text-claro-texto2/60 dark:placeholder:text-oscuro-texto2/60 focus:outline-none focus:ring-2 focus:ring-claro-primario/35 dark:focus:ring-oscuro-primario/35 focus:border-claro-primario/40 dark:focus:border-oscuro-primario/40 transition-[border-color,box-shadow] duration-200"
                />
              </div>

              {/* Filtro Rol */}
              <div className="lg:col-span-2 min-w-0">
                <label className="block text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1.5">
                  Rol
                </label>
                <select
                  value={filtroRol}
                  onChange={(e) => setFiltroRol(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario/35 dark:focus:ring-oscuro-primario/35 transition-[border-color,box-shadow] duration-200"
                >
                  <option value="">Todos</option>
                  {rolesDisponibles.map((rol) => (
                    <option key={rol} value={rol}>
                      {getRolDisplay(rol)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro Estado */}
              <div className="lg:col-span-2 min-w-0">
                <label className="block text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1.5">
                  Estado
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario/35 dark:focus:ring-oscuro-primario/35 transition-[border-color,box-shadow] duration-200"
                >
                  <option value="">Todos</option>
                  {estadosDisponibles.map((est) => (
                    <option key={est} value={est}>
                      {est}
                    </option>
                  ))}
                </select>
              </div>

              {/* Por página */}
              <div className="lg:col-span-1 min-w-0">
                <label className="block text-xs font-medium text-claro-texto2 dark:text-oscuro-texto2 mb-1.5">
                  Mostrar
                </label>
                <select
                  value={porPagina}
                  onChange={(e) => setPorPagina(Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-claro-borde dark:border-oscuro-borde bg-claro-fondo dark:bg-oscuro-fondo text-claro-texto dark:text-oscuro-texto focus:outline-none focus:ring-2 focus:ring-claro-primario/35 dark:focus:ring-oscuro-primario/35 transition-[border-color,box-shadow] duration-200"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Botón Limpiar filtros */}
              <div className="lg:col-span-2 min-w-0">
                <label className="hidden lg:block text-xs font-medium text-transparent mb-1.5 select-none">
                  &nbsp;
                </label>
                <button
                  onClick={limpiarFiltros}
                  disabled={!hayFiltrosActivos}
                  className={`press w-full px-3 py-2.5 text-sm font-medium rounded-xl border whitespace-nowrap flex items-center justify-center gap-2
                    ${
                      hayFiltrosActivos
                        ? 'bg-claro-fondo dark:bg-oscuro-fondo border-claro-borde dark:border-oscuro-borde text-claro-texto2 dark:text-oscuro-texto2 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 cursor-pointer'
                        : 'bg-claro-fondo/40 dark:bg-oscuro-fondo/40 border-claro-borde/40 dark:border-oscuro-borde/40 text-claro-texto2/40 dark:text-oscuro-texto2/40 cursor-not-allowed'
                    }`}
                >
                  Limpiar filtros
                  {filtrosActivos > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-claro-primario dark:bg-oscuro-primario text-white text-[10px] font-bold">
                      {filtrosActivos}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="mt-3 text-xs text-claro-texto2 dark:text-oscuro-texto2">
              Mostrando{' '}
              <span className="font-semibold text-claro-texto dark:text-oscuro-texto">
                {indiceInicio}-{indiceFin}
              </span>{' '}
              de{' '}
              <span className="font-semibold text-claro-texto dark:text-oscuro-texto">
                {filtrados.length}
              </span>{' '}
              usuarios
              {hayFiltrosActivos && (
                <span className="ml-1">(filtrados de {totalUsuarios} en total)</span>
              )}
            </div>
          </div>
        )}

        {/* Estado de carga/error */}
        {cargando ? (
          <div className="px-6 py-8 text-center text-claro-texto2 dark:text-oscuro-texto2">
            Cargando usuarios...
          </div>
        ) : error ? (
          <div className="px-6 py-8 text-center font-medium text-red-600 dark:text-red-400">{error}</div>
        ) : usuariosPaginados.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-claro-texto2 dark:text-oscuro-texto2">
            {hayFiltrosActivos
              ? 'No se encontraron usuarios que coincidan con los filtros.'
              : 'No hay usuarios registrados.'}
          </div>
        ) : isPreview ? (
          /* ============ MODO PREVIEW (vitrina) ============ */
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usuariosPaginados.map((user) => (
              <UsuarioCard
                key={obtenerId(user) ?? user.id}
                usuario={user}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        ) : (
          <>
            {/* ============================================ */}
            {/* VISTA DESKTOP: TABLA ADAPTATIVA                */}
            {/* ============================================ */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left table-fixed">
                <colgroup>
                  <col className="w-12" />
                  <col className="w-[22%]" />
                  <col className="w-[24%]" />
                  <col className="w-[12%]" />
                  <col className="w-[13%]" />
                  <col className="w-[17%]" />
                </colgroup>
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-claro-texto2 dark:text-oscuro-texto2 border-b border-claro-borde dark:border-oscuro-borde bg-claro-fondo/50 dark:bg-oscuro-fondo/40">
                    <th className="px-3 py-3 text-center">#</th>
                    <th className="px-3 py-3">Usuario</th>
                    <th className="px-3 py-3">Correo electrónico</th>
                    <th className="px-3 py-3">Rol</th>
                    <th className="px-3 py-3">Estado</th>
                    <th className="px-3 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-claro-borde dark:divide-oscuro-borde">
                  {usuariosPaginados.map((user, idx) => {
                    const id = obtenerId(user);
                    const estaEliminando = eliminandoId === id;
                    const numeroFila = (paginaActual - 1) * porPagina + idx + 1;
                    const nombreCompleto = getNombreCompleto(user);
                    const iniciales = getIniciales(user);
                    const activo = esActivo(user);

                    return (
                      <tr
                        key={id ?? `user-${numeroFila}`}
                        className="group transition-colors duration-200 hover:bg-claro-fondo/80 dark:hover:bg-oscuro-fondo/50"
                      >
                        <td className="px-3 py-4 text-center text-xs font-semibold tabular-nums text-claro-texto2 dark:text-oscuro-texto2">
                          {numeroFila}
                        </td>

                        <td className="px-3 py-4 min-w-0">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-claro-tinte text-xs font-bold text-claro-primario ring-1 ring-claro-primario/15 dark:bg-oscuro-tinte dark:text-oscuro-primario dark:ring-oscuro-primario/25">
                              {iniciales}
                            </div>
                            <span
                              className="font-semibold text-claro-texto dark:text-oscuro-texto truncate text-sm"
                              title={nombreCompleto}
                            >
                              {nombreCompleto}
                            </span>
                          </div>
                        </td>

                        <td className="px-3 py-4 text-sm text-claro-texto2 dark:text-oscuro-texto2 min-w-0">
                          <span className="block truncate" title={user.correo}>
                            {user.correo}
                          </span>
                        </td>

                        <td className="px-3 py-4 min-w-0">
                          <span
                            className={`inline-flex max-w-full items-center truncate rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getRolBadgeClass(user.rol)}`}
                            title={getRolDisplay(user.rol)}
                          >
                            {getRolDisplay(user.rol)}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${
                              activo
                                ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-400/30'
                                : 'bg-red-500/10 text-red-700 border-red-500/25 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/30'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                activo ? 'bg-emerald-500' : 'bg-red-500'
                              }`}
                            />
                            {getEstado(user)}
                          </span>
                        </td>

                        {/* ACCIONES — botones verticales, mismo ancho, centrados */}
                        <td className="px-3 py-3">
                          <div className="flex flex-col items-stretch gap-1.5 w-full max-w-[100px] mx-auto">
                            <button
                              onClick={() => abrirModalEditar(user)}
                              className="press w-full rounded-lg border border-claro-borde bg-claro-tarjeta py-1.5 text-xs font-semibold text-claro-texto2 hover:border-claro-primario/45 hover:text-claro-primario dark:border-oscuro-borde dark:bg-oscuro-fondo dark:text-oscuro-texto2 dark:hover:border-oscuro-primario/45 dark:hover:text-oscuro-primario"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleEliminar(user)}
                              disabled={estaEliminando}
                              className="press w-full rounded-lg border border-claro-borde bg-claro-tarjeta py-1.5 text-xs font-semibold text-red-600 hover:border-red-300 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-oscuro-borde dark:bg-oscuro-fondo dark:text-red-400 dark:hover:border-red-800 dark:hover:bg-red-900/20"
                            >
                              {estaEliminando ? 'Borrando…' : 'Eliminar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ============================================ */}
            {/* VISTA MÓVIL: CARDS                             */}
            {/* ============================================ */}
            <div className="md:hidden divide-y divide-claro-borde dark:divide-oscuro-borde">
              {usuariosPaginados.map((user, idx) => {
                const id = obtenerId(user);
                const estaEliminando = eliminandoId === id;
                const numeroFila = (paginaActual - 1) * porPagina + idx + 1;
                const nombreCompleto = getNombreCompleto(user);
                const iniciales = getIniciales(user);
                const activo = esActivo(user);

                return (
                  <div key={id ?? `user-m-${numeroFila}`} className="space-y-4 p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-claro-borde bg-claro-fondo text-xs font-semibold tabular-nums text-claro-texto2 dark:border-oscuro-borde dark:bg-oscuro-fondo dark:text-oscuro-texto2">
                        {numeroFila}
                      </span>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-claro-tinte text-sm font-bold text-claro-primario ring-1 ring-claro-primario/15 dark:bg-oscuro-tinte dark:text-oscuro-primario dark:ring-oscuro-primario/25">
                        {iniciales}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          className="font-semibold text-claro-texto dark:text-oscuro-texto truncate"
                          title={nombreCompleto}
                        >
                          {nombreCompleto}
                        </h3>
                        <p
                          className="text-xs text-claro-texto2 dark:text-oscuro-texto2 truncate"
                          title={user.correo}
                        >
                          {user.correo}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="min-w-0">
                        <p className="mb-1 font-bold uppercase tracking-[0.12em] text-claro-texto2 dark:text-oscuro-texto2">
                          Rol
                        </p>
                        <span
                          className={`inline-flex max-w-full items-center truncate rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getRolBadgeClass(user.rol)}`}
                          title={getRolDisplay(user.rol)}
                        >
                          {getRolDisplay(user.rol)}
                        </span>
                      </div>
                      <div>
                        <p className="mb-1 font-bold uppercase tracking-[0.12em] text-claro-texto2 dark:text-oscuro-texto2">
                          Estado
                        </p>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                            activo
                              ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-400/30'
                              : 'bg-red-500/10 text-red-700 border-red-500/25 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              activo ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          />
                          {getEstado(user)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirModalEditar(user)}
                        className="press flex-1 rounded-xl border border-claro-borde bg-claro-fondo py-2 text-sm font-semibold text-claro-texto2 hover:border-claro-primario/40 hover:text-claro-primario dark:border-oscuro-borde dark:bg-oscuro-fondo dark:text-oscuro-texto2 dark:hover:border-oscuro-primario/40 dark:hover:text-oscuro-primario"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(user)}
                        disabled={estaEliminando}
                        className="press flex-1 rounded-xl border border-claro-borde bg-claro-fondo py-2 text-sm font-semibold text-red-600 hover:border-red-300 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-oscuro-borde dark:bg-oscuro-fondo dark:text-red-400 dark:hover:border-red-800 dark:hover:bg-red-900/20"
                      >
                        {estaEliminando ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ============================================ */}
            {/* PAGINACIÓN NUMERADA                            */}
            {/* ============================================ */}
            {totalPaginas > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-claro-borde dark:border-oscuro-borde bg-claro-fondo/50 dark:bg-oscuro-fondo/50">
                <div className="text-xs text-claro-texto2 dark:text-oscuro-texto2">
                  Página{' '}
                  <span className="font-semibold text-claro-texto dark:text-oscuro-texto">
                    {paginaActual}
                  </span>{' '}
                  de{' '}
                  <span className="font-semibold text-claro-texto dark:text-oscuro-texto">
                    {totalPaginas}
                  </span>
                </div>

                <div className="flex items-center gap-1 flex-wrap justify-center">
                  <button
                    onClick={() => setPaginaActual(1)}
                    disabled={paginaActual === 1}
                    className="press rounded-xl border border-claro-borde bg-claro-tarjeta px-2.5 py-1.5 text-sm text-claro-texto2 hover:text-claro-primario disabled:opacity-40 disabled:cursor-not-allowed dark:border-oscuro-borde dark:bg-oscuro-tarjeta dark:text-oscuro-texto2 dark:hover:text-oscuro-primario"
                    title="Primera página"
                  >
                    «
                  </button>
                  <button
                    onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                    disabled={paginaActual === 1}
                    className="press rounded-xl border border-claro-borde bg-claro-tarjeta px-2.5 py-1.5 text-sm text-claro-texto2 hover:text-claro-primario disabled:opacity-40 disabled:cursor-not-allowed dark:border-oscuro-borde dark:bg-oscuro-tarjeta dark:text-oscuro-texto2 dark:hover:text-oscuro-primario"
                    title="Anterior"
                  >
                    ‹
                  </button>

                  {numerosPagina.map((n, i) =>
                    n === '...' ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="px-2 text-claro-texto2 dark:text-oscuro-texto2"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => setPaginaActual(n)}
                        className={`press min-w-[36px] rounded-xl border px-2.5 py-1.5 text-sm font-semibold ${
                          paginaActual === n
                            ? 'bg-claro-primario text-white border-claro-primario shadow-soft dark:bg-oscuro-primario dark:text-oscuro-fondo dark:border-oscuro-primario'
                            : 'bg-claro-tarjeta dark:bg-oscuro-tarjeta border-claro-borde dark:border-oscuro-borde text-claro-texto2 dark:text-oscuro-texto2 hover:text-claro-primario dark:hover:text-oscuro-primario'
                        }`}
                      >
                        {n}
                      </button>
                    )
                  )}

                  <button
                    onClick={() =>
                      setPaginaActual((p) => Math.min(totalPaginas, p + 1))
                    }
                    disabled={paginaActual === totalPaginas}
                    className="press rounded-xl border border-claro-borde bg-claro-tarjeta px-2.5 py-1.5 text-sm text-claro-texto2 hover:text-claro-primario disabled:opacity-40 disabled:cursor-not-allowed dark:border-oscuro-borde dark:bg-oscuro-tarjeta dark:text-oscuro-texto2 dark:hover:text-oscuro-primario"
                    title="Siguiente"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => setPaginaActual(totalPaginas)}
                    disabled={paginaActual === totalPaginas}
                    className="press rounded-xl border border-claro-borde bg-claro-tarjeta px-2.5 py-1.5 text-sm text-claro-texto2 hover:text-claro-primario disabled:opacity-40 disabled:cursor-not-allowed dark:border-oscuro-borde dark:bg-oscuro-tarjeta dark:text-oscuro-texto2 dark:hover:text-oscuro-primario"
                    title="Última página"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {!isPreview && (
        <UsuarioModal
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          onSave={handleGuardarUsuario}
          usuarioId={usuarioIdEditar}
        />
      )}
    </div>
  );
};

export default UsuarioList;