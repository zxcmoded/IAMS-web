import { usersReducer } from './users.reducer';
import { UsersActions } from './users.actions';
import { initialUsersState, usersAdapter } from './users.state';
import { AdminPage } from '../../../core/models/api.model';
import { CreateUserResult, UserDetail, UserListItem } from '../user.model';

const userA: UserListItem = {
  id: 'a',
  username: 'alice',
  email: 'a@x.io',
  role: { code: 200, name: 'User' },
  userType: 'mobile',
  activationStatus: 'NotActivated',
  isActive: true,
  assignedLocations: [{ code: 'L1', name: 'Loc 1' }],
  createdAtUtc: '2026-01-01T00:00:00Z',
};
const userB: UserListItem = {
  id: 'b',
  username: 'bob',
  email: null,
  role: { code: 700, name: 'Admin' },
  userType: 'web',
  activationStatus: null,
  isActive: true,
  assignedLocations: [],
  createdAtUtc: '2026-01-02T00:00:00Z',
};
const page: AdminPage<UserListItem> = {
  items: [userB, userA],
  totalCount: 2,
  page: 1,
  pageSize: 25,
  totalPages: 1,
  hasMore: false,
};

describe('usersReducer', () => {
  it('sets loading on loadUsers', () => {
    const state = usersReducer(initialUsersState, UsersActions.loadUsers({ query: {} }));
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('stores the page (sorted by username) + maps 1-based page to 0-based index', () => {
    const state = usersReducer(initialUsersState, UsersActions.loadUsersSuccess({ page }));
    expect(state.loading).toBe(false);
    expect(state.totalCount).toBe(2);
    expect(state.pageIndex).toBe(0); // API page 1 → index 0
    expect(state.pageSize).toBe(25);
    const ids = usersAdapter.getSelectors().selectAll(state).map((u) => u.id);
    expect(ids).toEqual(['a', 'b']); // alice before bob
  });

  it('resets to page 0 on searchChanged', () => {
    const start = { ...initialUsersState, pageIndex: 3 };
    const state = usersReducer(start, UsersActions.searchChanged({ search: 'ali' }));
    expect(state.search).toBe('ali');
    expect(state.pageIndex).toBe(0);
  });

  it('records each filter and resets to page 0', () => {
    const start = { ...initialUsersState, pageIndex: 4 };
    const role = usersReducer(start, UsersActions.roleFilterChanged({ role: 300 }));
    expect(role.roleFilter).toBe(300);
    expect(role.pageIndex).toBe(0);

    const type = usersReducer(start, UsersActions.userTypeFilterChanged({ userType: 'web' }));
    expect(type.userTypeFilter).toBe('web');

    const active = usersReducer(start, UsersActions.activeFilterChanged({ isActive: false }));
    expect(active.isActiveFilter).toBe(false);

    const activation = usersReducer(
      start,
      UsersActions.activationStatusFilterChanged({ activationStatus: 'Activated' }),
    );
    expect(activation.activationStatusFilter).toBe('Activated');
  });

  it('loads a selected user detail and clears it', () => {
    const detail: UserDetail = { ...userA, companyId: 'c1' };
    const loading = usersReducer(initialUsersState, UsersActions.loadUser({ id: 'a' }));
    expect(loading.loadingSelected).toBe(true);
    const loaded = usersReducer(loading, UsersActions.loadUserSuccess({ user: detail }));
    expect(loaded.loadingSelected).toBe(false);
    expect(loaded.selected).toEqual(detail);
    const cleared = usersReducer(loaded, UsersActions.clearSelected());
    expect(cleared.selected).toBeNull();
  });

  it('toggles saving across a create lifecycle', () => {
    const saving = usersReducer(
      initialUsersState,
      UsersActions.createUser({
        payload: {
          userType: 'web',
          username: 'x',
          email: null,
          role: 700,
          companyId: null,
          locationCodes: null,
          password: 'Secret!99',
        },
      }),
    );
    expect(saving.saving).toBe(true);
    const result: CreateUserResult = {
      user: { ...userB, companyId: 'c1' },
      activationKey: null,
    };
    const done = usersReducer(saving, UsersActions.createUserSuccess({ result }));
    expect(done.saving).toBe(false);
  });

  it('records a mutation error and clears saving on failure', () => {
    const state = usersReducer(
      { ...initialUsersState, saving: true },
      UsersActions.updateUserFailure({ error: { status: 409, message: 'conflict' } }),
    );
    expect(state.saving).toBe(false);
    expect(state.error?.status).toBe(409);
  });
});
