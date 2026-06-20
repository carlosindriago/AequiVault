import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DemoService } from '../../../core/services/demo.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-demo-loading',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="demo-loading-container" [class.fade-out]="isFadingOut()">
      @if (status() === 'loading') {
        <div class="loading-state">
          <svg class="logo-icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#c084fc" />
                <stop offset="50%" stop-color="#6366f1" />
                <stop offset="100%" stop-color="#34d399" />
              </linearGradient>
            </defs>
            <path d="M50 15 L18 85 H36 L50 50 L64 85 H82 Z" fill="url(#logo-grad)" />
            <path d="M50 50 L40 72 H60 Z" fill="#0b0f19" opacity="0.9" />
            <circle cx="50" cy="50" r="3" fill="#34d399" />
          </svg>
          <h2 class="loading-text">{{ currentText() }}</h2>
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
      display: block;
      min-height: 100vh;
      background: #111318;
      color: white;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    .demo-loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      opacity: 1;
      transition: opacity 300ms ease-out;
    }
    .demo-loading-container.fade-out {
      opacity: 0;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
    }
    .logo-icon {
      width: 100px;
      height: 100px;
      animation: pulse-glow 2.5s infinite alternate ease-in-out;
    }
    @keyframes pulse-glow {
      0% {
        transform: scale(0.95);
        filter: drop-shadow(0 0 10px rgba(192, 132, 252, 0.4));
      }
      50% {
        filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.6));
      }
      100% {
        transform: scale(1.05);
        filter: drop-shadow(0 0 30px rgba(52, 211, 153, 0.5));
      }
    }
    .loading-text {
      font-size: 1.25rem;
      font-weight: 500;
      letter-spacing: 0.02em;
      color: #e2e8f0;
      margin: 0;
      min-width: 280px;
      text-align: center;
      animation: fade-text 0.8s ease-in-out infinite alternate;
    }
    @keyframes fade-text {
      0% { opacity: 0.7; }
      100% { opacity: 1; }
    }
    .error-state {
      text-align: center;
      max-width: 500px;
      padding: 3rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      backdrop-filter: blur(12px);
    }
    .error-text {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #fca5a5;
    }
    .error-subtext {
      font-size: 0.95rem;
      color: #94a3b8;
      margin-bottom: 2rem;
    }
    .btn-primary {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-weight: 500;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
  `]
})
export class DemoLoadingComponent implements OnInit, OnDestroy {
  private demoService = inject(DemoService);
  private authService = inject(AuthService);
  private router = inject(Router);

  status = signal<'loading' | 'rate_limited' | 'error'>('loading');
  isFadingOut = signal<boolean>(false);
  currentText = signal<string>('Iniciando contenedor aislado...');

  private texts = [
    'Iniciando contenedor aislado...',
    'Configurando aislamiento RLS...',
    'Inyectando catálogo de cuentas...',
    'Generando historial financiero...',
    'Cifrando credenciales...'
  ];
  private textIndex = 0;
  private intervalId: any;

  ngOnInit() {
    this.startTextAnimation();

    this.demoService.startDemo().subscribe({
      next: (res) => {
        this.authService.adoptDemoSession(res);
        this.finishLoadingAndNavigate();
      },
      error: (err) => {
        this.stopTextAnimation();
        if (err.status === 429) {
          this.status.set('rate_limited');
        } else {
          this.status.set('error');
        }
      }
    });
  }

  ngOnDestroy() {
    this.stopTextAnimation();
  }

  private startTextAnimation() {
    this.intervalId = setInterval(() => {
      this.textIndex = (this.textIndex + 1) % this.texts.length;
      this.currentText.set(this.texts[this.textIndex]);
    }, 800);
  }

  private stopTextAnimation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private finishLoadingAndNavigate() {
    this.stopTextAnimation();
    this.isFadingOut.set(true);
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 300);
  }
}
