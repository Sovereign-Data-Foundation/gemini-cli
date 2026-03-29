/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { isBinary } from './textUtils.js';

describe('isBinary', () => {
  it('should return false for null or undefined', () => {
    expect(isBinary(null)).toBe(false);
    expect(isBinary(undefined)).toBe(false);
  });

  it('should return false for empty buffer', () => {
    expect(isBinary(Buffer.alloc(0))).toBe(false);
  });

  it('should return false for text buffer (no NULL bytes)', () => {
    const text = 'Hello, world! This is a text file.';
    expect(isBinary(Buffer.from(text))).toBe(false);
  });

  it('should return true if NULL byte is at the beginning', () => {
    const buffer = Buffer.alloc(10);
    buffer[0] = 0; // NULL byte
    buffer.fill(65, 1); // Fill rest with 'A'
    expect(isBinary(buffer)).toBe(true);
  });

  it('should return true if NULL byte is in the middle', () => {
    const buffer = Buffer.from('Hello\0World');
    expect(isBinary(buffer)).toBe(true);
  });

  it('should return true if NULL byte is at the end', () => {
    const buffer = Buffer.alloc(10, 65); // Fill with 'A'
    buffer[9] = 0; // NULL byte at end
    expect(isBinary(buffer)).toBe(true);
  });

  it('should return false if NULL byte is beyond default sampleSize (512)', () => {
    const buffer = Buffer.alloc(1000, 65); // Fill with 'A'
    buffer[600] = 0; // NULL byte beyond 512
    expect(isBinary(buffer)).toBe(false);
  });

  it('should return true if NULL byte is within default sampleSize', () => {
    const buffer = Buffer.alloc(1000, 65); // Fill with 'A'
    buffer[500] = 0; // NULL byte within 512
    expect(isBinary(buffer)).toBe(true);
  });

  it('should return true if NULL byte is within custom sampleSize', () => {
    const buffer = Buffer.alloc(100, 65);
    buffer[50] = 0;
    expect(isBinary(buffer, 60)).toBe(true);
  });

  it('should return false if NULL byte is beyond custom sampleSize', () => {
    const buffer = Buffer.alloc(100, 65);
    buffer[50] = 0;
    expect(isBinary(buffer, 40)).toBe(false);
  });

  it('should handle buffer smaller than sampleSize correctly (with NULL)', () => {
    const buffer = Buffer.alloc(10, 65);
    buffer[5] = 0;
    expect(isBinary(buffer, 512)).toBe(true);
  });

  it('should handle buffer smaller than sampleSize correctly (without NULL)', () => {
    const buffer = Buffer.alloc(10, 65);
    expect(isBinary(buffer, 512)).toBe(false);
  });
});
