import type { ITheme } from 'xterm'

export interface Theme extends ITheme {
  name: string,
  type: 'dark' | 'light',
  secondaryBackground: string,
  materialBackground: string,
  systemAccent: string,
  opacity: number,
  variables: Record<string, string>,
  editor: Record<string, string>,
  vibrancy: boolean,
}
