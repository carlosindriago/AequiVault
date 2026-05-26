import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, TranslocoPipe],
  template: `
    <div class="kpi-card glass-panel" [ngClass]="type">
      <div class="card-header">
        <span class="card-title">{{ title }}</span>
        <span class="currency-badge">{{ currency }}</span>
      </div>
      <div class="card-body">
        <h3 class="card-value">{{ value | currency: currency:'symbol':'1.2-2' }}</h3>
      </div>
      @if (trendValue !== undefined) {
        <div class="card-footer" [ngClass]="trendValue >= 0 ? 'trend-up' : 'trend-down'">
          <span class="trend-icon">@if (trendValue >= 0) { ▲ } @else { ▼ }</span>
          <span class="trend-text">{{ trendValue | percent:'1.1-2' }} {{ 'dashboard.vs_previous' | transloco }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .kpi-card {
      margin-bottom: 0; /* Override standard glass-panel bottom margin to handle grid alignment */
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 140px;
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
    }
    
    /* Elegant subtle top border gradient for each card type */
    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, transparent, var(--card-accent), transparent);
    }
    
    .info {
      --card-accent: var(--color-primary);
    }
    
    .success {
      --card-accent: var(--color-success);
    }
    
    .danger {
      --card-accent: var(--color-danger);
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    
    .card-title {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .currency-badge {
      font-size: 0.75rem;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-glass);
      padding: 0.15rem 0.4rem;
      border-radius: var(--radius-sm);
      color: var(--text-muted);
    }
    
    .card-value {
      font-size: 1.85rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: var(--text-primary);
      margin: 0;
    }
    
    .card-footer {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin-top: 0.75rem;
      font-size: 0.8rem;
      font-weight: 500;
    }
    
    .trend-up {
      color: var(--color-success);
    }
    
    .trend-down {
      color: var(--color-danger);
    }
    
    .trend-icon {
      font-size: 0.7rem;
    }
    
    .trend-text {
      opacity: 0.85;
    }
  `]
})
export class KpiCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: number;
  @Input() currency: string = 'USD';
  @Input() type: 'info' | 'success' | 'danger' = 'info';
  @Input() trendValue?: number;
}
