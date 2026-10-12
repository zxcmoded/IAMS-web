import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AdminPage, ApiError, ListQuery } from '../../../core/models/api.model';
import { Location } from '../../../core/models/entities.model';
import { LocationCreate, LocationUpdate } from '../location-api.service';

export const LocationActions = createActionGroup({
  source: 'Location',
  events: {
    'Load Locations': props<{ query: ListQuery }>(),
    'Load Locations Success': props<{ page: AdminPage<Location> }>(),
    'Load Locations Failure': props<{ error: ApiError }>(),

    'Search Changed': props<{ search: string }>(),
    'Page Changed': props<{ pageIndex: number; pageSize: number }>(),
    'Include Inactive Toggled': props<{ includeInactive: boolean }>(),
    'Company Filter Changed': props<{ companyId: string | null }>(),

    'Create Location': props<{ payload: LocationCreate }>(),
    'Create Location Success': props<{ location: Location }>(),
    'Create Location Failure': props<{ error: ApiError }>(),

    'Update Location': props<{ code: string; payload: LocationUpdate }>(),
    'Update Location Success': props<{ location: Location }>(),
    'Update Location Failure': props<{ error: ApiError }>(),

    'Delete Location': props<{ code: string }>(),
    'Delete Location Success': props<{ code: string }>(),
    'Delete Location Failure': props<{ error: ApiError }>(),

    'Clear Error': emptyProps(),
  },
});
