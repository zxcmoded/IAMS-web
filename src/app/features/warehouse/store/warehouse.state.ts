import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { ApiError } from '../../../core/models/api.model';
import { Warehouse } from '../../../core/models/entities.model';

export const WAREHOUSE_FEATURE_KEY = 'warehouse';

export const warehouseAdapter = createEntityAdapter<Warehouse>({
  selectId: (w) => w.code,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

export interface WarehouseState extends EntityState<Warehouse> {
  loading: boolean;
  saving: boolean;
  error: ApiError | null;
  search: string;
  pageIndex: number;
  pageSize: number;
  includeInactive: boolean;
  /** Immediate-parent (locationCode) filter → `parentCode` query param. */
  parentFilter: string | null;
  totalCount: number;
}

export const initialWarehouseState: WarehouseState = warehouseAdapter.getInitialState({
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
