import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ListQuery } from '../../../core/models/api.model';
import { BIN_FEATURE_KEY, BinState, binAdapter } from './bin.state';

export const selectBinState = createFeatureSelector<BinState>(BIN_FEATURE_KEY);

const { selectAll } = binAdapter.getSelectors();

export const selectAllBins = createSelector(selectBinState, selectAll);
export const selectBinsLoading = createSelector(selectBinState, (s) => s.loading);
export const selectBinsSaving = createSelector(selectBinState, (s) => s.saving);
export const selectBinsError = createSelector(selectBinState, (s) => s.error);
export const selectBinSearch = createSelector(selectBinState, (s) => s.search);
export const selectBinPageIndex = createSelector(selectBinState, (s) => s.pageIndex);
export const selectBinPageSize = createSelector(selectBinState, (s) => s.pageSize);
export const selectBinIncludeInactive = createSelector(selectBinState, (s) => s.includeInactive);
export const selectBinParentFilter = createSelector(selectBinState, (s) => s.parentFilter);
export const selectBinTotalCount = createSelector(selectBinState, (s) => s.totalCount);

export const selectBinListQuery = createSelector(
  selectBinSearch,
  selectBinPageIndex,
  selectBinPageSize,
  selectBinIncludeInactive,
  selectBinParentFilter,
  (search, pageIndex, pageSize, includeInactive, parentFilter): ListQuery => ({
    search,
    pageIndex,
    pageSize,
    includeInactive,
    parentCode: parentFilter ?? undefined,
  }),
);

export const selectBinListViewModel = createSelector(
  selectAllBins,
  selectBinsLoading,
  selectBinsError,
  selectBinSearch,
  selectBinIncludeInactive,
  selectBinPageIndex,
  selectBinPageSize,
  selectBinTotalCount,
  (bins, loading, error, search, includeInactive, pageIndex, pageSize, totalCount) => ({
    bins,
    loading,
    error,
    search,
    includeInactive,
    pageIndex,
    pageSize,
    totalCount,
  }),
);
