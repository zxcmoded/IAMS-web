import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ApiError } from '../../models/api.model';
import { Company, Location, Rack, Warehouse } from '../../models/entities.model';

/**
 * Actions that populate the parent-option dropdowns used by the hierarchical
 * entity forms (Location/Warehouse/Rack/Bin). Loading a level clears all deeper
 * levels so cascading selections stay consistent.
 */
export const LookupsActions = createActionGroup({
  source: 'Lookups',
  events: {
    'Load Company Options': emptyProps(),
    'Load Company Options Success': props<{ companies: Company[] }>(),
    'Load Company Options Failure': props<{ error: ApiError }>(),

    'Load Location Options': props<{ companyId: string }>(),
    'Load Location Options Success': props<{ locations: Location[] }>(),
    'Load Location Options Failure': props<{ error: ApiError }>(),

    'Load Warehouse Options': props<{ locationCode: string }>(),
    'Load Warehouse Options Success': props<{ warehouses: Warehouse[] }>(),
    'Load Warehouse Options Failure': props<{ error: ApiError }>(),

    'Load Rack Options': props<{ warehouseCode: string }>(),
    'Load Rack Options Success': props<{ racks: Rack[] }>(),
    'Load Rack Options Failure': props<{ error: ApiError }>(),

    /** Reset every option list (e.g. when a form dialog closes). */
    'Reset Options': emptyProps(),
  },
});
