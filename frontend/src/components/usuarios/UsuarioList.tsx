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
 * - Buscador por nombre → apellidos → correo, con varios términos en orden
 *   (ej. "luis mario"), sin distinguir acentos ni mayúsculas.
 * - Filtros por rol y estado (case-insensitive).
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
import { useToast } from '../../context/ToastContext';
import { usuarioApi } from '../../api/usuario.api';
import { UsuarioCard } from './UsuarioCard';
import UsuarioModal from './UsuarioModal';
import ConfirmModal from '../ui/ConfirmModal';
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
    return 'border-primary/25 bg-primary-soft text-primary';
  }
  if (r === 'donante' || r === 'cliente') {
    return 'border-accent/35 bg-accent-soft text-accent-text';
  }
  if (r === 'empleado' || r === 'voluntario') {
    return 'border-success/30 bg-success-soft text-success';
  }
  if (r === 'beneficiario') {
    return 'border-info/30 bg-info-soft text-info';
  }
  return 'border-border bg-surface text-text-muted';
};

const badgeEstado = (activo: boolean): string =>
  activo
    ? 'border-success/30 bg-success-soft text-success'
    : 'border-error/30 bg-error-soft text-error';

const puntoEstado = (activo: boolean): string => (activo ? 'bg-success' : 'bg-error');

// =====================================================
// BÚSQUEDA
// =====================================================

/**
 * Normaliza texto para comparar: minúsculas, sin acentos y sin espacios sobrantes.
 */
const normalizarTexto = (valor?: string | null): string =>
  (valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/**
 * Campos de búsqueda en el orden pedido: nombre → apellidos → correo.
 */
const getCamposBusqueda = (u: Usuario): [string, string, string] => {
  const nombre = normalizarTexto(u.nombre);
  const apellidos = normalizarTexto(
    u.apellidos || [u.paterno, u.materno].filter(Boolean).join(' '),
  );
  const correo = normalizarTexto(u.correo);
  return [nombre, apellidos, correo];
};

const esInicioDePalabra = (texto: string, posicion: number): boolean =>
  posicion === 0 || /[\s._@\-+]/.test(texto.charAt(posicion - 1));

/**
 * Puntúa la coincidencia de los términos respetando el orden
 * nombre → apellidos → correo. Cada término puede quedarse en el campo actual
 * o avanzar al siguiente, pero nunca retroceder.
 *
 * - "lu"        → coincide con nombre, apellidos o correo.
 * - "luis mario" → "luis" en el nombre y "mario" en el nombre o apellidos.
 * - "luis gmail" → "luis" en el nombre y "gmail" en el correo.
 *
 * Devuelve `null` cuando algún término no coincide.
 */
const puntuarBusqueda = (
  campos: [string, string, string],
  terminos: string[],
): number | null => {
  let campoActual = 0;
  let puntaje = 0;

  for (const termino of terminos) {
    let campoEncontrado = -1;
    let posicion = -1;

    for (let i = campoActual; i < campos.length; i++) {
      const encontrada = campos[i].indexOf(termino);
      if (encontrada !== -1) {
        campoEncontrado = i;
        posicion = encontrada;
        break;
      }
    }

    if (campoEncontrado === -1) return null;

    campoActual = campoEncontrado;
    // El nombre pesa más que los apellidos, y los apellidos más que el correo.
    puntaje += (campos.length - campoEncontrado) * 100;
    // Coincidir al inicio de una palabra ("Lu" en "Lucía") vale más.
    if (esInicioDePalabra(campos[campoEncontrado], posicion)) puntaje += 40;
    // Cuanto antes aparezca, mejor.
    puntaje -= Math.min(posicion, 30);
  }

  return puntaje;
};

export const UsuarioList = ({
  modo = 'app',
  title = 'Usuarios',
  subtitle = 'Resumen general de las cuentas registradas.',
}: UsuarioListProps) => {
  const { token } = useAuth();
  const { exito, error: mostrarError } = useToast();
  const isPreview = modo === 'preview';

  // =====================================================
  // ESTADOS PRINCIPALES
  // =====================================================
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [eliminandoId, setEliminandoId] = useState<number | string | null>(null);

  // Modal de confirmación de eliminación y modal de avisos/errores
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null);
  const [aviso, setAviso] = useState<{ titulo: string; mensaje: string } | null>(null);
  const [desactivandoId, setDesactivandoId] = useState<number | string | null>(null);

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
    if (token) void fetchUsuarios();
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
      void mostrarError('', 'No se pudo abrir el usuario');
      return;
    }
    setUsuarioIdEditar(Number(id));
    setModalAbierto(true);
  };

  const handleGuardarUsuario = (): void => {
    void fetchUsuarios();
  };

  // 1) El botón "Eliminar" solo abre el modal
  const handleEliminar = (user: Usuario): void => {
    const id = obtenerId(user);
    if (id === undefined || id === null || id === '') {
      setAviso({
        titulo: 'No se pudo eliminar',
        mensaje: 'No se pudo identificar el usuario a eliminar (ID inválido).',
      });
      return;
    }
    setUsuarioAEliminar(user);
  };

  // 2) Cancelar (no permite cerrar mientras se está eliminando)
  const cancelarEliminacion = (): void => {
    if (eliminandoId !== null || desactivandoId !== null) return;
    setUsuarioAEliminar(null);
  };

  // 3) Confirmar: aquí va la lógica real de borrado
  const confirmarEliminacion = async (): Promise<void> => {
    if (!usuarioAEliminar) return;
    const id = obtenerId(usuarioAEliminar);
    if (id === undefined || id === null || id === '') return;

    setEliminandoId(id);

    try {
      await usuarioApi.delete(id);
      setUsuarioAEliminar(null);
      await fetchUsuarios();
      void exito('', 'Usuario eliminado con éxito');
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
          'No se pudo completar el borrado lógico del usuario. ' +
          'Revisá el estado del servidor o intentá nuevamente en unos minutos.';
      }

      setUsuarioAEliminar(null);
      setAviso({
        titulo: `No se pudo eliminar (${status ?? 'sin conexión'})`,
        mensaje,
      });
    } finally {
      setEliminandoId(null);
    }
  };
  const desactivarUsuario = async (): Promise<void> => {
  if (!usuarioAEliminar) return;
  const id = obtenerId(usuarioAEliminar);
  if (id === undefined || id === null || id === '') return;

  setDesactivandoId(id);

  try {
    await usuarioApi.cambiarEstado(id, 'Inactivo');
    setUsuarioAEliminar(null);
    await fetchUsuarios();
    void exito('', 'Usuario desactivado');
  } catch (err: any) {
    console.error('Error al desactivar usuario:', {
      status: err.response?.status,
      data: err.response?.data,
    });

    const status = err.response?.status;
    let mensaje =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Error desconocido';

    if (status === 401 || status === 403) {
      mensaje =
        'No tienes permisos para desactivar usuarios o tu sesión expiró. ' +
        'Vuelve a iniciar sesión e inténtalo de nuevo.';
    } else if (status === 404) {
      mensaje = 'El usuario no existe o ya fue eliminado.';
    }

    setUsuarioAEliminar(null);
    setAviso({
      titulo: `No se pudo desactivar (${status ?? 'sin conexión'})`,
      mensaje,
    });
  } finally {
    setDesactivandoId(null);
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
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [usuarios]);

  const estadosDisponibles = useMemo(() => {
    const set = new Set<string>();
    usuarios.forEach((u) => {
      const est = getEstado(u);
      if (est) set.add(est);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [usuarios]);

  // =====================================================
  // FILTRADO COMBINADO
  // =====================================================
  const filtrados = useMemo(() => {
    const terminos = normalizarTexto(busqueda).split(/\s+/).filter(Boolean);

    const base = usuarios.filter((u) => {
      // 1. Filtro rol
      if (filtroRol) {
        const rolUsuario = (u.rol || '').toLowerCase();
        const rolFiltro = filtroRol.toLowerCase();
        const coincide =
          rolUsuario === rolFiltro ||
          (rolFiltro === 'admin' && rolUsuario === 'administrador') ||
          (rolFiltro === 'administrador' && rolUsuario === 'admin');
        if (!coincide) return false;
      }

      // 2. Filtro estado (case-insensitive)
      if (filtroEstado) {
        if (getEstado(u).toLowerCase() !== filtroEstado.toLowerCase()) return false;
      }

      return true;
    });

    // Sin término de búsqueda: solo filtros, sin reordenar.
    if (terminos.length === 0) return base;

    // Con búsqueda: nombre primero, luego apellidos y por último correo.
    const puntuados: { usuario: Usuario; puntaje: number }[] = [];

    for (const u of base) {
      const puntaje = puntuarBusqueda(getCamposBusqueda(u), terminos);
      if (puntaje !== null) puntuados.push({ usuario: u, puntaje });
    }

    return puntuados
      .sort((a, b) => b.puntaje - a.puntaje)
      .map((r) => r.usuario);
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
  // ESTILOS COMPARTIDOS
  // =====================================================
  const claseSelect =
    'w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text transition-[border-color,box-shadow] duration-200 hover:border-border-strong focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15';

  const botonPagina =
    'press inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-text-muted hover:border-accent/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0 sm:min-w-0';

  const ESTADISTICAS = [
    {
      etiqueta: 'Total registrados',
      valor: totalUsuarios,
      icono: 'bg-primary-soft text-primary',
      acento: 'text-text',
      iconoPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    },
    {
      etiqueta: 'Activos',
      valor: usuariosActivos,
      icono: 'bg-success-soft text-success',
      acento: 'text-success',
      iconoPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      etiqueta: 'Roles de admin',
      valor: admins,
      icono: 'bg-accent-soft text-accent-text',
      acento: 'text-accent-text',
      iconoPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    },
    {
      etiqueta: 'Suspendidos',
      valor: usuariosSuspendidos,
      icono: 'bg-error-soft text-error',
      acento: 'text-error',
      iconoPath: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
    },
  ];

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-accent-text">
            <span className="h-px w-6 bg-accent" />
            Administración
          </span>
          <h1 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.03em] text-text md:text-[2rem]">
            {title}
          </h1>
          <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
        </div>
        {!isPreview && (
          <button
            onClick={abrirModalNuevo}
            className="press inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-5 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-on-primary shadow-soft hover:bg-primary-hover hover:shadow-lift sm:w-auto"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo usuario
          </button>
        )}
      </div>

      {/* Estadísticas */}
      {!isPreview && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {ESTADISTICAS.map((stat) => (
            <div
              key={stat.etiqueta}
              className="rounded-2xl border border-border bg-surface-elevated p-4 shadow-soft transition-[border-color,box-shadow] duration-300 hover:border-accent/35 hover:shadow-lift sm:p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-text-muted">
                  {stat.etiqueta}
                </p>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.icono}`}>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.iconoPath} />
                  </svg>
                </span>
              </div>
              <h3 className={`mt-3 font-display text-3xl font-extrabold tabular-nums ${stat.acento}`}>
                {stat.valor}
              </h3>
            </div>
          ))}
        </div>
      )}

      {/* ============================================ */}
      {/* CONTENEDOR PRINCIPAL                          */}
      {/* ============================================ */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-soft">
        {!isPreview && (
          <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-4 sm:px-6">
            <h2 className="flex items-center gap-2.5 font-display text-sm font-bold text-text">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </span>
              Administrar usuarios
            </h2>
            <span className="rounded-full border border-border bg-surface-elevated px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-text-muted">
              {filtrados.length} de {totalUsuarios}
            </span>
          </div>
        )}

        {/* ============================================ */}
        {/* BARRA DE BÚSQUEDA Y FILTROS                    */}
        {/* ============================================ */}
        {!isPreview && (
          <div className="border-b border-border bg-surface-elevated px-4 py-4 sm:px-6">
            <div className="grid grid-cols-1 items-end gap-3 lg:grid-cols-12">
              {/* Buscador */}
              <div className="relative min-w-0 lg:col-span-5">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-subtle">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-3 text-sm text-text placeholder:text-text-subtle transition-[border-color,box-shadow] duration-200 hover:border-border-strong focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
                />
              </div>

              {/* Filtro Rol */}
              <div className="min-w-0 lg:col-span-2">
                <label htmlFor="filtro-rol" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted">
                  Rol
                </label>
                <select
                  id="filtro-rol"
                  value={filtroRol}
                  onChange={(e) => setFiltroRol(e.target.value)}
                  className={claseSelect}
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
              <div className="min-w-0 lg:col-span-2">
                <label htmlFor="filtro-estado" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted">
                  Estado
                </label>
                <select
                  id="filtro-estado"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className={claseSelect}
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
              <div className="min-w-0 lg:col-span-1">
                <label htmlFor="por-pagina" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted">
                  Mostrar
                </label>
                <select
                  id="por-pagina"
                  value={porPagina}
                  onChange={(e) => setPorPagina(Number(e.target.value))}
                  className={claseSelect}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Botón Limpiar filtros */}
              <div className="min-w-0 lg:col-span-2">
                <button
                  onClick={limpiarFiltros}
                  disabled={!hayFiltrosActivos}
                  className={`press flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2.5 text-sm font-semibold
                    ${
                      hayFiltrosActivos
                        ? 'border-border bg-surface text-text-muted hover:border-error/40 hover:bg-error-soft hover:text-error'
                        : 'cursor-not-allowed border-border/50 bg-surface/50 text-text-subtle/50'
                    }`}
                >
                  Limpiar filtros
                  {filtrosActivos > 0 && (
                    <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-on-primary">
                      {filtrosActivos}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="mt-3 text-xs text-text-muted">
              Mostrando{' '}
              <span className="font-semibold text-text">
                {indiceInicio}-{indiceFin}
              </span>{' '}
              de{' '}
              <span className="font-semibold text-text">{filtrados.length}</span>{' '}
              usuarios
              {hayFiltrosActivos && (
                <span className="ml-1">(filtrados de {totalUsuarios} en total)</span>
              )}
            </div>
          </div>
        )}

        {/* Estado de carga/error */}
        {cargando ? (
          <div className="space-y-3 px-4 py-6 sm:px-6" aria-busy="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-surface-sunken" />
                <div className="h-3.5 flex-1 animate-pulse rounded-full bg-surface-sunken" />
                <div className="hidden h-3.5 w-32 animate-pulse rounded-full bg-surface-sunken sm:block" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-surface-sunken" />
              </div>
            ))}
            <span className="sr-only">Cargando usuarios…</span>
          </div>
        ) : error ? (
          <div className="flex items-start gap-2.5 px-6 py-8 font-medium text-error">
            <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            {error}
          </div>
        ) : usuariosPaginados.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-text-subtle">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
            </span>
            <p className="text-sm text-text-muted">
              {hayFiltrosActivos
                ? 'No se encontraron usuarios que coincidan con los filtros.'
                : 'No hay usuarios registrados.'}
            </p>
          </div>
        ) : isPreview ? (
          /* ============ MODO PREVIEW (vitrina) ============ */
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
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
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full table-fixed text-left">
                <colgroup>
                  <col className="w-12" />
                  <col className="w-[22%]" />
                  <col className="w-[24%]" />
                  <col className="w-[12%]" />
                  <col className="w-[13%]" />
                  <col className="w-[17%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-border bg-surface text-[9.5px] font-bold uppercase tracking-[0.14em] text-text-subtle">
                    <th className="px-3 py-3 text-center">#</th>
                    <th className="px-3 py-3">Usuario</th>
                    <th className="px-3 py-3">Correo electrónico</th>
                    <th className="px-3 py-3">Rol</th>
                    <th className="px-3 py-3">Estado</th>
                    <th className="px-3 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
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
                        className="group transition-colors duration-200 hover:bg-surface"
                      >
                        <td className="px-3 py-4 text-center text-xs font-bold tabular-nums text-text-subtle">
                          {numeroFila}
                        </td>

                        <td className="min-w-0 px-3 py-4">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-xs font-bold text-primary ring-1 ring-primary/15">
                              {iniciales}
                            </div>
                            <span
                              className="truncate text-sm font-semibold text-text"
                              title={nombreCompleto}
                            >
                              {nombreCompleto}
                            </span>
                          </div>
                        </td>

                        <td className="min-w-0 px-3 py-4 text-sm text-text-muted">
                          <span className="block truncate" title={user.correo}>
                            {user.correo}
                          </span>
                        </td>

                        <td className="min-w-0 px-3 py-4">
                          <span
                            className={`inline-flex max-w-full items-center truncate rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.06em] ${getRolBadgeClass(user.rol)}`}
                            title={getRolDisplay(user.rol)}
                          >
                            {getRolDisplay(user.rol)}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold ${badgeEstado(activo)}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${puntoEstado(activo)}`} />
                            {getEstado(user)}
                          </span>
                        </td>

                        {/* ACCIONES — botones verticales, mismo ancho, centrados */}
                        <td className="px-3 py-3">
                          <div className="mx-auto flex w-full max-w-[100px] flex-col items-stretch gap-1.5">
                            <button
                              onClick={() => abrirModalEditar(user)}
                              className="press w-full rounded-lg border border-border bg-surface py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-text-muted hover:border-accent/50 hover:bg-accent-soft hover:text-text"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleEliminar(user)}
                              disabled={estaEliminando}
                              className="press w-full rounded-lg border border-border bg-surface py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-error hover:border-error/40 hover:bg-error-soft disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="divide-y divide-border md:hidden">
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
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-[11px] font-bold tabular-nums text-text-subtle">
                        {numeroFila}
                      </span>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-sm font-bold text-primary ring-1 ring-primary/15">
                        {iniciales}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          className="truncate text-sm font-semibold text-text"
                          title={nombreCompleto}
                        >
                          {nombreCompleto}
                        </h3>
                        <p
                          className="truncate text-xs text-text-muted"
                          title={user.correo}
                        >
                          {user.correo}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="min-w-0">
                        <p className="mb-1 text-[9.5px] font-bold uppercase tracking-[0.12em] text-text-subtle">
                          Rol
                        </p>
                        <span
                          className={`inline-flex max-w-full items-center truncate rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.06em] ${getRolBadgeClass(user.rol)}`}
                          title={getRolDisplay(user.rol)}
                        >
                          {getRolDisplay(user.rol)}
                        </span>
                      </div>
                      <div>
                        <p className="mb-1 text-[9.5px] font-bold uppercase tracking-[0.12em] text-text-subtle">
                          Estado
                        </p>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold ${badgeEstado(activo)}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${puntoEstado(activo)}`} />
                          {getEstado(user)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirModalEditar(user)}
                        className="press flex-1 rounded-xl border border-border bg-surface py-2.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-text-muted hover:border-accent/50 hover:bg-accent-soft hover:text-text"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(user)}
                        disabled={estaEliminando}
                        className="press flex-1 rounded-xl border border-border bg-surface py-2.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-error hover:border-error/40 hover:bg-error-soft disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {estaEliminando ? 'Eliminando…' : 'Eliminar'}
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
              <div className="flex flex-col items-center justify-between gap-3 border-t border-border bg-surface px-4 py-4 sm:flex-row sm:px-6">
                <div className="text-xs text-text-muted">
                  Página{' '}
                  <span className="font-semibold text-text">{paginaActual}</span> de{' '}
                  <span className="font-semibold text-text">{totalPaginas}</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1">
                  <button
                    onClick={() => setPaginaActual(1)}
                    disabled={paginaActual === 1}
                    className={botonPagina}
                    title="Primera página"
                  >
                    «
                  </button>
                  <button
                    onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                    disabled={paginaActual === 1}
                    className={botonPagina}
                    title="Anterior"
                  >
                    ‹
                  </button>

                  {numerosPagina.map((n, i) =>
                    n === '...' ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="px-2 text-text-subtle"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => setPaginaActual(n)}
                        className={`press inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg border px-2.5 py-1.5 text-sm font-bold sm:min-h-0 sm:min-w-0 ${
                          paginaActual === n
                            ? 'border-primary bg-primary text-on-primary shadow-soft'
                            : 'border-border bg-surface text-text-muted hover:border-accent/50 hover:text-primary'
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
                    className={botonPagina}
                    title="Siguiente"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => setPaginaActual(totalPaginas)}
                    disabled={paginaActual === totalPaginas}
                    className={botonPagina}
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
            {/* Modal de confirmación de eliminación (borrado lógico) */}
      {!isPreview && (
        <ConfirmModal
          isOpen={usuarioAEliminar !== null}
          variante="peligro"
          titulo="Eliminar usuario"
          mensaje={
            <>
              ¿Marcar a{' '}
              <strong className="text-text">
                {usuarioAEliminar ? getNombreCompleto(usuarioAEliminar) : ''}
              </strong>{' '}
              como <strong className="text-text">Eliminado</strong>? Dejará de aparecer en el
              listado y no podrá iniciar sesión.
            </>
          }
          advertencia={
            usuarioAEliminar && esActivo(usuarioAEliminar)
              ? 'Se aplica borrado lógico: el registro no se borra físicamente de la base de datos y conserva su historial.\n' +
                'Si solo querés quitarle el acceso temporalmente, usá "Desactivar": es reversible.'
              : 'Se aplica borrado lógico: el registro no se borra físicamente de la base de datos y conserva su historial.'
          }
          textoConfirmar="Sí, eliminar"
          textoCancelar="Cancelar"
          cargando={eliminandoId !== null || desactivandoId !== null}
          accionEnCurso={desactivandoId !== null ? 'secundaria' : 'confirmar'}
          accionSecundaria={
            usuarioAEliminar && esActivo(usuarioAEliminar)
              ? { texto: 'Desactivar', onClick: desactivarUsuario }
              : undefined
          }
          onConfirm={confirmarEliminacion}
          onCancel={cancelarEliminacion}
        />
      )}

      {/* Modal de avisos / errores del sistema */}
      {!isPreview && (
        <ConfirmModal
          isOpen={aviso !== null}
          variante="info"
          titulo={aviso?.titulo ?? 'Aviso'}
          mensaje={aviso?.mensaje ?? ''}
          mostrarCancelar={false}
          textoConfirmar="Entendido"
          onConfirm={() => setAviso(null)}
          onCancel={() => setAviso(null)}
        />
      )}
    </div>
  );
};

export default UsuarioList;