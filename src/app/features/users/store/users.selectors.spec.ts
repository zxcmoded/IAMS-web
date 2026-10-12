import {
  selectAllUsers,
  selectUsersListQuery,
  selectUsersListViewModel,
  selectUsersLoading,
} from './users.selectors';
import { USERS_FEATURE_KEY, initialUsersState, usersAdapter } from './users.state';
import { UserListItem } from '../user.model';

const userA: UserListItem = {
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

function stateWith(overrides: Partial<typeof initialUsersState> = {}) {
  const feature = usersAdapter.setAll([userA], { ...initialUsersState, ...overrides });
  return { [USERS_FEATURE_KEY]: feature };
}

describe('users selectors', () => {
  it('selectAllUsers returns the collection', () => {
    expect(selectAllUsers(stateWith())).toEqual([userA]);
  });

  it('selectUsersLoading reflects the flag', () => {
    expect(selectUsersLoading(stateWith({ loading: true }))).toBe(true);
  });

  it('selectUsersListQuery composes search/paging/filters', () => {
    const query = selectUsersListQuery(
      stateWith({
        search: 'al',
        pageIndex: 1,
        pageSize: 25,
        roleFilter: 300,
        userTypeFilter: 'web',
        isActiveFilter: true,
        activationStatusFilter: 'Activated',
      }),
    );
    expect(query).toEqual({
      search: 'al',
      pageIndex: 1,
      pageSize: 25,
      role: 300,
      userType: 'web',
      isActive: true,
      activationStatus: 'Activated',
    });
  });

  it('selectUsersListViewModel bundles list state + filters for the container', () => {
    const vm = selectUsersListViewModel(
      stateWith({ loading: true, totalCount: 7, pageIndex: 1, userTypeFilter: 'mobile' }),
    );
    expect(vm.users).toEqual([userA]);
    expect(vm.loading).toBe(true);
    expect(vm.totalCount).toBe(7);
    expect(vm.pageIndex).toBe(1);
    expect(vm.userTypeFilter).toBe('mobile');
  });
});
