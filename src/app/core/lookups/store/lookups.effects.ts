import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { CompanyApiService } from '../../../features/company/company-api.service';
import { LocationApiService } from '../../../features/location/location-api.service';
import { WarehouseApiService } from '../../../features/warehouse/warehouse-api.service';
import { RackApiService } from '../../../features/rack/rack-api.service';
import { toApiError } from '../../api/http-error.util';
import { LookupsActions } from './lookups.actions';
import { OPTIONS_PAGE_SIZE } from './lookups.state';

/**
 * Loads active parent options for the cascading entity forms. Each uses
 * `switchMap` so a fast ancestor change cancels a stale in-flight options load.
 * A single large page (contract max 200) is fetched; only active parents are
 * returned (includeInactive defaults false) since you cannot attach to an
 * inactive parent.
 */

export const loadCompanyOptions$ = createEffect(
  (actions$ = inject(Actions), api = inject(CompanyApiService)) =>
    actions$.pipe(
      ofType(LookupsActions.loadCompanyOptions),
      switchMap(() =>
        api.list({ pageSize: OPTIONS_PAGE_SIZE }).pipe(
          map((page) => LookupsActions.loadCompanyOptionsSuccess({ companies: page.items })),
          catchError((err) =>
            of(LookupsActions.loadCompanyOptionsFailure({ error: toApiError(err) })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const loadLocationOptions$ = createEffect(
  (actions$ = inject(Actions), api = inject(LocationApiService)) =>
    actions$.pipe(
      ofType(LookupsActions.loadLocationOptions),
      switchMap(({ companyId }) =>
        api.list({ companyId, pageSize: OPTIONS_PAGE_SIZE }).pipe(
          map((page) => LookupsActions.loadLocationOptionsSuccess({ locations: page.items })),
          catchError((err) =>
            of(LookupsActions.loadLocationOptionsFailure({ error: toApiError(err) })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const loadWarehouseOptions$ = createEffect(
  (actions$ = inject(Actions), api = inject(WarehouseApiService)) =>
    actions$.pipe(
      ofType(LookupsActions.loadWarehouseOptions),
      switchMap(({ locationCode }) =>
        api.list({ parentCode: locationCode, pageSize: OPTIONS_PAGE_SIZE }).pipe(
          map((page) => LookupsActions.loadWarehouseOptionsSuccess({ warehouses: page.items })),
          catchError((err) =>
            of(LookupsActions.loadWarehouseOptionsFailure({ error: toApiError(err) })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const loadRackOptions$ = createEffect(
  (actions$ = inject(Actions), api = inject(RackApiService)) =>
    actions$.pipe(
      ofType(LookupsActions.loadRackOptions),
      switchMap(({ warehouseCode }) =>
        api.list({ parentCode: warehouseCode, pageSize: OPTIONS_PAGE_SIZE }).pipe(
          map((page) => LookupsActions.loadRackOptionsSuccess({ racks: page.items })),
          catchError((err) =>
            of(LookupsActions.loadRackOptionsFailure({ error: toApiError(err) })),
          ),
        ),
      ),
    ),
  { functional: true },
);
