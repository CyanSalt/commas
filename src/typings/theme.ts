import type { ITheme } from 'xterm'

export interface EditorTheme extends Required<ITheme> {
  type: 'dark' | 'light',
  comment: string,
  lineHighlight: string,
  lineNumber: string,
  activeLineNumber: string,
}

export interface Theme extends Required<ITheme> {
  name: string,
  type: 'dark' | 'light',
  opacity: number,
  variables: Record<string, string>,
  editor: EditorTheme,
  systemRed: string,
  systemYellow: string,
  systemGreen: string,
  systemCyan: string,
  systemBlue: string,
  systemMagenta: string,
  systemAccent: string,
  vibrancy: boolean,
  materialBackground: string,
  secondaryBackground: string,
}
