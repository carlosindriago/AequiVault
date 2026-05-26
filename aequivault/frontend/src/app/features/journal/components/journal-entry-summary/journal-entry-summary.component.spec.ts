import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JournalEntrySummaryComponent } from './journal-entry-summary.component';
import { By } from '@angular/platform-browser';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('JournalEntrySummaryComponent', () => {
  let component: JournalEntrySummaryComponent;
  let fixture: ComponentFixture<JournalEntrySummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        JournalEntrySummaryComponent,
        TranslocoTestingModule.forRoot({
          langs: {
            es: {
              journal: {
                total_debit: 'Total Debe (Debits)',
                total_credit: 'Total Haber (Credits)',
                diff: 'Diferencia',
                balanced_title: 'Asiento Balanceado',
                balanced_desc: 'La partida doble se cumple perfectamente. Listo para asentar.',
                unbalanced_title: 'Asiento Desbalanceado',
                unbalanced_desc: 'El Debe y el Haber no coinciden. La diferencia debe ser 0.00 para asentar en firme.'
              }
            }
          },
          translocoConfig: {
            availableLangs: ['es'],
            defaultLang: 'es',
          },
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(JournalEntrySummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display total debits, credits, and difference with correct format', () => {
    component.debitSum = 1250.50;
    component.creditSum = 1200.00;
    component.difference = 50.50;
    component.isBalanced = false;
    component.currency = 'USD';
    
    fixture.detectChanges();

    const valueElements = fixture.debugElement.queryAll(By.css('.total-box .value'));
    expect(valueElements[0].nativeElement.textContent).toContain('$1,250.50');
    expect(valueElements[1].nativeElement.textContent).toContain('$1,200.00');
    expect(valueElements[2].nativeElement.textContent).toContain('$50.50');
  });

  it('should show balanced panel when isBalanced is true', () => {
    component.debitSum = 1000;
    component.creditSum = 1000;
    component.difference = 0;
    component.isBalanced = true;
    
    fixture.detectChanges();

    const statusPanel = fixture.debugElement.query(By.css('.status-panel'));
    expect(statusPanel.nativeElement.classList).toContain('status-balanced');
    expect(statusPanel.nativeElement.textContent).toContain('Asiento Balanceado');
  });

  it('should show unbalanced panel when isBalanced is false', () => {
    component.debitSum = 1000;
    component.creditSum = 900;
    component.difference = 100;
    component.isBalanced = false;
    
    fixture.detectChanges();

    const statusPanel = fixture.debugElement.query(By.css('.status-panel'));
    expect(statusPanel.nativeElement.classList).toContain('status-unbalanced');
    expect(statusPanel.nativeElement.textContent).toContain('Asiento Desbalanceado');
  });
});
