import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LiquidityChartComponent } from './liquidity-chart.component';
import { DailyBalanceDto } from '../../../../core/models/dashboard.model';
import { CurrencyPipe } from '@angular/common';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('LiquidityChartComponent', () => {
  let component: LiquidityChartComponent;
  let fixture: ComponentFixture<LiquidityChartComponent>;

  const mockData: DailyBalanceDto[] = [
    { date: '2026-05-01', balance: 1000 },
    { date: '2026-05-15', balance: 2000 },
    { date: '2026-05-30', balance: 1500 }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LiquidityChartComponent,
        TranslocoTestingModule.forRoot({
          langs: {
            es: {
              dashboard: {
                no_data: 'No hay datos de saldos disponibles'
              }
            },
            en: {
              dashboard: {
                no_data: 'No daily balances data available'
              }
            }
          },
          translocoConfig: { availableLangs: ['en', 'es'], defaultLang: 'es' }
        })
      ],
      providers: [CurrencyPipe]
    }).compileComponents();

    fixture = TestBed.createComponent(LiquidityChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render SVG element', () => {
    component.data = mockData;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const svgEl = compiled.querySelector('svg');
    expect(svgEl).toBeTruthy();
  });

  it('should render path and area tags when data is provided', () => {
    component.data = mockData;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const paths = compiled.querySelectorAll('path');
    expect(paths.length).toBe(2);

    const circles = compiled.querySelectorAll('circle');
    expect(circles.length).toBe(3);
  });

  it('should display empty message when data is empty', () => {
    component.data = [];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const emptyText = compiled.querySelector('.empty-text');
    expect(emptyText?.textContent).toBe('No hay datos de saldos disponibles');
  });

  it('should show tooltip on point hover and hide on leave', () => {
    component.data = mockData;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    
    let tooltip = compiled.querySelector('.tooltip-badge');
    expect(tooltip).toBeNull();

    const circles = compiled.querySelectorAll('circle');
    expect(circles.length).toBe(3);

    const firstCircle = circles[0];
    firstCircle.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();

    tooltip = compiled.querySelector('.tooltip-badge');
    expect(tooltip).toBeTruthy();
    expect(tooltip?.textContent).toContain('1,000.00');

    firstCircle.dispatchEvent(new Event('mouseleave'));
    fixture.detectChanges();

    tooltip = compiled.querySelector('.tooltip-badge');
    expect(tooltip).toBeNull();
  });
});
