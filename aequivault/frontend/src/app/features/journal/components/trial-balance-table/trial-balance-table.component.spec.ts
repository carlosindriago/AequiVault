import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrialBalanceTableComponent } from './trial-balance-table.component';
import { AccountBalanceDto } from '../../../../core/models/report.model';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('TrialBalanceTableComponent', () => {
  let component: TrialBalanceTableComponent;
  let fixture: ComponentFixture<TrialBalanceTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TrialBalanceTableComponent,
        TranslocoTestingModule.forRoot({
          langs: {
            en: {
              reports: {
                no_data: 'No transaction data found for the selected period.',
                status: 'Status',
                balanced: 'Balanced',
                unbalanced: 'Unbalanced'
              }
            }
          },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TrialBalanceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate depth correctly based on dot notation', () => {
    expect(component.getDepth('1')).toBe(0);
    expect(component.getDepth('1.01')).toBe(1);
    expect(component.getDepth('1.1.02')).toBe(2);
    expect(component.getDepth('')).toBe(0);
  });

  it('should identify balancing correctly', () => {
    component.totalDebitSum = 500;
    component.totalCreditSum = 500;
    expect(component.isBalanced()).toBeTrue();

    component.totalDebitSum = 500;
    component.totalCreditSum = 499.99;
    expect(component.isBalanced()).toBeFalse();
  });

  it('should render empty state when balances are empty', () => {
    component.balances = [];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const emptyCell = compiled.querySelector('.empty-state');
    expect(emptyCell).toBeTruthy();
    expect(emptyCell?.textContent).toContain('No transaction data found');
  });

  it('should render balances and correct totals', () => {
    const mockBalances: AccountBalanceDto[] = [
      {
        groupCode: '1',
        groupName: 'Activos',
        accountCode: '1.01',
        accountName: 'Caja',
        totalDebit: 150.50,
        totalCredit: 0,
        netBalance: 150.50
      },
      {
        groupCode: '1',
        groupName: 'Activos',
        accountCode: '1.02',
        accountName: 'Bancos',
        totalDebit: 0,
        totalCredit: 150.50,
        netBalance: -150.50
      }
    ];

    component.balances = mockBalances;
    component.totalDebitSum = 150.50;
    component.totalCreditSum = 150.50;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll('.report-row');
    expect(rows.length).toBe(2);

    expect(rows[0].querySelector('.code-cell')?.textContent).toContain('1.01');
    expect(rows[0].querySelector('.name-cell')?.textContent).toContain('Caja');
    expect(rows[0].querySelector('.text-debit')?.textContent).toContain('150.50');

    const totalDebitCell = compiled.querySelector('.total-debit-val');
    const totalCreditCell = compiled.querySelector('.total-credit-val');
    expect(totalDebitCell?.textContent).toContain('150.50');
    expect(totalCreditCell?.textContent).toContain('150.50');

    const statusPill = compiled.querySelector('.status-pill');
    expect(statusPill?.classList.contains('balanced')).toBeTrue();
    expect(statusPill?.textContent).toContain('Status: Balanced');
  });
});
