import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Subject } from 'rxjs';
import { Action } from '@ngrx/store';
import { LocationFormDialog } from './location-form-dialog';
import { LocationActions } from '../store/location.actions';
import { selectLocationsError, selectLocationsSaving } from '../store/location.selectors';
import {
  selectCompanyOptions,
  selectLocationOptions,
  selectRackOptions,
  selectWarehouseOptions,
} from '../../../core/lookups/store/lookups.selectors';

describe('LocationFormDialog', () => {
  let store: MockStore;
  const dialogRef = { close: vi.fn() };

  function configure(data: { location: unknown }) {
    TestBed.configureTestingModule({
      imports: [LocationFormDialog],
      providers: [
        provideNoopAnimations(),
        provideMockActions(() => new Subject<Action>()),
        provideMockStore({
          selectors: [
            { selector: selectLocationsSaving, value: false },
            { selector: selectLocationsError, value: null },
            { selector: selectCompanyOptions, value: [] },
            { selector: selectLocationOptions, value: [] },
            { selector: selectWarehouseOptions, value: [] },
            { selector: selectRackOptions, value: [] },
          ],
        }),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });
    store = TestBed.inject(MockStore);
  }

  it('create: dispatches createLocation with the resolved companyId + region null when blank', () => {
    configure({ location: null });
    const fixture = TestBed.createComponent(LocationFormDialog);
    const cmp = fixture.componentInstance;
    const spy = vi.spyOn(store, 'dispatch');

    cmp.onCompany('c1');
    cmp.form.patchValue({ code: 'L1', name: 'Main', region: '  ' });
    cmp.submit();

    expect(spy).toHaveBeenCalledWith(
      LocationActions.createLocation({
        payload: { code: 'L1', name: 'Main', companyId: 'c1', region: null },
      }),
    );
  });

  it('create: blocks dispatch until a parent company is chosen', () => {
    configure({ location: null });
    const fixture = TestBed.createComponent(LocationFormDialog);
    const cmp = fixture.componentInstance;
    const spy = vi.spyOn(store, 'dispatch');
    spy.mockClear();

    cmp.form.patchValue({ code: 'L1', name: 'Main' }); // no company selected
    cmp.submit();

    expect(spy).not.toHaveBeenCalledWith(expect.objectContaining({ type: LocationActions.createLocation.type }));
  });

  it('edit: dispatches updateLocation with name + region only (code immutable)', () => {
    const location = {
      code: 'L1',
      name: 'Main',
      isActive: true,
      companyId: 'c1',
      region: 'EU',
      createdAtUtc: '',
    };
    configure({ location });
    const fixture = TestBed.createComponent(LocationFormDialog);
    const cmp = fixture.componentInstance;
    const spy = vi.spyOn(store, 'dispatch');

    cmp.form.patchValue({ name: 'Renamed', region: 'US' });
    cmp.submit();

    expect(spy).toHaveBeenCalledWith(
      LocationActions.updateLocation({ code: 'L1', payload: { name: 'Renamed', region: 'US' } }),
    );
  });
});
