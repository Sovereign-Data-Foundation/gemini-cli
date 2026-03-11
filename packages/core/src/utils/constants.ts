/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Base exclusion patterns for commonly ignored directories and binary file types.
 * These are compatible with glob ignore patterns.
 */
export const BASE_EXCLUDES: string[] = [
  '**/node_modules/**',
  '**/.git/**',
  '**/.svn/**',
  '**/.hg/**',
  '**/bower_components/**',
  '**/.vscode/**',
  '**/.idea/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
  '**/__pycache__/**',
  '**/*.pyc',
  '**/*.pyo',
  '**/*.bin',
  '**/*.exe',
  '**/*.dll',
  '**/*.so',
  '**/*.dylib',
  '**/*.class',
  '**/*.jar',
  '**/*.war',
  '**/*.zip',
  '**/*.tar',
  '**/*.gz',
  '**/*.bz2',
  '**/*.rar',
  '**/*.7z',
  '**/*.doc',
  '**/*.docx',
  '**/*.xls',
  '**/*.xlsx',
  '**/*.ppt',
  '**/*.pptx',
  '**/*.odt',
  '**/*.ods',
  '**/*.odp',
  '**/*.DS_Store',
  '**/.env',
];
