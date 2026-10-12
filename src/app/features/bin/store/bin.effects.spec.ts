import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable, Subject, firstValueFrom, of } from 'rxjs';
import { Action } from '@ngrx/store';
import { createBin$, loadBins$ } from './bin.effects';
import { BinActions } from './bin.actions';
import { selectBinListQuery } from './bin.selectors';
import { BinApiService } from '../bin-api.service';
import { Bin } from '../../../core/models/entities.model';
import { AdminPage } from '../../../core/models/api.model';
import { NotificationService } from '../../../shared/services/notification.service';

const bin: Bin = {
  code: 'B1',
  name: 'Bin One',
  isActive: true,
  rackCode: 'R1',
  warehouseCode: 'W1',
  locationCode: 'L1',
  companyId: 'c1',
  createdAtUtc: '2026-01-01T00:00:00Z',
};
const page: AdminPage<Bin> = {
  items: [bin],
  totalCount: 1,
  page: 1,
  pageSize: 25,
  totalPages: 1,
  hasMore: false,
};

describe('bin effects', () => {
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
              selector: selectBinListQuery,
              value: { search: '', pageIndex: 0, pageSize: 25, includeInactive: false, parentCode: 'R1' },
            },
          ],
        }),
        { provide: BinApiService, useValue: api },
        { provide: NotificationService, useValue: { success: vi.fn(), error: vi.fn() } },
      ],
    });
  });

  function run(effect: () => Observable<Action>): Promise<Action> {
    return firstValueFrom(TestBed.runInInjectionContext(effect));
  }

  it('loadBins$ maps a page to success', async () => {
    api.list.mockReturnValue(of(page));
    const p = run(loadBins$);
    actions$.next(BinActions.loadBins({ query: {} }));
    expect(await p).toEqual(BinActions.loadBinsSuccess({ page }));
  });

  it('createBin$ submits only the immediate parent (rackCode)', async () => {
    api.create.mockReturnValue(of(bin));
    const p = run(createBin$);
    const payload = { code: 'B1', name: 'Bin One', rackCode: 'R1' };
    actions$.next(BinActions.createBin({ payload }));
    expect(await p).toEqual(BinActions.createBinSuccess({ bin }));
    expect(api.create).toHaveBeenCalledWith(payload);
  });
});
