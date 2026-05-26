import { Injectable, computed, signal } from '@angular/core';

export interface JournalLineForm {
  id: string;
  ledgerAccountId: string;
  amount: number | null;
  type: 'DEBIT' | 'CREDIT';
}

@Injectable({
  providedIn: 'root'
})
export class JournalEntryStateService {
  // State Signals
  lines = signal<JournalLineForm[]>([]);
  date = signal<string>(new Date().toISOString().substring(0, 10));
  description = signal<string>('');
  entryNumber = signal<string>('');
  status = signal<'DRAFT' | 'POSTED'>('DRAFT');
  currency = signal<string>('USD');

  // Computed Signals for math validation
  debitSum = computed(() => {
    return this.lines()
      .filter(l => l.type === 'DEBIT')
      .reduce((sum, l) => sum + (l.amount || 0), 0);
  });

  creditSum = computed(() => {
    return this.lines()
      .filter(l => l.type === 'CREDIT')
      .reduce((sum, l) => sum + (l.amount || 0), 0);
  });

  difference = computed(() => {
    const diff = this.debitSum() - this.creditSum();
    // Redondear a 4 decimales para evitar problemas de coma flotante de JS
    return Math.round(Math.abs(diff) * 10000) / 10000;
  });

  isBalanced = computed(() => {
    const d = this.debitSum();
    return this.lines().length >= 2 && d > 0 && this.difference() < 0.0001;
  });

  canSubmit = computed(() => {
    if (this.date() === '') {
      return false;
    }
    
    const currentLines = this.lines();
    if (currentLines.length < 2) {
      return false;
    }

    if (this.status() === 'DRAFT') {
      // Para borradores: al menos debe tener cuentas asignadas a las líneas creadas
      return currentLines.every(l => l.ledgerAccountId !== '');
    } else {
      // Para definitivos (POSTED): debe tener número de asiento, estar balanceado, y todas las líneas válidas
      const hasNumber = !!this.entryNumber() && this.entryNumber().trim() !== '';
      const allLinesValid = currentLines.every(l => 
        l.ledgerAccountId !== '' && l.amount !== null && l.amount > 0
      );
      return this.isBalanced() && hasNumber && allLinesValid;
    }
  });

  constructor() {
    this.reset();
  }

  reset() {
    this.date.set(new Date().toISOString().substring(0, 10));
    this.description.set('');
    this.entryNumber.set('');
    this.status.set('DRAFT');
    this.currency.set('USD');
    // Inicializar con dos líneas vacías por defecto
    this.lines.set([
      { id: crypto.randomUUID(), ledgerAccountId: '', amount: null, type: 'DEBIT' },
      { id: crypto.randomUUID(), ledgerAccountId: '', amount: null, type: 'CREDIT' }
    ]);
  }

  addLine() {
    this.lines.update(current => [
      ...current,
      { id: crypto.randomUUID(), ledgerAccountId: '', amount: null, type: 'DEBIT' }
    ]);
  }

  removeLine(id: string) {
    this.lines.update(current => current.filter(l => l.id !== id));
  }

  updateLine(id: string, field: keyof JournalLineForm, value: any) {
    this.lines.update(current =>
      current.map(l => (l.id === id ? { ...l, [field]: value } : l))
    );
  }
}
