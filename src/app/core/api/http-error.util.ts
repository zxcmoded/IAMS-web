import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/api.model';

/** RFC7807 problem-details body as returned by the backend. */
interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  code?: string;
  errors?: Record<string, string[]>;
  /** Top-level extension member on a user/location validation_failed 400. */
  invalidLocationCodes?: string[];
}

/**
 * Normalize any thrown HTTP error into the UI-facing {@link ApiError} shape.
 * The backend always returns RFC7807, so we read `detail`/`title` for the
 * message, `code` for machine handling, and `errors` for field-level messages.
 */
export function toApiError(err: unknown): ApiError {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return {
        status: 0,
        code: 'network_error',
        message: 'Unable to reach the server. Check your connection.',
      };
    }

    const body = err.error as ProblemDetails | string | null | undefined;

    if (body && typeof body === 'object') {
      const message = body.detail ?? body.title ?? defaultMessageFor(err.status);
      return {
        status: err.status,
        code: body.code,
        message,
        fieldErrors: body.errors,
        invalidLocationCodes: body.invalidLocationCodes,
      };
    }

    if (typeof body === 'string' && body.trim().length > 0) {
      return { status: err.status, message: body };
    }

    return { status: err.status, message: err.message || defaultMessageFor(err.status) };
  }

  return { status: -1, message: 'An unexpected error occurred.' };
}

function defaultMessageFor(status: number): string {
  switch (status) {
    case 400:
      return 'The request was invalid.';
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This conflicts with existing data.';
    case 429:
      return 'Too many attempts. Please wait a moment and try again.';
    case 500:
      return 'A server error occurred. Please try again later.';
    default:
      return 'Request failed.';
  }
}
