import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable, Subject, firstValueFrom, of } from 'rxjs';
import { Action } from '@ngrx/store';
import { createRack$, loadRacks$ } from './rack.effects';
import { RackActions } from './rack.actions';
import { selectRackListQuery } from './rack.selectors';
import { RackApiService } from '../rack-api.service';
import { Rack } from '../../../core/models/entities.model';
import { AdminPage } from '../../../core/models/api.model';
import { NotificationService } from '../../../shared/services/notification.service';

const rack: Rack = {
  code: 'R1',
  name: 'Rack One',
  isActive: true,
  warehouseCode: 'W1',
  locationCode: 'L1',
  companyId: 'c1',
  createdAtUtc: '2026-01-01T00:00:00Z',
};
const page: AdminPage<Rack> = {
  items: [rack],
  totalCount: 1,
  page: 1,
  pageSize: 25,
  totalPages: 1,
  hasMore: false,
};

describe('rack effects', () => {
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
              selector: selectRackListQuery,
              value: { search: '', pageIndex: 0, pageSize: 25, includeInactive: false, parentCode: 'W1' },
            },
          ],
        }),
        { provide: RackApiService, useValue: api },
        { provide: NotificationService, useValue: { success: vi.fn(), error: vi.fn() } },
      ],
    });
  });

  function run(effect: () => Observable<Action>): Promise<Action> {
    return firstValueFrom(TestBed.runInInjectionContext(effect));
  }

  it('loadRacks$ maps a page to success', async () => {
    api.list.mockReturnValue(of(page));
    const p = run(loadRacks$);
    actions$.next(RackActions.loadRacks({ query: {} }));
    expect(await p).toEqual(RackActions.loadRacksSuccess({ page }));
  });

  it('createRack$ submits only the immediate parent (warehouseCode)', async () => {
    api.create.mockReturnValue(of(rack));
    const p = run(createRack$);
    const payload = { code: 'R1', name: 'Rack One', warehouseCode: 'W1' };
    actions$.next(RackActions.createRack({ payload }));
    expect(await p).toEqual(RackActions.createRackSuccess({ rack }));
    expect(api.create).toHaveBeenCalledWith(payload);
  });
});
