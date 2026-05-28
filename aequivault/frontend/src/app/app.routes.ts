import { Routes } from '@angular/router';
import { setupGuard } from './core/guards/setup.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'setup',
    loadComponent: () => import('./features/auth/setup/setup.component').then(m => m.SetupComponent),
    canActivate: [setupGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [setupGuard, authGuard]
  },
  {
    path: '',
    loadComponent: () => import('./features/journal/journal-entry-container/journal-entry-container.component').then(m => m.JournalEntryContainerComponent),
    canActivate: [setupGuard, authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
