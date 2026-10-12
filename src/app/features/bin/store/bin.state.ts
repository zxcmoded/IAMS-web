import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { ApiError } from '../../../core/models/api.model';
import { Bin } from '../../../core/models/entities.model';

export const BIN_FEATURE_KEY = 'bin';

export const binAdapter = createEntityAdapter<Bin>({
  selectId: (b) => b.code,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

export interface BinState extends EntityState<Bin> {
  loading: boolean;
  saving: boolean;
  error: ApiError | null;
  search: string;
  pageIndex: number;
  pageSize: number;
  includeInactive: boolean;
  /** Immediate-parent (rackCode) filter → `parentCode` query param. */
  parentFilter: string | null;
  totalCount: number;
}

export const initialBinState: BinState = binAdapter.getInitialState({
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
