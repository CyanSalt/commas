import type { ITheme } from '@xterm/xterm'
import type { BrowserWindowConstructorOptions } from 'electron'

export interface ThemeDefinition extends ITheme {
  purple?: string,
  brightPurple?: string,
  cursorColor?: string,
}

export interface Theme extends Required<ThemeDefinition> {
  name: string,
  type: 'dark' | 'light',
  opacity: number,
  variables: Record<string, string>,
  systemRed: string,
  systemYellow: string,
  systemGreen: string,
  systemCyan: string,
  systemBlue: string,
  systemMagenta: string,
  systemAccent: string,
  vibrancy: BrowserWindowConstructorOptions['vibrancy'] | boolean,
  acrylicBackground: string,
}
