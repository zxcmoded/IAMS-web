import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ListQuery } from '../../../core/models/api.model';
import { WAREHOUSE_FEATURE_KEY, WarehouseState, warehouseAdapter } from './warehouse.state';

export const selectWarehouseState = createFeatureSelector<WarehouseState>(WAREHOUSE_FEATURE_KEY);

const { selectAll } = warehouseAdapter.getSelectors();

export const selectAllWarehouses = createSelector(selectWarehouseState, selectAll);
export const selectWarehousesLoading = createSelector(selectWarehouseState, (s) => s.loading);
export const selectWarehousesSaving = createSelector(selectWarehouseState, (s) => s.saving);
export const selectWarehousesError = createSelector(selectWarehouseState, (s) => s.error);
export const selectWarehouseSearch = createSelector(selectWarehouseState, (s) => s.search);
export const selectWarehousePageIndex = createSelector(selectWarehouseState, (s) => s.pageIndex);
export const selectWarehousePageSize = createSelector(selectWarehouseState, (s) => s.pageSize);
export const selectWarehouseIncludeInactive = createSelector(
  selectWarehouseState,
  (s) => s.includeInactive,
);
export const selectWarehouseParentFilter = createSelector(
  selectWarehouseState,
  (s) => s.parentFilter,
);
export const selectWarehouseTotalCount = createSelector(selectWarehouseState, (s) => s.totalCount);

export const selectWarehouseListQuery = createSelector(
  selectWarehouseSearch,
  selectWarehousePageIndex,
  selectWarehousePageSize,
  selectWarehouseIncludeInactive,
  selectWarehouseParentFilter,
  (search, pageIndex, pageSize, includeInactive, parentFilter): ListQuery => ({
    search,
    pageIndex,
    pageSize,
    includeInactive,
    parentCode: parentFilter ?? undefined,
  }),
);

export const selectWarehouseListViewModel = createSelector(
  selectAllWarehouses,
  selectWarehousesLoading,
  selectWarehousesError,
  selectWarehouseSearch,
  selectWarehouseIncludeInactive,
  selectWarehousePageIndex,
  selectWarehousePageSize,
  selectWarehouseTotalCount,
  (warehouses, loading, error, search, includeInactive, pageIndex, pageSize, totalCount) => ({
    warehouses,
    loading,
    error,
    search,
    includeInactive,
    pageIndex,
    pageSize,
    totalCount,
  }),
);
