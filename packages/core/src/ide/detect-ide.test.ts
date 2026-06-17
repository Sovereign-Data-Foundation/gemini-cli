/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DetectedIde, getIdeDisplayName, detectIde } from './detect-ide.js';

describe('detect-ide', () => {
  describe('getIdeDisplayName', () => {
    it('should return "VS Code" for DetectedIde.VSCode', () => {
      expect(getIdeDisplayName(DetectedIde.VSCode)).toBe('VS Code');
    });
  });

  describe('detectIde', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('should return DetectedIde.VSCode if TERM_PROGRAM is vscode', () => {
      vi.stubEnv('TERM_PROGRAM', 'vscode');
      expect(detectIde()).toBe(DetectedIde.VSCode);
    });

    it('should return undefined if TERM_PROGRAM is not vscode', () => {
      vi.stubEnv('TERM_PROGRAM', 'something-else');
      expect(detectIde()).toBeUndefined();
    });

    it('should return undefined if TERM_PROGRAM is not set', () => {
      // Vitest's vi.unstubAllEnvs or setting to empty isn't perfectly unsetting it, but we can set it to undefined explicitly
      // Actually, let's just use stubEnv to remove it temporarily
      vi.stubEnv('TERM_PROGRAM', '');
      expect(detectIde()).toBeUndefined();
    });
  });
});
