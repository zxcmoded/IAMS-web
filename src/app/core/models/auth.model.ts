/**
 * Auth-related models — finalized against the backend contract.
 */

/** Login form payload — username + password ONLY (no activation key, no OTP). */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Authenticated user profile as the portal needs it. Mapped from the login
 * response's nested `user` (incl. `role.code` → `roleCode`).
 */
export interface AuthUser {
  userId: string;
  username: string;
  displayName: string | null;
  companyId: string;
  roleCode: number;
  roleName: string;
}

/** Result of a successful login: the bearer token (+ expiry) plus the user. */
export interface AuthResult {
  token: string;
  tokenType: string;
  expiresAt: string | null;
  user: AuthUser;
}
