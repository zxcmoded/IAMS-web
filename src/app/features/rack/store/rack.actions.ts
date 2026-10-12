import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AdminPage, ApiError, ListQuery } from '../../../core/models/api.model';
import { Rack } from '../../../core/models/entities.model';
import { RackCreate, RackUpdate } from '../rack-api.service';

export const RackActions = createActionGroup({
  source: 'Rack',
  events: {
    'Load Racks': props<{ query: ListQuery }>(),
    'Load Racks Success': props<{ page: AdminPage<Rack> }>(),
    'Load Racks Failure': props<{ error: ApiError }>(),

    'Search Changed': props<{ search: string }>(),
    'Page Changed': props<{ pageIndex: number; pageSize: number }>(),
    'Include Inactive Toggled': props<{ includeInactive: boolean }>(),
    'Parent Filter Changed': props<{ parentCode: string | null }>(),

    'Create Rack': props<{ payload: RackCreate }>(),
    'Create Rack Success': props<{ rack: Rack }>(),
    'Create Rack Failure': props<{ error: ApiError }>(),

    'Update Rack': props<{ code: string; payload: RackUpdate }>(),
    'Update Rack Success': props<{ rack: Rack }>(),
    'Update Rack Failure': props<{ error: ApiError }>(),

    'Delete Rack': props<{ code: string }>(),
    'Delete Rack Success': props<{ code: string }>(),
    'Delete Rack Failure': props<{ error: ApiError }>(),

    'Clear Error': emptyProps(),
  },
});
