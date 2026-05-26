import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JournalLineTableComponent } from './journal-line-table.component';
import { JournalLineForm } from '../../../../core/services/journal-entry-state.service';
import { LedgerAccountDto } from '../../../../core/models/ledger-account.model';
import { By } from '@angular/platform-browser';

describe('JournalLineTableComponent', () => {
  let component: JournalLineTableComponent;
  let fixture: ComponentFixture<JournalLineTableComponent>;

  const mockAccounts: LedgerAccountDto[] = [
    { id: '1', code: '1.1.01', name: 'Caja', groupId: 'g1', type: 'ASSET' },
    { id: '2', code: '2.1.01', name: 'Proveedores', groupId: 'g2', type: 'LIABILITY' }
  ];

  const mockLines: JournalLineForm[] = [
    { id: 'l-1', ledgerAccountId: '1', amount: 100, type: 'DEBIT' },
    { id: 'l-2', ledgerAccountId: '2', amount: 100, type: 'CREDIT' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalLineTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(JournalLineTableComponent);
    component = fixture.componentInstance;
    component.lines = [...mockLines];
    component.accounts = mockAccounts;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the correct number of rows', () => {
    const rows = fixture.debugElement.queryAll(By.css('.line-row'));
    expect(rows.length).toBe(2);
  });

  it('should emit addLine when clicking the add button', () => {
    spyOn(component.addLine, 'emit');
    const addButton = fixture.debugElement.query(By.css('.btn-add-line'));
    addButton.triggerEventHandler('click', null);
    expect(component.addLine.emit).toHaveBeenCalled();
  });

  it('should emit removeLine when clicking the delete button', () => {
    spyOn(component.removeLine, 'emit');
    // Delete button only renders when lines.length > 2. So let's add one more line.
    component.lines = [
      ...mockLines,
      { id: 'l-3', ledgerAccountId: '', amount: null, type: 'DEBIT' }
    ];
    fixture.detectChanges();

    const deleteButtons = fixture.debugElement.queryAll(By.css('.btn-delete'));
    expect(deleteButtons.length).toBe(3);

    deleteButtons[0].triggerEventHandler('click', null);
    expect(component.removeLine.emit).toHaveBeenCalledWith('l-1');
  });

  it('should emit updateLine when inputs or selects change', () => {
    spyOn(component.updateLine, 'emit');
    
    // Test account select change
    const selects = fixture.debugElement.queryAll(By.css('.select-account'));
    selects[0].triggerEventHandler('ngModelChange', '2');
    expect(component.updateLine.emit).toHaveBeenCalledWith({ id: 'l-1', field: 'ledgerAccountId', value: '2' });

    // Test debit amount input change
    const amountInputs = fixture.debugElement.queryAll(By.css('.input-amount'));
    // Index 0 is debit input of line 1, index 1 is credit input of line 1
    amountInputs[0].triggerEventHandler('ngModelChange', '250.75');
    expect(component.updateLine.emit).toHaveBeenCalledWith({ id: 'l-1', field: 'type', value: 'DEBIT' });
    expect(component.updateLine.emit).toHaveBeenCalledWith({ id: 'l-1', field: 'amount', value: 250.75 });
  });
});
