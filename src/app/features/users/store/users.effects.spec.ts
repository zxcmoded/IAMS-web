import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, firstValueFrom, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import {
  createUser$,
  loadUsers$,
  reloadAfterMutation$,
  updateUser$,
} from './users.effects';
import { usersErrorMessage } from '../users-error.util';
import { UsersActions } from './users.actions';
import { UsersApiService } from '../users-api.service';
import { USERS_FEATURE_KEY, initialUsersState } from './users.state';
import { AdminPage } from '../../../core/models/api.model';
import { CreateUserResult, UserDetail, UserListItem } from '../user.model';

const listItem: UserListItem = {
  id: 'a',
  username: 'alice',
  email: null,
  role: { code: 200, name: 'User' },
  userType: 'mobile',
  activationStatus: 'NotActivated',
  isActive: true,
  assignedLocations: [],
  createdAtUtc: '2026-01-01T00:00:00Z',
};
const detail: UserDetail = { ...listItem, companyId: 'c1' };
const page: AdminPage<UserListItem> = {
  items: [listItem],
  totalCount: 1,
  page: 1,
  pageSize: 25,
  totalPages: 1,
  hasMore: false,
};

describe('users effects', () => {
  let actions$: Subject<Action>;
  let api: {
    list: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    actions$ = new Subject<Action>();
    api = { list: vi.fn(), getById: vi.fn(), create: vi.fn(), update: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        // Drive the composed query via real state (not overrideSelector) so the
        // shared memoized `selectUsersListQuery` isn't clamped for other specs.
        provideMockStore({
          initialState: {
            [USERS_FEATURE_KEY]: {
              ...initialUsersState,
              search: 'al',
              pageIndex: 1,
              pageSize: 25,
            },
          },
        }),
        { provide: UsersApiService, useValue: api },
      ],
    });
  });

  function run(effect: () => Observable<Action>): Promise<Action> {
    const out$ = TestBed.runInInjectionContext(effect);
    return firstValueFrom(out$);
  }

  it('loadUsers$ maps a page to loadUsersSuccess', async () => {
    api.list.mockReturnValue(of(page));
    const promise = run(loadUsers$);
    actions$.next(UsersActions.loadUsers({ query: { pageIndex: 0, pageSize: 25 } }));
    expect(await promise).toEqual(UsersActions.loadUsersSuccess({ page }));
  });

  it('loadUsers$ maps an error to loadUsersFailure', async () => {
    api.list.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    const promise = run(loadUsers$);
    actions$.next(UsersActions.loadUsers({ query: {} }));
    const out = (await promise) as ReturnType<typeof UsersActions.loadUsersFailure>;
    expect(out.type).toBe(UsersActions.loadUsersFailure.type);
    expect(out.error.status).toBe(500);
  });

  it('createUser$ maps a result (with activationKey) to createUserSuccess', async () => {
    const result: CreateUserResult = { user: detail, activationKey: 'RAW-KEY-123' };
    api.create.mockReturnValue(of(result));
    const payload = {
      userType: 'mobile' as const,
      username: 'alice',
      email: null,
      role: 200,
      companyId: null,
      locationCodes: ['L1'],
      password: null,
    };
    const promise = run(createUser$);
    actions$.next(UsersActions.createUser({ payload }));
    expect(await promise).toEqual(UsersActions.createUserSuccess({ result }));
    expect(api.create).toHaveBeenCalledWith(payload);
  });

  it('updateUser$ maps the updated user to updateUserSuccess', async () => {
    api.update.mockReturnValue(of(detail));
    const payload = { username: 'alice', email: null, role: 200, locationCodes: ['L1'] };
    const promise = run(updateUser$);
    actions$.next(UsersActions.updateUser({ id: 'a', payload }));
    expect(await promise).toEqual(UsersActions.updateUserSuccess({ user: detail }));
    expect(api.update).toHaveBeenCalledWith('a', payload);
  });

  it('reloadAfterMutation$ reloads the list using the current store query', async () => {
    const result: CreateUserResult = { user: detail, activationKey: null };
    const promise = run(reloadAfterMutation$);
    actions$.next(UsersActions.createUserSuccess({ result }));
    expect(await promise).toEqual(
      UsersActions.loadUsers({
        query: {
          search: 'al',
          pageIndex: 1,
          pageSize: 25,
          role: null,
          userType: null,
          isActive: null,
          activationStatus: null,
        },
      }),
    );
  });

  it('usersErrorMessage specializes known codes', () => {
    expect(usersErrorMessage({ status: 409, code: 'username_conflict', message: 'x' })).toContain(
      'already taken',
    );
    expect(usersErrorMessage({ status: 403, code: 'access_denied', message: 'x' })).toContain(
      'higher than your own',
    );
    expect(usersErrorMessage({ status: 400, message: 'fallback copy' })).toBe('fallback copy');
  });
});
