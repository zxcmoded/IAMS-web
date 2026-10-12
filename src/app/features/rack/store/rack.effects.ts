import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, of, switchMap, tap } from 'rxjs';
import { toApiError } from '../../../core/api/http-error.util';
import { entityErrorMessage } from '../../../shared/util/field-error.util';
import { NotificationService } from '../../../shared/services/notification.service';
import { RackApiService } from '../rack-api.service';
import { RackActions } from './rack.actions';
import { selectRackListQuery } from './rack.selectors';

export const loadRacks$ = createEffect(
  (actions$ = inject(Actions), api = inject(RackApiService)) =>
    actions$.pipe(
      ofType(RackActions.loadRacks),
      switchMap(({ query }) =>
        api.list(query).pipe(
          map((page) => RackActions.loadRacksSuccess({ page })),
          catchError((err) => of(RackActions.loadRacksFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

export const reloadOnQueryChange$ = createEffect(
  (actions$ = inject(Actions), store = inject(Store)) =>
    actions$.pipe(
      ofType(
        RackActions.searchChanged,
        RackActions.pageChanged,
        RackActions.includeInactiveToggled,
        RackActions.parentFilterChanged,
      ),
      concatLatestFrom(() => store.select(selectRackListQuery)),
      map(([, query]) => RackActions.loadRacks({ query })),
    ),
  { functional: true },
);

export const createRack$ = createEffect(
  (actions$ = inject(Actions), api = inject(RackApiService)) =>
    actions$.pipe(
      ofType(RackActions.createRack),
      exhaustMap(({ payload }) =>
        api.create(payload).pipe(
          map((rack) => RackActions.createRackSuccess({ rack })),
          catchError((err) => of(RackActions.createRackFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

export const updateRack$ = createEffect(
  (actions$ = inject(Actions), api = inject(RackApiService)) =>
    actions$.pipe(
      ofType(RackActions.updateRack),
      exhaustMap(({ code, payload }) =>
        api.update(code, payload).pipe(
          map((rack) => RackActions.updateRackSuccess({ rack })),
          catchError((err) => of(RackActions.updateRackFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

export const deleteRack$ = createEffect(
  (actions$ = inject(Actions), api = inject(RackApiService)) =>
    actions$.pipe(
      ofType(RackActions.deleteRack),
      exhaustMap(({ code }) =>
        api.remove(code).pipe(
          map(() => RackActions.deleteRackSuccess({ code })),
          catchError((err) => of(RackActions.deleteRackFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

export const reloadAfterMutation$ = createEffect(
  (actions$ = inject(Actions), store = inject(Store)) =>
    actions$.pipe(
      ofType(
        RackActions.createRackSuccess,
        RackActions.updateRackSuccess,
        RackActions.deleteRackSuccess,
      ),
      concatLatestFrom(() => store.select(selectRackListQuery)),
      map(([, query]) => RackActions.loadRacks({ query })),
    ),
  { functional: true },
);

export const mutationNotifications$ = createEffect(
  (actions$ = inject(Actions), notify = inject(NotificationService)) =>
    actions$.pipe(
      ofType(
        RackActions.createRackSuccess,
        RackActions.updateRackSuccess,
        RackActions.deleteRackSuccess,
      ),
      tap((action) => {
        const message =
          action.type === RackActions.createRackSuccess.type
            ? 'Rack created.'
            : action.type === RackActions.updateRackSuccess.type
              ? 'Rack updated.'
              : 'Rack deleted.';
        notify.success(message);
      }),
    ),
  { functional: true, dispatch: false },
);

export const failureNotifications$ = createEffect(
  (actions$ = inject(Actions), notify = inject(NotificationService)) =>
    actions$.pipe(
      ofType(
        RackActions.loadRacksFailure,
        RackActions.createRackFailure,
        RackActions.updateRackFailure,
        RackActions.deleteRackFailure,
      ),
      tap(({ error }) => notify.error(entityErrorMessage(error, 'rack'))),
    ),
  { functional: true, dispatch: false },
);
