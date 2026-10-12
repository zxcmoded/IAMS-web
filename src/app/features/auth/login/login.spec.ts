import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Login } from './login';
import { AuthActions } from '../../../core/auth/store/auth.actions';
import {
  selectAuthError,
  selectAuthLoading,
} from '../../../core/auth/store/auth.selectors';

describe('Login', () => {
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideNoopAnimations(),
        provideMockStore({
          selectors: [
            { selector: selectAuthLoading, value: false },
            { selector: selectAuthError, value: null },
          ],
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
  });

  it('creates the login form with username + password only', () => {
    const fixture = TestBed.createComponent(Login);
    const cmp = fixture.componentInstance;
    expect(Object.keys(cmp.form.controls).sort()).toEqual(['password', 'username']);
  });

  it('does not dispatch login when the form is invalid', () => {
    const fixture = TestBed.createComponent(Login);
    const spy = vi.spyOn(store, 'dispatch');
    fixture.componentInstance.submit();
    expect(spy).not.toHaveBeenCalled();
  });

  it('dispatches login with the entered credentials when valid', () => {
    const fixture = TestBed.createComponent(Login);
    const cmp = fixture.componentInstance;
    const spy = vi.spyOn(store, 'dispatch');

    cmp.form.setValue({ username: 'admin', password: 's3cret' });
    cmp.submit();

    expect(spy).toHaveBeenCalledWith(
      AuthActions.login({ credentials: { username: 'admin', password: 's3cret' } }),
    );
  });
});
