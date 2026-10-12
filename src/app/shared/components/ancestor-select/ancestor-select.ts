import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { LookupsActions } from '../../../core/lookups/store/lookups.actions';
import {
  selectCompanyOptions,
  selectLocationOptions,
  selectRackOptions,
  selectWarehouseOptions,
} from '../../../core/lookups/store/lookups.selectors';

/** The deepest ancestor level this selector resolves (= immediate parent). */
export type AncestorLevel = 'company' | 'location' | 'warehouse' | 'rack';

const LEVEL_ORDER: AncestorLevel[] = ['company', 'location', 'warehouse', 'rack'];

/**
 * Reusable cascading ancestor selector backed by the shared lookups store.
 *
 * This is a deliberately SMART widget (it reads the lookups store and dispatches
 * option-load actions) so the cascade logic lives in exactly one place and is
 * shared by every hierarchical entity's create form AND its list parent-filter.
 * It renders Company → … → `target` dropdowns, loads each level's options when
 * its parent is chosen, clears now-invalid descendant selections on any ancestor
 * change, and emits the selected immediate-parent code (or null while
 * incomplete). No entity HTTP lives in the consuming components as a result.
 */
@Component({
  selector: 'app-ancestor-select',
  standalone: true,
  imports: [AsyncPipe, MatFormFieldModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ancestor">
      @if (showLevel('company')) {
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Company</mat-label>
          <mat-select
            [value]="companyId()"
            [disabled]="disabled()"
            (selectionChange)="onCompany($event.value)"
          >
            @for (c of companyOptions$ | async; track c.companyId) {
              <mat-option [value]="c.companyId">{{ c.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      }

      @if (showLevel('location')) {
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Location</mat-label>
          <mat-select
            [value]="locationCode()"
            [disabled]="disabled() || !companyId()"
            (selectionChange)="onLocation($event.value)"
          >
            @for (l of locationOptions$ | async; track l.code) {
              <mat-option [value]="l.code">{{ l.name }} ({{ l.code }})</mat-option>
            }
          </mat-select>
        </mat-form-field>
      }

      @if (showLevel('warehouse')) {
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Warehouse</mat-label>
          <mat-select
            [value]="warehouseCode()"
            [disabled]="disabled() || !locationCode()"
            (selectionChange)="onWarehouse($event.value)"
          >
            @for (w of warehouseOptions$ | async; track w.code) {
              <mat-option [value]="w.code">{{ w.name }} ({{ w.code }})</mat-option>
            }
          </mat-select>
        </mat-form-field>
      }

      @if (showLevel('rack')) {
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Rack</mat-label>
          <mat-select
            [value]="rackCode()"
            [disabled]="disabled() || !warehouseCode()"
            (selectionChange)="onRack($event.value)"
          >
            @for (r of rackOptions$ | async; track r.code) {
              <mat-option [value]="r.code">{{ r.name }} ({{ r.code }})</mat-option>
            }
          </mat-select>
        </mat-form-field>
      }
    </div>
  `,
  styles: [
    `
      .ancestor {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
    `,
  ],
})
export class AncestorSelect implements OnInit {
  private readonly store = inject(Store);

  /** Deepest level to resolve (the entity's immediate parent). */
  readonly target = input.required<AncestorLevel>();
  /** When true, all selectors are disabled (e.g. edit mode / read-only parent). */
  readonly disabled = input<boolean>(false);

  /** Emits the selected immediate-parent code, or null while the cascade is incomplete. */
  readonly immediateParentChange = output<string | null>();

  readonly companyOptions$ = this.store.select(selectCompanyOptions);
  readonly locationOptions$ = this.store.select(selectLocationOptions);
  readonly warehouseOptions$ = this.store.select(selectWarehouseOptions);
  readonly rackOptions$ = this.store.select(selectRackOptions);

  readonly companyId = signal<string | null>(null);
  readonly locationCode = signal<string | null>(null);
  readonly warehouseCode = signal<string | null>(null);
  readonly rackCode = signal<string | null>(null);

  private readonly targetIndex = computed(() => LEVEL_ORDER.indexOf(this.target()));

  ngOnInit(): void {
    this.store.dispatch(LookupsActions.loadCompanyOptions());
  }

  showLevel(level: AncestorLevel): boolean {
    return LEVEL_ORDER.indexOf(level) <= this.targetIndex();
  }

  onCompany(id: string): void {
    this.companyId.set(id);
    this.locationCode.set(null);
    this.warehouseCode.set(null);
    this.rackCode.set(null);
    if (this.targetIndex() >= LEVEL_ORDER.indexOf('location')) {
      this.store.dispatch(LookupsActions.loadLocationOptions({ companyId: id }));
    }
    this.emit();
  }

  onLocation(code: string): void {
    this.locationCode.set(code);
    this.warehouseCode.set(null);
    this.rackCode.set(null);
    if (this.targetIndex() >= LEVEL_ORDER.indexOf('warehouse')) {
      this.store.dispatch(LookupsActions.loadWarehouseOptions({ locationCode: code }));
    }
    this.emit();
  }

  onWarehouse(code: string): void {
    this.warehouseCode.set(code);
    this.rackCode.set(null);
    if (this.targetIndex() >= LEVEL_ORDER.indexOf('rack')) {
      this.store.dispatch(LookupsActions.loadRackOptions({ warehouseCode: code }));
    }
    this.emit();
  }

  onRack(code: string): void {
    this.rackCode.set(code);
    this.emit();
  }

  /** Emits the immediate-parent code for the configured target level (or null). */
  private emit(): void {
    const byLevel: Record<AncestorLevel, string | null> = {
      company: this.companyId(),
      location: this.locationCode(),
      warehouse: this.warehouseCode(),
      rack: this.rackCode(),
    };
    this.immediateParentChange.emit(byLevel[this.target()]);
  }
}
