import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, Subject, firstValueFrom, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { HttpErrorResponse } from '@angular/common/http';
import { login$, loginSuccessPersist$, sessionCleared$ } from './auth.effects';
import { AuthActions } from './auth.actions';
import { AuthApiService } from '../auth-api.service';
import { TokenStorageService } from '../token-storage.service';
import { AuthResult } from '../../models/auth.model';
import { RoleCode } from '../../models/role.model';

const adminResult: AuthResult = {
  token: 'jwt',
  tokenType: 'Bearer',
  expiresAt: null,
  user: {
    userId: 'u1',
    username: 'admin',
    displayName: 'Admin',
    companyId: 'c1',
    roleCode: RoleCode.Admin,
    roleName: 'Admin',
  },
};
const managerResult: AuthResult = {
  token: 'jwt',
  tokenType: 'Bearer',
  expiresAt: null,
  user: {
    userId: 'u2',
    username: 'mgr',
    displayName: 'Mgr',
    companyId: 'c1',
    roleCode: RoleCode.Manager,
    roleName: 'Manager',
  },
};

describe('auth effects', () => {
  let actions$: Subject<Action>;
  let api: { login: ReturnType<typeof vi.fn> };
  let tokenStorage: {
    setSession: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
    getSession: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    actions$ = new Subject<Action>();
    api = { login: vi.fn() };
    tokenStorage = { setSession: vi.fn(), clear: vi.fn(), getSession: vi.fn() };
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        { provide: AuthApiService, useValue: api },
        { provide: TokenStorageService, useValue: tokenStorage },
        { provide: Router, useValue: router },
      ],
    });
  });

  function runEffect(effect: () => Observable<Action>): Promise<Action> {
    const output$ = TestBed.runInInjectionContext(effect);
    const result = firstValueFrom(output$);
    return result;
  }

  it('login$ dispatches loginSuccess for an authorized (>=700) role', async () => {
    api.login.mockReturnValue(of(adminResult));
    const promise = runEffect(login$);
    actions$.next(AuthActions.login({ credentials: { username: 'admin', password: 'pw' } }));
    const out = await promise;
    expect(out).toEqual(AuthActions.loginSuccess({ result: adminResult }));
  });

  it('login$ dispatches loginSuccess for any valid role (Manager included)', async () => {
    // Portal floor was removed: a sub-Admin role is no longer bounced.
    api.login.mockReturnValue(of(managerResult));
    const promise = runEffect(login$);
    actions$.next(AuthActions.login({ credentials: { username: 'mgr', password: 'pw' } }));
    const out = await promise;
    expect(out).toEqual(AuthActions.loginSuccess({ result: managerResult }));
  });

  it('login$ rejects a response carrying no valid role', async () => {
    const noRole: AuthResult = {
      ...managerResult,
      user: { ...managerResult.user, roleCode: 0 },
    };
    api.login.mockReturnValue(of(noRole));
    const promise = runEffect(login$);
    actions$.next(AuthActions.login({ credentials: { username: 'x', password: 'pw' } }));
    const out = await promise;
    expect(out).toEqual(AuthActions.loginRejectedInsufficientRole({ roleCode: 0 }));
  });

  it('login$ maps an HTTP error to loginFailure', async () => {
    api.login.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401, error: { message: 'bad creds' } })),
    );
    const promise = runEffect(login$);
    actions$.next(AuthActions.login({ credentials: { username: 'x', password: 'y' } }));
    const out = (await promise) as ReturnType<typeof AuthActions.loginFailure>;
    expect(out.type).toBe(AuthActions.loginFailure.type);
    expect(out.error.status).toBe(401);
  });

  it('loginSuccessPersist$ saves the session and navigates into the portal', () => {
    const output$ = TestBed.runInInjectionContext(loginSuccessPersist$);
    output$.subscribe();
    actions$.next(AuthActions.loginSuccess({ result: adminResult }));
    expect(tokenStorage.setSession).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'jwt', user: adminResult.user }),
    );
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('sessionCleared$ clears the token and routes to /login', () => {
    const output$ = TestBed.runInInjectionContext(sessionCleared$);
    output$.subscribe();
    actions$.next(AuthActions.sessionCleared());
    expect(tokenStorage.clear).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
