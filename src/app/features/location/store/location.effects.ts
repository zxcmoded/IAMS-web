import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, of, switchMap, tap } from 'rxjs';
import { toApiError } from '../../../core/api/http-error.util';
import { entityErrorMessage } from '../../../shared/util/field-error.util';
import { NotificationService } from '../../../shared/services/notification.service';
import { LocationApiService } from '../location-api.service';
import { LocationActions } from './location.actions';
import { selectLocationListQuery } from './location.selectors';

export const loadLocations$ = createEffect(
  (actions$ = inject(Actions), api = inject(LocationApiService)) =>
    actions$.pipe(
      ofType(LocationActions.loadLocations),
      switchMap(({ query }) =>
        api.list(query).pipe(
          map((page) => LocationActions.loadLocationsSuccess({ page })),
          catchError((err) => of(LocationActions.loadLocationsFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

export const reloadOnQueryChange$ = createEffect(
  (actions$ = inject(Actions), store = inject(Store)) =>
    actions$.pipe(
      ofType(
        LocationActions.searchChanged,
        LocationActions.pageChanged,
        LocationActions.includeInactiveToggled,
        LocationActions.companyFilterChanged,
      ),
      concatLatestFrom(() => store.select(selectLocationListQuery)),
      map(([, query]) => LocationActions.loadLocations({ query })),
    ),
  { functional: true },
);

export const createLocation$ = createEffect(
  (actions$ = inject(Actions), api = inject(LocationApiService)) =>
    actions$.pipe(
      ofType(LocationActions.createLocation),
      exhaustMap(({ payload }) =>
        api.create(payload).pipe(
          map((location) => LocationActions.createLocationSuccess({ location })),
          catchError((err) => of(LocationActions.createLocationFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

export const updateLocation$ = createEffect(
  (actions$ = inject(Actions), api = inject(LocationApiService)) =>
    actions$.pipe(
      ofType(LocationActions.updateLocation),
      exhaustMap(({ code, payload }) =>
        api.update(code, payload).pipe(
          map((location) => LocationActions.updateLocationSuccess({ location })),
          catchError((err) => of(LocationActions.updateLocationFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

export const deleteLocation$ = createEffect(
  (actions$ = inject(Actions), api = inject(LocationApiService)) =>
    actions$.pipe(
      ofType(LocationActions.deleteLocation),
      exhaustMap(({ code }) =>
        api.remove(code).pipe(
          map(() => LocationActions.deleteLocationSuccess({ code })),
          catchError((err) => of(LocationActions.deleteLocationFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

export const reloadAfterMutation$ = createEffect(
  (actions$ = inject(Actions), store = inject(Store)) =>
    actions$.pipe(
      ofType(
        LocationActions.createLocationSuccess,
        LocationActions.updateLocationSuccess,
        LocationActions.deleteLocationSuccess,
      ),
      concatLatestFrom(() => store.select(selectLocationListQuery)),
      map(([, query]) => LocationActions.loadLocations({ query })),
    ),
  { functional: true },
);

export const mutationNotifications$ = createEffect(
  (actions$ = inject(Actions), notify = inject(NotificationService)) =>
    actions$.pipe(
      ofType(
        LocationActions.createLocationSuccess,
        LocationActions.updateLocationSuccess,
        LocationActions.deleteLocationSuccess,
      ),
      tap((action) => {
        const message =
          action.type === LocationActions.createLocationSuccess.type
            ? 'Location created.'
            : action.type === LocationActions.updateLocationSuccess.type
              ? 'Location updated.'
              : 'Location deleted.';
        notify.success(message);
      }),
    ),
  { functional: true, dispatch: false },
);

export const failureNotifications$ = createEffect(
  (actions$ = inject(Actions), notify = inject(NotificationService)) =>
    actions$.pipe(
      ofType(
        LocationActions.loadLocationsFailure,
        LocationActions.createLocationFailure,
        LocationActions.updateLocationFailure,
        LocationActions.deleteLocationFailure,
      ),
      tap(({ error }) => notify.error(entityErrorMessage(error, 'location'))),
    ),
  { functional: true, dispatch: false },
);
