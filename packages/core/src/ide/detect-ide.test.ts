/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { vi, describe, it, expect, afterEach } from 'vitest';
import { detectIde, getIdeDisplayName, DetectedIde } from './detect-ide.js';

describe('detect-ide', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('getIdeDisplayName', () => {
    it('should return "VS Code" for DetectedIde.VSCode', () => {
      expect(getIdeDisplayName(DetectedIde.VSCode)).toBe('VS Code');
    });
  });

  describe('detectIde', () => {
    it('should return DetectedIde.VSCode when TERM_PROGRAM is "vscode"', () => {
      vi.stubEnv('TERM_PROGRAM', 'vscode');
      expect(detectIde()).toBe(DetectedIde.VSCode);
    });

    it('should return undefined when TERM_PROGRAM is not "vscode"', () => {
      vi.stubEnv('TERM_PROGRAM', 'iterm');
      expect(detectIde()).toBeUndefined();
    });

    it('should return undefined when TERM_PROGRAM is undefined', () => {
      vi.stubEnv('TERM_PROGRAM', undefined as unknown as string);
      expect(detectIde()).toBeUndefined();
    });
  });
});
