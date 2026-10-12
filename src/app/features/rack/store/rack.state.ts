import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { ApiError } from '../../../core/models/api.model';
import { Rack } from '../../../core/models/entities.model';

export const RACK_FEATURE_KEY = 'rack';

export const rackAdapter = createEntityAdapter<Rack>({
  selectId: (r) => r.code,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

export interface RackState extends EntityState<Rack> {
  loading: boolean;
  saving: boolean;
  error: ApiError | null;
  search: string;
  pageIndex: number;
  pageSize: number;
  includeInactive: boolean;
  /** Immediate-parent (warehouseCode) filter → `parentCode` query param. */
  parentFilter: string | null;
  totalCount: number;
}

export const initialRackState: RackState = rackAdapter.getInitialState({
  loading: false,
  saving: false,
  error: null,
  search: '',
  pageIndex: 0,
  pageSize: 25,
  includeInactive: false,
  parentFilter: null,
  totalCount: 0,
});
