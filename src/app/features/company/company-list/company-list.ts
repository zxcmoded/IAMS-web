import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs';
import { Company } from '../../../core/models/entities.model';
import { selectIsSuperAdmin } from '../../../core/auth/store/auth.selectors';
import { TableColumn } from '../../../shared/models/table-column.model';
import { DataTable } from '../../../shared/components/data-table/data-table';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog';
import {
  CompanyFormDialog,
  CompanyFormDialogData,
} from '../company-form-dialog/company-form-dialog';
import { CompanyActions } from '../store/company.actions';
import {
  selectCompanyListQuery,
  selectCompanyListViewModel,
} from '../store/company.selectors';

/**
 * Company list container (smart). Connects the reusable DataTable to the
 * Company store. Create/Delete are gated to SuperAdmin (>=800) in the UI; the
 * effect still surfaces a 403 gracefully as a fallback. No HTTP here.
 */
@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [AsyncPipe, DataTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm$ | async; as vm) {
      <app-data-table
        title="Companies"
        createLabel="Add company"
        searchPlaceholder="Search companies…"
        [columns]="columns"
        [rows]="vm.companies"
        [loading]="vm.loading"
        [error]="vm.error"
        [searchTerm]="vm.search"
        [includeInactive]="vm.includeInactive"
        [totalCount]="vm.totalCount"
        [pageIndex]="vm.pageIndex"
        [pageSize]="vm.pageSize"
        [showCreate]="(canManage$ | async) ?? false"
        [showDelete]="(canManage$ | async) ?? false"
        (searchChange)="onSearch($event)"
        (includeInactiveChange)="onIncludeInactive($event)"
        (pageChange)="onPage($event)"
        (create)="onCreate()"
        (edit)="onEdit($event)"
        (remove)="onDelete($event)"
        (retry)="onRetry()"
      />
    }
  `,
})
export class CompanyList implements OnInit {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);

  readonly vm$ = this.store.select(selectCompanyListViewModel);
  readonly canManage$ = this.store.select(selectIsSuperAdmin);

  readonly columns: TableColumn<Company>[] = [
    { key: 'name', header: 'Name', type: 'text' },
    { key: 'isActive', header: 'Active', type: 'boolean', width: '110px' },
    { key: 'createdAtUtc', header: 'Created', type: 'date', width: '200px' },
  ];

  ngOnInit(): void {
    this.reload();
  }

  onSearch(search: string): void {
    this.store.dispatch(CompanyActions.searchChanged({ search }));
  }

  onIncludeInactive(includeInactive: boolean): void {
    this.store.dispatch(CompanyActions.includeInactiveToggled({ includeInactive }));
  }

  onPage(event: PageEvent): void {
    this.store.dispatch(
      CompanyActions.pageChanged({ pageIndex: event.pageIndex, pageSize: event.pageSize }),
    );
  }

  onCreate(): void {
    this.dialog.open<CompanyFormDialog, CompanyFormDialogData>(CompanyFormDialog, {
      data: { company: null },
      autoFocus: 'first-tabbable',
    });
  }

  onEdit(company: Company): void {
    this.dialog.open<CompanyFormDialog, CompanyFormDialogData>(CompanyFormDialog, {
      data: { company },
      autoFocus: 'first-tabbable',
    });
  }

  onDelete(company: Company): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Delete company',
        message: `Delete “${company.name}”? This deactivates the company.`,
        confirmLabel: 'Delete',
        destructive: true,
      },
    });

    ref
      .afterClosed()
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.store.dispatch(CompanyActions.deleteCompany({ id: company.companyId }));
        }
      });
  }

  onRetry(): void {
    this.reload();
  }

  private reload(): void {
    this.store
      .select(selectCompanyListQuery)
      .pipe(take(1))
      .subscribe((query) => this.store.dispatch(CompanyActions.loadCompanies({ query })));
  }
}
