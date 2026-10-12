import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RoleCode, canAccessPortal, roleLabel } from '../../models/role.model';
import { AUTH_FEATURE_KEY, AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>(AUTH_FEATURE_KEY);

export const selectAuthUser = createSelector(selectAuthState, (s) => s.user);
export const selectAuthToken = createSelector(selectAuthState, (s) => s.token);
export const selectAuthLoading = createSelector(selectAuthState, (s) => s.loading);
export const selectAuthError = createSelector(selectAuthState, (s) => s.error);
export const selectAuthInitialized = createSelector(selectAuthState, (s) => s.initialized);

/** Authenticated AND role-authorized for the portal. */
export const selectIsAuthenticated = createSelector(
  selectAuthUser,
  (user) => !!user && canAccessPortal(user.roleCode),
);

export const selectUserDisplayName = createSelector(
  selectAuthUser,
  (user) => user?.displayName?.trim() || user?.username || '',
);

export const selectUserRoleLabel = createSelector(selectAuthUser, (user) =>
  roleLabel(user?.roleCode),
);

export const selectUserRoleCode = createSelector(selectAuthUser, (user) => user?.roleCode ?? 0);

/** SuperAdmin (>=800) — gates Company create/delete in the UI. */
export const selectIsSuperAdmin = createSelector(
  selectUserRoleCode,
  (code) => code >= RoleCode.SuperAdmin,
);

/** The logged-in user's company (used to scope/seed parent filters). */
export const selectUserCompanyId = createSelector(
  selectAuthUser,
  (user) => user?.companyId ?? null,
);
