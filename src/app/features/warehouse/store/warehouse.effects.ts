import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, of, switchMap, tap } from 'rxjs';
import { toApiError } from '../../../core/api/http-error.util';
import { entityErrorMessage } from '../../../shared/util/field-error.util';
import { NotificationService } from '../../../shared/services/notification.service';
import { WarehouseApiService } from '../warehouse-api.service';
import { WarehouseActions } from './warehouse.actions';
import { selectWarehouseListQuery } from './warehouse.selectors';

export const loadWarehouses$ = createEffect(
  (actions$ = inject(Actions), api = inject(WarehouseApiService)) =>
    actions$.pipe(
      ofType(WarehouseActions.loadWarehouses),
      switchMap(({ query }) =>
        api.list(query).pipe(
          map((page) => WarehouseActions.loadWarehousesSuccess({ page })),
          catchError((err) => of(WarehouseActions.loadWarehousesFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

export const reloadOnQueryChange$ = createEffect(
  (actions$ = inject(Actions), store = inject(Store)) =>
    actions$.pipe(
      ofType(
        WarehouseActions.searchChanged,
        WarehouseActions.pageChanged,
        WarehouseActions.includeInactiveToggled,
        WarehouseActions.parentFilterChanged,
      ),
      concatLatestFrom(() => store.select(selectWarehouseListQuery)),
      map(([, query]) => WarehouseActions.loadWarehouses({ query })),
    ),
  { functional: true },
);

export const createWarehouse$ = createEffect(
  (actions$ = inject(Actions), api = inject(WarehouseApiService)) =>
    actions$.pipe(
      ofType(WarehouseActions.createWarehouse),
      exhaustMap(({ payload }) =>
        api.create(payload).pipe(
          map((warehouse) => WarehouseActions.createWarehouseSuccess({ warehouse })),
          catchError((err) => of(WarehouseActions.createWarehouseFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

export const updateWarehouse$ = createEffect(
  (actions$ = inject(Actions), api = inject(WarehouseApiService)) =>
    actions$.pipe(
      ofType(WarehouseActions.updateWarehouse),
      exhaustMap(({ code, payload }) =>
        api.update(code, payload).pipe(
          map((warehouse) => WarehouseActions.updateWarehouseSuccess({ warehouse })),
          catchError((err) => of(WarehouseActions.updateWarehouseFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

export const deleteWarehouse$ = createEffect(
  (actions$ = inject(Actions), api = inject(WarehouseApiService)) =>
    actions$.pipe(
      ofType(WarehouseActions.deleteWarehouse),
      exhaustMap(({ code }) =>
        api.remove(code).pipe(
          map(() => WarehouseActions.deleteWarehouseSuccess({ code })),
          catchError((err) => of(WarehouseActions.deleteWarehouseFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

export const reloadAfterMutation$ = createEffect(
  (actions$ = inject(Actions), store = inject(Store)) =>
    actions$.pipe(
      ofType(
        WarehouseActions.createWarehouseSuccess,
        WarehouseActions.updateWarehouseSuccess,
        WarehouseActions.deleteWarehouseSuccess,
      ),
      concatLatestFrom(() => store.select(selectWarehouseListQuery)),
      map(([, query]) => WarehouseActions.loadWarehouses({ query })),
    ),
  { functional: true },
);

export const mutationNotifications$ = createEffect(
  (actions$ = inject(Actions), notify = inject(NotificationService)) =>
    actions$.pipe(
      ofType(
        WarehouseActions.createWarehouseSuccess,
        WarehouseActions.updateWarehouseSuccess,
        WarehouseActions.deleteWarehouseSuccess,
      ),
      tap((action) => {
        const message =
          action.type === WarehouseActions.createWarehouseSuccess.type
            ? 'Warehouse created.'
            : action.type === WarehouseActions.updateWarehouseSuccess.type
              ? 'Warehouse updated.'
              : 'Warehouse deleted.';
        notify.success(message);
      }),
    ),
  { functional: true, dispatch: false },
);

export const failureNotifications$ = createEffect(
  (actions$ = inject(Actions), notify = inject(NotificationService)) =>
    actions$.pipe(
      ofType(
        WarehouseActions.loadWarehousesFailure,
        WarehouseActions.createWarehouseFailure,
        WarehouseActions.updateWarehouseFailure,
        WarehouseActions.deleteWarehouseFailure,
      ),
      tap(({ error }) => notify.error(entityErrorMessage(error, 'warehouse'))),
    ),
  { functional: true, dispatch: false },
);
