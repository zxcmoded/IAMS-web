import { companyReducer } from './company.reducer';
import { CompanyActions } from './company.actions';
import { companyAdapter, initialCompanyState } from './company.state';
import { Company } from '../../../core/models/entities.model';
import { AdminPage } from '../../../core/models/api.model';

const companyA: Company = {
  companyId: 'a',
  name: 'Acme',
  isActive: true,
  createdAtUtc: '2026-01-01T00:00:00Z',
};
const companyB: Company = {
  companyId: 'b',
  name: 'Beta',
  isActive: false,
  createdAtUtc: '2026-01-02T00:00:00Z',
};

const page: AdminPage<Company> = {
  items: [companyB, companyA],
  totalCount: 2,
  page: 1,
  pageSize: 25,
  totalPages: 1,
  hasMore: false,
};

describe('companyReducer', () => {
  it('sets loading on loadCompanies', () => {
    const state = companyReducer(
      initialCompanyState,
      CompanyActions.loadCompanies({ query: {} }),
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('stores the page (sorted by name) + maps 1-based page to 0-based index', () => {
    const state = companyReducer(
      initialCompanyState,
      CompanyActions.loadCompaniesSuccess({ page }),
    );
    expect(state.loading).toBe(false);
    expect(state.totalCount).toBe(2);
    expect(state.pageIndex).toBe(0); // API page 1 → index 0
    expect(state.pageSize).toBe(25);
    const ids = companyAdapter.getSelectors().selectAll(state).map((c) => c.companyId);
    expect(ids).toEqual(['a', 'b']); // Acme before Beta
  });

  it('resets to page 0 on searchChanged', () => {
    const start = { ...initialCompanyState, pageIndex: 3, search: 'x' };
    const state = companyReducer(start, CompanyActions.searchChanged({ search: 'acme' }));
    expect(state.search).toBe('acme');
    expect(state.pageIndex).toBe(0);
  });

  it('updates pagination on pageChanged', () => {
    const state = companyReducer(
      initialCompanyState,
      CompanyActions.pageChanged({ pageIndex: 2, pageSize: 25 }),
    );
    expect(state.pageIndex).toBe(2);
    expect(state.pageSize).toBe(25);
  });

  it('toggles saving across a create lifecycle', () => {
    const saving = companyReducer(
      initialCompanyState,
      CompanyActions.createCompany({ payload: { name: 'X' } }),
    );
    expect(saving.saving).toBe(true);
    const done = companyReducer(saving, CompanyActions.createCompanySuccess({ company: companyA }));
    expect(done.saving).toBe(false);
  });

  it('records a mutation error and clears saving on failure', () => {
    const state = companyReducer(
      { ...initialCompanyState, saving: true },
      CompanyActions.updateCompanyFailure({ error: { status: 409, message: 'conflict' } }),
    );
    expect(state.saving).toBe(false);
    expect(state.error?.status).toBe(409);
  });
});
