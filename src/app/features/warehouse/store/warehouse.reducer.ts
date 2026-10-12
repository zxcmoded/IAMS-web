import { createReducer, on } from '@ngrx/store';
import { WarehouseActions } from './warehouse.actions';
import { WarehouseState, initialWarehouseState, warehouseAdapter } from './warehouse.state';

export const warehouseReducer = createReducer(
  initialWarehouseState,

  on(WarehouseActions.loadWarehouses, (state): WarehouseState => ({ ...state, loading: true, error: null })),

  on(WarehouseActions.loadWarehousesSuccess, (state, { page }): WarehouseState =>
    warehouseAdapter.setAll(page.items, {
      ...state,
      loading: false,
      error: null,
      totalCount: page.totalCount,
      pageIndex: page.page - 1,
      pageSize: page.pageSize,
    }),
  ),

  on(WarehouseActions.loadWarehousesFailure, (state, { error }): WarehouseState => ({
    ...state,
    loading: false,
    error,
  })),

  on(WarehouseActions.searchChanged, (state, { search }): WarehouseState => ({
    ...state,
    search,
    pageIndex: 0,
  })),

  on(WarehouseActions.pageChanged, (state, { pageIndex, pageSize }): WarehouseState => ({
    ...state,
    pageIndex,
    pageSize,
  })),

  on(WarehouseActions.includeInactiveToggled, (state, { includeInactive }): WarehouseState => ({
    ...state,
    includeInactive,
    pageIndex: 0,
  })),

  on(WarehouseActions.parentFilterChanged, (state, { parentCode }): WarehouseState => ({
    ...state,
    parentFilter: parentCode,
    pageIndex: 0,
  })),

  on(WarehouseActions.createWarehouse, (state): WarehouseState => ({ ...state, saving: true, error: null })),
  on(WarehouseActions.createWarehouseSuccess, (state): WarehouseState => ({ ...state, saving: false })),
  on(WarehouseActions.createWarehouseFailure, (state, { error }): WarehouseState => ({
    ...state,
    saving: false,
    error,
  })),

  on(WarehouseActions.updateWarehouse, (state): WarehouseState => ({ ...state, saving: true, error: null })),
  on(WarehouseActions.updateWarehouseSuccess, (state): WarehouseState => ({ ...state, saving: false })),
  on(WarehouseActions.updateWarehouseFailure, (state, { error }): WarehouseState => ({
    ...state,
    saving: false,
    error,
  })),

  on(WarehouseActions.deleteWarehouse, (state): WarehouseState => ({ ...state, saving: true, error: null })),
  on(WarehouseActions.deleteWarehouseSuccess, (state): WarehouseState => ({ ...state, saving: false })),
  on(WarehouseActions.deleteWarehouseFailure, (state, { error }): WarehouseState => ({
    ...state,
    saving: false,
    error,
  })),

  on(WarehouseActions.clearError, (state): WarehouseState => ({ ...state, error: null })),
);
