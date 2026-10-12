import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter } from 'rxjs';
import {
  selectIsSuperAdmin,
  selectUserCompanyId,
  selectUserRoleCode,
} from '../../../core/auth/store/auth.selectors';
import { ApiError } from '../../../core/models/api.model';
import { roleLabel } from '../../../core/models/role.model';
import { LookupsActions } from '../../../core/lookups/store/lookups.actions';
import {
  selectCompanyOptions,
  selectLocationOptions,
} from '../../../core/lookups/store/lookups.selectors';
import { FormDialogShell } from '../../../shared/components/form-dialog-shell/form-dialog-shell';
import { fieldError } from '../../../shared/util/field-error.util';
import {
  MOBILE_ROLE_CODES,
  UserCreate,
  UserListItem,
  UserType,
  UserUpdate,
  WEB_ROLE_CODES,
} from '../user.model';
import { UsersActions } from '../store/users.actions';
import {
  selectLoadingSelectedUser,
  selectSelectedUser,
  selectUsersError,
  selectUsersSaving,
} from '../store/users.selectors';

/** Dialog data: a user (list item) to edit, or null to create. */
export interface UserFormDialogData {
  user: UserListItem | null;
}

/**
 * Shared create/edit dialog for both mobile and web users (one component).
 *
 * SMART dialog: dispatches create/update, reflects `saving`, shows server-side
 * field errors, and self-closes on the matching success — EXCEPT a mobile
 * create, which swaps to a one-time activation-key panel (copy + "won't be
 * shown again") before the user dismisses it.
 *
 * Dynamic by userType (fixed on edit):
 *  - mobile → role ∈ {Viewer,User,Manager}, multi-select locations, no password.
 *  - web    → role ∈ {Manager,Admin,SuperAdmin}, password (required on create,
 *             optional on edit), no locations.
 *
 * RBAC (mirrors the backend so users avoid 403s): the role list is capped at
 * the caller's own role, so only a SuperAdmin ever sees SuperAdmin. For a
 * SuperAdmin caller, create requires an explicit Company; for an Admin caller
 * it's their own company (omitted from the payload).
 */
@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    FormDialogShell,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (activationKey(); as key) {
      <h2 mat-dialog-title>User created</h2>
      <mat-dialog-content>
        <p class="akey__warn">
          <mat-icon class="akey__warn-icon">warning</mat-icon>
          <span>Copy this activation key now — it will <strong>not</strong> be shown again.</span>
        </p>
        <div class="akey__box">
          <code class="akey__value">{{ key }}</code>
          <button
            matIconButton
            type="button"
            matTooltip="Copy"
            aria-label="Copy activation key"
            (click)="copyKey(key)"
          >
            <mat-icon>content_copy</mat-icon>
          </button>
        </div>
        @if (copied()) {
          <span class="akey__copied">Copied to clipboard.</span>
        }
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button matButton="filled" type="button" (click)="dialogRef.close()">Done</button>
      </mat-dialog-actions>
    } @else {
      <app-form-dialog-shell
        [title]="isEdit ? 'Edit user' : 'Add user'"
        [saving]="(saving$ | async) ?? false"
        [canSave]="form.valid"
        (save)="submit()"
        (cancelled)="dialogRef.close()"
      >
        <form [formGroup]="form" class="entity-form" (ngSubmit)="submit()">
          @if (!isEdit) {
            <mat-form-field appearance="outline">
              <mat-label>User type</mat-label>
              <mat-select [value]="userType()" (selectionChange)="onUserTypeChange($event.value)">
                <mat-option value="mobile">Mobile</mat-option>
                <mat-option value="web">Web</mat-option>
              </mat-select>
            </mat-form-field>
          } @else {
            <mat-form-field appearance="outline">
              <mat-label>User type</mat-label>
              <input matInput [value]="userType()" disabled />
            </mat-form-field>
          }

          @if (!isEdit && isSuperAdmin()) {
            <mat-form-field appearance="outline">
              <mat-label>Company</mat-label>
              <mat-select formControlName="companyId" (selectionChange)="onCompanyChange($event.value)">
                @for (c of companyOptions$ | async; track c.companyId) {
                  <mat-option [value]="c.companyId">{{ c.name }}</mat-option>
                }
              </mat-select>
              @if (form.controls.companyId.hasError('required') && form.controls.companyId.touched) {
                <mat-error>Company is required</mat-error>
              }
            </mat-form-field>
          }

          <mat-form-field appearance="outline">
            <mat-label>{{ userType() === 'web' ? 'Username' : 'Username (optional)' }}</mat-label>
            <input matInput formControlName="username" maxlength="256" autocomplete="off" />
            @if (userType() === 'mobile') {
              <mat-hint>Leave blank to auto-generate a placeholder.</mat-hint>
            }
            @if (form.controls.username.hasError('required') && form.controls.username.touched) {
              <mat-error>Username is required</mat-error>
            }
            @if (error$ | async; as error) {
              @if (usernameMsg(error); as msg) {
                <mat-error>{{ msg }}</mat-error>
              }
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email (optional)</mat-label>
            <input matInput type="email" formControlName="email" maxlength="256" autocomplete="off" />
            @if (form.controls.email.hasError('email')) {
              <mat-error>Enter a valid email</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Role</mat-label>
            <mat-select formControlName="role">
              @for (code of roleOptions(); track code) {
                <mat-option [value]="code">{{ roleLabel(code) }}</mat-option>
              }
            </mat-select>
            @if (form.controls.role.hasError('required') && form.controls.role.touched) {
              <mat-error>Role is required</mat-error>
            }
          </mat-form-field>

          @if (userType() === 'web') {
            <mat-form-field appearance="outline">
              <mat-label>{{ isEdit ? 'New password (leave blank to keep)' : 'Password' }}</mat-label>
              <input
                matInput
                type="password"
                formControlName="password"
                maxlength="256"
                autocomplete="new-password"
              />
              @if (form.controls.password.hasError('required') && form.controls.password.touched) {
                <mat-error>Password is required</mat-error>
              }
              @if (form.controls.password.hasError('minlength')) {
                <mat-error>At least 8 characters</mat-error>
              }
              @if (error$ | async; as error) {
                @if (passwordMsg(error); as msg) {
                  <mat-error>{{ msg }}</mat-error>
                }
              }
            </mat-form-field>
          }

          @if (userType() === 'mobile') {
            <mat-form-field appearance="outline">
              <mat-label>Assigned locations</mat-label>
              <mat-select formControlName="locationCodes" multiple>
                @for (l of locationOptions$ | async; track l.code) {
                  <mat-option [value]="l.code">{{ l.name }} ({{ l.code }})</mat-option>
                }
              </mat-select>
              @if (loadingSelected$ | async) {
                <mat-hint>Loading current assignments…</mat-hint>
              }
            </mat-form-field>
            @if (error$ | async; as error) {
              @if (locationsMsg(error); as msg) {
                <p class="entity-form__error">{{ msg }}</p>
              }
            }
          }
        </form>
      </app-form-dialog-shell>
    }
  `,
  styles: [
    `
      .entity-form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding-top: 0.5rem;
      }
      .entity-form__error {
        margin: -0.25rem 0 0.25rem;
        color: var(--mat-sys-error);
        font: var(--mat-sys-body-small);
      }
      .akey__warn {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        margin: 0 0 1rem;
        color: var(--mat-sys-error);
        font: var(--mat-sys-body-medium);
      }
      .akey__warn-icon {
        flex: 0 0 auto;
      }
      .akey__box {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--mat-sys-outline);
        border-radius: 8px;
        background: var(--mat-sys-surface-container);
      }
      .akey__value {
        flex: 1 1 auto;
        font-family: monospace;
        font-size: 1rem;
        word-break: break-all;
      }
      .akey__copied {
        display: inline-block;
        margin-top: 0.5rem;
        color: var(--mat-sys-primary);
        font: var(--mat-sys-body-small);
      }
    `,
  ],
})
export class UserFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  readonly dialogRef = inject<MatDialogRef<UserFormDialog>>(MatDialogRef);
  readonly data = inject<UserFormDialogData>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data.user;

  /** Fixed on edit; toggled on create. */
  readonly userType = signal<UserType>(this.data.user?.userType ?? 'mobile');
  /** Set after a mobile create to swap the dialog to the activation-key panel. */
  readonly activationKey = signal<string | null>(null);
  readonly copied = signal(false);

  // Caller identity (synchronous signals) — drives RBAC + company resolution.
  private readonly callerRoleCode = this.store.selectSignal(selectUserRoleCode);
  readonly isSuperAdmin = this.store.selectSignal(selectIsSuperAdmin);
  private readonly ownCompanyId = this.store.selectSignal(selectUserCompanyId);

  readonly saving$ = this.store.select(selectUsersSaving);
  readonly error$ = this.store.select(selectUsersError);
  readonly loadingSelected$ = this.store.select(selectLoadingSelectedUser);
  readonly companyOptions$ = this.store.select(selectCompanyOptions);
  readonly locationOptions$ = this.store.select(selectLocationOptions);

  readonly roleLabel = roleLabel;
  readonly passwordMsg = fieldError('password');

  /** Roles allowed for the current type, capped at the caller's own role. */
  readonly roleOptions = computed<number[]>(() => {
    const base = this.userType() === 'mobile' ? MOBILE_ROLE_CODES : WEB_ROLE_CODES;
    return base.filter((code) => code <= this.callerRoleCode());
  });

  readonly form = this.fb.group({
    username: this.fb.control(this.data.user?.username ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(256)],
    }),
    email: this.fb.control(this.data.user?.email ?? '', {
      nonNullable: true,
      validators: [Validators.email, Validators.maxLength(256)],
    }),
    role: this.fb.control<number | null>(this.data.user?.role.code ?? null, {
      validators: [Validators.required],
    }),
    password: this.fb.control('', { nonNullable: true }),
    companyId: this.fb.control('', {
      nonNullable: true,
      validators: !this.isEdit && this.isSuperAdmin() ? [Validators.required] : [],
    }),
    locationCodes: this.fb.control<string[]>(
      this.data.user?.assignedLocations.map((l) => l.code) ?? [],
      { nonNullable: true },
    ),
  });

  constructor() {
    this.store.dispatch(UsersActions.clearError());
    this.store.dispatch(UsersActions.clearSelected());
    this.applyTypeValidators();

    // SuperAdmin picks the target company explicitly on create.
    if (!this.isEdit && this.isSuperAdmin()) {
      this.store.dispatch(LookupsActions.loadCompanyOptions());
    }

    if (this.isEdit && this.data.user) {
      // Fetch full detail (companyId + fresh assignments) to drive the mobile
      // location multi-select; the list item lacks companyId.
      this.store.dispatch(UsersActions.loadUser({ id: this.data.user.id }));
      this.store
        .select(selectSelectedUser)
        .pipe(filter(Boolean), takeUntilDestroyed())
        .subscribe((detail) => {
          if (detail.userType === 'mobile') {
            this.form.controls.locationCodes.setValue(
              detail.assignedLocations.map((l) => l.code),
            );
            this.store.dispatch(
              LookupsActions.loadLocationOptions({ companyId: detail.companyId }),
            );
          }
        });
    } else if (this.userType() === 'mobile') {
      // Create + mobile: an Admin's locations load immediately for their own
      // company; a SuperAdmin's load once they choose a company.
      const companyId = this.resolveCreateCompanyId();
      if (companyId) {
        this.store.dispatch(LookupsActions.loadLocationOptions({ companyId }));
      }
    }

    this.actions$
      .pipe(ofType(UsersActions.createUserSuccess), takeUntilDestroyed())
      .subscribe(({ result }) => {
        if (result.activationKey) {
          this.activationKey.set(result.activationKey);
        } else {
          this.dialogRef.close();
        }
      });

    this.actions$
      .pipe(ofType(UsersActions.updateUserSuccess), takeUntilDestroyed())
      .subscribe(() => this.dialogRef.close());
  }

  onUserTypeChange(type: UserType): void {
    this.userType.set(type);
    this.form.controls.role.reset(null);
    this.applyTypeValidators();
    if (type === 'mobile') {
      const companyId = this.resolveCreateCompanyId();
      if (companyId) {
        this.store.dispatch(LookupsActions.loadLocationOptions({ companyId }));
      }
    } else {
      this.form.controls.locationCodes.reset([]);
    }
  }

  onCompanyChange(companyId: string): void {
    this.form.controls.locationCodes.reset([]);
    if (this.userType() === 'mobile' && companyId) {
      this.store.dispatch(LookupsActions.loadLocationOptions({ companyId }));
    }
  }

  usernameMsg(error: ApiError): string | null {
    if (error.code === 'username_conflict') {
      return 'That username is already taken.';
    }
    return fieldError('username')(error);
  }

  locationsMsg(error: ApiError): string | null {
    if (error.invalidLocationCodes?.length) {
      return `These locations are invalid: ${error.invalidLocationCodes.join(', ')}`;
    }
    return fieldError('locationCodes')(error);
  }

  copyKey(key: string): void {
    const clip = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
    if (clip?.writeText) {
      clip.writeText(key).then(
        () => this.copied.set(true),
        () => undefined,
      );
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const email = raw.email.trim() ? raw.email.trim() : null;
    const role = raw.role as number;
    const isMobile = this.userType() === 'mobile';
    // Web requires a username; mobile may be blank → send null so the backend
    // synthesizes a stable placeholder.
    const username = isMobile ? raw.username.trim() || null : raw.username.trim();

    if (this.isEdit && this.data.user) {
      const payload: UserUpdate = { username, email, role };
      if (isMobile) {
        payload.locationCodes = raw.locationCodes;
      } else {
        const pw = raw.password.trim();
        if (pw) {
          payload.password = pw;
        }
      }
      this.store.dispatch(UsersActions.updateUser({ id: this.data.user.id, payload }));
    } else {
      const payload: UserCreate = {
        userType: this.userType(),
        username,
        email,
        role,
        companyId: this.isSuperAdmin() ? raw.companyId || null : null,
        locationCodes: isMobile ? raw.locationCodes : null,
        password: isMobile ? null : raw.password,
      };
      this.store.dispatch(UsersActions.createUser({ payload }));
    }
  }

  /** Target company for loading the mobile location options on CREATE. */
  private resolveCreateCompanyId(): string | null {
    return this.isSuperAdmin() ? this.form.controls.companyId.value || null : this.ownCompanyId();
  }

  /**
   * (Re)applies the validators that depend on userType: username is required
   * for web but optional for mobile (blank → backend synthesizes a placeholder);
   * password is web-only, required on create and optional on edit.
   */
  private applyTypeValidators(): void {
    const isWeb = this.userType() === 'web';

    const username = this.form.controls.username;
    username.setValidators(
      isWeb
        ? [Validators.required, Validators.maxLength(256)]
        : [Validators.maxLength(256)],
    );
    username.updateValueAndValidity();

    const pw = this.form.controls.password;
    if (isWeb) {
      const validators = [Validators.minLength(8), Validators.maxLength(256)];
      if (!this.isEdit) {
        validators.unshift(Validators.required);
      }
      pw.setValidators(validators);
    } else {
      pw.clearValidators();
    }
    pw.updateValueAndValidity();
  }
}
