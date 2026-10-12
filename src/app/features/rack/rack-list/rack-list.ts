import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs';
import { Rack } from '../../../core/models/entities.model';
import { TableColumn } from '../../../shared/models/table-column.model';
import { DataTable } from '../../../shared/components/data-table/data-table';
import { AncestorSelect } from '../../../shared/components/ancestor-select/ancestor-select';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog';
import { RackFormDialog, RackFormDialogData } from '../rack-form-dialog/rack-form-dialog';
import { RackActions } from '../store/rack.actions';
import { selectRackListQuery, selectRackListViewModel } from '../store/rack.selectors';

/** Rack list container (smart) with a Warehouse parent-filter. */
@Component({
  selector: 'app-rack-list',
  standalone: true,
  imports: [AsyncPipe, DataTable, AncestorSelect],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm$ | async; as vm) {
      <app-data-table
        title="Racks"
        createLabel="Add rack"
        searchPlaceholder="Search racks…"
        [columns]="columns"
        [rows]="vm.racks"
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
          target="warehouse"
          (immediateParentChange)="onParentFilter($event)"
        />
      </app-data-table>
    }
  `,
})
export class RackList implements OnInit {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);

  readonly vm$ = this.store.select(selectRackListViewModel);

  readonly columns: TableColumn<Rack>[] = [
    { key: 'code', header: 'Code', type: 'text', width: '140px' },
    { key: 'name', header: 'Name', type: 'text' },
    { key: 'warehouseCode', header: 'Warehouse', type: 'text', width: '140px' },
    { key: 'isActive', header: 'Active', type: 'boolean', width: '110px' },
    { key: 'createdAtUtc', header: 'Created', type: 'date', width: '200px' },
  ];

  ngOnInit(): void {
    this.reload();
  }

  onSearch(search: string): void {
    this.store.dispatch(RackActions.searchChanged({ search }));
  }

  onIncludeInactive(includeInactive: boolean): void {
    this.store.dispatch(RackActions.includeInactiveToggled({ includeInactive }));
  }

  onParentFilter(parentCode: string | null): void {
    this.store.dispatch(RackActions.parentFilterChanged({ parentCode }));
  }

  onPage(event: PageEvent): void {
    this.store.dispatch(
      RackActions.pageChanged({ pageIndex: event.pageIndex, pageSize: event.pageSize }),
    );
  }

  onCreate(): void {
    this.dialog.open<RackFormDialog, RackFormDialogData>(RackFormDialog, {
      data: { rack: null },
      autoFocus: 'first-tabbable',
    });
  }

  onEdit(rack: Rack): void {
    this.dialog.open<RackFormDialog, RackFormDialogData>(RackFormDialog, {
      data: { rack },
      autoFocus: 'first-tabbable',
    });
  }

  onDelete(rack: Rack): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Delete rack',
        message: `Delete “${rack.name}” (${rack.code})? This deactivates it.`,
        confirmLabel: 'Delete',
        destructive: true,
      },
    });
    ref
      .afterClosed()
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.store.dispatch(RackActions.deleteRack({ code: rack.code }));
        }
      });
  }

  onRetry(): void {
    this.reload();
  }

  private reload(): void {
    this.store
      .select(selectRackListQuery)
      .pipe(take(1))
      .subscribe((query) => this.store.dispatch(RackActions.loadRacks({ query })));
  }
}
