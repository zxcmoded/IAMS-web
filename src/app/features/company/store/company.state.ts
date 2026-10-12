import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { ApiError } from '../../../core/models/api.model';
import { Company } from '../../../core/models/entities.model';

export const COMPANY_FEATURE_KEY = 'company';

/** Normalized collection keyed by the server-generated Guid. */
export const companyAdapter = createEntityAdapter<Company>({
  selectId: (c) => c.companyId,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

export interface CompanyState extends EntityState<Company> {
  loading: boolean;
  /** True while a create/update/delete is in flight. */
  saving: boolean;
  error: ApiError | null;
  // server-side list query state
  search: string;
  pageIndex: number;
  pageSize: number;
  includeInactive: boolean;
  totalCount: number;
}

export const initialCompanyState: CompanyState = companyAdapter.getInitialState({
  loading: false,
  saving: false,
  error: null,
  search: '',
  pageIndex: 0,
  pageSize: 25,
  includeInactive: false,
  totalCount: 0,
});
