import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs';
import { Bin } from '../../../core/models/entities.model';
import { TableColumn } from '../../../shared/models/table-column.model';
import { DataTable } from '../../../shared/components/data-table/data-table';
import { AncestorSelect } from '../../../shared/components/ancestor-select/ancestor-select';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog';
import { BinFormDialog, BinFormDialogData } from '../bin-form-dialog/bin-form-dialog';
import { BinActions } from '../store/bin.actions';
import { selectBinListQuery, selectBinListViewModel } from '../store/bin.selectors';

/** Bin list container (smart) with a Rack parent-filter. */
@Component({
  selector: 'app-bin-list',
  standalone: true,
  imports: [AsyncPipe, DataTable, AncestorSelect],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm$ | async; as vm) {
      <app-data-table
        title="Bins"
        createLabel="Add bin"
        searchPlaceholder="Search bins…"
        [columns]="columns"
        [rows]="vm.bins"
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
          target="rack"
          (immediateParentChange)="onParentFilter($event)"
        />
      </app-data-table>
    }
  `,
})
export class BinList implements OnInit {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);

  readonly vm$ = this.store.select(selectBinListViewModel);

  readonly columns: TableColumn<Bin>[] = [
    { key: 'code', header: 'Code', type: 'text', width: '140px' },
    { key: 'name', header: 'Name', type: 'text' },
    { key: 'rackCode', header: 'Rack', type: 'text', width: '140px' },
    { key: 'isActive', header: 'Active', type: 'boolean', width: '110px' },
    { key: 'createdAtUtc', header: 'Created', type: 'date', width: '200px' },
  ];

  ngOnInit(): void {
    this.reload();
  }

  onSearch(search: string): void {
    this.store.dispatch(BinActions.searchChanged({ search }));
  }

  onIncludeInactive(includeInactive: boolean): void {
    this.store.dispatch(BinActions.includeInactiveToggled({ includeInactive }));
  }

  onParentFilter(parentCode: string | null): void {
    this.store.dispatch(BinActions.parentFilterChanged({ parentCode }));
  }

  onPage(event: PageEvent): void {
    this.store.dispatch(
      BinActions.pageChanged({ pageIndex: event.pageIndex, pageSize: event.pageSize }),
    );
  }

  onCreate(): void {
    this.dialog.open<BinFormDialog, BinFormDialogData>(BinFormDialog, {
      data: { bin: null },
      autoFocus: 'first-tabbable',
    });
  }

  onEdit(bin: Bin): void {
    this.dialog.open<BinFormDialog, BinFormDialogData>(BinFormDialog, {
      data: { bin },
      autoFocus: 'first-tabbable',
    });
  }

  onDelete(bin: Bin): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Delete bin',
        message: `Delete “${bin.name}” (${bin.code})? This deactivates it.`,
        confirmLabel: 'Delete',
        destructive: true,
      },
    });
    ref
      .afterClosed()
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.store.dispatch(BinActions.deleteBin({ code: bin.code }));
        }
      });
  }

  onRetry(): void {
    this.reload();
  }

  private reload(): void {
    this.store
      .select(selectBinListQuery)
      .pipe(take(1))
      .subscribe((query) => this.store.dispatch(BinActions.loadBins({ query })));
  }
}
