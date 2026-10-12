import { binReducer } from './bin.reducer';
import { BinActions } from './bin.actions';
import { binAdapter, initialBinState } from './bin.state';
import { Bin } from '../../../core/models/entities.model';
import { AdminPage } from '../../../core/models/api.model';

const bin: Bin = {
  code: 'B1',
  name: 'Bin One',
  isActive: true,
  rackCode: 'R1',
  warehouseCode: 'W1',
  locationCode: 'L1',
  companyId: 'c1',
  createdAtUtc: '2026-01-01T00:00:00Z',
};
const page: AdminPage<Bin> = {
  items: [bin],
  totalCount: 1,
  page: 1,
  pageSize: 25,
  totalPages: 1,
  hasMore: false,
};

describe('binReducer', () => {
  it('stores the page on success', () => {
    const state = binReducer(initialBinState, BinActions.loadBinsSuccess({ page }));
    expect(binAdapter.getSelectors().selectAll(state)).toEqual([bin]);
  });

  it('resets to page 0 when the parent filter changes', () => {
    const state = binReducer(
      { ...initialBinState, pageIndex: 4 },
      BinActions.parentFilterChanged({ parentCode: 'R1' }),
    );
    expect(state.parentFilter).toBe('R1');
    expect(state.pageIndex).toBe(0);
  });

  it('toggles includeInactive and resets the page', () => {
    const state = binReducer(
      { ...initialBinState, pageIndex: 2 },
      BinActions.includeInactiveToggled({ includeInactive: true }),
    );
    expect(state.includeInactive).toBe(true);
    expect(state.pageIndex).toBe(0);
  });
});
