import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { COMPANY_FEATURE_KEY } from './store/company.state';
import { companyReducer } from './store/company.reducer';
import * as companyEffects from './store/company.effects';

/**
 * Lazily-loaded Company feature. The feature's NgRx state and effects are
 * registered at the route level so they load only when the Company module is
 * visited — this is the repeatable per-entity pattern.
 */
export const COMPANY_ROUTES: Routes = [
  {
    path: '',
    providers: [
      provideState(COMPANY_FEATURE_KEY, companyReducer),
      provideEffects(companyEffects),
    ],
    loadComponent: () =>
      import('./company-list/company-list').then((m) => m.CompanyList),
  },
];
