import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LOOKUPS_FEATURE_KEY, LookupsState } from './lookups.state';

export const selectLookupsState = createFeatureSelector<LookupsState>(LOOKUPS_FEATURE_KEY);

export const selectCompanyOptions = createSelector(selectLookupsState, (s) => s.companies);
export const selectLocationOptions = createSelector(selectLookupsState, (s) => s.locations);
export const selectWarehouseOptions = createSelector(selectLookupsState, (s) => s.warehouses);
export const selectRackOptions = createSelector(selectLookupsState, (s) => s.racks);

export const selectLoadingCompanyOptions = createSelector(
  selectLookupsState,
  (s) => s.loadingCompanies,
);
export const selectLoadingLocationOptions = createSelector(
  selectLookupsState,
  (s) => s.loadingLocations,
);
export const selectLoadingWarehouseOptions = createSelector(
  selectLookupsState,
  (s) => s.loadingWarehouses,
);
export const selectLoadingRackOptions = createSelector(
  selectLookupsState,
  (s) => s.loadingRacks,
);
