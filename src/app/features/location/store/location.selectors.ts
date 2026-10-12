import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ListQuery } from '../../../core/models/api.model';
import { LOCATION_FEATURE_KEY, LocationState, locationAdapter } from './location.state';

export const selectLocationState = createFeatureSelector<LocationState>(LOCATION_FEATURE_KEY);

const { selectAll } = locationAdapter.getSelectors();

export const selectAllLocations = createSelector(selectLocationState, selectAll);
export const selectLocationsLoading = createSelector(selectLocationState, (s) => s.loading);
export const selectLocationsSaving = createSelector(selectLocationState, (s) => s.saving);
export const selectLocationsError = createSelector(selectLocationState, (s) => s.error);
export const selectLocationSearch = createSelector(selectLocationState, (s) => s.search);
export const selectLocationPageIndex = createSelector(selectLocationState, (s) => s.pageIndex);
export const selectLocationPageSize = createSelector(selectLocationState, (s) => s.pageSize);
export const selectLocationIncludeInactive = createSelector(
  selectLocationState,
  (s) => s.includeInactive,
);
export const selectLocationCompanyFilter = createSelector(
  selectLocationState,
  (s) => s.companyFilter,
);
export const selectLocationTotalCount = createSelector(selectLocationState, (s) => s.totalCount);

export const selectLocationListQuery = createSelector(
  selectLocationSearch,
  selectLocationPageIndex,
  selectLocationPageSize,
  selectLocationIncludeInactive,
  selectLocationCompanyFilter,
  (search, pageIndex, pageSize, includeInactive, companyFilter): ListQuery => ({
    search,
    pageIndex,
    pageSize,
    includeInactive,
    companyId: companyFilter ?? undefined,
  }),
);

export const selectLocationListViewModel = createSelector(
  selectAllLocations,
  selectLocationsLoading,
  selectLocationsError,
  selectLocationSearch,
  selectLocationIncludeInactive,
  selectLocationPageIndex,
  selectLocationPageSize,
  selectLocationTotalCount,
  (locations, loading, error, search, includeInactive, pageIndex, pageSize, totalCount) => ({
    locations,
    loading,
    error,
    search,
    includeInactive,
    pageIndex,
    pageSize,
    totalCount,
  }),
);
