import { createReducer, on } from '@ngrx/store';
import { RackActions } from './rack.actions';
import { RackState, initialRackState, rackAdapter } from './rack.state';

export const rackReducer = createReducer(
  initialRackState,

  on(RackActions.loadRacks, (state): RackState => ({ ...state, loading: true, error: null })),

  on(RackActions.loadRacksSuccess, (state, { page }): RackState =>
    rackAdapter.setAll(page.items, {
      ...state,
      loading: false,
      error: null,
      totalCount: page.totalCount,
      pageIndex: page.page - 1,
      pageSize: page.pageSize,
    }),
  ),

  on(RackActions.loadRacksFailure, (state, { error }): RackState => ({
    ...state,
    loading: false,
    error,
  })),

  on(RackActions.searchChanged, (state, { search }): RackState => ({ ...state, search, pageIndex: 0 })),

  on(RackActions.pageChanged, (state, { pageIndex, pageSize }): RackState => ({
    ...state,
    pageIndex,
    pageSize,
  })),

  on(RackActions.includeInactiveToggled, (state, { includeInactive }): RackState => ({
    ...state,
    includeInactive,
    pageIndex: 0,
  })),

  on(RackActions.parentFilterChanged, (state, { parentCode }): RackState => ({
    ...state,
    parentFilter: parentCode,
    pageIndex: 0,
  })),

  on(RackActions.createRack, (state): RackState => ({ ...state, saving: true, error: null })),
  on(RackActions.createRackSuccess, (state): RackState => ({ ...state, saving: false })),
  on(RackActions.createRackFailure, (state, { error }): RackState => ({ ...state, saving: false, error })),

  on(RackActions.updateRack, (state): RackState => ({ ...state, saving: true, error: null })),
  on(RackActions.updateRackSuccess, (state): RackState => ({ ...state, saving: false })),
  on(RackActions.updateRackFailure, (state, { error }): RackState => ({ ...state, saving: false, error })),

  on(RackActions.deleteRack, (state): RackState => ({ ...state, saving: true, error: null })),
  on(RackActions.deleteRackSuccess, (state): RackState => ({ ...state, saving: false })),
  on(RackActions.deleteRackFailure, (state, { error }): RackState => ({ ...state, saving: false, error })),

  on(RackActions.clearError, (state): RackState => ({ ...state, error: null })),
);
