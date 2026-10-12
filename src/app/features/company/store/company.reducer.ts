import { createReducer, on } from '@ngrx/store';
import { CompanyActions } from './company.actions';
import { CompanyState, companyAdapter, initialCompanyState } from './company.state';

export const companyReducer = createReducer(
  initialCompanyState,

  // --- list ---
  on(CompanyActions.loadCompanies, (state): CompanyState => ({ ...state, loading: true, error: null })),

  on(CompanyActions.loadCompaniesSuccess, (state, { page }): CompanyState =>
    companyAdapter.setAll(page.items, {
      ...state,
      loading: false,
      error: null,
      totalCount: page.totalCount,
      pageIndex: page.page - 1, // API page is 1-based; store is 0-based
      pageSize: page.pageSize,
    }),
  ),

  on(CompanyActions.loadCompaniesFailure, (state, { error }): CompanyState => ({
    ...state,
    loading: false,
    error,
  })),

  // --- query params (effects react to these to reload) ---
  on(CompanyActions.searchChanged, (state, { search }): CompanyState => ({
    ...state,
    search,
    pageIndex: 0, // reset to first page on a new search
  })),

  on(CompanyActions.pageChanged, (state, { pageIndex, pageSize }): CompanyState => ({
    ...state,
    pageIndex,
    pageSize,
  })),

  on(CompanyActions.includeInactiveToggled, (state, { includeInactive }): CompanyState => ({
    ...state,
    includeInactive,
    pageIndex: 0,
  })),

  // --- create ---
  on(CompanyActions.createCompany, (state): CompanyState => ({ ...state, saving: true, error: null })),
  on(CompanyActions.createCompanySuccess, (state): CompanyState => ({ ...state, saving: false })),
  on(CompanyActions.createCompanyFailure, (state, { error }): CompanyState => ({
    ...state,
    saving: false,
    error,
  })),

  // --- update ---
  on(CompanyActions.updateCompany, (state): CompanyState => ({ ...state, saving: true, error: null })),
  on(CompanyActions.updateCompanySuccess, (state): CompanyState => ({ ...state, saving: false })),
  on(CompanyActions.updateCompanyFailure, (state, { error }): CompanyState => ({
    ...state,
    saving: false,
    error,
  })),

  // --- delete ---
  on(CompanyActions.deleteCompany, (state): CompanyState => ({ ...state, saving: true, error: null })),
  on(CompanyActions.deleteCompanySuccess, (state): CompanyState => ({ ...state, saving: false })),
  on(CompanyActions.deleteCompanyFailure, (state, { error }): CompanyState => ({
    ...state,
    saving: false,
    error,
  })),

  on(CompanyActions.clearError, (state): CompanyState => ({ ...state, error: null })),
);
