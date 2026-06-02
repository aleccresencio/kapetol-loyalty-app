import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session';

export const staffGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);

  if (session.isStaffAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/staff/login']);
};
