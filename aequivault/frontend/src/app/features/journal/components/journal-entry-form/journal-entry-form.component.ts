import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-journal-entry-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-header-grid">
      <div class="form-group">
        <label for="date">Fecha Contable</label>
        <input 
          id="date" 
          type="date" 
          [ngModel]="date" 
          (ngModelChange)="dateChange.emit($event)" 
          required />
      </div>

      <div class="form-group">
        <label for="status">Estado del Asiento</label>
        <select 
          id="status" 
          [ngModel]="status" 
          (ngModelChange)="statusChange.emit($event)">
          <option value="DRAFT">Borrador (DRAFT)</option>
          <option value="POSTED">Asentado Firme (POSTED)</option>
        </select>
      </div>

      <div class="form-group" [ngStyle]="{'visibility': status === 'POSTED' ? 'visible' : 'hidden'}">
        <label for="entryNumber">Número de Asiento (POSTED)</label>
        <input 
          id="entryNumber" 
          type="text" 
          placeholder="Ej: JE-2026-0001"
          [ngModel]="entryNumber" 
          (ngModelChange)="entryNumberChange.emit($event)" />
      </div>

      <div class="form-group">
        <label for="currency">Divisa (Currency)</label>
        <select 
          id="currency" 
          [ngModel]="currency" 
          (ngModelChange)="currencyChange.emit($event)">
          <option value="USD">USD - Dólar Estadounidense</option>
          <option value="ARS">ARS - Peso Argentino</option>
          <option value="EUR">EUR - Euro</option>
          <option value="MXN">MXN - Peso Mexicano</option>
        </select>
      </div>
    </div>

    <div class="form-group full-width">
      <label for="description">Descripción / Concepto</label>
      <textarea 
        id="description" 
        rows="2" 
        placeholder="Escriba el motivo o descripción del asiento..."
        [ngModel]="description" 
        (ngModelChange)="descriptionChange.emit($event)">
      </textarea>
    </div>

    <div class="lines-section">
      <h3>Detalle del Asiento (Partidas)</h3>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .form-header-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
    }
    .full-width {
      margin-bottom: 1.5rem;
    }
    .lines-section {
      margin-top: 2.5rem;
    }
    .lines-section h3 {
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-glass);
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
    }
  `]
})
export class JournalEntryFormComponent {
  @Input({ required: true }) date: string = '';
  @Input({ required: true }) description: string = '';
  @Input({ required: true }) entryNumber: string = '';
  @Input({ required: true }) status: 'DRAFT' | 'POSTED' = 'DRAFT';
  @Input({ required: true }) currency: string = 'USD';

  @Output() dateChange = new EventEmitter<string>();
  @Output() descriptionChange = new EventEmitter<string>();
  @Output() entryNumberChange = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<'DRAFT' | 'POSTED'>();
  @Output() currencyChange = new EventEmitter<string>();
}
