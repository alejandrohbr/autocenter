import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderInvoice, XmlProduct } from '../models/order.model';

@Component({
  selector: 'app-xml-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div class="border-b pb-4 mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Cargar Facturas XML</h2>
        <p class="text-gray-600 mt-2">Pedido: {{ orderFolio }}</p>
      </div>

      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Archivos XML de Facturas
          </label>
          <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
            <div class="space-y-1 text-center">
              <svg
                class="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <div class="flex text-sm text-gray-600">
                <label
                  class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Subir archivos XML</span>
                  <input
                    type="file"
                    accept=".xml"
                    multiple
                    (change)="onFilesSelected($event)"
                    class="sr-only"
                  />
                </label>
                <p class="pl-1">o arrastrar y soltar</p>
              </div>
              <p class="text-xs text-gray-500">Puedes seleccionar múltiples archivos XML</p>
            </div>
          </div>
        </div>

        <div *ngIf="isProcessing" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-700">Procesando archivos XML...</span>
        </div>

        <div *ngIf="processedInvoices.length > 0 && !isProcessing">
          <h3 class="text-lg font-semibold text-gray-800 mb-3">Facturas Procesadas ({{ processedInvoices.length }})</h3>
          <div class="space-y-4">
            <div *ngFor="let invoice of processedInvoices; let i = index" class="border rounded-lg p-4 bg-gray-50">
              <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900">Factura: {{ invoice.invoice_folio }}</h4>
                  <p class="text-sm text-gray-600 mt-1">
                    <span class="font-medium">Proveedor:</span> {{ invoice.proveedor }}
                  </p>
                  <p class="text-sm text-gray-600">
                    <span class="font-medium">RFC:</span> {{ invoice.rfc_proveedor }}
                  </p>
                  <p class="text-sm text-gray-600">
                    <span class="font-medium">Total:</span> \${{ invoice.total_amount.toFixed(2) }}
                  </p>
                  <p class="text-sm text-gray-600">
                    <span class="font-medium">Productos:</span> {{ invoice.xml_products?.length || 0 }}
                  </p>
                </div>
                <button
                  (click)="removeInvoice(i)"
                  class="text-red-600 hover:text-red-800 p-2"
                  title="Eliminar factura"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <button
                (click)="toggleProducts(i)"
                class="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {{ expandedInvoices[i] ? 'Ocultar' : 'Ver' }} productos
              </button>

              <div *ngIf="expandedInvoices[i]" class="mt-3 max-h-64 overflow-y-auto">
                <table class="w-full text-xs">
                  <thead class="bg-gray-200 sticky top-0">
                    <tr>
                      <th class="px-2 py-1 text-left">Descripción</th>
                      <th class="px-2 py-1 text-center">Cant.</th>
                      <th class="px-2 py-1 text-right">Precio</th>
                      <th class="px-2 py-1 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr *ngFor="let product of invoice.xml_products">
                      <td class="px-2 py-1">{{ product.descripcion }}</td>
                      <td class="px-2 py-1 text-center">{{ product.cantidad }}</td>
                      <td class="px-2 py-1 text-right">{{ product.precio.toFixed(2) }}</td>
                      <td class="px-2 py-1 text-right font-semibold">{{ product.total.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="errors.length > 0" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 class="font-semibold text-red-800 mb-2">Errores al procesar archivos:</h4>
          <ul class="list-disc list-inside space-y-1 text-sm text-red-700">
            <li *ngFor="let error of errors">{{ error }}</li>
          </ul>
        </div>
      </div>

      <div class="mt-6 pt-6 border-t flex gap-3">
        <button
          (click)="onCancel()"
          class="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          (click)="onSubmit()"
          [disabled]="processedInvoices.length === 0 || isProcessing"
          [class.opacity-50]="processedInvoices.length === 0 || isProcessing"
          [class.cursor-not-allowed]="processedInvoices.length === 0 || isProcessing"
          class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Guardar {{ processedInvoices.length }} Factura(s)
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class XmlUploadComponent {
  @Input() orderFolio: string = '';
  @Output() invoicesUploaded = new EventEmitter<OrderInvoice[]>();
  @Output() cancelled = new EventEmitter<void>();

  processedInvoices: OrderInvoice[] = [];
  expandedInvoices: boolean[] = [];
  errors: string[] = [];
  isProcessing: boolean = false;

  async onFilesSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    this.isProcessing = true;
    this.errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const invoice = await this.processXmlFile(file);
        this.processedInvoices.push(invoice);
        this.expandedInvoices.push(false);
      } catch (error: any) {
        this.errors.push(`Error en ${file.name}: ${error.message}`);
      }
    }

    this.isProcessing = false;
    event.target.value = '';
  }

  private async processXmlFile(file: File): Promise<OrderInvoice> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const xmlContent = e.target.result;
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

          const parserError = xmlDoc.querySelector('parsererror');
          if (parserError) {
            reject(new Error('XML inválido o mal formado'));
            return;
          }

          const emisor = xmlDoc.querySelector('Emisor');
          const proveedor = emisor?.getAttribute('Nombre') || emisor?.getAttribute('nombre') || 'Proveedor Desconocido';
          const rfcProveedor = emisor?.getAttribute('Rfc') || emisor?.getAttribute('rfc') || '';

          const comprobante = xmlDoc.querySelector('Comprobante') || xmlDoc.documentElement;
          const folio = comprobante?.getAttribute('Folio') || comprobante?.getAttribute('folio') || `SIN-FOLIO-${Date.now()}`;
          const total = parseFloat(comprobante?.getAttribute('Total') || comprobante?.getAttribute('total') || '0');

          const conceptos = xmlDoc.querySelectorAll('Concepto');
          const xmlProducts: XmlProduct[] = [];

          conceptos.forEach((concepto, index) => {
            const descripcion = concepto.getAttribute('Descripcion') || concepto.getAttribute('descripcion') || `Producto ${index + 1}`;
            const cantidad = parseFloat(concepto.getAttribute('Cantidad') || concepto.getAttribute('cantidad') || '1');
            const precio = parseFloat(concepto.getAttribute('ValorUnitario') || concepto.getAttribute('valorUnitario') || '0');
            const totalConcepto = parseFloat(concepto.getAttribute('Importe') || concepto.getAttribute('importe') || '0');
            const claveProdServ = concepto.getAttribute('ClaveProdServ') || concepto.getAttribute('claveProdServ') || '';
            const claveUnidad = concepto.getAttribute('ClaveUnidad') || concepto.getAttribute('claveUnidad') || '';
            const unidad = concepto.getAttribute('Unidad') || concepto.getAttribute('unidad') || 'PZ';

            xmlProducts.push({
              descripcion,
              cantidad,
              precio,
              total: totalConcepto,
              claveProdServ,
              claveUnidad,
              unidad,
              isValidated: false,
              isNew: true,
              proveedor
            });
          });

          const invoice: OrderInvoice = {
            invoice_folio: folio,
            xml_content: xmlContent,
            total_amount: total,
            items: xmlProducts,
            proveedor,
            rfc_proveedor: rfcProveedor,
            xml_products: xmlProducts,
            validados: 0,
            nuevos: xmlProducts.length
          };

          resolve(invoice);
        } catch (error: any) {
          reject(new Error(error.message || 'Error procesando XML'));
        }
      };

      reader.onerror = () => reject(new Error('Error leyendo el archivo'));
      reader.readAsText(file);
    });
  }

  toggleProducts(index: number) {
    this.expandedInvoices[index] = !this.expandedInvoices[index];
  }

  removeInvoice(index: number) {
    this.processedInvoices.splice(index, 1);
    this.expandedInvoices.splice(index, 1);
  }

  onSubmit() {
    if (this.processedInvoices.length === 0) return;
    this.invoicesUploaded.emit(this.processedInvoices);
  }

  onCancel() {
    this.cancelled.emit();
  }
}
