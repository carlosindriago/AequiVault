import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DemoService } from '../../../core/services/demo.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-demo-loading',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="demo-loading-container glass-panel">
      @if (status() === 'loading') {
        <div class="loading-state">
          <div class="spinner"></div>
          <h2 class="loading-text">Aprovisionando tu entorno de demostración...</h2>
          <p class="loading-subtext">Preparando datos contables efímeros...</p>
        </div>
      } @else if (status() === 'rate_limited') {
        <div class="error-state">
          <h2 class="error-text">Has alcanzado el límite de demostraciones por hoy.</h2>
          <p class="error-subtext">Tu servidor de pruebas está protegido contra abusos.</p>
          <button class="btn-primary" routerLink="/login">Ir al Login Manual</button>
        </div>
      } @else if (status() === 'error') {
        <div class="error-state">
          <h2 class="error-text">El Modo Demo se encuentra deshabilitado en este momento.</h2>
          <p class="error-subtext">Por favor intenta más tarde o accede de forma manual.</p>
          <button class="btn-primary" routerLink="/login">Ir al Login Manual</button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: var(--color-bg-primary, #0b0f19);
      color: white;
    }
    .demo-loading-container {
      padding: 3rem 4rem;
      border-radius: 16px;
      text-align: center;
      max-width: 500px;
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-top-color: var(--color-accent, #6366f1);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1.5rem;
    }
    @keyframes spin { 
      to { transform: rotate(360deg); } 
    }
    .loading-text, .error-text {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    .loading-subtext, .error-subtext {
      font-size: 0.9rem;
      color: var(--color-text-muted, #888);
      margin-bottom: 1.5rem;
    }
    .btn-primary {
      background: var(--color-accent, #6366f1);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .btn-primary:hover {
      background: #4f46e5;
    }
  `]
})
export class DemoLoadingComponent implements OnInit {
  private demoService = inject(DemoService);
  private authService = inject(AuthService);
  private router = inject(Router);

  status = signal<'loading' | 'rate_limited' | 'error'>('loading');

  ngOnInit() {
    this.demoService.startDemo().subscribe({
      next: (res) => {
        this.authService.adoptDemoSession(res);
        this.router.navigate(['/']);
      },
      error: (err) => {
        if (err.status === 429) {
          this.status.set('rate_limited');
        } else {
          this.status.set('error');
        }
      }
    });
  }
}
