import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Rack } from '../../../core/models/entities.model';
import { FormDialogShell } from '../../../shared/components/form-dialog-shell/form-dialog-shell';
import { AncestorSelect } from '../../../shared/components/ancestor-select/ancestor-select';
import {
  codeConflictError,
  fieldError,
  parentError,
} from '../../../shared/util/field-error.util';
import { RackActions } from '../store/rack.actions';
import { selectRacksError, selectRacksSaving } from '../store/rack.selectors';

export interface RackFormDialogData {
  rack: Rack | null;
}

/**
 * Rack create/edit dialog. Create resolves the parent Warehouse via the shared
 * {@link AncestorSelect} (Company → Location → Warehouse) and submits only
 * `warehouseCode`. Edit keeps Code + parent read-only (only Name editable).
 */
@Component({
  selector: 'app-rack-form-dialog',
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
      [title]="isEdit ? 'Edit rack' : 'Add rack'"
      [saving]="(saving$ | async) ?? false"
      [canSave]="form.valid"
      (save)="submit()"
      (cancelled)="dialogRef.close()"
    >
      <form [formGroup]="form" class="entity-form" (ngSubmit)="submit()">
        @if (!isEdit) {
          <app-ancestor-select target="warehouse" (immediateParentChange)="onParent($event)" />
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
            <input matInput [value]="data.rack!.code" disabled />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Warehouse</mat-label>
            <input matInput [value]="data.rack!.warehouseCode" disabled />
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
export class RackFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  readonly dialogRef = inject<MatDialogRef<RackFormDialog>>(MatDialogRef);
  readonly data = inject<RackFormDialogData>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data.rack;
  readonly saving$ = this.store.select(selectRacksSaving);
  readonly error$ = this.store.select(selectRacksError);

  readonly codeMsg = codeConflictError;
  readonly nameMsg = fieldError('name');
  readonly parentMsg = parentError;

  readonly form = this.fb.nonNullable.group({
    warehouseCode: [
      this.data.rack?.warehouseCode ?? '',
      this.isEdit ? [] : [Validators.required],
    ],
    code: [
      { value: this.data.rack?.code ?? '', disabled: this.isEdit },
      [Validators.required, Validators.maxLength(50)],
    ],
    name: [this.data.rack?.name ?? '', [Validators.required, Validators.maxLength(200)]],
  });

  constructor() {
    this.store.dispatch(RackActions.clearError());
    this.actions$
      .pipe(
        ofType(RackActions.createRackSuccess, RackActions.updateRackSuccess),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.dialogRef.close());
  }

  onParent(warehouseCode: string | null): void {
    this.form.controls.warehouseCode.setValue(warehouseCode ?? '');
    this.form.controls.warehouseCode.markAsTouched();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();

    if (this.isEdit && this.data.rack) {
      this.store.dispatch(
        RackActions.updateRack({ code: this.data.rack.code, payload: { name: raw.name } }),
      );
    } else {
      this.store.dispatch(
        RackActions.createRack({
          payload: { code: raw.code, name: raw.name, warehouseCode: raw.warehouseCode },
        }),
      );
    }
  }
}
