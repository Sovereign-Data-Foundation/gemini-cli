/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { EditorType, openDiff } from '../utils/editor.js';
import os from 'os';
import path from 'path';
import fsp from 'node:fs/promises';
import * as Diff from 'diff';
import { DEFAULT_DIFF_OPTIONS } from './diffOptions.js';
import { isNodeError } from '../utils/errors.js';
import { AnyDeclarativeTool, DeclarativeTool, ToolResult } from './tools.js';

/**
 * A declarative tool that supports a modify operation.
 */
export interface ModifiableDeclarativeTool<
  TParams extends object,
> extends DeclarativeTool<TParams, ToolResult> {
  getModifyContext(abortSignal: AbortSignal): ModifyContext<TParams>;
}

export interface ModifyContext<ToolParams> {
  getFilePath: (params: ToolParams) => string;

  getCurrentContent: (params: ToolParams) => Promise<string>;

  getProposedContent: (params: ToolParams) => Promise<string>;

  createUpdatedParams: (
    oldContent: string,
    modifiedProposedContent: string,
    originalParams: ToolParams,
  ) => ToolParams;
}

export interface ModifyResult<ToolParams> {
  updatedParams: ToolParams;
  updatedDiff: string;
}

/**
 * Type guard to check if a declarative tool is modifiable.
 */
export function isModifiableDeclarativeTool(
  tool: AnyDeclarativeTool,
): tool is ModifiableDeclarativeTool<object> {
  return 'getModifyContext' in tool;
}

async function createTempFilesForModify(
  currentContent: string,
  proposedContent: string,
  file_path: string,
): Promise<{ oldPath: string; newPath: string }> {
  const tempDir = os.tmpdir();
  const diffDir = path.join(tempDir, 'gemini-cli-tool-modify-diffs');

  await fsp.mkdir(diffDir, { recursive: true });

  const ext = path.extname(file_path);
  const fileName = path.basename(file_path, ext);
  const timestamp = Date.now();
  const tempOldPath = path.join(
    diffDir,
    `gemini-cli-modify-${fileName}-old-${timestamp}${ext}`,
  );
  const tempNewPath = path.join(
    diffDir,
    `gemini-cli-modify-${fileName}-new-${timestamp}${ext}`,
  );

  await Promise.all([
    fsp.writeFile(tempOldPath, currentContent, 'utf8'),
    fsp.writeFile(tempNewPath, proposedContent, 'utf8'),
  ]);

  return { oldPath: tempOldPath, newPath: tempNewPath };
}

async function getUpdatedParams<ToolParams>(
  tmpOldPath: string,
  tempNewPath: string,
  originalParams: ToolParams,
  modifyContext: ModifyContext<ToolParams>,
): Promise<{ updatedParams: ToolParams; updatedDiff: string }> {
  const [oldContent, newContent] = await Promise.all([
    fsp.readFile(tmpOldPath, 'utf8').catch((err) => {
      if (!isNodeError(err) || err.code !== 'ENOENT') throw err;
      return '';
    }),
    fsp.readFile(tempNewPath, 'utf8').catch((err) => {
      if (!isNodeError(err) || err.code !== 'ENOENT') throw err;
      return '';
    }),
  ]);

  const updatedParams = modifyContext.createUpdatedParams(
    oldContent,
    newContent,
    originalParams,
  );
  const updatedDiff = Diff.createPatch(
    path.basename(modifyContext.getFilePath(originalParams)),
    oldContent,
    newContent,
    'Current',
    'Proposed',
    DEFAULT_DIFF_OPTIONS,
  );

  return { updatedParams, updatedDiff };
}

async function deleteTempFiles(oldPath: string, newPath: string): Promise<void> {
  await Promise.all([
    fsp.unlink(oldPath).catch(() => {
      console.error(`Error deleting temp diff file: ${oldPath}`);
    }),
    fsp.unlink(newPath).catch(() => {
      console.error(`Error deleting temp diff file: ${newPath}`);
    }),
  ]);
}

/**
 * Triggers an external editor for the user to modify the proposed content,
 * and returns the updated tool parameters and the diff after the user has modified the proposed content.
 */
export async function modifyWithEditor<ToolParams>(
  originalParams: ToolParams,
  modifyContext: ModifyContext<ToolParams>,
  editorType: EditorType,
  _abortSignal: AbortSignal,
  onEditorClose: () => void,
): Promise<ModifyResult<ToolParams>> {
  const currentContent = await modifyContext.getCurrentContent(originalParams);
  const proposedContent =
    await modifyContext.getProposedContent(originalParams);

  const { oldPath, newPath } = await createTempFilesForModify(
    currentContent,
    proposedContent,
    modifyContext.getFilePath(originalParams),
  );

  try {
    await openDiff(oldPath, newPath, editorType, onEditorClose);
    const result = await getUpdatedParams(
      oldPath,
      newPath,
      originalParams,
      modifyContext,
    );

    return result;
  } finally {
    await deleteTempFiles(oldPath, newPath);
  }
}
