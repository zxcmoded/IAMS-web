import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs';
import { Location } from '../../../core/models/entities.model';
import { TableColumn } from '../../../shared/models/table-column.model';
import { DataTable } from '../../../shared/components/data-table/data-table';
import { AncestorSelect } from '../../../shared/components/ancestor-select/ancestor-select';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog';
import {
  LocationFormDialog,
  LocationFormDialogData,
} from '../location-form-dialog/location-form-dialog';
import { LocationActions } from '../store/location.actions';
import {
  selectLocationListQuery,
  selectLocationListViewModel,
} from '../store/location.selectors';

/**
 * Location list container (smart). Adds a Company parent-filter (via the shared
 * AncestorSelect) to the reusable DataTable. No HTTP here.
 */
@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [AsyncPipe, DataTable, AncestorSelect],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (vm$ | async; as vm) {
      <app-data-table
        title="Locations"
        createLabel="Add location"
        searchPlaceholder="Search locations…"
        [columns]="columns"
        [rows]="vm.locations"
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
          target="company"
          (immediateParentChange)="onCompanyFilter($event)"
        />
      </app-data-table>
    }
  `,
})
export class LocationList implements OnInit {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);

  readonly vm$ = this.store.select(selectLocationListViewModel);

  readonly columns: TableColumn<Location>[] = [
    { key: 'code', header: 'Code', type: 'text', width: '140px' },
    { key: 'name', header: 'Name', type: 'text' },
    { key: 'region', header: 'Region', type: 'text', width: '140px' },
    { key: 'isActive', header: 'Active', type: 'boolean', width: '110px' },
    { key: 'createdAtUtc', header: 'Created', type: 'date', width: '200px' },
  ];

  ngOnInit(): void {
    this.reload();
  }

  onSearch(search: string): void {
    this.store.dispatch(LocationActions.searchChanged({ search }));
  }

  onIncludeInactive(includeInactive: boolean): void {
    this.store.dispatch(LocationActions.includeInactiveToggled({ includeInactive }));
  }

  onCompanyFilter(companyId: string | null): void {
    this.store.dispatch(LocationActions.companyFilterChanged({ companyId }));
  }

  onPage(event: PageEvent): void {
    this.store.dispatch(
      LocationActions.pageChanged({ pageIndex: event.pageIndex, pageSize: event.pageSize }),
    );
  }

  onCreate(): void {
    this.dialog.open<LocationFormDialog, LocationFormDialogData>(LocationFormDialog, {
      data: { location: null },
      autoFocus: 'first-tabbable',
    });
  }

  onEdit(location: Location): void {
    this.dialog.open<LocationFormDialog, LocationFormDialogData>(LocationFormDialog, {
      data: { location },
      autoFocus: 'first-tabbable',
    });
  }

  onDelete(location: Location): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Delete location',
        message: `Delete “${location.name}” (${location.code})? This deactivates it.`,
        confirmLabel: 'Delete',
        destructive: true,
      },
    });
    ref
      .afterClosed()
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.store.dispatch(LocationActions.deleteLocation({ code: location.code }));
        }
      });
  }

  onRetry(): void {
    this.reload();
  }

  private reload(): void {
    this.store
      .select(selectLocationListQuery)
      .pipe(take(1))
      .subscribe((query) => this.store.dispatch(LocationActions.loadLocations({ query })));
  }
}
