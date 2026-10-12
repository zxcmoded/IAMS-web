import { authReducer } from './auth.reducer';
import { AuthActions } from './auth.actions';
import { initialAuthState } from './auth.state';
import { AuthResult, AuthUser } from '../../models/auth.model';
import { RoleCode } from '../../models/role.model';

const adminUser: AuthUser = {
  userId: 'u1',
  username: 'admin',
  displayName: 'Admin User',
  companyId: 'c1',
  roleCode: RoleCode.Admin,
  roleName: 'Admin',
};

const adminResult: AuthResult = {
  token: 'jwt-token',
  tokenType: 'Bearer',
  expiresAt: null,
  user: adminUser,
};

describe('authReducer', () => {
  it('returns the initial state for an unknown action', () => {
    const state = authReducer(undefined, { type: 'noop' } as never);
    expect(state).toEqual(initialAuthState);
  });

  it('sets loading and clears error on login', () => {
    const state = authReducer(
      { ...initialAuthState, error: { status: 401, message: 'old' } },
      AuthActions.login({ credentials: { username: 'a', password: 'b' } }),
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('stores user + token and initializes on loginSuccess', () => {
    const state = authReducer(initialAuthState, AuthActions.loginSuccess({ result: adminResult }));
    expect(state.user).toEqual(adminUser);
    expect(state.token).toBe('jwt-token');
    expect(state.loading).toBe(false);
    expect(state.initialized).toBe(true);
    expect(state.error).toBeNull();
  });

  it('clears session and records error on loginFailure', () => {
    const start = authReducer(initialAuthState, AuthActions.loginSuccess({ result: adminResult }));
    const state = authReducer(
      start,
      AuthActions.loginFailure({ error: { status: 401, message: 'bad creds' } }),
    );
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.error).toEqual({ status: 401, message: 'bad creds' });
    expect(state.initialized).toBe(true);
  });

  it('records a permission error on a no/invalid-role rejection without a session', () => {
    // The Admin-only floor is gone; this path now only guards a login whose
    // response carries no valid role.
    const state = authReducer(
      initialAuthState,
      AuthActions.loginRejectedInsufficientRole({ roleCode: 0 }),
    );
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.error?.status).toBe(403);
    expect(state.initialized).toBe(true);
  });

  it('restores a persisted session without navigation on sessionRestored', () => {
    const state = authReducer(initialAuthState, AuthActions.sessionRestored({ result: adminResult }));
    expect(state.user).toEqual(adminUser);
    expect(state.token).toBe('jwt-token');
    expect(state.initialized).toBe(true);
  });

  it('resets to an initialized empty state on sessionCleared', () => {
    const start = authReducer(initialAuthState, AuthActions.loginSuccess({ result: adminResult }));
    const state = authReducer(start, AuthActions.sessionCleared());
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.initialized).toBe(true);
  });
});
