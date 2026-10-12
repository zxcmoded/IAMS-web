import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, throwError } from 'rxjs';
import { AuthActions } from '../auth/store/auth.actions';
import { ApiEndpoints } from '../api/api-endpoints';

/**
 * On a 401 from any non-login API call, clear the session and route to /login.
 * The error is still re-thrown so the originating effect can dispatch its own
 * failure action. Login 401s are left alone (handled as a normal login failure
 * so the form can show "invalid credentials").
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (
        err instanceof HttpErrorResponse &&
        err.status === 401 &&
        req.url !== ApiEndpoints.auth.login()
      ) {
        store.dispatch(AuthActions.sessionCleared());
      }
      return throwError(() => err);
    }),
  );
};
