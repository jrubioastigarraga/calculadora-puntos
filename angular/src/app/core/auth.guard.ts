import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.demo) return true;
  const session = await auth.ready;
  if (session) return true;
  return router.createUrlTree(['/login'], { queryParams: { next: state.url } });
};
