import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { LOCATION_FEATURE_KEY } from './store/location.state';
import { locationReducer } from './store/location.reducer';
import * as locationEffects from './store/location.effects';

export const LOCATION_ROUTES: Routes = [
  {
    path: '',
    providers: [
      provideState(LOCATION_FEATURE_KEY, locationReducer),
      provideEffects(locationEffects),
    ],
    loadComponent: () => import('./location-list/location-list').then((m) => m.LocationList),
  },
];
