import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiagnosticItem } from '../models/diagnostic.model';
import { DiagnosticItemAuthorization } from '../models/order.model';
import { getSeverityLabel, getSeverityBadgeColor } from '../models/diagnostic.model';

@Component({
  selector: 'app-authorization-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="border-b pb-4 mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Solicitud de Autorización</h2>
        <p class="text-gray-600 mt-2">Pedido: {{ orderFolio }}</p>
        <p class="text-gray-600">Cliente: {{ customerName }}</p>
      </div>

      <div class="space-y-4">
        <div
          *ngFor="let item of diagnosticItems; let i = index"
          class="border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span
                  [class]="getSeverityClass(item.severity)"
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                >
                  {{ getSeverityText(item.severity) }}
                </span>
                <span class="text-sm text-gray-500 font-medium">{{ item.category }}</span>
              </div>

              <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ item.item }}</h3>
              <p class="text-gray-600 mb-3">{{ item.description }}</p>

              <div *ngIf="item.notes" class="bg-gray-50 rounded p-3 mb-3">
                <p class="text-sm text-gray-700"><strong>Notas:</strong> {{ item.notes }}</p>
              </div>

              <div class="flex items-center justify-between">
                <div class="text-xl font-bold text-gray-900">
                  $ {{ item.estimatedCost?.toFixed(2) || '0.00' }}
                </div>

                <div class="flex items-center gap-4">
                  <label class="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      [(ngModel)]="item.isAuthorized"
                      (change)="onAuthorizationChange(item, true)"
                      [disabled]="!!item.isRejected"
                      class="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
                    />
                    <span class="text-sm font-medium transition-colors"
                          [class.text-green-700]="item.isAuthorized"
                          [class.text-gray-700]="!item.isAuthorized && !item.isRejected"
                          [class.text-gray-400]="item.isRejected">
                      {{ item.isAuthorized ? '✓ Autorizado' : 'Autorizar' }}
                    </span>
                  </label>

                  <label class="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      [(ngModel)]="item.isRejected"
                      (change)="onAuthorizationChange(item, false)"
                      [disabled]="!!item.isAuthorized"
                      class="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 disabled:opacity-50"
                    />
                    <span class="text-sm font-medium transition-colors"
                          [class.text-red-700]="item.isRejected"
                          [class.text-gray-700]="!item.isRejected && !item.isAuthorized"
                          [class.text-gray-400]="item.isAuthorized">
                      {{ item.isRejected ? '✗ No Autorizado' : 'No Autorizar' }}
                    </span>
                  </label>
                </div>
              </div>

              <div *ngIf="item.isRejected" class="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                <label class="block text-sm font-medium text-red-900 mb-2">
                  Razón del rechazo *
                </label>
                <textarea
                  [(ngModel)]="item.rejectionReason"
                  placeholder="Explique por qué no se autorizó este servicio (Ej: Muy costoso, lo haré después, no es necesario, etc.)"
                  rows="2"
                  class="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                ></textarea>
                <p class="text-xs text-red-600 mt-1">
                  ⚠️ Este servicio se registrará como venta perdida para análisis estadístico
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 pt-6 border-t">
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-gray-700">Total de servicios ofrecidos:</span>
            <span class="font-semibold">$ {{ getTotalEstimated().toFixed(2) }}</span>
          </div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-green-700">Total autorizado:</span>
            <span class="font-bold text-green-700">$ {{ getTotalAuthorized().toFixed(2) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-red-700">Total rechazado:</span>
            <span class="font-bold text-red-700">$ {{ getTotalRejected().toFixed(2) }}</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            (click)="onCancel()"
            class="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            (click)="onSubmit()"
            class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Confirmar Autorización
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AuthorizationRequestComponent {
  @Input() orderFolio: string = '';
  @Input() customerName: string = '';
  @Input() diagnosticItems: DiagnosticItem[] = [];
  @Output() authorizationSubmitted = new EventEmitter<DiagnosticItem[]>();
  @Output() cancelled = new EventEmitter<void>();

  getSeverityText(severity: string): string {
    return getSeverityLabel(severity as any);
  }

  getSeverityClass(severity: string): string {
    return getSeverityBadgeColor(severity as any);
  }

  onAuthorizationChange(item: DiagnosticItem, isAuthorized: boolean) {
    if (isAuthorized) {
      if (item.isAuthorized) {
        item.isRejected = false;
        item.rejectionReason = undefined;
        item.authorizationDate = new Date();
      }
    } else {
      if (item.isRejected) {
        item.isAuthorized = false;
        item.authorizationDate = new Date();
      }
    }
  }

  getTotalEstimated(): number {
    return this.diagnosticItems.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
  }

  getTotalAuthorized(): number {
    return this.diagnosticItems
      .filter(item => item.isAuthorized)
      .reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
  }

  getTotalRejected(): number {
    return this.diagnosticItems
      .filter(item => item.isRejected)
      .reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
  }

  onSubmit() {
    const hasRejectedWithoutReason = this.diagnosticItems.some(
      item => item.isRejected && !item.rejectionReason?.trim()
    );

    if (hasRejectedWithoutReason) {
      alert('Por favor proporcione la razón para todos los servicios no autorizados');
      return;
    }

    this.authorizationSubmitted.emit(this.diagnosticItems);
  }

  onCancel() {
    this.cancelled.emit();
  }
}
