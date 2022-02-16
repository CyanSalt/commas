import type { JSONSchema } from '../../../typings/json-schema'

export function accepts<T extends JSONSchema['type']>(schema: boolean | JSONSchema | undefined, type: T | T[]): schema is JSONSchema & { type: T } {
  if (typeof schema !== 'object') return false
  return Array.isArray(type) ? type.includes(schema.type as T) : type === schema.type
}

export function isObjectSchema(schema: boolean | JSONSchema | undefined) {
  return accepts(schema, ['array', 'object'])
}
