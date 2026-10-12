import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AdminPage, ApiError, ListQuery } from '../../../core/models/api.model';
import { Company } from '../../../core/models/entities.model';
import { CompanyCreate, CompanyUpdate } from '../company-api.service';

/**
 * Company feature actions — the repeatable template every other entity mirrors.
 */
export const CompanyActions = createActionGroup({
  source: 'Company',
  events: {
    // --- list / search / paginate / filter ---
    'Load Companies': props<{ query: ListQuery }>(),
    'Load Companies Success': props<{ page: AdminPage<Company> }>(),
    'Load Companies Failure': props<{ error: ApiError }>(),

    'Search Changed': props<{ search: string }>(),
    'Page Changed': props<{ pageIndex: number; pageSize: number }>(),
    'Include Inactive Toggled': props<{ includeInactive: boolean }>(),

    // --- create (SuperAdmin-only server-side) ---
    'Create Company': props<{ payload: CompanyCreate }>(),
    'Create Company Success': props<{ company: Company }>(),
    'Create Company Failure': props<{ error: ApiError }>(),

    // --- update ---
    'Update Company': props<{ id: string; payload: CompanyUpdate }>(),
    'Update Company Success': props<{ company: Company }>(),
    'Update Company Failure': props<{ error: ApiError }>(),

    // --- delete (soft-delete server-side; SuperAdmin-only) ---
    'Delete Company': props<{ id: string }>(),
    'Delete Company Success': props<{ id: string }>(),
    'Delete Company Failure': props<{ error: ApiError }>(),

    // Clear any transient mutation error (e.g. when (re)opening the form)
    'Clear Error': emptyProps(),
  },
});
