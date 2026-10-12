import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { RACK_FEATURE_KEY } from './store/rack.state';
import { rackReducer } from './store/rack.reducer';
import * as rackEffects from './store/rack.effects';

export const RACK_ROUTES: Routes = [
  {
    path: '',
    providers: [provideState(RACK_FEATURE_KEY, rackReducer), provideEffects(rackEffects)],
    loadComponent: () => import('./rack-list/rack-list').then((m) => m.RackList),
  },
];
