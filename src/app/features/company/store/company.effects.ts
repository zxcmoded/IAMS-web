import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, of, switchMap, tap } from 'rxjs';
import { toApiError } from '../../../core/api/http-error.util';
import { entityErrorMessage } from '../../../shared/util/field-error.util';
import { NotificationService } from '../../../shared/services/notification.service';
import { CompanyApiService } from '../company-api.service';
import { CompanyActions } from './company.actions';
import { selectCompanyListQuery } from './company.selectors';

/**
 * Company side effects. Operator choices:
 *  - `switchMap` for loads/search/paginate (cancel a stale in-flight request).
 *  - `exhaustMap` for create/update/delete (ignore duplicate submits).
 * All HTTP lives here; failures map to a normalized ApiError and never kill
 * the effect stream.
 */

export const loadCompanies$ = createEffect(
  (actions$ = inject(Actions), api = inject(CompanyApiService)) =>
    actions$.pipe(
      ofType(CompanyActions.loadCompanies),
      switchMap(({ query }) =>
        api.list(query).pipe(
          map((page) => CompanyActions.loadCompaniesSuccess({ page })),
          catchError((err) => of(CompanyActions.loadCompaniesFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

/** A search or page change recomputes the query from state and reloads. */
export const reloadOnQueryChange$ = createEffect(
  (actions$ = inject(Actions), store = inject(Store)) =>
    actions$.pipe(
      ofType(
        CompanyActions.searchChanged,
        CompanyActions.pageChanged,
        CompanyActions.includeInactiveToggled,
      ),
      concatLatestFrom(() => store.select(selectCompanyListQuery)),
      map(([, query]) => CompanyActions.loadCompanies({ query })),
    ),
  { functional: true },
);

export const createCompany$ = createEffect(
  (actions$ = inject(Actions), api = inject(CompanyApiService)) =>
    actions$.pipe(
      ofType(CompanyActions.createCompany),
      exhaustMap(({ payload }) =>
        api.create(payload).pipe(
          map((company) => CompanyActions.createCompanySuccess({ company })),
          catchError((err) => of(CompanyActions.createCompanyFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

export const updateCompany$ = createEffect(
  (actions$ = inject(Actions), api = inject(CompanyApiService)) =>
    actions$.pipe(
      ofType(CompanyActions.updateCompany),
      exhaustMap(({ id, payload }) =>
        api.update(id, payload).pipe(
          map((company) => CompanyActions.updateCompanySuccess({ company })),
          catchError((err) => of(CompanyActions.updateCompanyFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

export const deleteCompany$ = createEffect(
  (actions$ = inject(Actions), api = inject(CompanyApiService)) =>
    actions$.pipe(
      ofType(CompanyActions.deleteCompany),
      exhaustMap(({ id }) =>
        api.remove(id).pipe(
          map(() => CompanyActions.deleteCompanySuccess({ id })),
          catchError((err) => of(CompanyActions.deleteCompanyFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

/** After any successful mutation, reload the current page of the list. */
export const reloadAfterMutation$ = createEffect(
  (actions$ = inject(Actions), store = inject(Store)) =>
    actions$.pipe(
      ofType(
        CompanyActions.createCompanySuccess,
        CompanyActions.updateCompanySuccess,
        CompanyActions.deleteCompanySuccess,
      ),
      concatLatestFrom(() => store.select(selectCompanyListQuery)),
      map(([, query]) => CompanyActions.loadCompanies({ query })),
    ),
  { functional: true },
);

/** User-facing success toasts for mutations. */
export const mutationNotifications$ = createEffect(
  (actions$ = inject(Actions), notify = inject(NotificationService)) =>
    actions$.pipe(
      ofType(
        CompanyActions.createCompanySuccess,
        CompanyActions.updateCompanySuccess,
        CompanyActions.deleteCompanySuccess,
      ),
      tap((action) => {
        const message =
          action.type === CompanyActions.createCompanySuccess.type
            ? 'Company created.'
            : action.type === CompanyActions.updateCompanySuccess.type
              ? 'Company updated.'
              : 'Company deleted.';
        notify.success(message);
      }),
    ),
  { functional: true, dispatch: false },
);

/** User-facing error toasts for any failure. */
export const failureNotifications$ = createEffect(
  (actions$ = inject(Actions), notify = inject(NotificationService)) =>
    actions$.pipe(
      ofType(
        CompanyActions.loadCompaniesFailure,
        CompanyActions.createCompanyFailure,
        CompanyActions.updateCompanyFailure,
        CompanyActions.deleteCompanyFailure,
      ),
      tap(({ error }) => {
        const message =
          error.code === 'access_denied'
            ? 'Only a Super Admin can create or delete companies.'
            : entityErrorMessage(error, 'company');
        notify.error(message);
      }),
    ),
  { functional: true, dispatch: false },
);
