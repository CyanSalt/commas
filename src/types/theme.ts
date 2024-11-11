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
  systemOrange: string,
  systemYellow: string,
  systemGreen: string,
  systemMint: string,
  systemTeal: string,
  systemCyan: string,
  systemBlue: string,
  systemIndigo: string,
  systemPurple: string,
  systemPink: string,
  systemBrown: string,
  systemGray: string,
  systemAccent: string,
  vibrancy: BrowserWindowConstructorOptions['vibrancy'] | boolean,
}
