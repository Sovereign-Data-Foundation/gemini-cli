import { describe, it, expect } from 'vitest';
import {
  isApiError,
  isStructuredError,
  isProQuotaExceededError,
  isGenericQuotaExceededError,
  type ApiError,
} from './quotaErrorDetection';

describe('quotaErrorDetection', () => {
  describe('isApiError', () => {
    it('should return true for a valid ApiError object', () => {
      const error: ApiError = {
        error: {
          code: 429,
          message: 'Quota exceeded',
          status: 'RESOURCE_EXHAUSTED',
          details: [],
        },
      };
      expect(isApiError(error)).toBe(true);
    });

    it('should return false for invalid objects', () => {
      expect(isApiError(null)).toBe(false);
      expect(isApiError({})).toBe(false);
      expect(isApiError({ error: {} })).toBe(false);
      expect(isApiError({ error: { message: 123 } })).toBe(false);
    });
  });

  describe('isStructuredError', () => {
    it('should return true for a valid StructuredError object', () => {
      expect(isStructuredError({ message: 'Error message' })).toBe(true);
      expect(isStructuredError({ message: 'Error message', status: 400 })).toBe(true);
    });

    it('should return false for invalid objects', () => {
      expect(isStructuredError(null)).toBe(false);
      expect(isStructuredError({})).toBe(false);
      expect(isStructuredError({ message: 123 })).toBe(false);
    });
  });

  describe('isProQuotaExceededError', () => {
    const proQuotaMessage = "Quota exceeded for quota metric 'Gemini 2.5 Pro Requests'";
    const previewProQuotaMessage = "Quota exceeded for quota metric 'Gemini 2.5-preview Pro Requests'";
    const otherQuotaMessage = "Quota exceeded for quota metric 'Gemini 2.5 Flash Requests'";

    it('should return true for matching strings', () => {
      expect(isProQuotaExceededError(proQuotaMessage)).toBe(true);
      expect(isProQuotaExceededError(previewProQuotaMessage)).toBe(true);
    });

    it('should return false for non-matching strings', () => {
      expect(isProQuotaExceededError(otherQuotaMessage)).toBe(false);
      expect(isProQuotaExceededError('Some other error')).toBe(false);
    });

    it('should handle StructuredError', () => {
      expect(isProQuotaExceededError({ message: proQuotaMessage })).toBe(true);
      expect(isProQuotaExceededError({ message: otherQuotaMessage })).toBe(false);
    });

    it('should handle ApiError', () => {
      const apiError = {
        error: {
          message: proQuotaMessage,
          code: 429,
          status: 'RESOURCE_EXHAUSTED',
          details: [],
        },
      };
      expect(isProQuotaExceededError(apiError)).toBe(true);
    });

    it('should handle Gaxios-style errors with string data', () => {
      const gaxiosError = {
        response: {
          data: proQuotaMessage,
        },
      };
      expect(isProQuotaExceededError(gaxiosError)).toBe(true);
    });

    it('should handle Gaxios-style errors with object data', () => {
      const gaxiosError = {
        response: {
          data: {
            error: {
              message: proQuotaMessage,
            },
          },
        },
      };
      expect(isProQuotaExceededError(gaxiosError)).toBe(true);
    });

    it('should return false for Gaxios-style errors without message', () => {
      const gaxiosError = {
        response: {
          data: {
            error: {},
          },
        },
      };
      expect(isProQuotaExceededError(gaxiosError)).toBe(false);
    });

    it('should return false for non-object/non-string inputs', () => {
      expect(isProQuotaExceededError(null)).toBe(false);
      expect(isProQuotaExceededError(123)).toBe(false);
    });
  });

  describe('isGenericQuotaExceededError', () => {
    const quotaMessage = "Quota exceeded for quota metric 'Some Metric'";

    it('should return true for matching strings', () => {
      expect(isGenericQuotaExceededError(quotaMessage)).toBe(true);
    });

    it('should return false for non-matching strings', () => {
      expect(isGenericQuotaExceededError('Some other error')).toBe(false);
    });

    it('should handle StructuredError', () => {
      expect(isGenericQuotaExceededError({ message: quotaMessage })).toBe(true);
    });

    it('should handle ApiError', () => {
      const apiError = {
        error: {
          message: quotaMessage,
          code: 429,
          status: 'RESOURCE_EXHAUSTED',
          details: [],
        },
      };
      expect(isGenericQuotaExceededError(apiError)).toBe(true);
    });
  });
});
