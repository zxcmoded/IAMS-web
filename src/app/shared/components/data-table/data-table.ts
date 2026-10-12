import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiError } from '../../../core/models/api.model';
import { RowAction, TableColumn } from '../../models/table-column.model';
import { EmptyState } from '../empty-state/empty-state';

/**
 * Reusable, fully presentational data table.
 *
 * Pure @Input/@Output: NO store access, NO HTTP. The parent container owns all
 * data fetching and dispatches; this component only renders and emits intent.
 *
 * Features: column config, row edit/delete actions, loading/empty/error states,
 * server-side pagination controls, debounce-free text search (parent debounces
 * if desired), and a projected parent-filter slot (`[filters]`).
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    DatePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatTableModule,
    MatTooltipModule,
    EmptyState,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable<T> {
  // --- data & config ---
  readonly columns = input.required<TableColumn<T>[]>();
  readonly rows = input.required<readonly T[]>();
  readonly trackByKey = input<keyof T | string>('');

  // --- state ---
  readonly loading = input<boolean>(false);
  readonly error = input<ApiError | null>(null);

  // --- toolbar ---
  readonly title = input<string>('');
  readonly searchTerm = input<string>('');
  readonly searchPlaceholder = input<string>('Search…');
  readonly showCreate = input<boolean>(true);
  readonly createLabel = input<string>('Add');
  readonly showActions = input<boolean>(true);
  readonly showDelete = input<boolean>(true);
  readonly showInactiveToggle = input<boolean>(true);
  readonly includeInactive = input<boolean>(false);

  // --- pagination (server-side) ---
  readonly totalCount = input<number>(0);
  readonly pageIndex = input<number>(0);
  readonly pageSize = input<number>(10);
  readonly pageSizeOptions = input<number[]>([10, 25, 50]);

  // --- outputs ---
  readonly searchChange = output<string>();
  readonly includeInactiveChange = output<boolean>();
  readonly pageChange = output<PageEvent>();
  readonly create = output<void>();
  readonly edit = output<T>();
  readonly remove = output<T>();
  readonly rowAction = output<RowAction<T>>();
  readonly retry = output<void>();

  /** Material column ids = configured columns (+ actions column when enabled). */
  readonly displayedColumns = computed<string[]>(() => {
    const base = this.columns().map((c) => c.key);
    return this.showActions() ? [...base, '__actions__'] : base;
  });

  readonly isEmpty = computed(
    () => !this.loading() && !this.error() && this.rows().length === 0,
  );

  cellValue(column: TableColumn<T>, row: T): unknown {
    return column.value
      ? column.value(row)
      : (row as Record<string, unknown>)[column.key];
  }

  onSearchInput(value: string): void {
    this.searchChange.emit(value);
  }

  onEdit(row: T): void {
    this.edit.emit(row);
    this.rowAction.emit({ action: 'edit', row });
  }

  onRemove(row: T): void {
    this.remove.emit(row);
    this.rowAction.emit({ action: 'delete', row });
  }
}
