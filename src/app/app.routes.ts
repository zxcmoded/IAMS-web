import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/admin-layout/admin-layout').then((m) => m.AdminLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'company' },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/users.routes').then((m) => m.USERS_ROUTES),
      },
      {
        path: 'company',
        loadChildren: () =>
          import('./features/company/company.routes').then((m) => m.COMPANY_ROUTES),
      },
      {
        path: 'location',
        loadChildren: () =>
          import('./features/location/location.routes').then((m) => m.LOCATION_ROUTES),
      },
      {
        path: 'warehouse',
        loadChildren: () =>
          import('./features/warehouse/warehouse.routes').then((m) => m.WAREHOUSE_ROUTES),
      },
      {
        path: 'rack',
        loadChildren: () => import('./features/rack/rack.routes').then((m) => m.RACK_ROUTES),
      },
      {
        path: 'bin',
        loadChildren: () => import('./features/bin/bin.routes').then((m) => m.BIN_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
