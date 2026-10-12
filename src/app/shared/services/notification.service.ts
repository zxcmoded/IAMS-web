import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

/**
 * Thin wrapper over MatSnackBar so components/effects raise notifications
 * through one consistent API instead of configuring the snackbar everywhere.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly base: MatSnackBarConfig = {
    duration: 4000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  success(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      ...this.base,
      panelClass: ['iams-snack', 'iams-snack--success'],
    });
  }

  error(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      ...this.base,
      duration: 6000,
      panelClass: ['iams-snack', 'iams-snack--error'],
    });
  }

  info(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      ...this.base,
      panelClass: ['iams-snack', 'iams-snack--info'],
    });
  }
}
