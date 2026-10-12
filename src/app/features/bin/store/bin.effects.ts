import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, of, switchMap, tap } from 'rxjs';
import { toApiError } from '../../../core/api/http-error.util';
import { entityErrorMessage } from '../../../shared/util/field-error.util';
import { NotificationService } from '../../../shared/services/notification.service';
import { BinApiService } from '../bin-api.service';
import { BinActions } from './bin.actions';
import { selectBinListQuery } from './bin.selectors';

export const loadBins$ = createEffect(
  (actions$ = inject(Actions), api = inject(BinApiService)) =>
    actions$.pipe(
      ofType(BinActions.loadBins),
      switchMap(({ query }) =>
        api.list(query).pipe(
          map((page) => BinActions.loadBinsSuccess({ page })),
          catchError((err) => of(BinActions.loadBinsFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

export const reloadOnQueryChange$ = createEffect(
  (actions$ = inject(Actions), store = inject(Store)) =>
    actions$.pipe(
      ofType(
        BinActions.searchChanged,
        BinActions.pageChanged,
        BinActions.includeInactiveToggled,
        BinActions.parentFilterChanged,
      ),
      concatLatestFrom(() => store.select(selectBinListQuery)),
      map(([, query]) => BinActions.loadBins({ query })),
    ),
  { functional: true },
);

export const createBin$ = createEffect(
  (actions$ = inject(Actions), api = inject(BinApiService)) =>
    actions$.pipe(
      ofType(BinActions.createBin),
      exhaustMap(({ payload }) =>
        api.create(payload).pipe(
          map((bin) => BinActions.createBinSuccess({ bin })),
          catchError((err) => of(BinActions.createBinFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

export const updateBin$ = createEffect(
  (actions$ = inject(Actions), api = inject(BinApiService)) =>
    actions$.pipe(
      ofType(BinActions.updateBin),
      exhaustMap(({ code, payload }) =>
        api.update(code, payload).pipe(
          map((bin) => BinActions.updateBinSuccess({ bin })),
          catchError((err) => of(BinActions.updateBinFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

export const deleteBin$ = createEffect(
  (actions$ = inject(Actions), api = inject(BinApiService)) =>
    actions$.pipe(
      ofType(BinActions.deleteBin),
      exhaustMap(({ code }) =>
        api.remove(code).pipe(
          map(() => BinActions.deleteBinSuccess({ code })),
          catchError((err) => of(BinActions.deleteBinFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  { functional: true },
);

export const reloadAfterMutation$ = createEffect(
  (actions$ = inject(Actions), store = inject(Store)) =>
    actions$.pipe(
      ofType(
        BinActions.createBinSuccess,
        BinActions.updateBinSuccess,
        BinActions.deleteBinSuccess,
      ),
      concatLatestFrom(() => store.select(selectBinListQuery)),
      map(([, query]) => BinActions.loadBins({ query })),
    ),
  { functional: true },
);

export const mutationNotifications$ = createEffect(
  (actions$ = inject(Actions), notify = inject(NotificationService)) =>
    actions$.pipe(
      ofType(BinActions.createBinSuccess, BinActions.updateBinSuccess, BinActions.deleteBinSuccess),
      tap((action) => {
        const message =
          action.type === BinActions.createBinSuccess.type
            ? 'Bin created.'
            : action.type === BinActions.updateBinSuccess.type
              ? 'Bin updated.'
              : 'Bin deleted.';
        notify.success(message);
      }),
    ),
  { functional: true, dispatch: false },
);

export const failureNotifications$ = createEffect(
  (actions$ = inject(Actions), notify = inject(NotificationService)) =>
    actions$.pipe(
      ofType(
        BinActions.loadBinsFailure,
        BinActions.createBinFailure,
        BinActions.updateBinFailure,
        BinActions.deleteBinFailure,
      ),
      tap(({ error }) => notify.error(entityErrorMessage(error, 'bin'))),
    ),
  { functional: true, dispatch: false },
);
