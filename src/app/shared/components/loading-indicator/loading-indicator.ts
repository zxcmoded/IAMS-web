import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Presentational loading spinner. No store, no HTTP — driven purely by inputs.
 */
@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="loading" role="status" [attr.aria-label]="message()">
      <mat-progress-spinner mode="indeterminate" [diameter]="diameter()" />
      @if (message()) {
        <span class="loading__text">{{ message() }}</span>
      }
    </div>
  `,
  styles: [
    `
      .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 2rem;
      }
      .loading__text {
        color: var(--mat-sys-on-surface-variant);
        font: var(--mat-sys-body-medium);
      }
    `,
  ],
})
export class LoadingIndicator {
  readonly message = input<string>('');
  readonly diameter = input<number>(40);
}
