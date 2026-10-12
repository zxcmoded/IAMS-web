import { RoleCode } from '../../core/models/role.model';

/**
 * User-feature wire shapes — finalized against the LOCKED backend contract
 * (`/api/users`). Kept in the feature slice (not core) since only this slice
 * speaks the User shape. `Role` is the `{ code, name }` pair the contract uses;
 * role CODES reuse the stable {@link RoleCode} enum from core.
 */

/** Whether the account authenticates via the mobile app or the web portal. */
export type UserType = 'mobile' | 'web';

/** Mobile activation lifecycle. Always null for web users. */
export type ActivationStatus = 'NotActivated' | 'Activated';

/** The `{ code, name }` role pair carried by every user payload. */
export interface Role {
  code: number;
  name: string;
}

/** A location assigned to a mobile user (subset of the Location entity). */
export interface AssignedLocation {
  code: string;
  name: string;
}

/** Row shape returned by `GET /api/users` (list envelope item). */
export interface UserListItem {
  id: string;
  username: string;
  email: string | null;
  role: Role;
  userType: UserType;
  /** Null for web users. */
  activationStatus: ActivationStatus | null;
  isActive: boolean;
  assignedLocations: AssignedLocation[];
  createdAtUtc: string;
}

/** Full record from `GET /api/users/{id}` — adds `companyId` (never any hash). */
export interface UserDetail {
  id: string;
  username: string;
  email: string | null;
  companyId: string;
  role: Role;
  userType: UserType;
  activationStatus: ActivationStatus | null;
  isActive: boolean;
  assignedLocations: AssignedLocation[];
  createdAtUtc: string;
}

/**
 * Body for `POST /api/users`. Mobile sends `locationCodes` + `password:null`;
 * web sends `password` + `locationCodes:null`. `companyId` is REQUIRED for a
 * SuperAdmin caller and omitted (null) for an Admin caller (their own company).
 */
export interface UserCreate {
  userType: UserType;
  /** Required for web; optional for mobile (null → backend synthesizes a placeholder). */
  username: string | null;
  email: string | null;
  role: number;
  companyId: string | null;
  locationCodes: string[] | null;
  password: string | null;
}

/**
 * Body for `PUT /api/users/{id}`. `username` + `role` required; `email:null`
 * clears it. `locationCodes` is mobile-only (REPLACES the set); `password` is
 * web-only and re-hashes only when non-empty. userType can't change on edit.
 */
export interface UserUpdate {
  /** Required for web; may be null for mobile (backend keeps/synthesizes). */
  username: string | null;
  email: string | null;
  role: number;
  locationCodes?: string[] | null;
  password?: string | null;
}

/** Result of `POST /api/users`: the user plus a one-time raw activation key (mobile). */
export interface CreateUserResult {
  user: UserDetail;
  /** Raw mobile activation key — shown ONCE; null for web. */
  activationKey: string | null;
}

/**
 * Server-side list query (UI-side). `pageIndex` is 0-based (Material paginator);
 * the api service maps it to the contract's 1-based `page`. Filters are omitted
 * from the request when null/undefined (= "all").
 */
export interface UserListQuery {
  search?: string;
  pageIndex?: number;
  pageSize?: number;
  /** Role code filter. */
  role?: number | null;
  userType?: UserType | null;
  /** Tri-state: true/false filter, null/undefined = all. */
  isActive?: boolean | null;
  activationStatus?: ActivationStatus | null;
}

/** Role codes selectable for a MOBILE user (Viewer/User/Manager). */
export const MOBILE_ROLE_CODES: readonly number[] = [
  RoleCode.Viewer,
  RoleCode.User,
  RoleCode.Manager,
];

/** Role codes selectable for a WEB user (Manager/Admin/SuperAdmin). */
export const WEB_ROLE_CODES: readonly number[] = [
  RoleCode.Manager,
  RoleCode.Admin,
  RoleCode.SuperAdmin,
];

/** Every role code (used by the list's role filter). */
export const ALL_ROLE_CODES: readonly number[] = [
  RoleCode.Viewer,
  RoleCode.User,
  RoleCode.Manager,
  RoleCode.Admin,
  RoleCode.SuperAdmin,
];
