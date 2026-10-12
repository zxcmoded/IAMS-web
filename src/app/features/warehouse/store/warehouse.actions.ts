import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AdminPage, ApiError, ListQuery } from '../../../core/models/api.model';
import { Warehouse } from '../../../core/models/entities.model';
import { WarehouseCreate, WarehouseUpdate } from '../warehouse-api.service';

export const WarehouseActions = createActionGroup({
  source: 'Warehouse',
  events: {
    'Load Warehouses': props<{ query: ListQuery }>(),
    'Load Warehouses Success': props<{ page: AdminPage<Warehouse> }>(),
    'Load Warehouses Failure': props<{ error: ApiError }>(),

    'Search Changed': props<{ search: string }>(),
    'Page Changed': props<{ pageIndex: number; pageSize: number }>(),
    'Include Inactive Toggled': props<{ includeInactive: boolean }>(),
    'Parent Filter Changed': props<{ parentCode: string | null }>(),

    'Create Warehouse': props<{ payload: WarehouseCreate }>(),
    'Create Warehouse Success': props<{ warehouse: Warehouse }>(),
    'Create Warehouse Failure': props<{ error: ApiError }>(),

    'Update Warehouse': props<{ code: string; payload: WarehouseUpdate }>(),
    'Update Warehouse Success': props<{ warehouse: Warehouse }>(),
    'Update Warehouse Failure': props<{ error: ApiError }>(),

    'Delete Warehouse': props<{ code: string }>(),
    'Delete Warehouse Success': props<{ code: string }>(),
    'Delete Warehouse Failure': props<{ error: ApiError }>(),

    'Clear Error': emptyProps(),
  },
});
