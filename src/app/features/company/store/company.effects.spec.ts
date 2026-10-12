import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, firstValueFrom, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { createCompany$, loadCompanies$, reloadAfterMutation$ } from './company.effects';
import { CompanyActions } from './company.actions';
import { selectCompanyListQuery } from './company.selectors';
import { CompanyApiService } from '../company-api.service';
import { Company } from '../../../core/models/entities.model';
import { AdminPage } from '../../../core/models/api.model';

const company: Company = {
  companyId: 'a',
  name: 'Acme',
  isActive: true,
  createdAtUtc: '2026-01-01T00:00:00Z',
};
const page: AdminPage<Company> = {
  items: [company],
  totalCount: 1,
  page: 1,
  pageSize: 25,
  totalPages: 1,
  hasMore: false,
};

describe('company effects', () => {
  let actions$: Subject<Action>;
  let api: {
    list: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    actions$ = new Subject<Action>();
    api = { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        provideMockStore({
          selectors: [
            {
              selector: selectCompanyListQuery,
              value: { search: 'ac', pageIndex: 1, pageSize: 25, includeInactive: false },
            },
          ],
        }),
        { provide: CompanyApiService, useValue: api },
      ],
    });
  });

  function run(effect: () => Observable<Action>): Promise<Action> {
    const out$ = TestBed.runInInjectionContext(effect);
    const result = firstValueFrom(out$);
    return result;
  }

  it('loadCompanies$ maps a page to loadCompaniesSuccess', async () => {
    api.list.mockReturnValue(of(page));
    const promise = run(loadCompanies$);
    actions$.next(CompanyActions.loadCompanies({ query: { pageIndex: 0, pageSize: 25 } }));
    expect(await promise).toEqual(CompanyActions.loadCompaniesSuccess({ page }));
  });

  it('loadCompanies$ maps an error to loadCompaniesFailure', async () => {
    api.list.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    const promise = run(loadCompanies$);
    actions$.next(CompanyActions.loadCompanies({ query: {} }));
    const out = (await promise) as ReturnType<typeof CompanyActions.loadCompaniesFailure>;
    expect(out.type).toBe(CompanyActions.loadCompaniesFailure.type);
    expect(out.error.status).toBe(500);
  });

  it('createCompany$ maps a created company to createCompanySuccess', async () => {
    api.create.mockReturnValue(of(company));
    const promise = run(createCompany$);
    actions$.next(CompanyActions.createCompany({ payload: { name: 'Acme' } }));
    expect(await promise).toEqual(CompanyActions.createCompanySuccess({ company }));
    expect(api.create).toHaveBeenCalledWith({ name: 'Acme' });
  });

  it('reloadAfterMutation$ reloads the list using the current store query', async () => {
    const promise = run(reloadAfterMutation$);
    actions$.next(CompanyActions.createCompanySuccess({ company }));
    expect(await promise).toEqual(
      CompanyActions.loadCompanies({
        query: { search: 'ac', pageIndex: 1, pageSize: 25, includeInactive: false },
      }),
    );
  });
});
