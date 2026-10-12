import { ApiError } from '../../core/models/api.model';

/**
 * Builds an accessor that extracts the server-side validation message(s) for a
 * given form field from an {@link ApiError}. The RFC7807 `errors` map may key
 * fields in PascalCase (e.g. `Name`), so matching is case-insensitive. Returns
 * a joined message string, or null when there's no server error for the field.
 */
export function fieldError(field: string): (error: ApiError | null | undefined) => string | null {
  const target = field.toLowerCase();
  return (error) => {
    const map = error?.fieldErrors;
    if (!map) {
      return null;
    }
    const key = Object.keys(map).find((k) => k.toLowerCase() === target);
    if (!key) {
      return null;
    }
    const messages = map[key];
    return messages && messages.length > 0 ? messages.join(' ') : null;
  };
}

/**
 * Message to show beside the Code field when a create is rejected with the
 * `code_conflict` machine code (409), else null.
 */
export function codeConflictError(error: ApiError | null | undefined): string | null {
  if (error?.code === 'code_conflict') {
    return error.message || 'That code is already in use.';
  }
  return null;
}

/**
 * Message to show beside a parent selector when a create is rejected because
 * the parent is missing/inactive, else null.
 */
export function parentError(error: ApiError | null | undefined): string | null {
  switch (error?.code) {
    case 'parent_not_found':
      return error.message || 'The selected parent no longer exists.';
    case 'parent_inactive':
      return error.message || 'The selected parent is inactive.';
    default:
      return null;
  }
}

/**
 * Maps an {@link ApiError} to a clear, user-facing notification message for a
 * given entity, specializing the codes whose generic copy is unhelpful. Falls
 * back to the server-provided message for everything else. `entityLabel` is the
 * lowercase singular noun (e.g. 'location', 'warehouse').
 */
export function entityErrorMessage(error: ApiError, entityLabel: string): string {
  switch (error.code) {
    case 'has_active_children':
      return `Can't delete — this ${entityLabel} still has active child records. Deactivate or remove them first.`;
    case 'not_found':
      return `This ${entityLabel} no longer exists. It may have been removed.`;
    default:
      return error.message;
  }
}
