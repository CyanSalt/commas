export type Settings = Record<string, any>

export interface SettingsSpec {
  key: string,
  type: 'string' | 'number' | 'boolean' | 'enum' | 'list' | 'map',
  label: string,
  configurable?: NodeJS.Platform[],
  paradigm?: any[],
  recommendations?: any[],
  comments?: string[],
  default?: any,
}
