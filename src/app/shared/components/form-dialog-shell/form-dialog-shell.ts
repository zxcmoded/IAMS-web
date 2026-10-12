import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';

/**
 * Presentational Add/Edit dialog shell: a consistent title bar, content slot,
 * and Save/Cancel action row shared by every entity form dialog.
 *
 * Pure @Input/@Output. The concrete per-entity reactive form is projected in;
 * this shell owns neither the form state nor any store/HTTP access. The host
 * dialog component wires `save`/`cancel` to its own dispatch + dialog close.
 */
@Component({
  selector: 'app-form-dialog-shell',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>{{ title() }}</h2>

    <div class="shell__progress">
      @if (saving()) {
        <mat-progress-bar mode="indeterminate" />
      }
    </div>

    <mat-dialog-content>
      <ng-content />
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button matButton type="button" [disabled]="saving()" (click)="cancelled.emit()">
        {{ cancelLabel() }}
      </button>
      <button
        matButton="filled"
        type="button"
        [disabled]="saving() || !canSave()"
        (click)="save.emit()"
      >
        {{ saveLabel() }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .shell__progress {
        height: 4px;
        margin-bottom: 0.25rem;
      }
      mat-dialog-content {
        min-width: min(420px, 80vw);
      }
    `,
  ],
})
export class FormDialogShell {
  readonly title = input<string>('');
  readonly saving = input<boolean>(false);
  readonly canSave = input<boolean>(true);
  readonly saveLabel = input<string>('Save');
  readonly cancelLabel = input<string>('Cancel');

  readonly save = output<void>();
  readonly cancelled = output<void>();
}
