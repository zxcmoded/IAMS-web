import { createReducer, on } from '@ngrx/store';
import { LookupsActions } from './lookups.actions';
import { LookupsState, initialLookupsState } from './lookups.state';

export const lookupsReducer = createReducer(
  initialLookupsState,

  // --- companies ---
  on(LookupsActions.loadCompanyOptions, (state): LookupsState => ({
    ...state,
    loadingCompanies: true,
  })),
  on(LookupsActions.loadCompanyOptionsSuccess, (state, { companies }): LookupsState => ({
    ...state,
    companies,
    loadingCompanies: false,
  })),
  on(LookupsActions.loadCompanyOptionsFailure, (state): LookupsState => ({
    ...state,
    loadingCompanies: false,
  })),

  // --- locations (clears deeper: warehouses + racks) ---
  on(LookupsActions.loadLocationOptions, (state): LookupsState => ({
    ...state,
    loadingLocations: true,
    warehouses: [],
    racks: [],
  })),
  on(LookupsActions.loadLocationOptionsSuccess, (state, { locations }): LookupsState => ({
    ...state,
    locations,
    loadingLocations: false,
  })),
  on(LookupsActions.loadLocationOptionsFailure, (state): LookupsState => ({
    ...state,
    loadingLocations: false,
  })),

  // --- warehouses (clears deeper: racks) ---
  on(LookupsActions.loadWarehouseOptions, (state): LookupsState => ({
    ...state,
    loadingWarehouses: true,
    racks: [],
  })),
  on(LookupsActions.loadWarehouseOptionsSuccess, (state, { warehouses }): LookupsState => ({
    ...state,
    warehouses,
    loadingWarehouses: false,
  })),
  on(LookupsActions.loadWarehouseOptionsFailure, (state): LookupsState => ({
    ...state,
    loadingWarehouses: false,
  })),

  // --- racks ---
  on(LookupsActions.loadRackOptions, (state): LookupsState => ({
    ...state,
    loadingRacks: true,
  })),
  on(LookupsActions.loadRackOptionsSuccess, (state, { racks }): LookupsState => ({
    ...state,
    racks,
    loadingRacks: false,
  })),
  on(LookupsActions.loadRackOptionsFailure, (state): LookupsState => ({
    ...state,
    loadingRacks: false,
  })),

  on(LookupsActions.resetOptions, (): LookupsState => initialLookupsState),
);
