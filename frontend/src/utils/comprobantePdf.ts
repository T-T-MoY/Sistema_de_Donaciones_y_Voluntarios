/**
 * ============================================================================
 * ARCHIVO: comprobantePdf.ts
 * Genera y descarga el comprobante de una donación (jsPDF, en el navegador).
 * El NÚMERO de comprobante lo emite el backend; aquí solo se presenta.
 * ============================================================================
 */

import type { DonacionDetalle } from '../types/donacion.types';
import {
  ETIQUETA_ESTADO,
  ETIQUETA_ESTADO_MATERIAL,
  ETIQUETA_METODO_PAGO,
  ETIQUETA_TIPO,
  formatoCantidad,
  formatoFechaHora,
  formatoFecha,
} from './donacionFormat';

export const descargarComprobante = async (d: DonacionDetalle, mostrarDonante = true): Promise<void> => {
  if (!d.comprobante) return;
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a5' });
  const ancho = doc.internal.pageSize.getWidth();
  const anulado = d.comprobante.estado === 'ANULADO';

  // Cabecera
  doc.setFillColor(17, 28, 45);
  doc.rect(0, 0, ancho, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('Donaciones y Voluntariados', 12, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Comprobante de donación', 12, 19);

  // Número y fecha
  doc.setTextColor(17, 28, 45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(d.comprobante.numero_comprobante, 12, 38);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90, 100, 115);
  doc.text(`Emitido: ${formatoFechaHora(d.comprobante.fecha_emision)}`, ancho - 12, 38, { align: 'right' });

  // Filas de datos
  const filas: [string, string][] = [['Código de donación', d.codigo]];
  if (mostrarDonante && d.donante_nombre) filas.push(['Donante', d.donante_nombre]);
  filas.push(['Tipo', ETIQUETA_TIPO[d.tipo_donacion]]);
  if (d.categoria) filas.push([d.tipo_donacion === 'ALIMENTO' ? 'Tipo de alimento' : 'Tipo de material', d.categoria]);
  if (d.nombre_item) filas.push(['Artículo', d.nombre_item]);

  if (d.tipo_donacion === 'ECONOMICO') {
    filas.push(['Monto', formatoCantidad(d.monto ?? d.cantidad, d.moneda_codigo)]);
    if (d.metodo_pago) filas.push(['Método de pago', ETIQUETA_METODO_PAGO[d.metodo_pago]]);
    if (d.referencia_pago) filas.push(['Referencia', d.referencia_pago]);
  } else {
    filas.push(['Cantidad', formatoCantidad(d.cantidad, d.unidad)]);
    if (d.fecha_vencimiento) filas.push(['Vence', formatoFecha(d.fecha_vencimiento)]);
    if (d.estado_material) filas.push(['Estado del material', ETIQUETA_ESTADO_MATERIAL[d.estado_material]]);
  }
  filas.push(['Fecha de donación', formatoFechaHora(d.fecha_donacion)]);
  filas.push(['Modalidad', d.modalidad === 'PRESENCIAL' ? 'Presencial' : 'En línea']);
  if (d.voluntario_nombre) filas.push(['Recibida por (voluntario)', d.voluntario_nombre]);
  filas.push(['Estado de la donación', ETIQUETA_ESTADO[d.estado]]);

  let y = 50;
  filas.forEach(([k, v]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(90, 100, 115);
    doc.text(k.toUpperCase(), 12, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(17, 28, 45);
    const lineas = doc.splitTextToSize(v, ancho - 24 - 52) as string[];
    doc.text(lineas, 64, y);
    y += Math.max(7, lineas.length * 5 + 2);
    doc.setDrawColor(220, 228, 238);
    doc.line(12, y - 4.2, ancho - 12, y - 4.2);
  });

  if (d.descripcion) {
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(90, 100, 115);
    doc.text('DESCRIPCIÓN', 12, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(17, 28, 45);
    doc.text(doc.splitTextToSize(d.descripcion, ancho - 24) as string[], 12, y + 5);
  }

  if (anulado) {
    doc.setTextColor(200, 40, 70);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(46);
    doc.text('ANULADO', ancho / 2, 125, { align: 'center', angle: 28 });
  }

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(120, 130, 145);
  doc.text('Gracias por tu solidaridad. Este comprobante respalda el registro de la donación.', ancho / 2, 200, {
    align: 'center',
  });

  doc.save(`${d.comprobante.numero_comprobante}.pdf`);
};
