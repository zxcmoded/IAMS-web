import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { ApiError } from '../../../core/models/api.model';
import { ActivationStatus, UserDetail, UserListItem, UserType } from '../user.model';

export const USERS_FEATURE_KEY = 'users';

/** Normalized collection keyed by the server-generated user id (Guid). */
export const usersAdapter = createEntityAdapter<UserListItem>({
  selectId: (u) => u.id,
  sortComparer: (a, b) => a.username.localeCompare(b.username),
});

export interface UsersState extends EntityState<UserListItem> {
  loading: boolean;
  /** True while a create/update is in flight. */
  saving: boolean;
  error: ApiError | null;
  // server-side list query state
  search: string;
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  // filters (null = "all")
  roleFilter: number | null;
  userTypeFilter: UserType | null;
  isActiveFilter: boolean | null;
  activationStatusFilter: ActivationStatus | null;
  // edit flow: the full detail (incl. companyId) for the user being edited
  selected: UserDetail | null;
  loadingSelected: boolean;
}

export const initialUsersState: UsersState = usersAdapter.getInitialState({
  loading: false,
  saving: false,
  error: null,
  search: '',
  pageIndex: 0,
  pageSize: 25,
  totalCount: 0,
  roleFilter: null,
  userTypeFilter: null,
  isActiveFilter: null,
  activationStatusFilter: null,
  selected: null,
  loadingSelected: false,
});
