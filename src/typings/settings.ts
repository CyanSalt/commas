import type { ITheme, RendererType } from 'xterm'
import type { JSONSchema } from './json-schema'

export interface Settings {
  'terminal.shell.path': string,
  'terminal.shell.args': string[],
  'terminal.shell.windowsArgs': string[],
  'terminal.shell.env': Record<string, string>,
  'terminal.external.openPathIn': 'new-tab' | 'new-window',
  'terminal.external.explorer': string,
  'terminal.external.remoteExplorer': string,
  'terminal.tab.liveCwd': boolean,
  'terminal.tab.liveIcon': boolean,
  'terminal.tab.titleFormat': string,
  'terminal.view.linkModifier': 'any' | 'CmdOrCtrl' | 'Alt',
  'terminal.view.rendererType': RendererType | 'webgl',
  'terminal.style.opacity': number,
  'terminal.style.vibrancy': boolean,
  'terminal.style.fontSize': number,
  'terminal.style.fontFamily': string,
  'terminal.style.fontLigatures': boolean,
  'terminal.style.cursorStyle': 'block' | 'bar' | 'underline',
  'terminal.theme.name': string,
  'terminal.theme.customization': ITheme,
  'terminal.addon.includes': string[],
}

export interface SettingsSpec {
  key: string,
  label: string,
  comments?: string[],
  configurable?: NodeJS.Platform[],
  schema?: JSONSchema,
  recommendations?: any[],
  reload?: boolean,
  default?: any,
}
