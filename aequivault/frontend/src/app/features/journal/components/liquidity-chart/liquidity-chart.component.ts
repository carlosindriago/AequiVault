import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { DailyBalanceDto } from '../../../../core/models/dashboard.model';
import { TranslationStateService } from '../../../../core/services/translation-state.service';

@Component({
  selector: 'app-liquidity-chart',
  standalone: true,
  imports: [CommonModule, TranslocoPipe],
  providers: [CurrencyPipe],
  template: `
    <div class="chart-container glass-panel">
      <div class="chart-header">
        <h4>{{ 'dashboard.trend_title' | transloco }}</h4>
        @if (hoveredPoint()) {
          <div class="tooltip-badge">
            <span class="tooltip-date">{{ formatTooltipDate(hoveredPoint()?.date) }}</span>:
            <strong class="tooltip-value">{{ hoveredPoint()?.balance | currency: currency }}</strong>
          </div>
        } @else {
          <span class="chart-subtitle">{{ 'dashboard.trend_subtitle' | transloco }}</span>
        }
      </div>

      <div class="svg-wrapper">
        <svg viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet" class="liquidity-svg">
          <defs>
            <!-- Gradient for Area Fill -->
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.3" />
              <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0.0" />
            </linearGradient>
            
            <!-- Gradient for Line -->
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="var(--color-primary)" />
              <stop offset="100%" stop-color="var(--color-success)" />
            </linearGradient>
          </defs>

          <!-- Horizontal Grid Lines -->
          @for (tick of yTicks(); track tick.value) {
            <g class="grid-line-group">
              <line x1="60" [attr.y1]="tick.y" x2="780" [attr.y2]="tick.y" class="grid-line" />
              <text x="50" [attr.y]="tick.y + 4" class="y-axis-label">{{ tick.label }}</text>
            </g>
          }

          <!-- Empty State or Data Rendering -->
          @if (chartPoints().length === 0) {
            <text x="400" y="150" class="empty-text">{{ 'dashboard.no_data' | transloco }}</text>
          } @else {
            <!-- Area Path -->
            <path [attr.d]="areaPath()" fill="url(#areaGradient)" />

            <!-- Line Path -->
            <path [attr.d]="linePath()" fill="none" stroke="url(#lineGradient)" stroke-width="3" stroke-linecap="round" />

            <!-- Data Point Circles -->
            @for (pt of chartPoints(); track pt.item.date; let i = $index) {
              <circle 
                [attr.cx]="pt.x" 
                [attr.cy]="pt.y" 
                [attr.r]="hoveredIndex() === i ? 6 : 4" 
                [attr.class]="hoveredIndex() === i ? 'data-point-hovered' : 'data-point'" 
                (mouseenter)="onPointHover(pt.item, i)"
                (mouseleave)="onPointLeave()"
              />
            }
          }

          <!-- X Axis labels -->
          @for (tick of xTicks(); track tick.index) {
            <text [attr.x]="tick.x" y="285" class="x-axis-label">{{ tick.label }}</text>
          }
        </svg>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      padding: 1.5rem;
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1.5px solid var(--border-glass);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-premium);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 28px;
    }
    .chart-header h4 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .chart-subtitle {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    .tooltip-badge {
      font-size: 0.85rem;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      padding: 0.2rem 0.65rem;
      border-radius: 12px;
      color: var(--text-primary);
      animation: fadeIn 0.15s ease-out;
    }
    .tooltip-value {
      color: var(--color-success);
    }
    .svg-wrapper {
      width: 100%;
      position: relative;
    }
    .liquidity-svg {
      width: 100%;
      height: auto;
      overflow: visible;
    }
    .grid-line {
      stroke: rgba(255, 255, 255, 0.04);
      stroke-dasharray: 4 4;
    }
    .y-axis-label {
      fill: var(--text-muted);
      font-size: 0.75rem;
      font-family: monospace;
      text-anchor: end;
      }
    .x-axis-label {
      fill: var(--text-muted);
      font-size: 0.75rem;
      text-anchor: middle;
    }
    .empty-text {
      fill: var(--text-muted);
      font-size: 1rem;
      text-anchor: middle;
      font-style: italic;
    }
    .data-point {
      fill: var(--bg-primary);
      stroke: var(--color-primary);
      stroke-width: 2px;
      cursor: pointer;
      transition: r 0.15s ease, stroke-width 0.15s ease, fill 0.15s ease;
    }
    .data-point-hovered {
      fill: var(--color-success);
      stroke: #ffffff;
      stroke-width: 3px;
      cursor: pointer;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(2px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class LiquidityChartComponent {
  private _data = signal<DailyBalanceDto[]>([]);
  @Input({ required: true }) set data(value: DailyBalanceDto[]) {
    this._data.set(value || []);
  }
  get data(): DailyBalanceDto[] {
    return this._data();
  }

  @Input() currency: string = 'USD';

  hoveredPoint = signal<DailyBalanceDto | null>(null);
  hoveredIndex = signal<number | null>(null);

  // SVG dimensions
  private readonly width = 800;
  private readonly height = 300;
  private readonly paddingLeft = 60;
  private readonly paddingRight = 20;
  private readonly paddingTop = 30;
  private readonly paddingBottom = 50;

  private readonly plotWidth = this.width - this.paddingLeft - this.paddingRight;
  private readonly plotHeight = this.height - this.paddingTop - this.paddingBottom;

  constructor(private translationState: TranslationStateService) {}

  // Compute boundaries
  private bounds = computed(() => {
    const list = this._data();
    if (list.length === 0) {
      return { min: 0, max: 1000 };
    }
    const balances = list.map(d => d.balance);
    let min = Math.min(...balances);
    let max = Math.max(...balances);
    
    // Add 10% padding
    const diff = max - min;
    if (diff === 0) {
      min = min - 1000;
      max = max + 1000;
    } else {
      min = min - diff * 0.1;
      max = max + diff * 0.1;
    }
    return { min, max };
  });

  // Calculate points
  chartPoints = computed(() => {
    const list = this._data();
    const N = list.length;
    if (N === 0) return [];
    
    const { min, max } = this.bounds();
    const range = max - min;

    return list.map((item, i) => {
      const x = this.paddingLeft + (i / (N - 1)) * this.plotWidth;
      const y = this.height - this.paddingBottom - ((item.balance - min) / range) * this.plotHeight;
      return { x, y, item };
    });
  });

  // Calculate line path
  linePath = computed(() => {
    const pts = this.chartPoints();
    if (pts.length === 0) return '';
    return pts.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
  });

  // Calculate area path
  areaPath = computed(() => {
    const pts = this.chartPoints();
    if (pts.length === 0) return '';
    const first = pts[0];
    const last = pts[pts.length - 1];
    const zeroY = this.height - this.paddingBottom;

    const linePointsStr = pts.map(pt => `L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
    
    return `M ${first.x.toFixed(1)} ${zeroY.toFixed(1)} ${linePointsStr} L ${last.x.toFixed(1)} ${zeroY.toFixed(1)} Z`;
  });

  // Y axis ticks (horizontal lines)
  yTicks = computed(() => {
    const { min, max } = this.bounds();
    const range = max - min;
    const ticksCount = 4;
    const ticks = [];
    
    for (let i = 0; i < ticksCount; i++) {
      const value = min + (i / (ticksCount - 1)) * range;
      const y = this.height - this.paddingBottom - (i / (ticksCount - 1)) * this.plotHeight;
      
      let label = '';
      if (Math.abs(value) >= 1_000_000) {
        label = (value / 1_000_000).toFixed(1) + 'M';
      } else if (Math.abs(value) >= 1_000) {
        label = (value / 1_000).toFixed(1) + 'K';
      } else {
        label = value.toFixed(0);
      }
      
      ticks.push({ value, y, label });
    }
    return ticks;
  });

  // X axis ticks (dates)
  xTicks = computed(() => {
    const list = this._data();
    const N = list.length;
    if (N === 0) return [];
    
    const lang = this.translationState.activeLanguage();
    
    const ticks = [];
    const indices: number[] = [];
    
    if (N <= 3) {
      for (let i = 0; i < N; i++) indices.push(i);
    } else {
      indices.push(0);
      indices.push(Math.floor(N / 2));
      indices.push(N - 1);
    }

    const monthsEs = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const months = lang === 'es' ? monthsEs : monthsEn;

    for (const index of indices) {
      const item = list[index];
      const x = this.paddingLeft + (index / (N - 1)) * this.plotWidth;
      
      const dateParts = item.date.split('-');
      let label = item.date;
      if (dateParts.length === 3) {
        const dateObj = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
        label = `${dateObj.getDate()} ${months[dateObj.getMonth()]}`;
      }
      
      ticks.push({ index, x, label });
    }
    return ticks;
  });

  formatTooltipDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const lang = this.translationState.activeLanguage();
    const monthsEs = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const months = lang === 'es' ? monthsEs : monthsEn;
    return `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  }

  onPointHover(item: DailyBalanceDto, index: number): void {
    this.hoveredPoint.set(item);
    this.hoveredIndex.set(index);
  }

  onPointLeave(): void {
    this.hoveredPoint.set(null);
    this.hoveredIndex.set(null);
  }
}
