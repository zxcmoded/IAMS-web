import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ListQuery } from '../../../core/models/api.model';
import { RACK_FEATURE_KEY, RackState, rackAdapter } from './rack.state';

export const selectRackState = createFeatureSelector<RackState>(RACK_FEATURE_KEY);

const { selectAll } = rackAdapter.getSelectors();

export const selectAllRacks = createSelector(selectRackState, selectAll);
export const selectRacksLoading = createSelector(selectRackState, (s) => s.loading);
export const selectRacksSaving = createSelector(selectRackState, (s) => s.saving);
export const selectRacksError = createSelector(selectRackState, (s) => s.error);
export const selectRackSearch = createSelector(selectRackState, (s) => s.search);
export const selectRackPageIndex = createSelector(selectRackState, (s) => s.pageIndex);
export const selectRackPageSize = createSelector(selectRackState, (s) => s.pageSize);
export const selectRackIncludeInactive = createSelector(selectRackState, (s) => s.includeInactive);
export const selectRackParentFilter = createSelector(selectRackState, (s) => s.parentFilter);
export const selectRackTotalCount = createSelector(selectRackState, (s) => s.totalCount);

export const selectRackListQuery = createSelector(
  selectRackSearch,
  selectRackPageIndex,
  selectRackPageSize,
  selectRackIncludeInactive,
  selectRackParentFilter,
  (search, pageIndex, pageSize, includeInactive, parentFilter): ListQuery => ({
    search,
    pageIndex,
    pageSize,
    includeInactive,
    parentCode: parentFilter ?? undefined,
  }),
);

export const selectRackListViewModel = createSelector(
  selectAllRacks,
  selectRacksLoading,
  selectRacksError,
  selectRackSearch,
  selectRackIncludeInactive,
  selectRackPageIndex,
  selectRackPageSize,
  selectRackTotalCount,
  (racks, loading, error, search, includeInactive, pageIndex, pageSize, totalCount) => ({
    racks,
    loading,
    error,
    search,
    includeInactive,
    pageIndex,
    pageSize,
    totalCount,
  }),
);
