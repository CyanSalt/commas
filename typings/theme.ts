import type { ITheme } from 'xterm'

export interface Theme extends ITheme {
  name: string,
  type: 'dark' | 'light',
  backdrop: string,
  systemAccent: string,
  opacity: number,
}
