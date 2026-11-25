/**
 * ============================================================================
 * COMPONENTE: CalendarioSemanalVoluntario
 * Calendario semanal compacto con bloques horarios (time-grid) que pinta
 * de color distintivo las horas en las que el voluntario está disponible.
 * ============================================================================
 */

import { useState, useMemo } from 'react';
import {
  DIAS_SEMANA,
  type DiaSemana,
  type HorarioDisponibilidad,
} from '../../../types/disponibilidad.types';
import type { VoluntarioEquipo } from '../../../types/disponibilidadEquipo.types';
import ModalActividadesVoluntario from './ModalActividadesVoluntario';

interface CalendarioSemanalVoluntarioProps {
  voluntario: VoluntarioEquipo | null;
  filtroDia: string;
}

const DIAS_CORTOS: Record<string, string> = {
  Lunes: 'Lun',
  Martes: 'Mar',
  Miercoles: 'Mié',
  Jueves: 'Jue',
  Viernes: 'Vie',
  Sabado: 'Sáb',
  Domingo: 'Dom',
};

const horaToMinutos = (horaStr: string): number => {
  const [h, m] = horaStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export default function CalendarioSemanalVoluntario({
  voluntario,
  filtroDia,
}: CalendarioSemanalVoluntarioProps) {
  const [modalActividadesAbierto, setModalActividadesAbierto] = useState<boolean>(false);

  // Rango de horas dinámico (por defecto de 08:00 a 20:00)
  const { horaInicio, horaFin } = useMemo(() => {
    if (!voluntario || voluntario.horarios.length === 0) {
      return { horaInicio: 8, horaFin: 20 };
    }
    const horasIni = voluntario.horarios
      .filter((h) => h.estado)
      .map((h) => parseInt(h.hora_inicio.split(':')[0], 10))
      .filter((n) => !isNaN(n));
    const horasFin = voluntario.horarios
      .filter((h) => h.estado)
      .map((h) => {
        const [hStr, mStr] = h.hora_fin.split(':');
        const hNum = parseInt(hStr, 10);
        const mNum = parseInt(mStr, 10);
        return mNum > 0 ? hNum + 1 : hNum;
      })
      .filter((n) => !isNaN(n));

    const min = horasIni.length > 0 ? Math.min(8, Math.min(...horasIni)) : 8;
    const max = horasFin.length > 0 ? Math.max(20, Math.max(...horasFin)) : 20;

    return { horaInicio: Math.max(6, min), horaFin: Math.min(23, max) };
  }, [voluntario]);

  // Lista de horas para las filas del calendario
  const horasFilas = useMemo(() => {
    const horas: number[] = [];
    for (let h = horaInicio; h <= horaFin; h++) {
      horas.push(h);
    }
    return horas;
  }, [horaInicio, horaFin]);

  // Cálculo del total de horas disponibles a la semana (redondeado a entero)
  const totalHorasSemanales = useMemo(() => {
    if (!voluntario) return 0;
    const horas = voluntario.horarios
      .filter((h) => h.estado)
      .reduce((total, h) => {
        const ini = horaToMinutos(h.hora_inicio);
        const fin = horaToMinutos(h.hora_fin);
        return total + Math.max(0, (fin - ini) / 60);
      }, 0);
    return Math.round(horas);
  }, [voluntario]);

  // Verifica si un slot horario [h, h+1] entra dentro de la disponibilidad del día
  const verificarDisponibilidadHora = (
    dia: DiaSemana,
    hora: number
  ): { disponible: boolean; horario?: HorarioDisponibilidad } => {
    if (!voluntario) return { disponible: false };
    const slotIni = hora * 60;
    const slotFin = (hora + 1) * 60;

    for (const h of voluntario.horarios) {
      if (!h.estado || h.dia_semana !== dia) continue;
      const hIni = horaToMinutos(h.hora_inicio);
      const hFin = horaToMinutos(h.hora_fin);

      // Solapamiento: el bloque horario cae dentro del rango declarado
      if (slotIni < hFin && slotFin > hIni) {
        return { disponible: true, horario: h };
      }
    }
    return { disponible: false };
  };

  if (!voluntario) {
    return (
      <section className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-elevated p-6 text-center shadow-soft">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface text-text-subtle">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="mt-3 font-display text-sm font-bold text-text">
          Selecciona un voluntario
        </h3>
        <p className="mt-1 max-w-xs text-xs text-text-subtle">
          Haz clic en cualquier voluntario de la tabla para ver sus bloques horarios semanales.
        </p>
      </section>
    );
  }

  const horariosActivos = voluntario.horarios.filter((h) => h.estado);

  return (
    <section className="rounded-2xl border border-border bg-surface-elevated p-4 shadow-soft sm:p-5">
      {/* Cabecera del Voluntario */}
      <div className="border-b border-border pb-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-display text-base font-bold text-text truncate">
                {voluntario.nombre} {voluntario.apellido}
              </h3>
              {voluntario.es_coordinador && (
                <span className="rounded-md border border-accent/30 bg-accent-soft px-1.5 py-0.5 text-[9.5px] font-bold text-accent-text dark:text-accent">
                  Coord.
                </span>
              )}
            </div>
            <p className="text-xs text-text-subtle truncate mt-0.5">
              {voluntario.correo}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={() => setModalActividadesAbierto(true)}
              className="press inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary-soft/50 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary-soft hover:border-primary transition-colors"
              title="Ver actividades actuales y futuras asignadas a este voluntario"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Ver actividades</span>
            </button>

            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary">
              {totalHorasSemanales > 0 ? `${totalHorasSemanales}h sem.` : 'Sin horas'}
            </span>
          </div>
        </div>

        {/* Resumen de rangos declarados */}
        {horariosActivos.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {horariosActivos.map((h) => (
              <span
                key={h.id_disponibilidad}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium border ${
                  filtroDia === h.dia_semana
                    ? 'border-primary bg-primary text-white font-semibold'
                    : 'border-border/80 bg-surface text-text-muted'
                }`}
              >
                <span className="font-semibold">{DIAS_CORTOS[h.dia_semana] || h.dia_semana}:</span>
                <span>{h.hora_inicio} - {h.hora_fin}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs italic text-text-subtle">
            Este voluntario aún no ha registrado franjas horarias específicas.
          </p>
        )}
      </div>

      {/* Leyenda compacta */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-text-subtle">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary border border-primary/80" />
            <span className="text-text font-medium">Disponible</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-surface border border-border" />
            <span>No disponible</span>
          </span>
        </div>

        {filtroDia && (
          <span className="text-primary font-semibold">
            Día filtrado: {DIAS_CORTOS[filtroDia] || filtroDia}
          </span>
        )}
      </div>

      {/* Grilla visual tipo Time-Grid con bloques de horas */}
      <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-surface">
        <div className="min-w-[340px]">
          {/* Fila de cabecera: Días */}
          <div className="grid grid-cols-8 border-b border-border bg-surface-sunken text-center text-[11px] font-bold">
            <div className="py-2 text-[10px] uppercase text-text-subtle border-r border-border/60">
              Hora
            </div>
            {DIAS_SEMANA.map((dia) => {
              const esDiaFiltrado = filtroDia === dia.valor;
              return (
                <div
                  key={dia.valor}
                  title={dia.etiqueta}
                  className={`py-2 text-center transition-colors border-r last:border-r-0 border-border/60 ${
                    esDiaFiltrado
                      ? 'bg-primary text-white font-bold'
                      : 'text-text'
                  }`}
                >
                  <span className="block">{DIAS_CORTOS[dia.valor] || dia.valor}</span>
                </div>
              );
            })}
          </div>

          {/* Filas de bloques de horas */}
          <div className="divide-y divide-border/40">
            {horasFilas.map((hora) => {
              const horaEtiqueta = `${hora.toString().padStart(2, '0')}:00`;

              return (
                <div key={hora} className="grid grid-cols-8 items-center text-center">
                  {/* Columna de Hora */}
                  <div className="py-1 px-1 font-mono text-[10px] text-text-subtle border-r border-border/60 bg-surface-sunken/40">
                    {horaEtiqueta}
                  </div>

                  {/* Celdas para cada día */}
                  {DIAS_SEMANA.map((dia) => {
                    const { disponible, horario } = verificarDisponibilidadHora(dia.valor, hora);
                    const esDiaFiltrado = filtroDia === dia.valor;

                    return (
                      <div
                        key={dia.valor}
                        title={
                          disponible
                            ? `${dia.etiqueta} ${horaEtiqueta}: Disponible (${horario?.hora_inicio} - ${horario?.hora_fin})`
                            : `${dia.etiqueta} ${horaEtiqueta}: No disponible`
                        }
                        className={`h-6 flex items-center justify-center border-r last:border-r-0 border-border/40 transition-all ${
                          disponible
                            ? 'bg-primary text-white shadow-xs font-bold'
                            : esDiaFiltrado
                              ? 'bg-primary-soft/15 hover:bg-primary-soft/25'
                              : 'bg-surface hover:bg-surface-sunken/50'
                        }`}
                      >
                        {disponible && (
                          <span className="text-[10px] leading-none drop-shadow-xs">
                            ✓
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de actividades actuales y futuras */}
      <ModalActividadesVoluntario
        abierto={modalActividadesAbierto}
        onCerrar={() => setModalActividadesAbierto(false)}
        voluntario={voluntario}
      />
    </section>
  );
}
