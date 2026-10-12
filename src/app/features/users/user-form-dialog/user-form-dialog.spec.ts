import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Subject } from 'rxjs';
import { Action } from '@ngrx/store';
import { UserFormDialog, UserFormDialogData } from './user-form-dialog';
import { UsersActions } from '../store/users.actions';
import {
  selectLoadingSelectedUser,
  selectSelectedUser,
  selectUsersError,
  selectUsersSaving,
} from '../store/users.selectors';
import {
  selectCompanyOptions,
  selectLocationOptions,
} from '../../../core/lookups/store/lookups.selectors';
import {
  selectIsSuperAdmin,
  selectUserCompanyId,
  selectUserRoleCode,
} from '../../../core/auth/store/auth.selectors';
import { UserListItem } from '../user.model';

describe('UserFormDialog', () => {
  let store: MockStore;
  let actions$: Subject<Action>;
  const dialogRef = { close: vi.fn() };

  function configure(
    data: UserFormDialogData,
    caller: { roleCode: number; isSuperAdmin: boolean; companyId: string | null },
  ) {
    actions$ = new Subject<Action>();
    TestBed.configureTestingModule({
      imports: [UserFormDialog],
      providers: [
        provideNoopAnimations(),
        provideMockActions(() => actions$),
        provideMockStore({
          selectors: [
            { selector: selectUsersSaving, value: false },
            { selector: selectUsersError, value: null },
            { selector: selectLoadingSelectedUser, value: false },
            { selector: selectSelectedUser, value: null },
            { selector: selectCompanyOptions, value: [] },
            { selector: selectLocationOptions, value: [] },
            { selector: selectUserRoleCode, value: caller.roleCode },
            { selector: selectIsSuperAdmin, value: caller.isSuperAdmin },
            { selector: selectUserCompanyId, value: caller.companyId },
          ],
        }),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });
    store = TestBed.inject(MockStore);
  }

  it('create web (Admin caller): dispatches a web createUser with companyId null, no locations', () => {
    configure({ user: null }, { roleCode: 700, isSuperAdmin: false, companyId: 'own-co' });
    const fixture = TestBed.createComponent(UserFormDialog);
    const cmp = fixture.componentInstance;
    const spy = vi.spyOn(store, 'dispatch');

    cmp.onUserTypeChange('web');
    cmp.form.patchValue({ username: 'bob', email: '', role: 700, password: 'Secret!99' });
    cmp.submit();

    expect(spy).toHaveBeenCalledWith(
      UsersActions.createUser({
        payload: {
          userType: 'web',
          username: 'bob',
          email: null,
          role: 700,
          companyId: null,
          locationCodes: null,
          password: 'Secret!99',
        },
      }),
    );
  });

  it('create mobile (SuperAdmin caller): requires + sends companyId and location codes', () => {
    configure({ user: null }, { roleCode: 800, isSuperAdmin: true, companyId: null });
    const fixture = TestBed.createComponent(UserFormDialog);
    const cmp = fixture.componentInstance;
    const spy = vi.spyOn(store, 'dispatch');

    cmp.form.patchValue({ companyId: 'c9' });
    cmp.onCompanyChange('c9');
    cmp.form.patchValue({ username: 'alice', role: 200, locationCodes: ['L1', 'L2'] });
    cmp.submit();

    expect(spy).toHaveBeenCalledWith(
      UsersActions.createUser({
        payload: {
          userType: 'mobile',
          username: 'alice',
          email: null,
          role: 200,
          companyId: 'c9',
          locationCodes: ['L1', 'L2'],
          password: null,
        },
      }),
    );
  });

  it('create mobile with a blank username: form is valid and username is sent as null', () => {
    configure({ user: null }, { roleCode: 700, isSuperAdmin: false, companyId: 'own-co' });
    const fixture = TestBed.createComponent(UserFormDialog);
    const cmp = fixture.componentInstance;
    const spy = vi.spyOn(store, 'dispatch');

    // userType defaults to mobile; username left blank.
    cmp.form.patchValue({ role: 200, locationCodes: ['L1'] });
    expect(cmp.form.valid).toBe(true);
    cmp.submit();

    expect(spy).toHaveBeenCalledWith(
      UsersActions.createUser({
        payload: {
          userType: 'mobile',
          username: null,
          email: null,
          role: 200,
          companyId: null,
          locationCodes: ['L1'],
          password: null,
        },
      }),
    );
  });

  it('surfaces invalidLocationCodes inline on the location field', () => {
    configure({ user: null }, { roleCode: 700, isSuperAdmin: false, companyId: 'own-co' });
    const fixture = TestBed.createComponent(UserFormDialog);
    const cmp = fixture.componentInstance;

    const msg = cmp.locationsMsg({
      status: 400,
      code: 'validation_failed',
      message: 'Some locations are invalid.',
      invalidLocationCodes: ['L9', 'L8'],
    });
    expect(msg).toBe('These locations are invalid: L9, L8');
  });

  it('caps the role options at the caller role (Admin 700 cannot pick SuperAdmin)', () => {
    configure({ user: null }, { roleCode: 700, isSuperAdmin: false, companyId: 'own-co' });
    const fixture = TestBed.createComponent(UserFormDialog);
    const cmp = fixture.componentInstance;

    cmp.onUserTypeChange('web');
    expect(cmp.roleOptions()).toEqual([300, 700]); // Manager, Admin — no SuperAdmin (800)
  });

  it('mobile create success swaps to the activation-key panel instead of closing', () => {
    configure({ user: null }, { roleCode: 800, isSuperAdmin: true, companyId: null });
    const fixture = TestBed.createComponent(UserFormDialog);
    const cmp = fixture.componentInstance;

    actions$.next(
      UsersActions.createUserSuccess({
        result: {
          user: {
            id: 'a',
            username: 'alice',
            email: null,
            companyId: 'c9',
            role: { code: 200, name: 'User' },
            userType: 'mobile',
            activationStatus: 'NotActivated',
            isActive: true,
            assignedLocations: [],
            createdAtUtc: '',
          },
          activationKey: 'RAW-KEY-123',
        },
      }),
    );

    expect(cmp.activationKey()).toBe('RAW-KEY-123');
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('edit web: omits password when left blank, includes it when changed', () => {
    const user: UserListItem = {
      id: 'u1',
      username: 'bob',
      email: 'b@x.io',
      role: { code: 700, name: 'Admin' },
      userType: 'web',
      activationStatus: null,
      isActive: true,
      assignedLocations: [],
      createdAtUtc: '',
    };
    configure({ user }, { roleCode: 800, isSuperAdmin: true, companyId: 'own-co' });
    const fixture = TestBed.createComponent(UserFormDialog);
    const cmp = fixture.componentInstance;
    const spy = vi.spyOn(store, 'dispatch');

    cmp.form.patchValue({ username: 'bob', role: 700, password: '' });
    cmp.submit();
    expect(spy).toHaveBeenCalledWith(
      UsersActions.updateUser({
        id: 'u1',
        payload: { username: 'bob', email: 'b@x.io', role: 700 },
      }),
    );

    spy.mockClear();
    cmp.form.patchValue({ password: 'NewSecret9' });
    cmp.submit();
    expect(spy).toHaveBeenCalledWith(
      UsersActions.updateUser({
        id: 'u1',
        payload: { username: 'bob', email: 'b@x.io', role: 700, password: 'NewSecret9' },
      }),
    );
  });
});
