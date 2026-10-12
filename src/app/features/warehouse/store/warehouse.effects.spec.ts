import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable, Subject, firstValueFrom, of } from 'rxjs';
import { Action } from '@ngrx/store';
import { createWarehouse$, loadWarehouses$, reloadAfterMutation$ } from './warehouse.effects';
import { WarehouseActions } from './warehouse.actions';
import { selectWarehouseListQuery } from './warehouse.selectors';
import { WarehouseApiService } from '../warehouse-api.service';
import { Warehouse } from '../../../core/models/entities.model';
import { AdminPage } from '../../../core/models/api.model';
import { NotificationService } from '../../../shared/services/notification.service';

const wh: Warehouse = {
  code: 'W1',
  name: 'WH One',
  isActive: true,
  locationCode: 'L1',
  companyId: 'c1',
  createdAtUtc: '2026-01-01T00:00:00Z',
};
const page: AdminPage<Warehouse> = {
  items: [wh],
  totalCount: 1,
  page: 1,
  pageSize: 25,
  totalPages: 1,
  hasMore: false,
};

describe('warehouse effects', () => {
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
              selector: selectWarehouseListQuery,
              value: { search: '', pageIndex: 0, pageSize: 25, includeInactive: false, parentCode: 'L1' },
            },
          ],
        }),
        { provide: WarehouseApiService, useValue: api },
        { provide: NotificationService, useValue: { success: vi.fn(), error: vi.fn() } },
      ],
    });
  });

  function run(effect: () => Observable<Action>): Promise<Action> {
    return firstValueFrom(TestBed.runInInjectionContext(effect));
  }

  it('loadWarehouses$ maps a page to success', async () => {
    api.list.mockReturnValue(of(page));
    const p = run(loadWarehouses$);
    actions$.next(WarehouseActions.loadWarehouses({ query: {} }));
    expect(await p).toEqual(WarehouseActions.loadWarehousesSuccess({ page }));
  });

  it('createWarehouse$ submits only the immediate parent (locationCode)', async () => {
    api.create.mockReturnValue(of(wh));
    const p = run(createWarehouse$);
    const payload = { code: 'W1', name: 'WH One', locationCode: 'L1' };
    actions$.next(WarehouseActions.createWarehouse({ payload }));
    expect(await p).toEqual(WarehouseActions.createWarehouseSuccess({ warehouse: wh }));
    expect(api.create).toHaveBeenCalledWith(payload);
  });

  it('reloadAfterMutation$ reloads using the current query', async () => {
    const p = run(reloadAfterMutation$);
    actions$.next(WarehouseActions.deleteWarehouseSuccess({ code: 'W1' }));
    const out = (await p) as ReturnType<typeof WarehouseActions.loadWarehouses>;
    expect(out.type).toBe(WarehouseActions.loadWarehouses.type);
    expect(out.query.parentCode).toBe('L1');
  });
});
