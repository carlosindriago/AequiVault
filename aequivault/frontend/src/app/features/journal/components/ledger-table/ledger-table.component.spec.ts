import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LedgerTableComponent } from './ledger-table.component';
import { LedgerReportDto } from '../../../../core/models/ledger.model';
import { By } from '@angular/platform-browser';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('LedgerTableComponent', () => {
  let component: LedgerTableComponent;
  let fixture: ComponentFixture<LedgerTableComponent>;

  const mockReport: LedgerReportDto = {
    accountId: 'a1',
    accountCode: '1.01',
    accountName: 'Caja Chica',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    initialBalance: 300.0,
    finalBalance: 400.0,
    lines: [
      {
        date: '2026-05-25',
        entryId: 'e1',
        entryNumber: 'JE-2026-0001',
        description: 'Cobro a Cliente',
        debit: 150.0,
        credit: 0.0,
        runningBalance: 450.0
      },
      {
        date: '2026-06-15',
        entryId: 'e2',
        entryNumber: 'JE-2026-0002',
        description: 'Pago de Gasto',
        debit: 0.0,
        credit: 50.0,
        runningBalance: 400.0
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LedgerTableComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, es: {} },
          translocoConfig: {
            availableLangs: ['en', 'es'],
            defaultLang: 'en',
          },
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LedgerTableComponent);
    component = fixture.componentInstance;
    component.report = mockReport;
    component.currency = 'USD';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render headers and account summary info', () => {
    const summaryValue = fixture.debugElement.query(By.css('.account-summary-header strong')).nativeElement.textContent;
    expect(summaryValue).toContain('Caja Chica');
    expect(summaryValue).toContain('1.01');
  });

  it('should render the correct number of rows', () => {
    const rows = fixture.debugElement.queryAll(By.css('.ledger-row'));
    expect(rows.length).toBe(2);

    const firstRowCells = rows[0].queryAll(By.css('td'));
    expect(firstRowCells[1].nativeElement.textContent).toContain('JE-2026-0001');
    expect(firstRowCells[2].nativeElement.textContent).toContain('Cobro a Cliente');
  });

  it('should render empty state if lines are empty', () => {
    component.report = {
      ...mockReport,
      lines: []
    };
    fixture.detectChanges();

    const emptyCell = fixture.debugElement.query(By.css('.empty-state'));
    expect(emptyCell).toBeTruthy();
  });
});
