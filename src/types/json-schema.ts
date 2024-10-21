export type JSONSchemaType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object'

export type JSONSchemaFormat = 'color'

export interface JSONSchema {
  type?: JSONSchemaType | JSONSchemaType[],
  enum?: any[],
  // string
  pattern?: string,
  format?: JSONSchemaFormat,
  // number
  minimum?: number,
  maximum?: number,
  multipleOf?: number,
  // array
  items?: JSONSchema,
  // object
  properties?: Record<string, JSONSchema>,
  additionalProperties?: boolean | JSONSchema,
  // combining
  allOf?: JSONSchema[],
  anyOf?: JSONSchema[],
  oneOf?: JSONSchema[],
  not?: JSONSchema,
}
