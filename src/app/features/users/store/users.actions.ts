import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AdminPage, ApiError } from '../../../core/models/api.model';
import {
  ActivationStatus,
  CreateUserResult,
  UserCreate,
  UserDetail,
  UserListItem,
  UserListQuery,
  UserType,
  UserUpdate,
} from '../user.model';

/**
 * Users feature actions. Mirrors the Company template, plus: per-field list
 * filters (role / userType / active / activation status), a `loadUser` edit
 * fetch (to resolve `companyId` + assigned locations), and a create-success
 * that carries the one-time `activationKey`. There is no delete (not in the
 * contract).
 */
export const UsersActions = createActionGroup({
  source: 'Users',
  events: {
    // --- list / search / paginate / filter ---
    'Load Users': props<{ query: UserListQuery }>(),
    'Load Users Success': props<{ page: AdminPage<UserListItem> }>(),
    'Load Users Failure': props<{ error: ApiError }>(),

    'Search Changed': props<{ search: string }>(),
    'Page Changed': props<{ pageIndex: number; pageSize: number }>(),
    'Role Filter Changed': props<{ role: number | null }>(),
    'User Type Filter Changed': props<{ userType: UserType | null }>(),
    'Active Filter Changed': props<{ isActive: boolean | null }>(),
    'Activation Status Filter Changed': props<{ activationStatus: ActivationStatus | null }>(),

    // --- fetch one (edit flow needs companyId, not present on the list item) ---
    'Load User': props<{ id: string }>(),
    'Load User Success': props<{ user: UserDetail }>(),
    'Load User Failure': props<{ error: ApiError }>(),
    'Clear Selected': emptyProps(),

    // --- create (returns one-time activationKey for mobile) ---
    'Create User': props<{ payload: UserCreate }>(),
    'Create User Success': props<{ result: CreateUserResult }>(),
    'Create User Failure': props<{ error: ApiError }>(),

    // --- update ---
    'Update User': props<{ id: string; payload: UserUpdate }>(),
    'Update User Success': props<{ user: UserDetail }>(),
    'Update User Failure': props<{ error: ApiError }>(),

    // Clear any transient mutation error (e.g. when (re)opening the form)
    'Clear Error': emptyProps(),
  },
});
