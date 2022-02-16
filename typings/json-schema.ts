export interface BaseSchema {
  enum?: any[],
}

export interface NumericSchema extends BaseSchema {
  type: 'number' | 'integer',
  minimum?: number,
  maximum?: number,
}

export interface StringSchema extends BaseSchema {
  type: 'string',
}

export interface BooleanSchema extends BaseSchema {
  type: 'boolean',
}

export interface ArraySchema extends BaseSchema {
  type: 'array',
  items?: JSONSchema,
}

export interface ObjectSchema extends BaseSchema {
  type: 'object',
  properties?: Record<string, JSONSchema>,
  additionalProperties?: boolean | JSONSchema,
}

export type JSONSchema = NumericSchema | StringSchema | BooleanSchema | ArraySchema | ObjectSchema
