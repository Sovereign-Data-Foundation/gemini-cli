/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ApprovalMode,
  type Config,
  type IdeContext,
} from '@google/gemini-cli-core';
import { Box, Text } from 'ink';
import { Colors } from '../colors.js';
import { LoadedSettings } from '../../config/settings.js';
import { type ConsoleMessageItem, StreamingState } from '../types.js';
import { type InputPromptProps, InputPrompt } from './InputPrompt.js';
import { LoadingIndicator } from './LoadingIndicator.js';
import { AutoAcceptIndicator } from './AutoAcceptIndicator.js';
import { ShellModeIndicator } from './ShellModeIndicator.js';
import { ContextSummaryDisplay } from './ContextSummaryDisplay.js';
import { DetailedMessagesDisplay } from './DetailedMessagesDisplay.js';
import { ShowMoreLines } from './ShowMoreLines.js';
import { OverflowProvider } from '../contexts/OverflowContext.js';
import {
  IdeIntegrationNudge,
  type IdeIntegrationNudgeResult,
} from '../IdeIntegrationNudge.js';
import { FolderTrustDialog } from './FolderTrustDialog.js';
import {
  ShellConfirmationDialog,
  type ShellConfirmationRequest,
} from './ShellConfirmationDialog.js';
import { ThemeDialog } from './ThemeDialog.js';
import { AuthInProgress } from './AuthInProgress.js';
import { AuthDialog } from './AuthDialog.js';
import { EditorSettingsDialog } from './EditorSettingsDialog.js';
import { PrivacyNotice } from '../privacy/PrivacyNotice.js';

interface AppInteractionPaneProps {
  startupWarnings: string[];
  shouldShowIdePrompt: boolean;
  onIdePromptComplete: (result: IdeIntegrationNudgeResult) => void;
  isFolderTrustDialogOpen: boolean;
  onFolderTrustSelect: React.ComponentProps<
    typeof FolderTrustDialog
  >['onSelect'];
  shellConfirmationRequest: ShellConfirmationRequest | null;
  isThemeDialogOpen: boolean;
  themeError: string | null;
  onThemeSelect: React.ComponentProps<typeof ThemeDialog>['onSelect'];
  onThemeHighlight: React.ComponentProps<typeof ThemeDialog>['onHighlight'];
  settings: LoadedSettings;
  constrainHeight: boolean;
  terminalHeight: number;
  staticExtraHeight: number;
  mainAreaWidth: number;
  isAuthenticating: boolean;
  onAuthenticationTimeout: () => void;
  showErrorDetails: boolean;
  filteredConsoleMessages: ConsoleMessageItem[];
  debugConsoleMaxHeight: number;
  inputWidth: number;
  isAuthDialogOpen: boolean;
  onAuthSelect: React.ComponentProps<typeof AuthDialog>['onSelect'];
  authError: string | null;
  isEditorDialogOpen: boolean;
  editorError: string | null;
  onEditorSelect: React.ComponentProps<typeof EditorSettingsDialog>['onSelect'];
  onExitEditorDialog: () => void;
  showPrivacyNotice: boolean;
  onExitPrivacyNotice: () => void;
  config: Config;
  streamingState: StreamingState;
  thought: string | undefined;
  currentLoadingPhrase: string | undefined;
  elapsedTime: number;
  ctrlCPressedOnce: boolean;
  ctrlDPressedOnce: boolean;
  ideContextState: IdeContext | undefined;
  geminiMdFileCount: number;
  contextFileNames: string[];
  showToolDescriptions: boolean;
  isNarrow: boolean;
  showAutoAcceptIndicator: ApprovalMode;
  shellModeActive: boolean;
  isInputActive: boolean;
  inputPromptProps: InputPromptProps;
}

const DebugConsoleSection = ({
  showErrorDetails,
  filteredConsoleMessages,
  constrainHeight,
  debugConsoleMaxHeight,
  inputWidth,
}: Pick<
  AppInteractionPaneProps,
  | 'showErrorDetails'
  | 'filteredConsoleMessages'
  | 'constrainHeight'
  | 'debugConsoleMaxHeight'
  | 'inputWidth'
>) => {
  if (!showErrorDetails) {
    return null;
  }

  return (
    <OverflowProvider>
      <Box flexDirection="column">
        <DetailedMessagesDisplay
          messages={filteredConsoleMessages}
          maxHeight={constrainHeight ? debugConsoleMaxHeight : undefined}
          width={inputWidth}
        />
        <ShowMoreLines constrainHeight={constrainHeight} />
      </Box>
    </OverflowProvider>
  );
};

export const AppInteractionPane = ({
  startupWarnings,
  shouldShowIdePrompt,
  onIdePromptComplete,
  isFolderTrustDialogOpen,
  onFolderTrustSelect,
  shellConfirmationRequest,
  isThemeDialogOpen,
  themeError,
  onThemeSelect,
  onThemeHighlight,
  settings,
  constrainHeight,
  terminalHeight,
  staticExtraHeight,
  mainAreaWidth,
  isAuthenticating,
  onAuthenticationTimeout,
  showErrorDetails,
  filteredConsoleMessages,
  debugConsoleMaxHeight,
  inputWidth,
  isAuthDialogOpen,
  onAuthSelect,
  authError,
  isEditorDialogOpen,
  editorError,
  onEditorSelect,
  onExitEditorDialog,
  showPrivacyNotice,
  onExitPrivacyNotice,
  config,
  streamingState,
  thought,
  currentLoadingPhrase,
  elapsedTime,
  ctrlCPressedOnce,
  ctrlDPressedOnce,
  ideContextState,
  geminiMdFileCount,
  contextFileNames,
  showToolDescriptions,
  isNarrow,
  showAutoAcceptIndicator,
  shellModeActive,
  isInputActive,
  inputPromptProps,
}: AppInteractionPaneProps) => (
  <>
    {startupWarnings.length > 0 && (
      <Box
        borderStyle="round"
        borderColor={Colors.AccentYellow}
        paddingX={1}
        marginY={1}
        flexDirection="column"
      >
        {startupWarnings.map((warning, index) => (
          <Text key={index} color={Colors.AccentYellow}>
            {warning}
          </Text>
        ))}
      </Box>
    )}

    {shouldShowIdePrompt ? (
      <IdeIntegrationNudge
        question="Do you want to connect your VS Code editor to Gemini CLI?"
        description="If you select Yes, we'll install an extension that allows the CLI to access your open files and display diffs directly in VS Code."
        onComplete={onIdePromptComplete}
      />
    ) : isFolderTrustDialogOpen ? (
      <FolderTrustDialog onSelect={onFolderTrustSelect} />
    ) : shellConfirmationRequest ? (
      <ShellConfirmationDialog request={shellConfirmationRequest} />
    ) : isThemeDialogOpen ? (
      <Box flexDirection="column">
        {themeError && (
          <Box marginBottom={1}>
            <Text color={Colors.AccentRed}>{themeError}</Text>
          </Box>
        )}
        <ThemeDialog
          onSelect={onThemeSelect}
          onHighlight={onThemeHighlight}
          settings={settings}
          availableTerminalHeight={
            constrainHeight ? terminalHeight - staticExtraHeight : undefined
          }
          terminalWidth={mainAreaWidth}
        />
      </Box>
    ) : isAuthenticating ? (
      <>
        <AuthInProgress onTimeout={onAuthenticationTimeout} />
        <DebugConsoleSection
          showErrorDetails={showErrorDetails}
          filteredConsoleMessages={filteredConsoleMessages}
          constrainHeight={constrainHeight}
          debugConsoleMaxHeight={debugConsoleMaxHeight}
          inputWidth={inputWidth}
        />
      </>
    ) : isAuthDialogOpen ? (
      <Box flexDirection="column">
        <AuthDialog
          onSelect={onAuthSelect}
          settings={settings}
          initialErrorMessage={authError}
        />
      </Box>
    ) : isEditorDialogOpen ? (
      <Box flexDirection="column">
        {editorError && (
          <Box marginBottom={1}>
            <Text color={Colors.AccentRed}>{editorError}</Text>
          </Box>
        )}
        <EditorSettingsDialog
          onSelect={onEditorSelect}
          settings={settings}
          onExit={onExitEditorDialog}
        />
      </Box>
    ) : showPrivacyNotice ? (
      <PrivacyNotice onExit={onExitPrivacyNotice} config={config} />
    ) : (
      <>
        <LoadingIndicator
          thought={
            streamingState === StreamingState.WaitingForConfirmation ||
            config.getAccessibility()?.disableLoadingPhrases
              ? undefined
              : thought
          }
          currentLoadingPhrase={
            config.getAccessibility()?.disableLoadingPhrases
              ? undefined
              : currentLoadingPhrase
          }
          elapsedTime={elapsedTime}
        />

        <Box
          marginTop={1}
          justifyContent="space-between"
          width="100%"
          flexDirection={isNarrow ? 'column' : 'row'}
          alignItems={isNarrow ? 'flex-start' : 'center'}
        >
          <Box>
            {process.env.GEMINI_SYSTEM_MD && (
              <Text color={Colors.AccentRed}>|⌐■_■| </Text>
            )}
            {ctrlCPressedOnce ? (
              <Text color={Colors.AccentYellow}>
                Press Ctrl+C again to exit.
              </Text>
            ) : ctrlDPressedOnce ? (
              <Text color={Colors.AccentYellow}>
                Press Ctrl+D again to exit.
              </Text>
            ) : (
              <ContextSummaryDisplay
                ideContext={ideContextState}
                geminiMdFileCount={geminiMdFileCount}
                contextFileNames={contextFileNames}
                mcpServers={config.getMcpServers()}
                blockedMcpServers={config.getBlockedMcpServers()}
                showToolDescriptions={showToolDescriptions}
              />
            )}
          </Box>
          <Box paddingTop={isNarrow ? 1 : 0}>
            {showAutoAcceptIndicator !== ApprovalMode.DEFAULT &&
              !shellModeActive && (
                <AutoAcceptIndicator approvalMode={showAutoAcceptIndicator} />
              )}
            {shellModeActive && <ShellModeIndicator />}
          </Box>
        </Box>

        <DebugConsoleSection
          showErrorDetails={showErrorDetails}
          filteredConsoleMessages={filteredConsoleMessages}
          constrainHeight={constrainHeight}
          debugConsoleMaxHeight={debugConsoleMaxHeight}
          inputWidth={inputWidth}
        />

        {isInputActive && <InputPrompt {...inputPromptProps} />}
      </>
    )}
  </>
);
