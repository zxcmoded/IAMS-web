import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserListQuery } from '../user.model';
import { USERS_FEATURE_KEY, UsersState, usersAdapter } from './users.state';

export const selectUsersState = createFeatureSelector<UsersState>(USERS_FEATURE_KEY);

const { selectAll, selectEntities } = usersAdapter.getSelectors();

export const selectAllUsers = createSelector(selectUsersState, selectAll);
export const selectUserEntities = createSelector(selectUsersState, selectEntities);

export const selectUsersLoading = createSelector(selectUsersState, (s) => s.loading);
export const selectUsersSaving = createSelector(selectUsersState, (s) => s.saving);
export const selectUsersError = createSelector(selectUsersState, (s) => s.error);

export const selectUsersSearch = createSelector(selectUsersState, (s) => s.search);
export const selectUsersPageIndex = createSelector(selectUsersState, (s) => s.pageIndex);
export const selectUsersPageSize = createSelector(selectUsersState, (s) => s.pageSize);
export const selectUsersTotalCount = createSelector(selectUsersState, (s) => s.totalCount);

export const selectUsersRoleFilter = createSelector(selectUsersState, (s) => s.roleFilter);
export const selectUsersUserTypeFilter = createSelector(selectUsersState, (s) => s.userTypeFilter);
export const selectUsersIsActiveFilter = createSelector(selectUsersState, (s) => s.isActiveFilter);
export const selectUsersActivationStatusFilter = createSelector(
  selectUsersState,
  (s) => s.activationStatusFilter,
);

export const selectSelectedUser = createSelector(selectUsersState, (s) => s.selected);
export const selectLoadingSelectedUser = createSelector(
  selectUsersState,
  (s) => s.loadingSelected,
);

/** Composed list query used by effects to build the HTTP request. */
export const selectUsersListQuery = createSelector(
  selectUsersSearch,
  selectUsersPageIndex,
  selectUsersPageSize,
  selectUsersRoleFilter,
  selectUsersUserTypeFilter,
  selectUsersIsActiveFilter,
  selectUsersActivationStatusFilter,
  (search, pageIndex, pageSize, role, userType, isActive, activationStatus): UserListQuery => ({
    search,
    pageIndex,
    pageSize,
    role,
    userType,
    isActive,
    activationStatus,
  }),
);

/** Single view-model for the list container to reduce template async pipes. */
export const selectUsersListViewModel = createSelector(
  selectAllUsers,
  selectUsersLoading,
  selectUsersError,
  selectUsersSearch,
  selectUsersPageIndex,
  selectUsersPageSize,
  selectUsersTotalCount,
  selectUsersRoleFilter,
  selectUsersUserTypeFilter,
  selectUsersIsActiveFilter,
  selectUsersActivationStatusFilter,
  (
    users,
    loading,
    error,
    search,
    pageIndex,
    pageSize,
    totalCount,
    roleFilter,
    userTypeFilter,
    isActiveFilter,
    activationStatusFilter,
  ) => ({
    users,
    loading,
    error,
    search,
    pageIndex,
    pageSize,
    totalCount,
    roleFilter,
    userTypeFilter,
    isActiveFilter,
    activationStatusFilter,
  }),
);
