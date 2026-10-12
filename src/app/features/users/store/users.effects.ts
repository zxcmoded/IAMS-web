import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, of, switchMap, tap } from 'rxjs';
import { toApiError } from '../../../core/api/http-error.util';
import { NotificationService } from '../../../shared/services/notification.service';
import { UsersApiService } from '../users-api.service';
import { usersErrorMessage } from '../users-error.util';
import { UsersActions } from './users.actions';
import { selectUsersListQuery } from './users.selectors';

/**
 * Users side effects. Operator choices mirror the Company template:
 *  - `switchMap` for loads/search/paginate/filter (cancel a stale request).
 *  - `exhaustMap` for create/update (ignore duplicate submits).
 * All HTTP lives here; failures map to a normalized ApiError and never kill the
 * effect stream.
 */

export const loadUsers$ = createEffect(
  (actions$ = inject(Actions), api = inject(UsersApiService)) =>
    actions$.pipe(
      ofType(UsersActions.loadUsers),
      switchMap(({ query }) =>
        api.list(query).pipe(
          map((page) => UsersActions.loadUsersSuccess({ page })),
          catchError((err) => of(UsersActions.loadUsersFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

/** A search / page / filter change recomputes the query from state and reloads. */
export const reloadOnQueryChange$ = createEffect(
  (actions$ = inject(Actions), store = inject(Store)) =>
    actions$.pipe(
      ofType(
        UsersActions.searchChanged,
        UsersActions.pageChanged,
        UsersActions.roleFilterChanged,
        UsersActions.userTypeFilterChanged,
        UsersActions.activeFilterChanged,
        UsersActions.activationStatusFilterChanged,
      ),
      concatLatestFrom(() => store.select(selectUsersListQuery)),
      map(([, query]) => UsersActions.loadUsers({ query })),
    ),
  { functional: true },
);

/** Fetch one user's full detail (companyId + assigned locations) for the edit form. */
export const loadUser$ = createEffect(
  (actions$ = inject(Actions), api = inject(UsersApiService)) =>
    actions$.pipe(
      ofType(UsersActions.loadUser),
      switchMap(({ id }) =>
        api.getById(id).pipe(
          map((user) => UsersActions.loadUserSuccess({ user })),
          catchError((err) => of(UsersActions.loadUserFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

export const createUser$ = createEffect(
  (actions$ = inject(Actions), api = inject(UsersApiService)) =>
    actions$.pipe(
      ofType(UsersActions.createUser),
      exhaustMap(({ payload }) =>
        api.create(payload).pipe(
          map((result) => UsersActions.createUserSuccess({ result })),
          catchError((err) => of(UsersActions.createUserFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

export const updateUser$ = createEffect(
  (actions$ = inject(Actions), api = inject(UsersApiService)) =>
    actions$.pipe(
      ofType(UsersActions.updateUser),
      exhaustMap(({ id, payload }) =>
        api.update(id, payload).pipe(
          map((user) => UsersActions.updateUserSuccess({ user })),
          catchError((err) => of(UsersActions.updateUserFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

/** After any successful mutation, reload the current page of the list. */
export const reloadAfterMutation$ = createEffect(
  (actions$ = inject(Actions), store = inject(Store)) =>
    actions$.pipe(
      ofType(UsersActions.createUserSuccess, UsersActions.updateUserSuccess),
      concatLatestFrom(() => store.select(selectUsersListQuery)),
      map(([, query]) => UsersActions.loadUsers({ query })),
    ),
  { functional: true },
);

/** User-facing success toasts for mutations. */
export const mutationNotifications$ = createEffect(
  (actions$ = inject(Actions), notify = inject(NotificationService)) =>
    actions$.pipe(
      ofType(UsersActions.createUserSuccess, UsersActions.updateUserSuccess),
      tap((action) => {
        notify.success(
          action.type === UsersActions.createUserSuccess.type
            ? 'User created.'
            : 'User updated.',
        );
      }),
    ),
  { functional: true, dispatch: false },
);

/** User-facing error toasts for any failure. */
export const failureNotifications$ = createEffect(
  (actions$ = inject(Actions), notify = inject(NotificationService)) =>
    actions$.pipe(
      ofType(
        UsersActions.loadUsersFailure,
        UsersActions.loadUserFailure,
        UsersActions.createUserFailure,
        UsersActions.updateUserFailure,
      ),
      tap(({ error }) => notify.error(usersErrorMessage(error))),
    ),
  { functional: true, dispatch: false },
);
