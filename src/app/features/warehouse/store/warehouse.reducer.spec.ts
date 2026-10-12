import { warehouseReducer } from './warehouse.reducer';
import { WarehouseActions } from './warehouse.actions';
import { initialWarehouseState, warehouseAdapter } from './warehouse.state';
import { Warehouse } from '../../../core/models/entities.model';
import { AdminPage } from '../../../core/models/api.model';

const wh: Warehouse = {
  code: 'W1',
  name: 'WH One',
  isActive: true,
  locationCode: 'L1',
  companyId: 'c1',
  createdAtUtc: '2026-01-01T00:00:00Z',
};
const page: AdminPage<Warehouse> = {
  items: [wh],
  totalCount: 1,
  page: 1,
  pageSize: 25,
  totalPages: 1,
  hasMore: false,
};

describe('warehouseReducer', () => {
  it('stores the page on success', () => {
    const state = warehouseReducer(initialWarehouseState, WarehouseActions.loadWarehousesSuccess({ page }));
    expect(warehouseAdapter.getSelectors().selectAll(state)).toEqual([wh]);
    expect(state.pageIndex).toBe(0);
  });

  it('resets to page 0 when the parent filter changes', () => {
    const state = warehouseReducer(
      { ...initialWarehouseState, pageIndex: 2 },
      WarehouseActions.parentFilterChanged({ parentCode: 'L1' }),
    );
    expect(state.parentFilter).toBe('L1');
    expect(state.pageIndex).toBe(0);
  });

  it('clears saving + records error on update failure', () => {
    const state = warehouseReducer(
      { ...initialWarehouseState, saving: true },
      WarehouseActions.updateWarehouseFailure({ error: { status: 404, message: 'gone' } }),
    );
    expect(state.saving).toBe(false);
    expect(state.error?.status).toBe(404);
  });
});
