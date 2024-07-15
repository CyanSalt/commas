import type { CommandCompletion } from '@commas/types/terminal'

declare module './modules/context' {
  export interface Context {
    'terminal.completion': (query: string, command: string, subcommand?: string) => Promise<CommandCompletion[]>,
  }
}

export * as app from './modules/app'
export * as context from './modules/context'
export * as file from './modules/file'
export * as frame from './modules/frame'
export * as helper from './modules/helper'
export * as i18n from './modules/i18n'
export * as ipcMain from './modules/ipc-main'
export * as keybinding from './modules/keybinding'
export * as settings from './modules/settings'
export * as shell from './modules/shell'
