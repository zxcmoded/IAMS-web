import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Location } from '../../../core/models/entities.model';
import { FormDialogShell } from '../../../shared/components/form-dialog-shell/form-dialog-shell';
import { AncestorSelect } from '../../../shared/components/ancestor-select/ancestor-select';
import {
  codeConflictError,
  fieldError,
  parentError,
} from '../../../shared/util/field-error.util';
import { LocationActions } from '../store/location.actions';
import { selectLocationsError, selectLocationsSaving } from '../store/location.selectors';

export interface LocationFormDialogData {
  location: Location | null;
}

/**
 * Location create/edit dialog. Create resolves the parent Company via the
 * shared {@link AncestorSelect}; Code is user-entered + unique. Edit keeps Code
 * and Company read-only (only Name + region are editable). Server field errors
 * render beside the relevant control.
 */
@Component({
  selector: 'app-location-form-dialog',
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
      [title]="isEdit ? 'Edit location' : 'Add location'"
      [saving]="(saving$ | async) ?? false"
      [canSave]="form.valid"
      (save)="submit()"
      (cancelled)="dialogRef.close()"
    >
      <form [formGroup]="form" class="entity-form" (ngSubmit)="submit()">
        @if (!isEdit) {
          <app-ancestor-select
            target="company"
            (immediateParentChange)="onCompany($event)"
          />
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
            <input matInput [value]="data.location!.code" disabled />
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

        <mat-form-field appearance="outline">
          <mat-label>Region (optional)</mat-label>
          <input matInput formControlName="region" maxlength="100" />
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
export class LocationFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  readonly dialogRef = inject<MatDialogRef<LocationFormDialog>>(MatDialogRef);
  readonly data = inject<LocationFormDialogData>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data.location;
  readonly saving$ = this.store.select(selectLocationsSaving);
  readonly error$ = this.store.select(selectLocationsError);

  readonly codeMsg = codeConflictError;
  readonly nameMsg = fieldError('name');
  readonly parentMsg = parentError;

  readonly form = this.fb.nonNullable.group({
    companyId: [this.data.location?.companyId ?? '', this.isEdit ? [] : [Validators.required]],
    code: [
      { value: this.data.location?.code ?? '', disabled: this.isEdit },
      [Validators.required, Validators.maxLength(50)],
    ],
    name: [this.data.location?.name ?? '', [Validators.required, Validators.maxLength(200)]],
    region: [this.data.location?.region ?? ''],
  });

  constructor() {
    this.store.dispatch(LocationActions.clearError());
    this.actions$
      .pipe(
        ofType(LocationActions.createLocationSuccess, LocationActions.updateLocationSuccess),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.dialogRef.close());
  }

  onCompany(companyId: string | null): void {
    this.form.controls.companyId.setValue(companyId ?? '');
    this.form.controls.companyId.markAsTouched();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const region = raw.region.trim() ? raw.region.trim() : null;

    if (this.isEdit && this.data.location) {
      this.store.dispatch(
        LocationActions.updateLocation({
          code: this.data.location.code,
          payload: { name: raw.name, region },
        }),
      );
    } else {
      this.store.dispatch(
        LocationActions.createLocation({
          payload: { code: raw.code, name: raw.name, companyId: raw.companyId, region },
        }),
      );
    }
  }
}
