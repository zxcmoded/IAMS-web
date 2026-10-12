import { createReducer, on } from '@ngrx/store';
import { ApiError } from '../../models/api.model';
import { AuthActions } from './auth.actions';
import { AuthState, initialAuthState } from './auth.state';

const INSUFFICIENT_ROLE_ERROR: ApiError = {
  status: 403,
  code: 'insufficient_role',
  message: 'You do not have permission to access the admin portal.',
};

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.login, (state): AuthState => ({ ...state, loading: true, error: null })),

  on(
    AuthActions.loginSuccess,
    (state, { result }): AuthState => ({
      ...state,
      user: result.user,
      token: result.token,
      loading: false,
      error: null,
      initialized: true,
    }),
  ),

  on(
    AuthActions.loginFailure,
    (state, { error }): AuthState => ({
      ...state,
      user: null,
      token: null,
      loading: false,
      error,
      initialized: true,
    }),
  ),

  on(
    AuthActions.loginRejectedInsufficientRole,
    (state): AuthState => ({
      ...state,
      user: null,
      token: null,
      loading: false,
      error: INSUFFICIENT_ROLE_ERROR,
      initialized: true,
    }),
  ),

  on(
    AuthActions.sessionRestored,
    (state, { result }): AuthState => ({
      ...state,
      user: result.user,
      token: result.token,
      loading: false,
      error: null,
      initialized: true,
    }),
  ),

  on(
    AuthActions.sessionCleared,
    (): AuthState => ({ ...initialAuthState, initialized: true }),
  ),
);
