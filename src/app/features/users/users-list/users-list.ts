import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { take } from 'rxjs';
import { selectUserRoleCode } from '../../../core/auth/store/auth.selectors';
import { roleLabel } from '../../../core/models/role.model';
import { TableColumn } from '../../../shared/models/table-column.model';
import { DataTable } from '../../../shared/components/data-table/data-table';
import { NotificationService } from '../../../shared/services/notification.service';
import {
  ActivationStatus,
  ALL_ROLE_CODES,
  UserListItem,
  UserType,
} from '../user.model';
import {
  UserFormDialog,
  UserFormDialogData,
} from '../user-form-dialog/user-form-dialog';
import { UsersActions } from '../store/users.actions';
import {
  selectUsersListQuery,
  selectUsersListViewModel,
} from '../store/users.selectors';

/**
 * Users list container (smart). Connects the reusable DataTable to the Users
 * store, projecting role / userType / active / activation-status filter
 * dropdowns into the table toolbar. Add is available to every portal user
 * (all are Admin+); Edit is blocked client-side for a target whose role is
 * higher than the caller's (the backend also enforces this with a 403). No HTTP
 * here — everything flows through the store.
 */
@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [AsyncPipe, DataTable, MatFormFieldModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm$ | async; as vm) {
      <app-data-table
        title="Users"
        createLabel="Add user"
        searchPlaceholder="Search username or email…"
        [columns]="columns"
        [rows]="vm.users"
        [loading]="vm.loading"
        [error]="vm.error"
        [searchTerm]="vm.search"
        [totalCount]="vm.totalCount"
        [pageIndex]="vm.pageIndex"
        [pageSize]="vm.pageSize"
        [showInactiveToggle]="false"
        [showDelete]="false"
        (searchChange)="onSearch($event)"
        (pageChange)="onPage($event)"
        (create)="onCreate()"
        (edit)="onEdit($event)"
        (retry)="onRetry()"
      >
        <div filters class="users-filters">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Role</mat-label>
            <mat-select
              [value]="vm.roleFilter"
              (selectionChange)="onRoleFilter($event.value)"
            >
              <mat-option [value]="null">All roles</mat-option>
              @for (code of roleCodes; track code) {
                <mat-option [value]="code">{{ roleLabel(code) }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Type</mat-label>
            <mat-select
              [value]="vm.userTypeFilter"
              (selectionChange)="onUserTypeFilter($event.value)"
            >
              <mat-option [value]="null">All types</mat-option>
              <mat-option value="mobile">Mobile</mat-option>
              <mat-option value="web">Web</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Status</mat-label>
            <mat-select
              [value]="vm.isActiveFilter"
              (selectionChange)="onActiveFilter($event.value)"
            >
              <mat-option [value]="null">All</mat-option>
              <mat-option [value]="true">Active</mat-option>
              <mat-option [value]="false">Inactive</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Activation</mat-label>
            <mat-select
              [value]="vm.activationStatusFilter"
              (selectionChange)="onActivationFilter($event.value)"
            >
              <mat-option [value]="null">All</mat-option>
              <mat-option value="NotActivated">Not activated</mat-option>
              <mat-option value="Activated">Activated</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </app-data-table>
    }
  `,
  styles: [
    `
      .users-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
      }
      .users-filters mat-form-field {
        min-width: 140px;
      }
    `,
  ],
})
export class UsersList implements OnInit {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotificationService);

  readonly vm$ = this.store.select(selectUsersListViewModel);
  private readonly callerRoleCode = this.store.selectSignal(selectUserRoleCode);

  readonly roleLabel = roleLabel;
  readonly roleCodes = ALL_ROLE_CODES;

  readonly columns: TableColumn<UserListItem>[] = [
    { key: 'username', header: 'Username', type: 'text' },
    { key: 'role', header: 'Role', type: 'text', value: (u) => u.role.name, width: '130px' },
    { key: 'userType', header: 'Type', type: 'text', width: '110px' },
    {
      key: 'activationStatus',
      header: 'Activation',
      type: 'text',
      width: '140px',
      value: (u) => u.activationStatus ?? '—',
    },
    {
      key: 'assignedLocations',
      header: 'Locations',
      type: 'text',
      width: '110px',
      value: (u) => u.assignedLocations?.length ?? 0,
    },
    { key: 'isActive', header: 'Active', type: 'boolean', width: '100px' },
    { key: 'createdAtUtc', header: 'Created', type: 'date', width: '190px' },
  ];

  ngOnInit(): void {
    this.reload();
  }

  onSearch(search: string): void {
    this.store.dispatch(UsersActions.searchChanged({ search }));
  }

  onRoleFilter(role: number | null): void {
    this.store.dispatch(UsersActions.roleFilterChanged({ role }));
  }

  onUserTypeFilter(userType: UserType | null): void {
    this.store.dispatch(UsersActions.userTypeFilterChanged({ userType }));
  }

  onActiveFilter(isActive: boolean | null): void {
    this.store.dispatch(UsersActions.activeFilterChanged({ isActive }));
  }

  onActivationFilter(activationStatus: ActivationStatus | null): void {
    this.store.dispatch(UsersActions.activationStatusFilterChanged({ activationStatus }));
  }

  onPage(event: PageEvent): void {
    this.store.dispatch(
      UsersActions.pageChanged({ pageIndex: event.pageIndex, pageSize: event.pageSize }),
    );
  }

  onCreate(): void {
    this.dialog.open<UserFormDialog, UserFormDialogData>(UserFormDialog, {
      data: { user: null },
      autoFocus: 'first-tabbable',
    });
  }

  onEdit(user: UserListItem): void {
    // Mirror the backend 403: you can't edit a user whose role outranks yours.
    if (user.role.code > this.callerRoleCode()) {
      this.notify.error("You can't edit a user with a role higher than your own.");
      return;
    }
    this.dialog.open<UserFormDialog, UserFormDialogData>(UserFormDialog, {
      data: { user },
      autoFocus: 'first-tabbable',
    });
  }

  onRetry(): void {
    this.reload();
  }

  private reload(): void {
    this.store
      .select(selectUsersListQuery)
      .pipe(take(1))
      .subscribe((query) => this.store.dispatch(UsersActions.loadUsers({ query })));
  }
}
