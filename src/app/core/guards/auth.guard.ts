import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, filter, map, take } from 'rxjs';
import { selectAuthInitialized, selectIsAuthenticated } from '../auth/store/auth.selectors';

/**
 * Protects the admin area. Waits for the bootstrap auth check to resolve
 * (`initialized`) so a page refresh with a valid token is not bounced to login
 * while the session re-hydrates. Unauthenticated / unauthorized users are
 * redirected to /login.
 */
export const authGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const store = inject(Store);
  const router = inject(Router);

  return combineLatest([
    store.select(selectAuthInitialized),
    store.select(selectIsAuthenticated),
  ]).pipe(
    filter(([initialized]) => initialized),
    take(1),
    map(([, isAuthenticated]) =>
      isAuthenticated ? true : router.createUrlTree(['/login']),
    ),
  );
};
