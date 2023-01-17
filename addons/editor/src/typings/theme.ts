import type { ThemeDefinition } from '../../../../src/typings/theme'

export interface EditorTheme extends Required<ThemeDefinition> {
  type: 'dark' | 'light',
  comment: string,
  lineHighlight: string,
  lineNumber: string,
  activeLineNumber: string,
}
