import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiEndpoints } from '../api/api-endpoints';
import { AuthResult, AuthUser, LoginRequest } from '../models/auth.model';

/**
 * Typed gateway for all auth HTTP calls — the ONLY place that knows the
 * login/me wire shape. Effects call these and receive mapped domain models.
 */

/** Login response (contract). */
interface LoginResponse {
  accessToken: string;
  tokenType: string;
  accessTokenExpiresAt: string;
  user: UserPayload;
}

interface UserPayload {
  id: string;
  username: string;
  displayName: string | null;
  companyId: string;
  role: { code: number; name: string };
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);

  login(credentials: LoginRequest): Observable<AuthResult> {
    return this.http
      .post<LoginResponse>(ApiEndpoints.auth.login(), credentials)
      .pipe(map((res) => mapLoginResponse(res)));
  }
}

function mapLoginResponse(res: LoginResponse): AuthResult {
  return {
    token: res.accessToken,
    tokenType: res.tokenType ?? 'Bearer',
    expiresAt: res.accessTokenExpiresAt ?? null,
    user: mapUser(res.user),
  };
}

function mapUser(res: UserPayload): AuthUser {
  return {
    userId: res.id,
    username: res.username,
    displayName: res.displayName ?? null,
    companyId: res.companyId,
    roleCode: res.role?.code ?? 0,
    roleName: res.role?.name ?? '',
  };
}
