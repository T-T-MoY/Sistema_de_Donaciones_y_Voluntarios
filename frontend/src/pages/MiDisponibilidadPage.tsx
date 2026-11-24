/**
 * ============================================================================
 * PÁGINA: MiDisponibilidadPage — Sección 5 (Rol: Voluntario)
 * Módulo 4: Gestión de Voluntarios.
 *
 * Compone: lista de horarios, calendario semanal, panel lateral de perfil,
 * modal de alta/edición y confirmación de activación/desactivación.
 * ============================================================================
 */

import { useState } from 'react';
import CalendarioSemanal from '../components/voluntarios/mi-disponibilidad/CalendarioSemanal';
import HorariosList from '../components/voluntarios/mi-disponibilidad/HorariosList';
import HorarioFormModal from '../components/voluntarios/mi-disponibilidad/HorarioFormModal';
import PerfilStatusPanel from '../components/voluntarios/mi-disponibilidad/PerfilStatusPanel';
import { IconoReintentar } from '../components/voluntarios/mi-disponibilidad/Iconos';
import ConfirmModal from '../components/ui/ConfirmModal';
import { useToast } from '../context/ToastContext';
import { useMiDisponibilidad, mensajeErrorApi } from '../hooks/useMiDisponibilidad';
import usuarioApi from '../api/usuario.api';
import { etiquetaDia, type DiaSemana, type HorarioDisponibilidad, type HorarioFormulario } from '../types/disponibilidad.types';

interface EstadoModal {
  abierto: boolean;
  horario: HorarioDisponibilidad | null;
  dia: DiaSemana | '';
}

const MODAL_CERRADO: EstadoModal = { abierto: false, horario: null, dia: '' };

const MiDisponibilidadPage = () => {
  const { datos, cargando, error, recargar, crear, actualizar, cambiarEstado } =
    useMiDisponibilidad();
  const { exito, error: toastError } = useToast();

  const [modal, setModal] = useState<EstadoModal>(MODAL_CERRADO);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [confirmacion, setConfirmacion] = useState<HorarioDisponibilidad | null>(null);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [postulando, setPostulando] = useState<boolean>(false);

  const abrirAgregar = (dia: DiaSemana | '' = ''): void => {
    setErrorForm(null);
    setModal({ abierto: true, horario: null, dia });
  };

  const abrirEditar = (horario: HorarioDisponibilidad): void => {
    setErrorForm(null);
    setModal({ abierto: true, horario, dia: '' });
  };

  const guardarHorario = async (payload: HorarioFormulario): Promise<void> => {
    setGuardando(true);
    setErrorForm(null);
    try {
      if (modal.horario) {
        await actualizar(modal.horario.id_disponibilidad, payload);
        exito('El horario fue actualizado correctamente.', 'Cambios guardados');
      } else {
        await crear(payload);
        exito('El horario fue agregado a tu semana.', 'Disponibilidad actualizada');
      }
      setModal(MODAL_CERRADO);
    } catch (err) {
      const mensaje = mensajeErrorApi(err, 'No se pudo guardar el horario. Intenta nuevamente.');
      setErrorForm(mensaje);
      toastError(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const confirmarCambioEstado = async (): Promise<void> => {
    if (!confirmacion) return;
    const horario = confirmacion;
    const nuevoEstado = !horario.estado;

    setProcesandoId(horario.id_disponibilidad);
    try {
      await cambiarEstado(horario.id_disponibilidad, nuevoEstado);
      exito(
        nuevoEstado ? 'El horario ya está activo.' : 'El horario fue desactivado.',
        'Disponibilidad actualizada'
      );
      setConfirmacion(null);
    } catch (err) {
      toastError(mensajeErrorApi(err, 'No se pudo cambiar el estado del horario.'));
      setConfirmacion(null);
    } finally {
      setProcesandoId(null);
    }
  };

  const postular = async (): Promise<void> => {
    setPostulando(true);
    try {
      await usuarioApi.postularVoluntario({
        habilidades: ['General'],
        disponibilidad: 'A convenir',
      });
      await recargar();
      exito('Tu postulación fue enviada. Un coordinador la revisará.', 'Postulación enviada');
    } catch (err) {
      toastError(mensajeErrorApi(err, 'No se pudo enviar la postulación.'));
    } finally {
      setPostulando(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5 px-3 py-5 sm:px-5 md:space-y-6 md:py-7">
      {/* Encabezado */}
      <div className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-soft sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-subtle">
          Módulo 4 · Gestión de Voluntarios
        </p>
        <h2 className="mt-1 font-display text-xl font-bold tracking-[-0.02em] text-text sm:text-2xl">
          Mi Disponibilidad
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-text-muted">
          Consultá el estado de tu perfil y organizá los días y horarios en los que podés apoyar
          las actividades de la fundación.
        </p>
      </div>

      {cargando ? (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <div className="h-72 animate-pulse rounded-2xl border border-border bg-surface-elevated xl:col-span-4" />
          <div className="h-72 animate-pulse rounded-2xl border border-border bg-surface-elevated xl:col-span-5" />
          <div className="h-72 animate-pulse rounded-2xl border border-border bg-surface-elevated xl:col-span-3" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-error/30 bg-error-soft p-6 text-center">
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
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <div className="xl:col-span-4">
            <HorariosList
              horarios={datos.horarios}
              procesandoId={procesandoId}
              onAgregar={() => abrirAgregar()}
              onEditar={abrirEditar}
              onCambiarEstado={setConfirmacion}
            />
          </div>
          <div className="xl:col-span-5">
            <CalendarioSemanal
              horarios={datos.horarios}
              onAgregar={abrirAgregar}
              onEditar={abrirEditar}
            />
          </div>
          <div className="xl:col-span-3">
            <PerfilStatusPanel
              perfil={datos.perfil}
              esVoluntario={datos.esVoluntario}
              postulando={postulando}
              onPostular={() => void postular()}
            />
          </div>
        </div>
      )}

      <HorarioFormModal
        isOpen={modal.abierto}
        horario={modal.horario}
        diaInicial={modal.dia}
        guardando={guardando}
        errorBackend={errorForm}
        onClose={() => setModal(MODAL_CERRADO)}
        onGuardar={guardarHorario}
      />

      <ConfirmModal
        isOpen={Boolean(confirmacion)}
        titulo={confirmacion?.estado ? 'Desactivar horario' : 'Activar horario'}
        mensaje={
          confirmacion
            ? `¿Deseas ${confirmacion.estado ? 'desactivar' : 'activar'} el horario del ${etiquetaDia(confirmacion.dia_semana)} de ${confirmacion.hora_inicio} a ${confirmacion.hora_fin}?`
            : ''
        }
        advertencia={
          confirmacion?.estado
            ? 'El bloque dejará de considerarse para posibles cruces con otros horarios. Podés reactivarlo cuando quieras.'
            : undefined
        }
        textoConfirmar={confirmacion?.estado ? 'Desactivar' : 'Activar'}
        variante={confirmacion?.estado ? 'peligro' : 'info'}
        cargando={procesandoId !== null}
        onConfirm={() => void confirmarCambioEstado()}
        onCancel={() => setConfirmacion(null)}
      />
    </div>
  );
};

export default MiDisponibilidadPage;
