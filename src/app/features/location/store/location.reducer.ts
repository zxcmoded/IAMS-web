import { createReducer, on } from '@ngrx/store';
import { LocationActions } from './location.actions';
import { LocationState, initialLocationState, locationAdapter } from './location.state';

export const locationReducer = createReducer(
  initialLocationState,

  on(LocationActions.loadLocations, (state): LocationState => ({ ...state, loading: true, error: null })),

  on(LocationActions.loadLocationsSuccess, (state, { page }): LocationState =>
    locationAdapter.setAll(page.items, {
      ...state,
      loading: false,
      error: null,
      totalCount: page.totalCount,
      pageIndex: page.page - 1,
      pageSize: page.pageSize,
    }),
  ),

  on(LocationActions.loadLocationsFailure, (state, { error }): LocationState => ({
    ...state,
    loading: false,
    error,
  })),

  on(LocationActions.searchChanged, (state, { search }): LocationState => ({
    ...state,
    search,
    pageIndex: 0,
  })),

  on(LocationActions.pageChanged, (state, { pageIndex, pageSize }): LocationState => ({
    ...state,
    pageIndex,
    pageSize,
  })),

  on(LocationActions.includeInactiveToggled, (state, { includeInactive }): LocationState => ({
    ...state,
    includeInactive,
    pageIndex: 0,
  })),

  on(LocationActions.companyFilterChanged, (state, { companyId }): LocationState => ({
    ...state,
    companyFilter: companyId,
    pageIndex: 0,
  })),

  on(LocationActions.createLocation, (state): LocationState => ({ ...state, saving: true, error: null })),
  on(LocationActions.createLocationSuccess, (state): LocationState => ({ ...state, saving: false })),
  on(LocationActions.createLocationFailure, (state, { error }): LocationState => ({
    ...state,
    saving: false,
    error,
  })),

  on(LocationActions.updateLocation, (state): LocationState => ({ ...state, saving: true, error: null })),
  on(LocationActions.updateLocationSuccess, (state): LocationState => ({ ...state, saving: false })),
  on(LocationActions.updateLocationFailure, (state, { error }): LocationState => ({
    ...state,
    saving: false,
    error,
  })),

  on(LocationActions.deleteLocation, (state): LocationState => ({ ...state, saving: true, error: null })),
  on(LocationActions.deleteLocationSuccess, (state): LocationState => ({ ...state, saving: false })),
  on(LocationActions.deleteLocationFailure, (state, { error }): LocationState => ({
    ...state,
    saving: false,
    error,
  })),

  on(LocationActions.clearError, (state): LocationState => ({ ...state, error: null })),
);
