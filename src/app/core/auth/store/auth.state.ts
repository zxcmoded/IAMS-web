import { ApiError } from '../../models/api.model';
import { AuthUser } from '../../models/auth.model';

export const AUTH_FEATURE_KEY = 'auth';

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: ApiError | null;
  /** True once a bootstrap `loadCurrentUser` attempt has resolved either way. */
  initialized: boolean;
}

export const initialAuthState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  initialized: false,
};
