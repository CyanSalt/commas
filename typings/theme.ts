import type { ITheme } from 'xterm'

export interface Theme extends ITheme {
  name: string,
  type: 'dark' | 'light',
  systemAccent: string,
  opacity: number,
  variables: Record<string, string>,
  vibrancy: boolean,
}
