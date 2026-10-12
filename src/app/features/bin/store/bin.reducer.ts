import { createReducer, on } from '@ngrx/store';
import { BinActions } from './bin.actions';
import { BinState, binAdapter, initialBinState } from './bin.state';

export const binReducer = createReducer(
  initialBinState,

  on(BinActions.loadBins, (state): BinState => ({ ...state, loading: true, error: null })),

  on(BinActions.loadBinsSuccess, (state, { page }): BinState =>
    binAdapter.setAll(page.items, {
      ...state,
      loading: false,
      error: null,
      totalCount: page.totalCount,
      pageIndex: page.page - 1,
      pageSize: page.pageSize,
    }),
  ),

  on(BinActions.loadBinsFailure, (state, { error }): BinState => ({ ...state, loading: false, error })),

  on(BinActions.searchChanged, (state, { search }): BinState => ({ ...state, search, pageIndex: 0 })),

  on(BinActions.pageChanged, (state, { pageIndex, pageSize }): BinState => ({
    ...state,
    pageIndex,
    pageSize,
  })),

  on(BinActions.includeInactiveToggled, (state, { includeInactive }): BinState => ({
    ...state,
    includeInactive,
    pageIndex: 0,
  })),

  on(BinActions.parentFilterChanged, (state, { parentCode }): BinState => ({
    ...state,
    parentFilter: parentCode,
    pageIndex: 0,
  })),

  on(BinActions.createBin, (state): BinState => ({ ...state, saving: true, error: null })),
  on(BinActions.createBinSuccess, (state): BinState => ({ ...state, saving: false })),
  on(BinActions.createBinFailure, (state, { error }): BinState => ({ ...state, saving: false, error })),

  on(BinActions.updateBin, (state): BinState => ({ ...state, saving: true, error: null })),
  on(BinActions.updateBinSuccess, (state): BinState => ({ ...state, saving: false })),
  on(BinActions.updateBinFailure, (state, { error }): BinState => ({ ...state, saving: false, error })),

  on(BinActions.deleteBin, (state): BinState => ({ ...state, saving: true, error: null })),
  on(BinActions.deleteBinSuccess, (state): BinState => ({ ...state, saving: false })),
  on(BinActions.deleteBinFailure, (state, { error }): BinState => ({ ...state, saving: false, error })),

  on(BinActions.clearError, (state): BinState => ({ ...state, error: null })),
);
