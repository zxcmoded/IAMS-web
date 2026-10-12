import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '../auth/token-storage.service';
import { ApiEndpoints } from '../api/api-endpoints';

/**
 * Attaches `Authorization: Bearer <token>` to outgoing API requests when a
 * token is present. The login endpoint is skipped (no token yet / not needed).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenStorageService).getToken();

  if (!token || req.url === ApiEndpoints.auth.login()) {
    return next(req);
  }

  return next(
    req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }),
  );
};
