import { Injectable } from '@angular/core';
import { Order } from '../models/order.model';
import { Customer } from '../models/customer.model';
import { DiagnosticItem } from '../models/diagnostic.model';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {
  constructor() {}

  generateDiagnosticBudgetHTML(order: Order, customer: Customer): string {
    const today = new Date().toLocaleDateString('es-MX');
    const diagnostic = order.diagnostic;
    const vehicleInfo = diagnostic?.vehicleInfo || {};

    let productosRows = '';
    if (order.productos && order.productos.length > 0) {
      order.productos.forEach((producto, idx) => {
        productosRows += `
          <tr>
            <td style="border: 1px solid #ddd; padding: 4px; text-align: center; font-size: 10px;">${idx + 1}</td>
            <td style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">${producto.descripcion}</td>
            <td style="border: 1px solid #ddd; padding: 4px; text-align: center; font-size: 10px;">${producto.cantidad}</td>
            <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px;">$${producto.precio.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px;">$${(producto.precio * producto.cantidad).toFixed(2)}</td>
          </tr>
        `;
      });
    }

    let serviciosRows = '';
    if (order.servicios && order.servicios.length > 0) {
      order.servicios.forEach((servicio, idx) => {
        serviciosRows += `
          <tr>
            <td style="border: 1px solid #ddd; padding: 4px; text-align: center; font-size: 10px;">${idx + 1}</td>
            <td style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">
              <strong>${servicio.nombre}</strong><br>
              <span style="font-size: 9px;">${servicio.descripcion}</span>
            </td>
            <td style="border: 1px solid #ddd; padding: 4px; text-align: center; font-size: 10px;">1</td>
            <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px;">$${servicio.precio.toFixed(2)}</td>
            <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px;">$${servicio.precio.toFixed(2)}</td>
          </tr>
        `;
      });
    }

    let diagnosticoRows = '';
    if (diagnostic?.items && diagnostic.items.length > 0) {
      diagnostic.items.forEach((item, idx) => {
        const severityLabel = item.severity === 'urgent' ? '⚠️ URGENTE' :
                             item.severity === 'recommended' ? '📋 RECOMENDADO' :
                             '✓ OK';
        const severityColor = item.severity === 'urgent' ? '#dc2626' :
                             item.severity === 'recommended' ? '#f59e0b' :
                             '#10b981';

        diagnosticoRows += `
          <tr>
            <td style="border: 1px solid #ddd; padding: 4px; text-align: center; font-size: 10px;">${idx + 1}</td>
            <td style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">
              <strong>${item.item}</strong> (${item.category})<br>
              <span style="font-size: 9px;">${item.description}</span><br>
              <span style="color: ${severityColor}; font-weight: bold; font-size: 9px;">${severityLabel}</span>
            </td>
            <td style="border: 1px solid #ddd; padding: 4px; text-align: right; font-size: 10px;">$${(item.estimatedCost || 0).toFixed(2)}</td>
          </tr>
        `;
      });
    }

    const subtotalProductos = order.productos?.reduce((sum, p) => sum + (p.precio * p.cantidad), 0) || 0;
    const subtotalServicios = order.servicios?.reduce((sum, s) => sum + s.precio, 0) || 0;
    const subtotalDiagnostico = diagnostic?.items?.reduce((sum, item) => sum + (item.estimatedCost || 0), 0) || 0;
    const total = subtotalProductos + subtotalServicios + subtotalDiagnostico;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Presupuesto - ${order.folio}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            padding: 15px;
            background: white;
            font-size: 11px;
          }
          .header {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
            padding: 12px;
            text-align: center;
            margin-bottom: 10px;
            border-radius: 4px;
          }
          .header h1 {
            margin: 0;
            font-size: 22px;
            letter-spacing: 2px;
          }
          .header h2 {
            margin: 3px 0 0 0;
            font-size: 12px;
            font-weight: normal;
            opacity: 0.9;
          }
          .folio-date {
            text-align: right;
            margin-bottom: 8px;
            font-size: 10px;
            color: #666;
          }
          .info-section {
            background: #f3f4f6;
            padding: 8px;
            margin-bottom: 8px;
            border-radius: 4px;
            border-left: 3px solid #3b82f6;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4px;
          }
          .info-item {
            font-size: 10px;
            padding: 2px 0;
          }
          .info-label {
            font-weight: bold;
            color: #1e40af;
            display: inline-block;
            width: 80px;
          }
          .section-title {
            background: #1e40af;
            color: white;
            padding: 6px 10px;
            margin: 10px 0 5px 0;
            font-size: 11px;
            font-weight: bold;
            border-radius: 3px;
            text-transform: uppercase;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
          }
          th {
            background: #3b82f6;
            color: white;
            padding: 5px;
            text-align: left;
            border: 1px solid #2563eb;
            font-size: 10px;
          }
          .totals-box {
            margin-left: auto;
            width: 250px;
            border: 2px solid #1e40af;
            border-radius: 4px;
            overflow: hidden;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 10px;
            border-bottom: 1px solid #ddd;
            font-size: 11px;
          }
          .total-final {
            background: #1e40af;
            color: white;
            font-weight: bold;
            font-size: 14px;
            padding: 8px 10px;
            display: flex;
            justify-content: space-between;
          }
          .signatures {
            display: flex;
            margin-top: 15px;
            gap: 10px;
          }
          .signature-box {
            flex: 1;
            border: 1px solid #333;
            padding: 30px 8px 8px 8px;
            text-align: center;
            border-radius: 3px;
          }
          .signature-label {
            font-weight: bold;
            font-size: 8px;
            line-height: 1.2;
          }
          .notes-section {
            margin-top: 8px;
            padding: 8px;
            background: #fef3c7;
            border-left: 3px solid #f59e0b;
            border-radius: 3px;
            font-size: 9px;
          }
          @media print {
            body {
              padding: 10px;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 15px;">
            <img src="/assets/searsicono.png" alt="Sears" style="height: 50px; width: auto;">
            <div style="flex: 1; text-align: center;">
              <img src="/assets/AUTOCENTER.jpg" alt="Auto Center" style="height: 50px; width: auto; margin-bottom: 5px;">
              <h1>AUTO CENTER</h1>
              <h2>Manejamos Confianza</h2>
              ${order.tienda ? `<h2 style="margin-top: 5px; font-weight: bold;">${order.tienda}</h2>` : ''}
            </div>
            <img src="/assets/searsicono.png" alt="Sears" style="height: 50px; width: auto;">
          </div>
        </div>

        <div class="folio-date">
          <strong>Fecha:</strong> ${today} | <strong>Folio:</strong> ${order.folio}
        </div>

        <!-- Información del Cliente -->
        <div class="info-section">
          <div style="font-weight: bold; color: #1e40af; margin-bottom: 4px; font-size: 11px;">DATOS DEL CLIENTE</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Nombre:</span>
              <span>${customer.nombre_completo}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Teléfono:</span>
              <span>${customer.telefono}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Dirección:</span>
              <span>${customer.direccion || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Ciudad:</span>
              <span>${customer.ciudad || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Tienda:</span>
              <span>${order.tienda}</span>
            </div>
            <div class="info-item">
              <span class="info-label">División:</span>
              <span>${order.division}</span>
            </div>
          </div>
        </div>

        <!-- Información del Vehículo -->
        <div class="info-section">
          <div style="font-weight: bold; color: #1e40af; margin-bottom: 4px; font-size: 11px;">DATOS DEL VEHÍCULO</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Marca:</span>
              <span>${vehicleInfo.brand || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Modelo:</span>
              <span>${vehicleInfo.model || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Año:</span>
              <span>${vehicleInfo.year || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Placas:</span>
              <span>${vehicleInfo.plate || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Kilometraje:</span>
              <span>${vehicleInfo.mileage || 'N/A'} km</span>
            </div>
            <div class="info-item">
              <span class="info-label">Color:</span>
              <span>${vehicleInfo.color || 'N/A'}</span>
            </div>
          </div>
        </div>

        ${productosRows ? `
          <div class="section-title">✓ Refacciones Solicitadas</div>
          <table>
            <thead>
              <tr>
                <th style="width: 30px; text-align: center;">#</th>
                <th>DESCRIPCIÓN</th>
                <th style="width: 50px; text-align: center;">CANT.</th>
                <th style="width: 80px; text-align: right;">PRECIO UNIT.</th>
                <th style="width: 80px; text-align: right;">IMPORTE TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${productosRows}
            </tbody>
          </table>
        ` : ''}

        ${serviciosRows ? `
          <div class="section-title">🔧 Mano de Obra Autorizada</div>
          <table>
            <thead>
              <tr>
                <th style="width: 30px; text-align: center;">#</th>
                <th>MANO DE OBRA</th>
                <th style="width: 50px; text-align: center;">CANT.</th>
                <th style="width: 80px; text-align: right;">PRECIO</th>
                <th style="width: 80px; text-align: right;">IMPORTE TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${serviciosRows}
            </tbody>
          </table>
        ` : ''}

        ${diagnosticoRows ? `
          <div class="section-title">🔍 Servicios Sugeridos</div>
          <table>
            <thead>
              <tr>
                <th style="width: 30px; text-align: center;">#</th>
                <th>HALLAZGO Y RECOMENDACIÓN</th>
                <th style="width: 100px; text-align: right;">COSTO ESTIMADO</th>
              </tr>
            </thead>
            <tbody>
              ${diagnosticoRows}
            </tbody>
          </table>
        ` : ''}

        <div class="totals-box">
          ${subtotalProductos > 0 ? `
            <div class="total-row">
              <span>Subtotal Refacciones:</span>
              <span>$${subtotalProductos.toFixed(2)}</span>
            </div>
          ` : ''}
          ${subtotalServicios > 0 ? `
            <div class="total-row">
              <span>Subtotal Mano de Obra:</span>
              <span>$${subtotalServicios.toFixed(2)}</span>
            </div>
          ` : ''}
          ${subtotalDiagnostico > 0 ? `
            <div class="total-row">
              <span>Subtotal Diagnóstico:</span>
              <span>$${subtotalDiagnostico.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="total-final">
            <span>COSTO TOTAL:</span>
            <span>$${total.toFixed(2)}</span>
          </div>
        </div>

        <div class="signatures">
          <div class="signature-box">
            <div class="signature-label">AUTORIZO EL PRESUPUESTO</div>
          </div>
          <div class="signature-box">
            <div class="signature-label">AUTORIZO TRABAJOS BAJO MI RESPONSABILIDAD</div>
          </div>
          <div class="signature-box">
            <div class="signature-label">RECIBÍ A SATISFACCIÓN</div>
          </div>
        </div>

        <div class="notes-section">
          <strong>NOTA:</strong> Los precios pueden variar según disponibilidad, sin previo aviso.
        </div>
      </body>
      </html>
    `;
  }

  printDiagnosticBudget(order: Order, customer: Customer): void {
    const html = this.generateDiagnosticBudgetHTML(order, customer);
    const printWindow = window.open('', '_blank');

    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  }

  async downloadDiagnosticBudgetPDF(order: Order, customer: Customer): Promise<void> {
    try {
      const element = document.createElement('div');
      element.innerHTML = this.generateDiagnosticBudgetHTML(order, customer);
      element.style.width = '210mm';
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      document.body.appendChild(element);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 794,
        windowWidth: 794
      });

      document.body.removeChild(element);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
      });

      const imgWidth = 210;
      const pageHeight = 279;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Presupuesto-${order.folio}.pdf`);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor intente nuevamente o use la opción de imprimir.');
    }
  }
}
