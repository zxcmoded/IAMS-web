import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AsyncPipe } from '@angular/common';
import { Company } from '../../../core/models/entities.model';
import { FormDialogShell } from '../../../shared/components/form-dialog-shell/form-dialog-shell';
import { fieldError } from '../../../shared/util/field-error.util';
import { CompanyActions } from '../store/company.actions';
import {
  selectCompaniesError,
  selectCompaniesSaving,
} from '../store/company.selectors';

/** Dialog data: a company to edit, or null to create. */
export interface CompanyFormDialogData {
  company: Company | null;
}

/**
 * Company create/edit dialog. SMART dialog: dispatches create/update, reflects
 * `saving`, self-closes on the matching success action, and shows server-side
 * field errors beside the Name field on failure. Per contract, only Name is
 * editable (companyId is server-assigned/immutable; isActive is not user-set).
 */
@Component({
  selector: 'app-company-form-dialog',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    FormDialogShell,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-form-dialog-shell
      [title]="isEdit ? 'Edit company' : 'Add company'"
      [saving]="(saving$ | async) ?? false"
      [canSave]="form.valid"
      (save)="submit()"
      (cancelled)="dialogRef.close()"
    >
      <form [formGroup]="form" class="company-form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" maxlength="200" />
          @if (form.controls.name.hasError('required') && form.controls.name.touched) {
            <mat-error>Name is required</mat-error>
          }
          @if (error$ | async; as error) {
            @if (nameError(error); as serverMsg) {
              <mat-error>{{ serverMsg }}</mat-error>
            }
          }
        </mat-form-field>
      </form>
    </app-form-dialog-shell>
  `,
  styles: [
    `
      .company-form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding-top: 0.5rem;
      }
    `,
  ],
})
export class CompanyFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  readonly dialogRef = inject<MatDialogRef<CompanyFormDialog>>(MatDialogRef);
  private readonly data = inject<CompanyFormDialogData>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data.company;
  readonly saving$ = this.store.select(selectCompaniesSaving);
  readonly error$ = this.store.select(selectCompaniesError);

  readonly form = this.fb.nonNullable.group({
    name: [this.data.company?.name ?? '', [Validators.required, Validators.maxLength(200)]],
  });

  readonly nameError = fieldError('name');

  constructor() {
    this.store.dispatch(CompanyActions.clearError());

    this.actions$
      .pipe(
        ofType(CompanyActions.createCompanySuccess, CompanyActions.updateCompanySuccess),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.dialogRef.close());
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.form.getRawValue();

    if (this.isEdit && this.data.company) {
      this.store.dispatch(
        CompanyActions.updateCompany({ id: this.data.company.companyId, payload }),
      );
    } else {
      this.store.dispatch(CompanyActions.createCompany({ payload }));
    }
  }
}
