import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, firstValueFrom, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { createLocation$, loadLocations$, reloadAfterMutation$ } from './location.effects';
import { LocationActions } from './location.actions';
import { selectLocationListQuery } from './location.selectors';
import { LocationApiService } from '../location-api.service';
import { Location } from '../../../core/models/entities.model';
import { AdminPage } from '../../../core/models/api.model';
import { NotificationService } from '../../../shared/services/notification.service';

const loc: Location = {
  code: 'L1',
  name: 'Main',
  isActive: true,
  companyId: 'c1',
  region: null,
  createdAtUtc: '2026-01-01T00:00:00Z',
};
const page: AdminPage<Location> = {
  items: [loc],
  totalCount: 1,
  page: 1,
  pageSize: 25,
  totalPages: 1,
  hasMore: false,
};

describe('location effects', () => {
  let actions$: Subject<Action>;
  let api: { list: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    actions$ = new Subject<Action>();
    api = { list: vi.fn(), create: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        provideMockStore({
          selectors: [
            {
              selector: selectLocationListQuery,
              value: { search: '', pageIndex: 0, pageSize: 25, includeInactive: false, companyId: 'c1' },
            },
          ],
        }),
        { provide: LocationApiService, useValue: api },
        { provide: NotificationService, useValue: { success: vi.fn(), error: vi.fn() } },
      ],
    });
  });

  function run(effect: () => Observable<Action>): Promise<Action> {
    return firstValueFrom(TestBed.runInInjectionContext(effect));
  }

  it('loadLocations$ maps a page to success', async () => {
    api.list.mockReturnValue(of(page));
    const p = run(loadLocations$);
    actions$.next(LocationActions.loadLocations({ query: {} }));
    expect(await p).toEqual(LocationActions.loadLocationsSuccess({ page }));
  });

  it('createLocation$ posts the full create payload (code+name+companyId+region)', async () => {
    api.create.mockReturnValue(of(loc));
    const p = run(createLocation$);
    const payload = { code: 'L1', name: 'Main', companyId: 'c1', region: null };
    actions$.next(LocationActions.createLocation({ payload }));
    expect(await p).toEqual(LocationActions.createLocationSuccess({ location: loc }));
    expect(api.create).toHaveBeenCalledWith(payload);
  });

  it('createLocation$ maps errors to failure without killing the stream', async () => {
    api.create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    const p = run(createLocation$);
    actions$.next(
      LocationActions.createLocation({ payload: { code: 'L1', name: 'x', companyId: 'c1', region: null } }),
    );
    const out = (await p) as ReturnType<typeof LocationActions.createLocationFailure>;
    expect(out.type).toBe(LocationActions.createLocationFailure.type);
  });

  it('reloadAfterMutation$ reloads using the current query', async () => {
    const p = run(reloadAfterMutation$);
    actions$.next(LocationActions.createLocationSuccess({ location: loc }));
    const out = (await p) as ReturnType<typeof LocationActions.loadLocations>;
    expect(out.type).toBe(LocationActions.loadLocations.type);
    expect(out.query.companyId).toBe('c1');
  });
});
