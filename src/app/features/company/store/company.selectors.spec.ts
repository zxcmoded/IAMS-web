import {
  selectAllCompanies,
  selectCompanyListQuery,
  selectCompanyListViewModel,
  selectCompaniesLoading,
} from './company.selectors';
import { COMPANY_FEATURE_KEY, companyAdapter, initialCompanyState } from './company.state';
import { Company } from '../../../core/models/entities.model';

const companyA: Company = {
  companyId: 'a',
  name: 'Acme',
  isActive: true,
  createdAtUtc: '2026-01-01T00:00:00Z',
};

function stateWith(overrides: Partial<typeof initialCompanyState> = {}) {
  const feature = companyAdapter.setAll([companyA], { ...initialCompanyState, ...overrides });
  return { [COMPANY_FEATURE_KEY]: feature };
}

describe('company selectors', () => {
  it('selectAllCompanies returns the collection', () => {
    expect(selectAllCompanies(stateWith())).toEqual([companyA]);
  });

  it('selectCompaniesLoading reflects the flag', () => {
    expect(selectCompaniesLoading(stateWith({ loading: true }))).toBe(true);
  });

  it('selectCompanyListQuery composes search/pageIndex/pageSize/includeInactive', () => {
    const query = selectCompanyListQuery(
      stateWith({ search: 'ac', pageIndex: 1, pageSize: 25, includeInactive: true }),
    );
    expect(query).toEqual({ search: 'ac', pageIndex: 1, pageSize: 25, includeInactive: true });
  });

  it('selectCompanyListViewModel bundles list state for the container', () => {
    const vm = selectCompanyListViewModel(
      stateWith({ loading: true, totalCount: 7, pageIndex: 1, pageSize: 25, search: 'ac' }),
    );
    expect(vm.companies).toEqual([companyA]);
    expect(vm.loading).toBe(true);
    expect(vm.totalCount).toBe(7);
    expect(vm.pageIndex).toBe(1);
    expect(vm.pageSize).toBe(25);
    expect(vm.search).toBe('ac');
  });
});
