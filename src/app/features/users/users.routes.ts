import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { USERS_FEATURE_KEY } from './store/users.state';
import { usersReducer } from './store/users.reducer';
import * as usersEffects from './store/users.effects';

/**
 * Lazily-loaded Users feature. State + effects register at the route level so
 * they load only when the Users module is visited — the repeatable per-entity
 * pattern. The parent admin route already applies `authGuard` (portal = Admin+,
 * `manage_company`), so no extra guard is needed here.
 */
export const USERS_ROUTES: Routes = [
  {
    path: '',
    providers: [
      provideState(USERS_FEATURE_KEY, usersReducer),
      provideEffects(usersEffects),
    ],
    loadComponent: () => import('./users-list/users-list').then((m) => m.UsersList),
  },
];
