import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { WAREHOUSE_FEATURE_KEY } from './store/warehouse.state';
import { warehouseReducer } from './store/warehouse.reducer';
import * as warehouseEffects from './store/warehouse.effects';

export const WAREHOUSE_ROUTES: Routes = [
  {
    path: '',
    providers: [
      provideState(WAREHOUSE_FEATURE_KEY, warehouseReducer),
      provideEffects(warehouseEffects),
    ],
    loadComponent: () => import('./warehouse-list/warehouse-list').then((m) => m.WarehouseList),
  },
];
