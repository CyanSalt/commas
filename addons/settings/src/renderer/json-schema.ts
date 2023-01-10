import type { JSONSchema, JSONSchemaType } from '../../../../src/typings/json-schema'

export function accepts<T extends JSONSchemaType>(
  schema: boolean | JSONSchema | undefined,
  input: T | T[],
): schema is JSONSchema & { type?: T | (T | JSONSchemaType)[] } {
  // `true` as `any` and `false` as `never`
  if (typeof schema === 'boolean') return schema
  // `undefined` and `{}` as `any`
  if (!schema) return true
  if (!schema.type) return true
  // Combining
  if (schema.allOf?.every(rule => !accepts(rule, input))) return false
  if (schema.anyOf?.some(rule => !accepts(rule, input))) return false
  if (schema.oneOf?.some(rule => !accepts(rule, input))) return false
  if (schema.not && accepts(schema.not, input)) return false
  const types = Array.isArray(schema.type) ? schema.type : [schema.type]
  return Array.isArray(input) ? input.some(item => types.includes(item)) : types.includes(input)
}

export function isObjectSchema(schema: boolean | JSONSchema | undefined) {
  return accepts(schema, ['array', 'object'])
}
