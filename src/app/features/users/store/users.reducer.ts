import { createReducer, on } from '@ngrx/store';
import { UsersActions } from './users.actions';
import { UsersState, initialUsersState, usersAdapter } from './users.state';

export const usersReducer = createReducer(
  initialUsersState,

  // --- list ---
  on(UsersActions.loadUsers, (state): UsersState => ({ ...state, loading: true, error: null })),

  on(UsersActions.loadUsersSuccess, (state, { page }): UsersState =>
    usersAdapter.setAll(page.items, {
      ...state,
      loading: false,
      error: null,
      totalCount: page.totalCount,
      pageIndex: page.page - 1, // API page is 1-based; store is 0-based
      pageSize: page.pageSize,
    }),
  ),

  on(UsersActions.loadUsersFailure, (state, { error }): UsersState => ({
    ...state,
    loading: false,
    error,
  })),

  // --- query params (effects react to these to reload) ---
  on(UsersActions.searchChanged, (state, { search }): UsersState => ({
    ...state,
    search,
    pageIndex: 0, // reset to first page on a new search
  })),

  on(UsersActions.pageChanged, (state, { pageIndex, pageSize }): UsersState => ({
    ...state,
    pageIndex,
    pageSize,
  })),

  on(UsersActions.roleFilterChanged, (state, { role }): UsersState => ({
    ...state,
    roleFilter: role,
    pageIndex: 0,
  })),

  on(UsersActions.userTypeFilterChanged, (state, { userType }): UsersState => ({
    ...state,
    userTypeFilter: userType,
    pageIndex: 0,
  })),

  on(UsersActions.activeFilterChanged, (state, { isActive }): UsersState => ({
    ...state,
    isActiveFilter: isActive,
    pageIndex: 0,
  })),

  on(UsersActions.activationStatusFilterChanged, (state, { activationStatus }): UsersState => ({
    ...state,
    activationStatusFilter: activationStatus,
    pageIndex: 0,
  })),

  // --- fetch one (edit flow) ---
  on(UsersActions.loadUser, (state): UsersState => ({
    ...state,
    loadingSelected: true,
    selected: null,
    error: null,
  })),
  on(UsersActions.loadUserSuccess, (state, { user }): UsersState => ({
    ...state,
    selected: user,
    loadingSelected: false,
  })),
  on(UsersActions.loadUserFailure, (state, { error }): UsersState => ({
    ...state,
    loadingSelected: false,
    error,
  })),
  on(UsersActions.clearSelected, (state): UsersState => ({
    ...state,
    selected: null,
    loadingSelected: false,
  })),

  // --- create ---
  on(UsersActions.createUser, (state): UsersState => ({ ...state, saving: true, error: null })),
  on(UsersActions.createUserSuccess, (state): UsersState => ({ ...state, saving: false })),
  on(UsersActions.createUserFailure, (state, { error }): UsersState => ({
    ...state,
    saving: false,
    error,
  })),

  // --- update ---
  on(UsersActions.updateUser, (state): UsersState => ({ ...state, saving: true, error: null })),
  on(UsersActions.updateUserSuccess, (state): UsersState => ({ ...state, saving: false })),
  on(UsersActions.updateUserFailure, (state, { error }): UsersState => ({
    ...state,
    saving: false,
    error,
  })),

  on(UsersActions.clearError, (state): UsersState => ({ ...state, error: null })),
);
