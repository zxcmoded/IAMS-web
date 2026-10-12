import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { AuthApiService } from '../auth-api.service';
import { TokenStorageService } from '../token-storage.service';
import { toApiError } from '../../api/http-error.util';
import { ApiError } from '../../models/api.model';
import { canAccessPortal } from '../../models/role.model';
import { AuthActions } from './auth.actions';

/**
 * All auth side effects. Login uses `exhaustMap` so rapid double submits cannot
 * fire concurrent login requests.
 */

export const login$ = createEffect(
  (actions$ = inject(Actions), api = inject(AuthApiService)) =>
    actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ credentials }) =>
        api.login(credentials).pipe(
          map((result) =>
            // Any valid authenticated role may enter the portal (the Admin-only
            // floor was removed — RBAC refinement is future work). This remains
            // only as a guard against a 200 carrying no/invalid role, so we
            // never establish a broken session.
            canAccessPortal(result.user.roleCode)
              ? AuthActions.loginSuccess({ result })
              : AuthActions.loginRejectedInsufficientRole({ roleCode: result.user.roleCode }),
          ),
          catchError((err) => of(AuthActions.loginFailure({ error: toLoginError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

/** Persist the session + navigate into the portal after an authorized login. */
export const loginSuccessPersist$ = createEffect(
  (
    actions$ = inject(Actions),
    tokenStorage = inject(TokenStorageService),
    router = inject(Router),
  ) =>
    actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({ result }) => {
        tokenStorage.setSession({
          token: result.token,
          tokenType: result.tokenType,
          expiresAt: result.expiresAt,
          user: result.user,
        });
        void router.navigate(['/']);
      }),
    ),
  { functional: true, dispatch: false },
);

/** User-initiated logout → clear session (logout is client-side for a JWT). */
export const logout$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(AuthActions.logout),
      map(() => AuthActions.sessionCleared()),
    ),
  { functional: true },
);

/** Clearing the session wipes storage and routes back to /login. */
export const sessionCleared$ = createEffect(
  (
    actions$ = inject(Actions),
    tokenStorage = inject(TokenStorageService),
    router = inject(Router),
  ) =>
    actions$.pipe(
      ofType(AuthActions.sessionCleared),
      tap(() => {
        tokenStorage.clear();
        void router.navigate(['/login']);
      }),
    ),
  { functional: true, dispatch: false },
);

/**
 * Translate known login error codes into the exact user-facing copy the
 * contract specifies, while preserving everything else.
 */
function toLoginError(err: unknown): ApiError {
  const apiError = toApiError(err);
  switch (apiError.code) {
    case 'invalid_credentials':
      return { ...apiError, message: 'Invalid username or password.' };
    case 'insufficient_role':
      return { ...apiError, message: 'You do not have permission to access the admin portal.' };
    default:
      return apiError;
  }
}
