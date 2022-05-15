<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { isEqual } from 'lodash'
import type { SettingsSpec } from '../../../../typings/settings'
import { accepts, isObjectSchema } from './json-schema'

const { vI18n, ObjectEditor, SwitchControl, ValueSelector } = commas.ui.vueAssets

const { spec, modelValue, currentValue, open } = defineProps<{
  spec: SettingsSpec,
  modelValue: any,
  currentValue: any,
  open?: boolean,
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: any): void,
  (event: 'update:open', value: boolean): void,
}>()

const isSimpleObject = $computed(() => {
  const schema = spec.schema
  if (accepts(schema, 'array')) {
    return !accepts(schema.items, ['array', 'object'])
  }
  if (accepts(schema, 'object')) {
    if (schema.additionalProperties === true || isObjectSchema(schema.additionalProperties)) return false
    return !schema.properties || Object.values(schema.properties).every(prop => !isObjectSchema(prop))
  }
  return false
})

const isScalarEnum = $computed(() => {
  const schema = spec.schema
  return schema?.enum?.every(item => typeof item !== 'object')
})

const placeholder = $computed(() => {
  return String(stringify(spec.default))
})

let model = $computed({
  get: () => {
    if (
      modelValue === undefined
      && (isScalarEnum || accepts(spec.schema, ['boolean', 'array', 'object']))
    ) {
      return normalize(spec.default)
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (isSimpleObject) {
      return normalize(modelValue)
    }
    return stringify(modelValue)
  },
  set: (value) => {
    emit('update:modelValue', parse(value))
  },
})

const isCustomized = $computed(() => {
  if (modelValue === undefined) return false
  return !isEqual(modelValue, spec.default)
})

const isChanged = $computed(() => {
  return !isEqual(modelValue, currentValue)
})

function normalize(value) {
  if (accepts(spec.schema, 'array') && Array.isArray(value)) {
    return value
  }
  if (accepts(spec.schema, 'object') && typeof value === 'object') {
    return value
  }
  if (value === undefined) {
    return ''
  }
  return value
}

function stringify(value) {
  if (accepts(spec.schema, 'array') && Array.isArray(value)) {
    return JSON.stringify(value, null, 2)
  }
  if (accepts(spec.schema, 'object') && typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  if (value === undefined) {
    return ''
  }
  return value as string | number | boolean
}

function parseJSON(value) {
  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

function parse(value) {
  if (typeof value !== 'string') {
    return value
  }
  if (accepts(spec.schema, 'object')) {
    const parsed = parseJSON(value)
    if (typeof parsed === 'object') {
      return parsed
    }
  }
  if (accepts(spec.schema, 'array')) {
    const parsed = parseJSON(value)
    if (Array.isArray(parsed)) {
      return parsed
    }
  }
  if (accepts(spec.schema, ['number', 'integer'])) {
    const parsed = parseJSON(value)
    if (typeof parsed === 'number') {
      return parsed
    }
  }
  if (!accepts(spec.schema, 'string') && value === '') {
    return undefined
  }
  return value
}

function toggle(event) {
  emit('update:open', event.target.open)
}

function reset() {
  model = spec.default
}
</script>

<template>
  <details
    :open="open"
    class="user-setting-line form-line block"
    @toggle="toggle"
  >
    <summary :class="['line-summary', { customized: isCustomized, changed: isChanged }]">
      <span class="link tree-node">
        <span class="feather-icon icon-chevron-down"></span>
      </span>
      <span v-i18n class="item-label" @click.prevent>{{ spec.label }}#!settings.label.{{ spec.key }}</span>
      <span class="item-key" @click.prevent>{{ spec.key }}</span>
    </summary>
    <div class="setting-detail">
      <div class="form-tips">
        <div
          v-for="(comment, index) in spec.comments"
          :key="index"
          v-i18n
          class="form-tip-line"
        >{{ comment }}#!settings.comments.{{ index }}.{{ spec.key }}</div>
      </div>
      <SwitchControl v-if="accepts(spec.schema, 'boolean')" v-model="model" />
      <ObjectEditor
        v-else-if="isSimpleObject"
        v-model="model"
        :with-keys="accepts(spec.schema, 'object')"
        :pinned="spec.recommendations"
      >
        <template #extra>
          <span class="link reset" @click="reset">
            <span class="feather-icon icon-rotate-ccw"></span>
          </span>
        </template>
      </ObjectEditor>
      <select
        v-else-if="isScalarEnum"
        v-model="model"
        class="form-control"
      >
        <option
          v-for="(option, index) in spec.schema!.enum"
          :key="option"
          v-i18n
          :value="option"
        >{{ option }}#!settings.options.{{ index }}.{{ spec.key }}</option>
      </select>
      <ValueSelector v-else v-model="model" :pinned="spec.recommendations">
        <input
          v-if="accepts(spec.schema, ['number', 'integer'])"
          v-model="model"
          :placeholder="placeholder"
          type="number"
          class="form-control"
          :min="spec.schema.minimum"
          :max="spec.schema.maximum"
          :step="spec.schema.multipleOf"
        >
        <input
          v-else-if="accepts(spec.schema, 'string')"
          v-model="model"
          :placeholder="placeholder"
          :pattern="spec.schema.pattern"
          type="text"
          class="form-control"
        >
        <textarea
          v-else
          v-model="model"
          :placeholder="placeholder"
          class="form-control"
        ></textarea>
      </ValueSelector>
    </div>
  </details>
</template>

<style lang="scss" scoped>
.user-setting-line {
  &.form-line.block .form-label {
    display: flex;
    align-items: center;
  }
}
.line-summary {
  display: flex;
}
.item-label {
  cursor: text;
  user-select: text;
  .line-summary.customized & {
    font-style: italic;
  }
  .line-summary.changed & {
    color: rgb(var(--design-yellow));
  }
}
.item-key {
  margin-left: 16px;
  font-size: 12px;
  opacity: 0.5;
  cursor: text;
  user-select: text;
  .line-summary.customized & {
    font-style: italic;
  }
  .line-summary.changed & {
    color: rgb(var(--design-yellow));
  }
}
.tree-node {
  width: 24px;
  text-align: center;
  opacity: 1;
  transition: transform 0.2s;
  .user-setting-line:not([open]) & {
    transform: rotate(-90deg) translateX(2px);
  }
}
.setting-detail {
  padding-left: 24px;
  .user-setting-line:not([open]) & {
    display: none;
  }
}
</style>
