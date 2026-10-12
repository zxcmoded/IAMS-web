import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Presentational empty / error placeholder. Emits an optional action click so
 * the parent container can retry or create a first record.
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty" [class.empty--error]="variant() === 'error'">
      <mat-icon class="empty__icon">{{ icon() }}</mat-icon>
      <p class="empty__title">{{ title() }}</p>
      @if (message()) {
        <p class="empty__message">{{ message() }}</p>
      }
      @if (actionLabel()) {
        <button matButton="outlined" type="button" (click)="action.emit()">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 3rem 1.5rem;
        text-align: center;
        color: var(--mat-sys-on-surface-variant);
      }
      .empty__icon {
        width: 48px;
        height: 48px;
        font-size: 48px;
      }
      .empty__title {
        font: var(--mat-sys-title-medium);
        margin: 0;
      }
      .empty__message {
        margin: 0;
        font: var(--mat-sys-body-medium);
      }
      .empty--error .empty__icon {
        color: var(--mat-sys-error);
      }
    `,
  ],
})
export class EmptyState {
  readonly title = input<string>('Nothing to show');
  readonly message = input<string>('');
  readonly icon = input<string>('inbox');
  readonly actionLabel = input<string>('');
  readonly variant = input<'empty' | 'error'>('empty');

  readonly action = output<void>();
}
