import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { BIN_FEATURE_KEY } from './store/bin.state';
import { binReducer } from './store/bin.reducer';
import * as binEffects from './store/bin.effects';

export const BIN_ROUTES: Routes = [
  {
    path: '',
    providers: [provideState(BIN_FEATURE_KEY, binReducer), provideEffects(binEffects)],
    loadComponent: () => import('./bin-list/bin-list').then((m) => m.BinList),
  },
];
