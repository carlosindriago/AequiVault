import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const setupGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkSetupStatus().pipe(
    map(status => {
      const isSetupPath = state.url.startsWith('/setup');
      if (!status.isInitialized) {
        if (!isSetupPath) {
          return router.createUrlTree(['/setup']);
        }
        return true;
      } else {
        if (isSetupPath) {
          return router.createUrlTree(['/login']);
        }
        return true;
      }
    }),
    catchError(() => {
      // Si falla la conexión con el backend, permitir el flujo por defecto o redirigir
      return of(true);
    })
  );
};
