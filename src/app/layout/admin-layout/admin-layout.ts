import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthActions } from '../../core/auth/store/auth.actions';
import {
  selectUserDisplayName,
  selectUserRoleLabel,
} from '../../core/auth/store/auth.selectors';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

/**
 * Container for the protected admin area: toolbar + side nav + routed content.
 * Reads auth display state via selectors and dispatches logout — no HTTP here.
 */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  private readonly store = inject(Store);

  readonly displayName$ = this.store.select(selectUserDisplayName);
  readonly roleLabel$ = this.store.select(selectUserRoleLabel);

  readonly navItems: readonly NavItem[] = [
    { label: 'Users', path: '/users', icon: 'group' },
    { label: 'Companies', path: '/company', icon: 'business' },
    { label: 'Locations', path: '/location', icon: 'place' },
    { label: 'Warehouses', path: '/warehouse', icon: 'warehouse' },
    { label: 'Racks', path: '/rack', icon: 'shelves' },
    { label: 'Bins', path: '/bin', icon: 'inventory_2' },
  ];

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
