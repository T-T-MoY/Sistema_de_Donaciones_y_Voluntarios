/**
 * ============================================================================
 * PÁGINA: DisponibilidadEquipoPage — Sección Disponibilidad de Voluntarios
 * Módulo 4: Gestión de Voluntarios (Rol: Coordinador)
 *
 * Incluye:
 * - Título: "Disponibilidad de voluntarios"
 * - Selector combobox de días ("Todos los días", "Lunes", "Martes", ...)
 * - Buscador de voluntarios por nombre o habilidad
 * - Tabla espaciosa con 3 columnas (Nombre, Habilidades, Estado)
 * - Calendario time-grid compacto con bloques de horas
 * ============================================================================
 */

import { useAuth } from '../../context/AuthContext';
import { useDisponibilidadEquipo } from '../../hooks/useDisponibilidadEquipo';
import { DIAS_FILTRO } from '../../types/disponibilidadEquipo.types';
import TablaVoluntarios from '../../components/voluntarios/disponibilidad-equipo/TablaVoluntarios';
import CalendarioSemanalVoluntario from '../../components/voluntarios/disponibilidad-equipo/CalendarioSemanalVoluntario';
import { IconoReintentar } from '../../components/voluntarios/mi-disponibilidad/Iconos';

export default function DisponibilidadEquipoPage() {
  const { usuario } = useAuth();

  const {
    voluntarios,
    totalVoluntarios,
    voluntarioSeleccionado,
    cargando,
    error,
    filtroDia,
    setFiltroDia,
    busqueda,
    setBusqueda,
    seleccionarVoluntario,
    recargar,
  } = useDisponibilidadEquipo();

  // Validación de rol: Coordinador o Administrador
  const rolesUsuario = [
    ...(usuario?.roles ?? []),
    usuario?.rol ?? '',
  ].map((r) => r.toLowerCase().trim());

  const esCoordinador =
    Boolean(usuario?.es_coordinador) ||
    rolesUsuario.includes('coordinador') ||
    rolesUsuario.includes('administrador') ||
    rolesUsuario.includes('admin');

  if (!esCoordinador) {
    return (
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-error/30 bg-error-soft p-8 text-center shadow-soft">
        <h2 className="font-display text-lg font-bold text-error">
          Acceso restringido
        </h2>
        <p className="mt-2 text-sm text-text-muted">
          Esta sección está disponible únicamente para usuarios con el rol de <span className="font-bold">Coordinador</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1550px] space-y-6">
      {/* Encabezado Principal */}
      <div className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-soft sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-subtle">
          Módulo 4 · Gestión de Voluntarios
        </p>
        <h2 className="mt-1 font-display text-xl font-bold tracking-[-0.02em] text-text sm:text-2xl">
          Disponibilidad de voluntarios
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-text-muted">
          Consulta la disponibilidad horaria del equipo de voluntarios en una grilla interactiva
          de bloques para organizar y coordinar actividades solidarias.
        </p>
      </div>

      {/* Barra de Filtros: Selector de días + Buscador de voluntarios */}
      <div className="rounded-2xl border border-border bg-surface-elevated p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {/* Combobox de días de la semana */}
            <div className="w-full sm:w-60 shrink-0">
              <label
                htmlFor="filtro-dia"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-text-subtle"
              >
                Filtrar por día
              </label>
              <div className="relative">
                <select
                  id="filtro-dia"
                  value={filtroDia}
                  onChange={(e) => setFiltroDia(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-border bg-surface px-3.5 py-2.5 pr-9 text-sm text-text transition-colors focus:border-accent focus:ring-4 focus:ring-accent/15 focus:outline-none"
                >
                  {DIAS_FILTRO.map((dia) => (
                    <option key={dia.valor} value={dia.valor}>
                      {dia.etiqueta}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-subtle">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Buscador de voluntarios al lado */}
            <div className="flex-1">
              <label
                htmlFor="buscador-voluntarios"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-text-subtle"
              >
                Buscar voluntarios
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-subtle">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="buscador-voluntarios"
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre, correo o habilidad..."
                  className="w-full rounded-xl border border-border bg-surface pl-10 pr-9 py-2.5 text-sm text-text placeholder:text-text-subtle transition-colors focus:border-accent focus:ring-4 focus:ring-accent/15 focus:outline-none"
                />
                {busqueda && (
                  <button
                    type="button"
                    onClick={() => setBusqueda('')}
                    title="Limpiar búsqueda"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-subtle hover:text-text"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="flex items-center gap-2 self-end text-xs text-text-subtle md:self-auto">
            <span className="font-semibold text-text">
              {voluntarios.length}
            </span>
            <span>de {totalVoluntarios} voluntarios</span>
            {(filtroDia || busqueda) && (
              <button
                type="button"
                onClick={() => {
                  setFiltroDia('');
                  setBusqueda('');
                }}
                className="press ml-2 text-xs font-semibold text-primary hover:underline"
              >
                Restablecer filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido Principal: Estados de carga / error / tabla + calendario */}
      {cargando ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="h-96 animate-pulse rounded-2xl border border-border bg-surface-elevated lg:col-span-7" />
          <div className="h-96 animate-pulse rounded-2xl border border-border bg-surface-elevated lg:col-span-5" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-error/30 bg-error-soft p-8 text-center shadow-soft">
          <p className="font-semibold text-error">{error}</p>
          <button
            type="button"
            onClick={() => void recargar()}
            className="press mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-muted hover:border-accent/50 hover:bg-accent-soft"
          >
            <IconoReintentar className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Tabla de voluntarios: 7 columnas de ancho para dar mucho espacio y legibilidad */}
          <div className="lg:col-span-7">
            <TablaVoluntarios
              voluntarios={voluntarios}
              voluntarioSeleccionado={voluntarioSeleccionado}
              onSeleccionar={seleccionarVoluntario}
              filtroDia={filtroDia}
            />
          </div>

          {/* Calendario time-grid compacto y estético: 5 columnas de ancho, fijo al hacer scroll */}
          <div className="lg:col-span-5 lg:sticky lg:top-6">
            <CalendarioSemanalVoluntario
              voluntario={voluntarioSeleccionado}
              filtroDia={filtroDia}
            />
          </div>
        </div>
      )}
    </div>
  );
}
