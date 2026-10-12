import { ApiError } from '../../core/models/api.model';

/**
 * Maps a Users {@link ApiError} `code` to friendly copy, specializing the codes
 * whose generic server message is unhelpful; falls back to the server message.
 * Kept out of the effects module so `provideEffects` doesn't treat it as an
 * effect.
 */
export function usersErrorMessage(error: ApiError): string {
  switch (error.code) {
    case 'username_conflict':
      return 'That username is already taken.';
    case 'access_denied':
      return "You can't assign or edit a role higher than your own, or that company isn't yours.";
    case 'not_found':
      return 'This user or company no longer exists. It may have been removed.';
    default:
      return error.message;
  }
}
