import { describe, it, expect } from 'vitest';
import {
  toFriendlyError,
  isNodeError,
  getErrorMessage,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
} from './errors.js';

describe('toFriendlyError', () => {
  it('should return the original error if it is not an object', () => {
    expect(toFriendlyError('string error')).toBe('string error');
    expect(toFriendlyError(null)).toBe(null);
    expect(toFriendlyError(123)).toBe(123);
  });

  it('should return the original error if it does not have a response property', () => {
    const error = new Error('regular error');
    expect(toFriendlyError(error)).toBe(error);

    const objError = { message: 'no response' };
    expect(toFriendlyError(objError)).toBe(objError);
  });

  it('should return the original error if response.data lacks error, error.message, or error.code', () => {
    const error1 = { response: { data: {} } };
    expect(toFriendlyError(error1)).toBe(error1);

    const error2 = { response: { data: { error: { message: 'no code' } } } };
    expect(toFriendlyError(error2)).toBe(error2);

    const error3 = { response: { data: { error: { code: 400 } } } };
    expect(toFriendlyError(error3)).toBe(error3);
  });

  it('should parse JSON string in response.data (Gaxios quirk) and map correctly', () => {
    const error = {
      response: {
        data: JSON.stringify({
          error: {
            code: 400,
            message: 'Bad Request String',
          },
        }),
      },
    };
    const result = toFriendlyError(error);
    expect(result).toBeInstanceOf(BadRequestError);
    expect((result as Error).message).toBe('Bad Request String');
  });

  it('should map code 400 to BadRequestError', () => {
    const error = {
      response: {
        data: {
          error: {
            code: 400,
            message: 'Bad Request Object',
          },
        },
      },
    };
    const result = toFriendlyError(error);
    expect(result).toBeInstanceOf(BadRequestError);
    expect((result as Error).message).toBe('Bad Request Object');
  });

  it('should map code 401 to UnauthorizedError', () => {
    const error = {
      response: {
        data: {
          error: {
            code: 401,
            message: 'Unauthorized',
          },
        },
      },
    };
    const result = toFriendlyError(error);
    expect(result).toBeInstanceOf(UnauthorizedError);
    expect((result as Error).message).toBe('Unauthorized');
  });

  it('should map code 403 to ForbiddenError', () => {
    const error = {
      response: {
        data: {
          error: {
            code: 403,
            message: 'Forbidden',
          },
        },
      },
    };
    const result = toFriendlyError(error);
    expect(result).toBeInstanceOf(ForbiddenError);
    expect((result as Error).message).toBe('Forbidden');
  });

  it('should return the original error for unmapped codes (e.g., 500)', () => {
    const error = {
      response: {
        data: {
          error: {
            code: 500,
            message: 'Internal Server Error',
          },
        },
      },
    };
    expect(toFriendlyError(error)).toBe(error);
  });
});

describe('isNodeError', () => {
  it('should return true for an Error instance with a code property', () => {
    const error = new Error('Test Error') as NodeJS.ErrnoException;
    error.code = 'ENOENT';
    expect(isNodeError(error)).toBe(true);
  });

  it('should return false for an Error instance without a code property', () => {
    const error = new Error('Test Error');
    expect(isNodeError(error)).toBe(false);
  });

  it('should return false for non-Error objects', () => {
    expect(isNodeError({ code: 'ENOENT' })).toBe(false);
    expect(isNodeError('string error')).toBe(false);
    expect(isNodeError(null)).toBe(false);
  });
});

describe('getErrorMessage', () => {
  it('should return error.message for Error instances', () => {
    const error = new Error('Test Error Message');
    expect(getErrorMessage(error)).toBe('Test Error Message');
  });

  it('should return stringified error for non-Error objects', () => {
    expect(getErrorMessage('String Error')).toBe('String Error');
    expect(getErrorMessage(123)).toBe('123');
    expect(getErrorMessage({ key: 'value' })).toBe('[object Object]');
  });

  it('should return fallback string if stringification throws an error', () => {
    const circularObj: any = {};
    circularObj.circularRef = circularObj;
    // By overriding toString, we can simulate a stringification error
    // simply using JSON.stringify or String() on circular obj doesn't always throw
    // but throwing from toString guarantees it.
    const throwingObj = {
      toString: () => {
        throw new Error('Cannot stringify');
      },
    };
    expect(getErrorMessage(throwingObj)).toBe('Failed to get error details');
  });
});
