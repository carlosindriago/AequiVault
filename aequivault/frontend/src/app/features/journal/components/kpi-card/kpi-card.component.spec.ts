import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiCardComponent } from './kpi-card.component';
import { CurrencyPipe } from '@angular/common';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('KpiCardComponent', () => {
  let component: KpiCardComponent;
  let fixture: ComponentFixture<KpiCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        KpiCardComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, es: {} },
          translocoConfig: { availableLangs: ['en', 'es'], defaultLang: 'en' },
        })
      ],
      providers: [CurrencyPipe]
    }).compileComponents();

    fixture = TestBed.createComponent(KpiCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title and formatted value', () => {
    component.title = 'Total Activos';
    component.value = 12500.5;
    component.currency = 'USD';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    
    const titleEl = compiled.querySelector('.card-title');
    expect(titleEl?.textContent?.trim()).toBe('Total Activos');

    const valueEl = compiled.querySelector('.card-value');
    expect(valueEl?.textContent).toContain('12,500.50');

    const badgeEl = compiled.querySelector('.currency-badge');
    expect(badgeEl?.textContent?.trim()).toBe('USD');
  });

  it('should apply class depending on type input', () => {
    component.title = 'Total Pasivos';
    component.value = 4500;
    component.type = 'danger';
    fixture.detectChanges();

    const cardEl = fixture.nativeElement.querySelector('.kpi-card');
    expect(cardEl.classList.contains('danger')).toBeTrue();
  });

  it('should render trend footer when trendValue is provided', () => {
    component.title = 'Patrimonio';
    component.value = 8000;
    component.trendValue = 0.125; // 12.5%
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const footerEl = compiled.querySelector('.card-footer');
    expect(footerEl).toBeTruthy();
    expect(footerEl?.classList.contains('trend-up')).toBeTrue();
    expect(footerEl?.textContent).toContain('12.5%');

    // Test negative trend
    component.trendValue = -0.05;
    fixture.detectChanges();
    
    const updatedFooterEl = compiled.querySelector('.card-footer');
    expect(updatedFooterEl?.classList.contains('trend-down')).toBeTrue();
    expect(updatedFooterEl?.textContent).toContain('5.0%');
  });
});
