import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { ApiError } from '../../../core/models/api.model';
import { Location } from '../../../core/models/entities.model';

export const LOCATION_FEATURE_KEY = 'location';

/** Keyed by the immutable user-entered `code`. */
export const locationAdapter = createEntityAdapter<Location>({
  selectId: (l) => l.code,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

export interface LocationState extends EntityState<Location> {
  loading: boolean;
  saving: boolean;
  error: ApiError | null;
  search: string;
  pageIndex: number;
  pageSize: number;
  includeInactive: boolean;
  /** Parent company filter for the list (maps to the `companyId` query param). */
  companyFilter: string | null;
  totalCount: number;
}

export const initialLocationState: LocationState = locationAdapter.getInitialState({
  loading: false,
  saving: false,
  error: null,
  search: '',
  pageIndex: 0,
  pageSize: 25,
  includeInactive: false,
  companyFilter: null,
  totalCount: 0,
});
