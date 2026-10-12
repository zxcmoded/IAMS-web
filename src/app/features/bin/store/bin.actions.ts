import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AdminPage, ApiError, ListQuery } from '../../../core/models/api.model';
import { Bin } from '../../../core/models/entities.model';
import { BinCreate, BinUpdate } from '../bin-api.service';

export const BinActions = createActionGroup({
  source: 'Bin',
  events: {
    'Load Bins': props<{ query: ListQuery }>(),
    'Load Bins Success': props<{ page: AdminPage<Bin> }>(),
    'Load Bins Failure': props<{ error: ApiError }>(),

    'Search Changed': props<{ search: string }>(),
    'Page Changed': props<{ pageIndex: number; pageSize: number }>(),
    'Include Inactive Toggled': props<{ includeInactive: boolean }>(),
    'Parent Filter Changed': props<{ parentCode: string | null }>(),

    'Create Bin': props<{ payload: BinCreate }>(),
    'Create Bin Success': props<{ bin: Bin }>(),
    'Create Bin Failure': props<{ error: ApiError }>(),

    'Update Bin': props<{ code: string; payload: BinUpdate }>(),
    'Update Bin Success': props<{ bin: Bin }>(),
    'Update Bin Failure': props<{ error: ApiError }>(),

    'Delete Bin': props<{ code: string }>(),
    'Delete Bin Success': props<{ code: string }>(),
    'Delete Bin Failure': props<{ error: ApiError }>(),

    'Clear Error': emptyProps(),
  },
});
