/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi } from 'vitest';
import * as os from 'os';
import * as path from 'path';
import { resolvePath } from './resolvePath.js';

vi.mock('os', async (importOriginal) => {
  const actualOs = await importOriginal<typeof os>();
  return {
    ...actualOs,
    homedir: vi.fn(() => '/mock/home/user'),
  };
});

describe('resolvePath', () => {
  it('should return an empty string for empty input', () => {
    expect(resolvePath('')).toBe('');
  });

  it('should expand %userprofile% (case-insensitive)', () => {
    const mockHome = '/mock/home/user';
    expect(resolvePath('%userprofile%/documents')).toBe(path.normalize(`${mockHome}/documents`));
    expect(resolvePath('%USERPROFILE%/documents')).toBe(path.normalize(`${mockHome}/documents`));
    expect(resolvePath('%UserProfile%/documents')).toBe(path.normalize(`${mockHome}/documents`));
  });

  it('should expand ~ and ~/', () => {
    const mockHome = '/mock/home/user';
    expect(resolvePath('~')).toBe(path.normalize(mockHome));
    expect(resolvePath('~/downloads')).toBe(path.normalize(`${mockHome}/downloads`));
  });

  it('should normalize paths', () => {
    expect(resolvePath('/foo/bar/../baz')).toBe(path.normalize('/foo/baz'));
    expect(resolvePath('foo/bar/./baz')).toBe(path.normalize('foo/bar/baz'));
  });

  it('should not expand %userprofile% or ~ if they are not at the start', () => {
    expect(resolvePath('/path/to/%userprofile%')).toBe(path.normalize('/path/to/%userprofile%'));
    expect(resolvePath('/path/to/~')).toBe(path.normalize('/path/to/~'));
  });

  it('should return regular paths as is (but normalized)', () => {
    expect(resolvePath('/usr/local/bin')).toBe(path.normalize('/usr/local/bin'));
    expect(resolvePath('relative/path')).toBe(path.normalize('relative/path'));
  });
});
