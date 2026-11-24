/**
 * ============================================================================
 * COMPONENTE: HorarioFormModal
 * Formulario reutilizable para agregar o editar un horario semanal.
 * Usa ModalBase, FieldError y validación instantánea en cliente.
 * ============================================================================
 */

import { useEffect, useState, type FormEvent } from 'react';
import ModalBase from '../../donaciones/ModalBase';
import FieldError from '../../ui/FieldError';
import { DIAS_SEMANA, type DiaSemana, type HorarioDisponibilidad, type HorarioFormulario } from '../../../types/disponibilidad.types';
import { IconoAlerta, IconoCheck, IconoReloj } from './Iconos';

interface HorarioFormModalProps {
  isOpen: boolean;
  /** null = modo crear; si trae datos, modo editar. */
  horario: HorarioDisponibilidad | null;
  /** Día preseleccionado al abrir desde el calendario. */
  diaInicial?: DiaSemana | '';
  guardando: boolean;
  errorBackend?: string | null;
  onClose: () => void;
  onGuardar: (datos: HorarioFormulario) => Promise<void>;
}

type Campo = keyof HorarioFormulario;
type Errores = Partial<Record<Campo, string>>;

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const claseInput =
  'w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-subtle transition-[border-color,box-shadow] duration-200 hover:border-border-strong focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15';
const claseInputError =
  'w-full rounded-xl border border-error bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-subtle focus:border-error focus:outline-none focus:ring-4 focus:ring-error/15';
const claseEtiqueta =
  'mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-text-muted';

const HorarioFormModal = ({
  isOpen,
  horario,
  diaInicial = '',
  guardando,
  errorBackend,
  onClose,
  onGuardar,
}: HorarioFormModalProps) => {
  const [form, setForm] = useState<HorarioFormulario>({
    dia_semana: diaInicial,
    hora_inicio: '',
    hora_fin: '',
  });
  const [touched, setTouched] = useState<Partial<Record<Campo, boolean>>>({});
  const [intentado, setIntentado] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      dia_semana: horario?.dia_semana ?? diaInicial ?? '',
      hora_inicio: horario?.hora_inicio ?? '',
      hora_fin: horario?.hora_fin ?? '',
    });
    setTouched({});
    setIntentado(false);
  }, [isOpen, horario, diaInicial]);

  const errores: Errores = {};
  if (!form.dia_semana) {
    errores.dia_semana = 'Seleccioná un día de la semana.';
  }
  if (!HORA_REGEX.test(form.hora_inicio)) {
    errores.hora_inicio = 'Ingresá una hora válida en formato 24 h (ej. 14:00).';
  }
  if (!HORA_REGEX.test(form.hora_fin)) {
    errores.hora_fin = 'Ingresá una hora válida en formato 24 h (ej. 18:00).';
  } else if (HORA_REGEX.test(form.hora_inicio) && form.hora_fin <= form.hora_inicio) {
    errores.hora_fin = 'La hora de fin debe ser mayor que la hora de inicio.';
  }

  const marcarTocado = (campo: Campo): void =>
    setTouched((prev) => ({ ...prev, [campo]: true }));

  const manejarEnvio = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setIntentado(true);
    if (Object.keys(errores).length > 0) return;

    void onGuardar({
      dia_semana: form.dia_semana as DiaSemana,
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin,
    });
  };

  const visible = (campo: Campo): boolean => intentado || Boolean(touched[campo]);

  return (
    <ModalBase
      isOpen={isOpen}
      titulo={horario ? 'Editar horario' : 'Agregar horario'}
      subtitulo={
        horario
          ? 'Actualizá el día y el rango horario de tu disponibilidad.'
          : 'Registrá un nuevo bloque de tiempo en tu semana.'
      }
      ancho="md"
      bloqueado={guardando}
      onClose={onClose}
      pie={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="press rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-muted hover:border-border-strong hover:text-text disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="form-mi-horario"
            disabled={guardando}
            className="press inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary shadow-soft hover:bg-primary-hover hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-60"
          >
            <IconoCheck className="h-4 w-4" />
            {guardando ? 'Guardando…' : horario ? 'Guardar cambios' : 'Agregar horario'}
          </button>
        </div>
      }
    >
      {errorBackend && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2.5 rounded-xl border border-error/30 bg-error-soft px-3.5 py-3 text-sm leading-relaxed text-error"
        >
          <IconoAlerta className="mt-0.5 h-4 w-4" />
          <span>{errorBackend}</span>
        </div>
      )}

      <form id="form-mi-horario" onSubmit={manejarEnvio} noValidate className="space-y-1">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="dia-horario" className={claseEtiqueta}>
              Día de la semana
            </label>
            <select
              id="dia-horario"
              value={form.dia_semana}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, dia_semana: e.target.value as DiaSemana }))
              }
              onBlur={() => marcarTocado('dia_semana')}
              className={errores.dia_semana && visible('dia_semana') ? claseInputError : claseInput}
            >
              <option value="">Seleccionar…</option>
              {DIAS_SEMANA.map((dia) => (
                <option key={dia.valor} value={dia.valor}>
                  {dia.etiqueta}
                </option>
              ))}
            </select>
            <FieldError error={errores.dia_semana} touched={visible('dia_semana')} />
          </div>

          <div>
            <label htmlFor="hora-inicio" className={claseEtiqueta}>
              Hora inicio
            </label>
            <input
              id="hora-inicio"
              type="time"
              value={form.hora_inicio}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, hora_inicio: e.target.value }))
              }
              onBlur={() => marcarTocado('hora_inicio')}
              className={errores.hora_inicio && visible('hora_inicio') ? claseInputError : claseInput}
            />
            <FieldError error={errores.hora_inicio} touched={visible('hora_inicio')} />
          </div>

          <div>
            <label htmlFor="hora-fin" className={claseEtiqueta}>
              Hora fin
            </label>
            <input
              id="hora-fin"
              type="time"
              value={form.hora_fin}
              onChange={(e) => setForm((prev) => ({ ...prev, hora_fin: e.target.value }))}
              onBlur={() => marcarTocado('hora_fin')}
              className={errores.hora_fin && visible('hora_fin') ? claseInputError : claseInput}
            />
            <FieldError error={errores.hora_fin} touched={visible('hora_fin')} />
          </div>
        </div>

        <p className="flex items-center gap-2 text-xs leading-relaxed text-text-subtle">
          <IconoReloj className="h-4 w-4" />
          Los rangos no pueden cruzarse con otro horario activo del mismo día.
        </p>
      </form>
    </ModalBase>
  );
};

export default HorarioFormModal;
