import type { ITheme } from 'xterm'

export interface Theme extends ITheme {
  name: string,
  type: 'dark' | 'light',
  materialBackground: string,
  systemAccent: string,
  opacity: number,
  variables: Record<string, string>,
  vibrancy: boolean,
}
