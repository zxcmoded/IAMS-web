import { Company, Location, Rack, Warehouse } from '../../models/entities.model';

export const LOOKUPS_FEATURE_KEY = 'lookups';

/** Max page size per the contract — option lists fetch a single large page. */
export const OPTIONS_PAGE_SIZE = 200;

export interface LookupsState {
  companies: Company[];
  locations: Location[];
  warehouses: Warehouse[];
  racks: Rack[];
  loadingCompanies: boolean;
  loadingLocations: boolean;
  loadingWarehouses: boolean;
  loadingRacks: boolean;
}

export const initialLookupsState: LookupsState = {
  companies: [],
  locations: [],
  warehouses: [],
  racks: [],
  loadingCompanies: false,
  loadingLocations: false,
  loadingWarehouses: false,
  loadingRacks: false,
};
