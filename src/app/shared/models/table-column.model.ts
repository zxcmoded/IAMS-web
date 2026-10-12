/**
 * Column configuration for the reusable data table. Kept framework-agnostic and
 * data-driven so every entity list reuses the same presentational table.
 */
export interface TableColumn<T> {
  /** Property key or synthetic id for the column. */
  key: string;
  /** Column header label. */
  header: string;
  /** Cell value accessor. Defaults to `row[key]` when omitted. */
  value?: (row: T) => unknown;
  /** Render hint used by the table template. */
  type?: 'text' | 'boolean' | 'date';
  /** Optional width (CSS value, e.g. '120px'). */
  width?: string;
}

/** A row action (edit/delete/etc.) emitted by the table. */
export interface RowAction<T> {
  action: string;
  row: T;
}
