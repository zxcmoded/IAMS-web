import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ListQuery } from '../../../core/models/api.model';
import { COMPANY_FEATURE_KEY, CompanyState, companyAdapter } from './company.state';

export const selectCompanyState = createFeatureSelector<CompanyState>(COMPANY_FEATURE_KEY);

const { selectAll, selectEntities } = companyAdapter.getSelectors();

export const selectAllCompanies = createSelector(selectCompanyState, selectAll);
export const selectCompanyEntities = createSelector(selectCompanyState, selectEntities);

export const selectCompaniesLoading = createSelector(selectCompanyState, (s) => s.loading);
export const selectCompaniesSaving = createSelector(selectCompanyState, (s) => s.saving);
export const selectCompaniesError = createSelector(selectCompanyState, (s) => s.error);

export const selectCompanySearch = createSelector(selectCompanyState, (s) => s.search);
export const selectCompanyPageIndex = createSelector(selectCompanyState, (s) => s.pageIndex);
export const selectCompanyPageSize = createSelector(selectCompanyState, (s) => s.pageSize);
export const selectCompanyIncludeInactive = createSelector(
  selectCompanyState,
  (s) => s.includeInactive,
);
export const selectCompanyTotalCount = createSelector(selectCompanyState, (s) => s.totalCount);

/** Composed list query used by effects to build the HTTP request. */
export const selectCompanyListQuery = createSelector(
  selectCompanySearch,
  selectCompanyPageIndex,
  selectCompanyPageSize,
  selectCompanyIncludeInactive,
  (search, pageIndex, pageSize, includeInactive): ListQuery => ({
    search,
    pageIndex,
    pageSize,
    includeInactive,
  }),
);

/** Single view-model for the list container to reduce template async pipes. */
export const selectCompanyListViewModel = createSelector(
  selectAllCompanies,
  selectCompaniesLoading,
  selectCompaniesError,
  selectCompanySearch,
  selectCompanyPageIndex,
  selectCompanyPageSize,
  selectCompanyIncludeInactive,
  selectCompanyTotalCount,
  (companies, loading, error, search, pageIndex, pageSize, includeInactive, totalCount) => ({
    companies,
    loading,
    error,
    search,
    pageIndex,
    pageSize,
    includeInactive,
    totalCount,
  }),
);
