import type { MenuItem } from '@commas/types/menu'
import type { CommandCompletion, IconEntry, TerminalTabAddons, TerminalTabCharacter, TerminalTabCharacterCommand } from '@commas/types/terminal'
import type { Component } from 'vue'

declare module './modules/context' {
  export interface Context {
    'terminal.ui-left-action-anchor': Component,
    'terminal.ui-right-action-anchor': Component,
    'terminal.ui-side-list': Component,
    'terminal.ui-slot': Component,
    'terminal.ui-title-anchor': Component,
    'terminal.category': {
      title: string,
      characters: TerminalTabCharacter[],
      command: TerminalTabCharacterCommand,
      priority?: number,
    },
    'terminal.file-opener': {
      extensions: string[],
      handler: (file: string) => Promise<void> | void,
    },
    'terminal.shell': MenuItem,
    'terminal.icon': IconEntry & { patterns: NonNullable<IconEntry['patterns']> },
    'terminal.completion-loader': (
      completion: CommandCompletion,
      shellIntegration: NonNullable<TerminalTabAddons['shellIntegration']>
    ) => boolean,
    'terminal.quick-fix-generator': (
      command: string,
      output: string,
    ) => CommandCompletion[] | undefined,
  }
}

export * as app from './modules/app'
export * as context from './modules/context'
export * as helper from './modules/helper'
export * as ipcRenderer from './modules/ipc-renderer'
export * as remote from './modules/remote'
export * as ui from './modules/ui'
export * as workspace from './modules/workspace'
