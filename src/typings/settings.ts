import type { JSONSchema } from './json-schema'

export type Settings = Record<string, any>

export interface SettingsSpec {
  key: string,
  label: string,
  comments?: string[],
  configurable?: NodeJS.Platform[],
  schema?: JSONSchema,
  recommendations?: any[],
  reload?: boolean,
  default?: any,
}
