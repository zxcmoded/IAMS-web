import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Warehouse } from '../../../core/models/entities.model';
import { FormDialogShell } from '../../../shared/components/form-dialog-shell/form-dialog-shell';
import { AncestorSelect } from '../../../shared/components/ancestor-select/ancestor-select';
import {
  codeConflictError,
  fieldError,
  parentError,
} from '../../../shared/util/field-error.util';
import { WarehouseActions } from '../store/warehouse.actions';
import { selectWarehousesError, selectWarehousesSaving } from '../store/warehouse.selectors';

export interface WarehouseFormDialogData {
  warehouse: Warehouse | null;
}

/**
 * Warehouse create/edit dialog. Create resolves the parent Location via the
 * shared {@link AncestorSelect} (Company → Location) and submits only
 * `locationCode`. Edit keeps Code + parent read-only (only Name editable).
 */
@Component({
  selector: 'app-warehouse-form-dialog',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    FormDialogShell,
    AncestorSelect,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-form-dialog-shell
      [title]="isEdit ? 'Edit warehouse' : 'Add warehouse'"
      [saving]="(saving$ | async) ?? false"
      [canSave]="form.valid"
      (save)="submit()"
      (cancelled)="dialogRef.close()"
    >
      <form [formGroup]="form" class="entity-form" (ngSubmit)="submit()">
        @if (!isEdit) {
          <app-ancestor-select target="location" (immediateParentChange)="onParent($event)" />
          @if (error$ | async; as error) {
            @if (parentMsg(error); as msg) {
              <p class="entity-form__parent-error">{{ msg }}</p>
            }
          }

          <mat-form-field appearance="outline">
            <mat-label>Code</mat-label>
            <input matInput formControlName="code" maxlength="50" />
            @if (form.controls.code.hasError('required') && form.controls.code.touched) {
              <mat-error>Code is required</mat-error>
            }
            @if (error$ | async; as error) {
              @if (codeMsg(error); as msg) {
                <mat-error>{{ msg }}</mat-error>
              }
            }
          </mat-form-field>
        } @else {
          <mat-form-field appearance="outline">
            <mat-label>Code</mat-label>
            <input matInput [value]="data.warehouse!.code" disabled />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Location</mat-label>
            <input matInput [value]="data.warehouse!.locationCode" disabled />
          </mat-form-field>
        }

        <mat-form-field appearance="outline">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" maxlength="200" />
          @if (form.controls.name.hasError('required') && form.controls.name.touched) {
            <mat-error>Name is required</mat-error>
          }
          @if (error$ | async; as error) {
            @if (nameMsg(error); as msg) {
              <mat-error>{{ msg }}</mat-error>
            }
          }
        </mat-form-field>
      </form>
    </app-form-dialog-shell>
  `,
  styles: [
    `
      .entity-form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding-top: 0.5rem;
      }
      .entity-form__parent-error {
        margin: -0.25rem 0 0.25rem;
        color: var(--mat-sys-error);
        font: var(--mat-sys-body-small);
      }
    `,
  ],
})
export class WarehouseFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  readonly dialogRef = inject<MatDialogRef<WarehouseFormDialog>>(MatDialogRef);
  readonly data = inject<WarehouseFormDialogData>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data.warehouse;
  readonly saving$ = this.store.select(selectWarehousesSaving);
  readonly error$ = this.store.select(selectWarehousesError);

  readonly codeMsg = codeConflictError;
  readonly nameMsg = fieldError('name');
  readonly parentMsg = parentError;

  readonly form = this.fb.nonNullable.group({
    locationCode: [
      this.data.warehouse?.locationCode ?? '',
      this.isEdit ? [] : [Validators.required],
    ],
    code: [
      { value: this.data.warehouse?.code ?? '', disabled: this.isEdit },
      [Validators.required, Validators.maxLength(50)],
    ],
    name: [this.data.warehouse?.name ?? '', [Validators.required, Validators.maxLength(200)]],
  });

  constructor() {
    this.store.dispatch(WarehouseActions.clearError());
    this.actions$
      .pipe(
        ofType(WarehouseActions.createWarehouseSuccess, WarehouseActions.updateWarehouseSuccess),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.dialogRef.close());
  }

  onParent(locationCode: string | null): void {
    this.form.controls.locationCode.setValue(locationCode ?? '');
    this.form.controls.locationCode.markAsTouched();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();

    if (this.isEdit && this.data.warehouse) {
      this.store.dispatch(
        WarehouseActions.updateWarehouse({
          code: this.data.warehouse.code,
          payload: { name: raw.name },
        }),
      );
    } else {
      this.store.dispatch(
        WarehouseActions.createWarehouse({
          payload: { code: raw.code, name: raw.name, locationCode: raw.locationCode },
        }),
      );
    }
  }
}
