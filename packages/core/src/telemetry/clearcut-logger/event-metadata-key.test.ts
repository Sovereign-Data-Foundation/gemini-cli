import { describe, it, expect } from 'vitest';
import {
  EventMetadataKey,
  getEventMetadataKey,
} from './event-metadata-key.js';

describe('getEventMetadataKey', () => {
  it('should return the correct enum value for a valid key name', () => {
    expect(getEventMetadataKey('GEMINI_CLI_START_SESSION_MODEL')).toBe(
      EventMetadataKey.GEMINI_CLI_START_SESSION_MODEL,
    );
    expect(getEventMetadataKey('GEMINI_CLI_USER_PROMPT_LENGTH')).toBe(
      EventMetadataKey.GEMINI_CLI_USER_PROMPT_LENGTH,
    );
    expect(getEventMetadataKey('GEMINI_CLI_END_SESSION_ID')).toBe(
      EventMetadataKey.GEMINI_CLI_END_SESSION_ID,
    );
  });

  it('should return undefined for an invalid key name', () => {
    expect(getEventMetadataKey('INVALID_KEY_NAME')).toBeUndefined();
    expect(getEventMetadataKey('')).toBeUndefined();
    expect(getEventMetadataKey(' ')).toBeUndefined();
  });

  it('should return undefined for a number passed as a string', () => {
    // EventMetadataKey[1] is 'GEMINI_CLI_START_SESSION_MODEL' in standard TS enums,
    // but getEventMetadataKey should return undefined because typeof 'GEMINI_CLI_START_SESSION_MODEL' is string, not number.
    expect(getEventMetadataKey('1')).toBeUndefined();
    expect(getEventMetadataKey('0')).toBeUndefined();
  });

  it('should return undefined for built-in object properties', () => {
    expect(getEventMetadataKey('toString')).toBeUndefined();
    expect(getEventMetadataKey('valueOf')).toBeUndefined();
    expect(getEventMetadataKey('__proto__')).toBeUndefined();
  });
});
