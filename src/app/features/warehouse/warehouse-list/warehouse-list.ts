import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs';
import { Warehouse } from '../../../core/models/entities.model';
import { TableColumn } from '../../../shared/models/table-column.model';
import { DataTable } from '../../../shared/components/data-table/data-table';
import { AncestorSelect } from '../../../shared/components/ancestor-select/ancestor-select';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog';
import {
  WarehouseFormDialog,
  WarehouseFormDialogData,
} from '../warehouse-form-dialog/warehouse-form-dialog';
import { WarehouseActions } from '../store/warehouse.actions';
import {
  selectWarehouseListQuery,
  selectWarehouseListViewModel,
} from '../store/warehouse.selectors';

/** Warehouse list container (smart) with a Location parent-filter. */
@Component({
  selector: 'app-warehouse-list',
  standalone: true,
  imports: [AsyncPipe, DataTable, AncestorSelect],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm$ | async; as vm) {
      <app-data-table
        title="Warehouses"
        createLabel="Add warehouse"
        searchPlaceholder="Search warehouses…"
        [columns]="columns"
        [rows]="vm.warehouses"
        [loading]="vm.loading"
        [error]="vm.error"
        [searchTerm]="vm.search"
        [includeInactive]="vm.includeInactive"
        [totalCount]="vm.totalCount"
        [pageIndex]="vm.pageIndex"
        [pageSize]="vm.pageSize"
        (searchChange)="onSearch($event)"
        (includeInactiveChange)="onIncludeInactive($event)"
        (pageChange)="onPage($event)"
        (create)="onCreate()"
        (edit)="onEdit($event)"
        (remove)="onDelete($event)"
        (retry)="onRetry()"
      >
        <app-ancestor-select
          filters
          target="location"
          (immediateParentChange)="onParentFilter($event)"
        />
      </app-data-table>
    }
  `,
})
export class WarehouseList implements OnInit {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);

  readonly vm$ = this.store.select(selectWarehouseListViewModel);

  readonly columns: TableColumn<Warehouse>[] = [
    { key: 'code', header: 'Code', type: 'text', width: '140px' },
    { key: 'name', header: 'Name', type: 'text' },
    { key: 'locationCode', header: 'Location', type: 'text', width: '140px' },
    { key: 'isActive', header: 'Active', type: 'boolean', width: '110px' },
    { key: 'createdAtUtc', header: 'Created', type: 'date', width: '200px' },
  ];

  ngOnInit(): void {
    this.reload();
  }

  onSearch(search: string): void {
    this.store.dispatch(WarehouseActions.searchChanged({ search }));
  }

  onIncludeInactive(includeInactive: boolean): void {
    this.store.dispatch(WarehouseActions.includeInactiveToggled({ includeInactive }));
  }

  onParentFilter(parentCode: string | null): void {
    this.store.dispatch(WarehouseActions.parentFilterChanged({ parentCode }));
  }

  onPage(event: PageEvent): void {
    this.store.dispatch(
      WarehouseActions.pageChanged({ pageIndex: event.pageIndex, pageSize: event.pageSize }),
    );
  }

  onCreate(): void {
    this.dialog.open<WarehouseFormDialog, WarehouseFormDialogData>(WarehouseFormDialog, {
      data: { warehouse: null },
      autoFocus: 'first-tabbable',
    });
  }

  onEdit(warehouse: Warehouse): void {
    this.dialog.open<WarehouseFormDialog, WarehouseFormDialogData>(WarehouseFormDialog, {
      data: { warehouse },
      autoFocus: 'first-tabbable',
    });
  }

  onDelete(warehouse: Warehouse): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Delete warehouse',
        message: `Delete “${warehouse.name}” (${warehouse.code})? This deactivates it.`,
        confirmLabel: 'Delete',
        destructive: true,
      },
    });
    ref
      .afterClosed()
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.store.dispatch(WarehouseActions.deleteWarehouse({ code: warehouse.code }));
        }
      });
  }

  onRetry(): void {
    this.reload();
  }

  private reload(): void {
    this.store
      .select(selectWarehouseListQuery)
      .pipe(take(1))
      .subscribe((query) => this.store.dispatch(WarehouseActions.loadWarehouses({ query })));
  }
}
