import {
  codeConflictError,
  entityErrorMessage,
  fieldError,
  parentError,
} from './field-error.util';
import { ApiError } from '../../core/models/api.model';

describe('field-error util', () => {
  it('fieldError matches the field case-insensitively and joins messages', () => {
    const error: ApiError = {
      status: 400,
      code: 'validation_failed',
      message: 'invalid',
      fieldErrors: { Name: ['Required.', 'Too short.'] },
    };
    expect(fieldError('name')(error)).toBe('Required. Too short.');
    expect(fieldError('region')(error)).toBeNull();
    expect(fieldError('name')(null)).toBeNull();
  });

  it('codeConflictError only fires for code_conflict', () => {
    expect(codeConflictError({ status: 409, code: 'code_conflict', message: 'dupe' })).toBe('dupe');
    expect(codeConflictError({ status: 409, code: 'other', message: 'x' })).toBeNull();
  });

  it('parentError maps parent_not_found / parent_inactive', () => {
    expect(parentError({ status: 404, code: 'parent_not_found', message: 'gone' })).toBe('gone');
    expect(parentError({ status: 400, code: 'parent_inactive', message: 'off' })).toBe('off');
    expect(parentError({ status: 400, code: 'nope', message: 'x' })).toBeNull();
  });

  describe('entityErrorMessage', () => {
    it('specializes has_active_children with the entity label', () => {
      const msg = entityErrorMessage(
        { status: 409, code: 'has_active_children', message: 'conflict' },
        'warehouse',
      );
      expect(msg).toContain('warehouse');
      expect(msg).toContain('active child records');
    });

    it('specializes not_found with the entity label', () => {
      const msg = entityErrorMessage({ status: 404, code: 'not_found', message: 'x' }, 'rack');
      expect(msg).toContain('rack');
      expect(msg).toContain('no longer exists');
    });

    it('falls back to the server message for other codes', () => {
      expect(
        entityErrorMessage({ status: 500, code: 'server_error', message: 'boom' }, 'location'),
      ).toBe('boom');
    });
  });
});
