import { rackReducer } from './rack.reducer';
import { RackActions } from './rack.actions';
import { initialRackState, rackAdapter } from './rack.state';
import { Rack } from '../../../core/models/entities.model';
import { AdminPage } from '../../../core/models/api.model';

const rack: Rack = {
  code: 'R1',
  name: 'Rack One',
  isActive: true,
  warehouseCode: 'W1',
  locationCode: 'L1',
  companyId: 'c1',
  createdAtUtc: '2026-01-01T00:00:00Z',
};
const page: AdminPage<Rack> = {
  items: [rack],
  totalCount: 1,
  page: 1,
  pageSize: 25,
  totalPages: 1,
  hasMore: false,
};

describe('rackReducer', () => {
  it('stores the page on success', () => {
    const state = rackReducer(initialRackState, RackActions.loadRacksSuccess({ page }));
    expect(rackAdapter.getSelectors().selectAll(state)).toEqual([rack]);
  });

  it('resets to page 0 when the parent filter changes', () => {
    const state = rackReducer(
      { ...initialRackState, pageIndex: 2 },
      RackActions.parentFilterChanged({ parentCode: 'W1' }),
    );
    expect(state.parentFilter).toBe('W1');
    expect(state.pageIndex).toBe(0);
  });

  it('sets saving on create and clears it on success', () => {
    const saving = rackReducer(
      initialRackState,
      RackActions.createRack({ payload: { code: 'R1', name: 'x', warehouseCode: 'W1' } }),
    );
    expect(saving.saving).toBe(true);
    expect(rackReducer(saving, RackActions.createRackSuccess({ rack })).saving).toBe(false);
  });
});
