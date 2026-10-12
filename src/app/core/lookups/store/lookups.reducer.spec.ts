import { lookupsReducer } from './lookups.reducer';
import { LookupsActions } from './lookups.actions';
import { initialLookupsState, LookupsState } from './lookups.state';
import { Location, Rack, Warehouse } from '../../models/entities.model';

const location: Location = {
  code: 'L1',
  name: 'Main',
  isActive: true,
  companyId: 'c1',
  region: null,
  createdAtUtc: '',
};
const warehouse: Warehouse = {
  code: 'W1',
  name: 'WH',
  isActive: true,
  locationCode: 'L1',
  companyId: 'c1',
  createdAtUtc: '',
};
const rack: Rack = {
  code: 'R1',
  name: 'Rack',
  isActive: true,
  warehouseCode: 'W1',
  locationCode: 'L1',
  companyId: 'c1',
  createdAtUtc: '',
};

describe('lookupsReducer', () => {
  it('loading locations clears already-loaded warehouses and racks', () => {
    const start: LookupsState = {
      ...initialLookupsState,
      warehouses: [warehouse],
      racks: [rack],
    };
    const state = lookupsReducer(start, LookupsActions.loadLocationOptions({ companyId: 'c2' }));
    expect(state.loadingLocations).toBe(true);
    expect(state.warehouses).toEqual([]);
    expect(state.racks).toEqual([]);
  });

  it('loading warehouses clears already-loaded racks only', () => {
    const start: LookupsState = {
      ...initialLookupsState,
      locations: [location],
      racks: [rack],
    };
    const state = lookupsReducer(start, LookupsActions.loadWarehouseOptions({ locationCode: 'L1' }));
    expect(state.racks).toEqual([]);
    expect(state.locations).toEqual([location]); // ancestor level untouched
  });

  it('stores loaded location options', () => {
    const state = lookupsReducer(
      initialLookupsState,
      LookupsActions.loadLocationOptionsSuccess({ locations: [location] }),
    );
    expect(state.locations).toEqual([location]);
    expect(state.loadingLocations).toBe(false);
  });

  it('resetOptions returns to the initial empty state', () => {
    const start: LookupsState = { ...initialLookupsState, locations: [location] };
    expect(lookupsReducer(start, LookupsActions.resetOptions())).toEqual(initialLookupsState);
  });
});
