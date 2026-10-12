import {
  ApplicationConfig,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  inject,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Store, provideState, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AUTH_FEATURE_KEY } from './core/auth/store/auth.state';
import { authReducer } from './core/auth/store/auth.reducer';
import * as authEffects from './core/auth/store/auth.effects';
import { LOOKUPS_FEATURE_KEY } from './core/lookups/store/lookups.state';
import { lookupsReducer } from './core/lookups/store/lookups.reducer';
import * as lookupsEffects from './core/lookups/store/lookups.effects';
import { AuthActions } from './core/auth/store/auth.actions';
import { TokenStorageService } from './core/auth/token-storage.service';
import { canAccessPortal } from './core/models/role.model';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),

    provideStore({ [AUTH_FEATURE_KEY]: authReducer }),
    provideState(LOOKUPS_FEATURE_KEY, lookupsReducer),
    provideEffects(authEffects, lookupsEffects),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode(), connectInZone: true }),

    // Bootstrap: restore a persisted session client-side (the contract has no
    // /me endpoint). Token validity is enforced lazily by the 401 interceptor.
    // A restored but under-privileged session is cleared immediately.
    provideAppInitializer(() => {
      const store = inject(Store);
      const session = inject(TokenStorageService).getSession();
      if (session && canAccessPortal(session.user.roleCode)) {
        store.dispatch(
          AuthActions.sessionRestored({
            result: {
              token: session.token,
              tokenType: session.tokenType,
              expiresAt: session.expiresAt,
              user: session.user,
            },
          }),
        );
      } else {
        store.dispatch(AuthActions.sessionCleared());
      }
    }),
  ],
};
