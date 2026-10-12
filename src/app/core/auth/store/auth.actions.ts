import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ApiError } from '../../models/api.model';
import { AuthResult, LoginRequest } from '../../models/auth.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    // Login form submit
    Login: props<{ credentials: LoginRequest }>(),
    'Login Success': props<{ result: AuthResult }>(),
    'Login Failure': props<{ error: ApiError }>(),

    // Role gate rejected a valid credential set (role code < 700)
    'Login Rejected Insufficient Role': props<{ roleCode: number }>(),

    // Re-hydrate a persisted session at app bootstrap (no HTTP — the contract
    // exposes no /me endpoint; validity is enforced lazily via 401).
    'Session Restored': props<{ result: AuthResult }>(),

    // Logout (user-initiated)
    Logout: emptyProps(),
    // Session cleared (logout completed OR a 401 forced it)
    'Session Cleared': emptyProps(),
  },
});
