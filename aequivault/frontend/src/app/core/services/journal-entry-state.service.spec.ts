import { TestBed } from '@angular/core/testing';
import { JournalEntryStateService, JournalLineForm } from './journal-entry-state.service';

describe('JournalEntryStateService', () => {
  let service: JournalEntryStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JournalEntryStateService);
  });

  it('should be created and initialized with defaults', () => {
    expect(service).toBeTruthy();
    expect(service.lines().length).toBe(2);
    expect(service.status()).toBe('DRAFT');
    expect(service.currency()).toBe('USD');
    expect(service.debitSum()).toBe(0);
    expect(service.creditSum()).toBe(0);
    expect(service.difference()).toBe(0);
    expect(service.isBalanced()).toBeFalse();
    expect(service.canSubmit()).toBeFalse(); // No accounts assigned yet
  });

  it('should add and remove lines', () => {
    service.addLine();
    expect(service.lines().length).toBe(3);

    const targetId = service.lines()[2].id;
    service.removeLine(targetId);
    expect(service.lines().length).toBe(2);
  });

  it('should update line properties and recalculate sums', () => {
    const lines = service.lines();
    const debitLineId = lines[0].id;
    const creditLineId = lines[1].id;

    service.updateLine(debitLineId, 'amount', 1500.50);
    service.updateLine(debitLineId, 'ledgerAccountId', 'acc-1');
    
    service.updateLine(creditLineId, 'amount', 1500.50);
    service.updateLine(creditLineId, 'ledgerAccountId', 'acc-2');

    expect(service.debitSum()).toBe(1500.50);
    expect(service.creditSum()).toBe(1500.50);
    expect(service.difference()).toBe(0);
    expect(service.isBalanced()).toBeTrue();
  });

  it('should calculate difference and balance correctly avoiding JS floating point errors', () => {
    const lines = service.lines();
    const debitLineId = lines[0].id;
    const creditLineId = lines[1].id;

    // 0.1 + 0.2 = 0.30000000000000004 in JS
    service.updateLine(debitLineId, 'amount', 0.1);
    service.updateLine(debitLineId, 'ledgerAccountId', 'acc-1');

    service.updateLine(creditLineId, 'amount', 0.2);
    service.updateLine(creditLineId, 'ledgerAccountId', 'acc-2');

    // Add another line to balance it
    service.addLine();
    const newLine = service.lines()[2];
    service.updateLine(newLine.id, 'amount', 0.1);
    service.updateLine(newLine.id, 'type', 'DEBIT');
    service.updateLine(newLine.id, 'ledgerAccountId', 'acc-3');

    // Debits = 0.1 + 0.1 = 0.2
    // Credits = 0.2
    expect(service.debitSum()).toBeCloseTo(0.2, 5);
    expect(service.creditSum()).toBe(0.2);
    expect(service.difference()).toBe(0);
    expect(service.isBalanced()).toBeTrue();
  });

  it('should control submission based on DRAFT/POSTED states', () => {
    const lines = service.lines();
    const debitLineId = lines[0].id;
    const creditLineId = lines[1].id;

    // 1. Assign accounts to lines for DRAFT state
    service.updateLine(debitLineId, 'ledgerAccountId', 'acc-1');
    service.updateLine(creditLineId, 'ledgerAccountId', 'acc-2');

    // In DRAFT status, once accounts are assigned, canSubmit should be true (amount is not mandatory for draft)
    service.status.set('DRAFT');
    expect(service.canSubmit()).toBeTrue();

    // 2. Change status to POSTED
    service.status.set('POSTED');
    // Without entryNumber and balanced amounts, cannot submit
    expect(service.canSubmit()).toBeFalse();

    // Set balanced amounts but no entryNumber
    service.updateLine(debitLineId, 'amount', 500);
    service.updateLine(creditLineId, 'amount', 500);
    expect(service.isBalanced()).toBeTrue();
    expect(service.canSubmit()).toBeFalse(); // missing entryNumber

    // Set entryNumber
    service.entryNumber.set('JE-2026-0001');
    expect(service.canSubmit()).toBeTrue();

    // Change date to empty
    service.date.set('');
    expect(service.canSubmit()).toBeFalse();
  });
});
