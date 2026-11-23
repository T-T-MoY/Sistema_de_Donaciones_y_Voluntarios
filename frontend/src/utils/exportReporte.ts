/**
 * ============================================================================
 * ARCHIVO: exportReporte.ts
 * Exporta el reporte de donaciones a Excel (xlsx) y PDF (jsPDF).
 * Las librerías se cargan bajo demanda para no inflar el bundle inicial.
 * Las monedas y unidades NUNCA se suman entre sí.
 * ============================================================================
 */

import type { ReporteDonaciones } from '../types/donacion.types';
import { ETIQUETA_ESTADO, ETIQUETA_TIPO, formatoFecha, formatoNumero } from './donacionFormat';

const nombreArchivo = (ext: string): string =>
  `reporte-donaciones-${new Date().toLocaleDateString('en-CA', { timeZone: 'America/La_Paz' })}.${ext}`;

export const exportarExcel = async (r: ReporteDonaciones): Promise<void> => {
  const XLSX = await import('xlsx');
  const libro = XLSX.utils.book_new();

  const resumen: (string | number)[][] = [
    ['Reporte de donaciones'],
    ['Total de donaciones', r.resumen.total_donaciones],
    [],
    ['Por tipo', 'Donaciones'],
    ...r.resumen.por_tipo.map((x) => [ETIQUETA_TIPO[x.tipo], x.cantidad_donaciones]),
    [],
    ['Por estado', 'Donaciones'],
    ...r.resumen.por_estado.map((x) => [ETIQUETA_ESTADO[x.estado], x.cantidad_donaciones]),
    [],
    ['Dinero (por moneda)', 'Registrado', 'Asignado', 'Saldo'],
    ...r.resumen.economico.map((x) => [x.moneda, x.registrado, x.asignado, x.saldo]),
    [],
    ['Bienes (por unidad)', 'Unidad', 'Registrado', 'Asignado', 'Saldo'],
    ...r.resumen.bienes.map((x) => [ETIQUETA_TIPO[x.tipo], x.unidad, x.registrado, x.asignado, x.saldo]),
  ];
  XLSX.utils.book_append_sheet(libro, XLSX.utils.aoa_to_sheet(resumen), 'Resumen');

  const filas = r.filas.map((f) => ({
    Código: f.codigo,
    Fecha: formatoFecha(f.fecha_donacion),
    Tipo: ETIQUETA_TIPO[f.tipo_donacion],
    Categoría: f.categoria ?? '',
    Cantidad: f.cantidad,
    Unidad: (f.unidad ?? '').trim(),
    Asignado: f.cantidad_asignada ?? 0,
    Saldo: f.saldo ?? 0,
    Estado: ETIQUETA_ESTADO[f.estado],
    Modalidad: f.modalidad === 'PRESENCIAL' ? 'Presencial' : 'En línea',
    Donante: f.donante_nombre ?? '',
    Campaña: f.campana_id ?? '',
  }));
  XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(filas), 'Donaciones');
  XLSX.writeFile(libro, nombreArchivo('xlsx'));
};

export const exportarPdf = async (r: ReporteDonaciones): Promise<void> => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
  const ancho = doc.internal.pageSize.getWidth();
  const alto = doc.internal.pageSize.getHeight();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(17, 28, 45);
  doc.text('Reporte de donaciones', 12, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90, 100, 115);
  doc.text(`Total: ${r.resumen.total_donaciones} donaciones${r.truncado ? ' (listado truncado)' : ''}`, 12, 20);

  let y = 27;
  const resumenLineas: string[] = [
    ...r.resumen.economico.map(
      (x) => `Dinero ${x.moneda}: registrado ${formatoNumero(x.registrado)} · asignado ${formatoNumero(x.asignado)} · saldo ${formatoNumero(x.saldo)}`
    ),
    ...r.resumen.bienes.map(
      (x) => `${ETIQUETA_TIPO[x.tipo]} (${x.unidad}): registrado ${formatoNumero(x.registrado)} · asignado ${formatoNumero(x.asignado)} · saldo ${formatoNumero(x.saldo)}`
    ),
  ];
  doc.setTextColor(17, 28, 45);
  resumenLineas.forEach((l) => {
    doc.text(l, 12, y);
    y += 5;
  });
  y += 3;

  // Las columnas con `a: 'right'` usan x como borde derecho.
  const cols: { t: string; x: number; w: number; a?: 'right' }[] = [
    { t: 'Código', x: 12, w: 28 },
    { t: 'Fecha', x: 42, w: 20 },
    { t: 'Tipo', x: 64, w: 22 },
    { t: 'Categoría', x: 88, w: 40 },
    { t: 'Cantidad', x: 172, w: 40, a: 'right' },
    { t: 'Asignado', x: 196, w: 22, a: 'right' },
    { t: 'Saldo', x: 220, w: 22, a: 'right' },
    { t: 'Estado', x: 224, w: 28 },
    { t: 'Donante', x: 254, w: 33 },
  ];

  const cabecera = (): void => {
    doc.setFillColor(230, 238, 246);
    doc.rect(10, y - 4.5, ancho - 20, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(17, 28, 45);
    cols.forEach((c) => doc.text(c.t, c.x, y, { align: c.a }));
    y += 6;
    doc.setFont('helvetica', 'normal');
  };
  cabecera();

  r.filas.forEach((f) => {
    if (y > alto - 14) {
      doc.addPage();
      y = 16;
      cabecera();
    }
    const unidad = (f.unidad ?? '').trim();
    const celdas = [
      f.codigo,
      formatoFecha(f.fecha_donacion),
      ETIQUETA_TIPO[f.tipo_donacion],
      f.categoria ?? '—',
      `${formatoNumero(f.cantidad)} ${unidad}`,
      formatoNumero(f.cantidad_asignada ?? 0),
      formatoNumero(f.saldo ?? 0),
      ETIQUETA_ESTADO[f.estado],
      f.donante_nombre ?? '—',
    ];
    doc.setFontSize(8);
    doc.setTextColor(40, 55, 80);
    celdas.forEach((txt, i) => {
      const c = cols[i];
      const recortado = doc.splitTextToSize(String(txt), c.w)[0] as string;
      doc.text(recortado, c.x, y, { align: c.a });
    });
    y += 5.5;
  });

  doc.save(nombreArchivo('pdf'));
};
