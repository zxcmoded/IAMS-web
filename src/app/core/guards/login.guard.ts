import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, filter, map, take } from 'rxjs';
import { selectAuthInitialized, selectIsAuthenticated } from '../auth/store/auth.selectors';

/**
 * Keeps already-authenticated admins off the /login page by redirecting them
 * into the portal. Waits for bootstrap to settle first.
 */
export const loginGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const store = inject(Store);
  const router = inject(Router);

  return combineLatest([
    store.select(selectAuthInitialized),
    store.select(selectIsAuthenticated),
  ]).pipe(
    filter(([initialized]) => initialized),
    take(1),
    map(([, isAuthenticated]) =>
      isAuthenticated ? router.createUrlTree(['/']) : true,
    ),
  );
};
