import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // Si ya está autenticado y trata de ir al login, redirigir a la raíz
    if (state.url.startsWith('/login')) {
      return router.createUrlTree(['/']);
    }
    return true;
  }

  // Si no está autenticado e intenta ir a una ruta segura
  if (state.url.startsWith('/login')) {
    return true;
  }
  
  return router.createUrlTree(['/login']);
};
