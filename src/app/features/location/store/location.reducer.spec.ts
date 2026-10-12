import { locationReducer } from './location.reducer';
import { LocationActions } from './location.actions';
import { initialLocationState, locationAdapter } from './location.state';
import { Location } from '../../../core/models/entities.model';
import { AdminPage } from '../../../core/models/api.model';

const loc: Location = {
  code: 'L1',
  name: 'Main',
  isActive: true,
  companyId: 'c1',
  region: 'EU',
  createdAtUtc: '2026-01-01T00:00:00Z',
};
const page: AdminPage<Location> = {
  items: [loc],
  totalCount: 1,
  page: 2,
  pageSize: 25,
  totalPages: 2,
  hasMore: false,
};

describe('locationReducer', () => {
  it('maps the 1-based API page to a 0-based index on success', () => {
    const state = locationReducer(initialLocationState, LocationActions.loadLocationsSuccess({ page }));
    expect(state.pageIndex).toBe(1);
    expect(state.totalCount).toBe(1);
    expect(locationAdapter.getSelectors().selectAll(state)).toEqual([loc]);
  });

  it('resets to page 0 when the company filter changes', () => {
    const start = { ...initialLocationState, pageIndex: 3 };
    const state = locationReducer(start, LocationActions.companyFilterChanged({ companyId: 'c2' }));
    expect(state.companyFilter).toBe('c2');
    expect(state.pageIndex).toBe(0);
  });

  it('records a code_conflict error on create failure', () => {
    const state = locationReducer(
      { ...initialLocationState, saving: true },
      LocationActions.createLocationFailure({
        error: { status: 409, code: 'code_conflict', message: 'dupe' },
      }),
    );
    expect(state.saving).toBe(false);
    expect(state.error?.code).toBe('code_conflict');
  });
});
