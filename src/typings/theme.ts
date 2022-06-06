import type { ITheme } from 'xterm'

export interface ColorTheme extends Required<ITheme> {
  type: 'dark' | 'light',
  systemAccent: string,
  materialBackground: string,
  secondaryBackground: string,
}

export interface EditorTheme extends ColorTheme {
  comment: string,
  lineHighlight: string,
  lineNumber: string,
  activeLineNumber: string,
}

export interface Theme extends ColorTheme {
  name: string,
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
}
