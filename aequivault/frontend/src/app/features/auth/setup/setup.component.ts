import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-wrapper">
      <div class="glow-bg"></div>
      <div class="auth-card glass-panel">
        <div class="brand-header">
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
          <h1 class="brand-name">AequiVault</h1>
          <p class="brand-subtitle">Asistente de Inicialización Segura</p>
        </div>

        <form (submit)="onSubmit($event)" class="auth-form">
          @if (errorMessage()) {
            <div class="error-banner">
              <span class="error-icon">⚠️</span>
              <span class="error-text">{{ errorMessage() }}</span>
            </div>
          }

          <div class="input-group">
            <label for="companyName" class="input-label">Nombre de la Empresa</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              class="form-input"
              placeholder="Empresa Contable S.A."
              [ngModel]="companyName()"
              (ngModelChange)="companyName.set($event)"
              required
            />
          </div>

          <div class="input-group">
            <label for="email" class="input-label">Correo Administrativo (Super Admin)</label>
            <input
              type="email"
              id="email"
              name="email"
              class="form-input"
              placeholder="admin@empresa.com"
              [ngModel]="email()"
              (ngModelChange)="email.set($event)"
              required
            />
          </div>

          <div class="input-group">
            <label for="password" class="input-label">Contraseña (Mín. 8 caracteres)</label>
            <input
              type="password"
              id="password"
              name="password"
              class="form-input"
              placeholder="••••••••"
              [ngModel]="password()"
              (ngModelChange)="password.set($event)"
              minlength="8"
              required
            />
          </div>

          <button
            type="submit"
            class="btn-submit"
            [disabled]="isLoading() || !companyName() || !email() || password().length < 8"
          >
            @if (isLoading()) {
              <span class="spinner"></span>
              Configurando Sistema...
            } @else {
              Inicializar Sistema
            }
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100vw;
      height: 100vh;
      background-color: #0b0f19;
      overflow: hidden;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .glow-bg {
      position: absolute;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(52, 211, 153, 0.12) 0%, rgba(99, 102, 241, 0.04) 50%, rgba(11, 15, 25, 0) 70%);
      top: -100px;
      right: -100px;
      pointer-events: none;
      animation: pulse 12s infinite alternate;
    }

    @keyframes pulse {
      0% { transform: scale(1) translate(0, 0); }
      100% { transform: scale(1.1) translate(-50px, -50px); }
    }

    .glass-panel {
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 50px -10px rgba(52, 211, 153, 0.05);
      border-radius: 20px;
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 3rem 2.5rem;
      z-index: 10;
      transition: transform 0.3s ease;
    }

    .auth-card:hover {
      border-color: rgba(255, 255, 255, 0.12);
    }

    .brand-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 2.5rem;
    }

    .logo-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 1rem;
      filter: drop-shadow(0 0 12px rgba(52, 211, 153, 0.3));
    }

    .brand-name {
      color: #ffffff;
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin: 0;
    }

    .brand-subtitle {
      color: #64748b;
      font-size: 0.9rem;
      margin-top: 0.35rem;
      margin-bottom: 0;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.4);
      padding: 0.75rem 1rem;
      border-radius: 10px;
      color: #fca5a5;
      font-size: 0.85rem;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .input-label {
      color: #94a3b8;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .form-input {
      background: rgba(15, 23, 42, 0.6);
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      color: #ffffff;
      padding: 0.75rem 1rem;
      font-size: 0.95rem;
      outline: none;
      transition: all 0.2s ease;
    }

    .form-input:focus {
      border-color: #34d399;
      background: rgba(15, 23, 42, 0.8);
      box-shadow: 0 0 10px rgba(52, 211, 153, 0.15);
    }

    .form-input::placeholder {
      color: #475569;
    }

    .btn-submit {
      background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
      border: none;
      border-radius: 10px;
      color: #ffffff;
      padding: 0.85rem;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 10px 20px -10px rgba(52, 211, 153, 0.4);
      margin-top: 0.5rem;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 12px 24px -8px rgba(52, 211, 153, 0.5);
    }

    .btn-submit:disabled {
      background: rgba(255, 255, 255, 0.05);
      color: #475569;
      cursor: not-allowed;
      box-shadow: none;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: #ffffff;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class SetupComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly companyName = signal<string>('');
  readonly email = signal<string>('');
  readonly password = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.companyName() || !this.email() || this.password().length < 8) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.setupInit({
      companyName: this.companyName(),
      email: this.email(),
      password: this.password()
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err?.error?.detail) {
          this.errorMessage.set(err.error.detail);
        } else if (err?.error?.message) {
          this.errorMessage.set(err.error.message);
        } else {
          this.errorMessage.set('Error durante la inicialización segura.');
        }
      }
    });
  }
}
