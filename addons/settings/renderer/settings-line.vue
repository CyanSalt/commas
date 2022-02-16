<script lang="ts" setup>
import { isEqual } from 'lodash-es'
import type { JSONSchema } from 'typings/json-schema'
import type { PropType } from 'vue'
import ObjectEditor from '../../../renderer/components/basic/object-editor.vue'
import type { EditorEntryItem } from '../../../renderer/components/basic/object-editor.vue'
import SwitchControl from '../../../renderer/components/basic/switch-control.vue'
import ValueSelector from '../../../renderer/components/basic/value-selector.vue'
import { useDiscoveredAddons } from '../../../renderer/compositions/settings'
import type { SettingsSpec } from '../../../typings/settings'

const { spec, modelValue, currentValue, open } = $(defineProps({
  spec: {
    type: Object as PropType<SettingsSpec>,
    required: true,
  },
  modelValue: {
    type: undefined,
    required: true,
  },
  currentValue: {
    type: undefined,
    required: true,
  },
  open: {
    type: Boolean,
    default: false,
  },
}))

const emit = defineEmits({
  'update:modelValue': (value: any) => {
    return true
  },
  'update:open': (value: boolean) => {
    return typeof value === 'boolean'
  },
})

const discoveredAddons = $(useDiscoveredAddons())

function isObjectSchema(schema: JSONSchema) {
  return ['array', 'object'].includes(schema.type)
}

const isSimpleObject = $computed(() => {
  const schema = spec.schema
  if (!schema) return false
  if (schema.type === 'array') {
    return !isObjectSchema(schema.items)
  }
  if (schema.type === 'object') {
    if (schema.additionalProperties === false || (
      typeof schema.additionalProperties === 'object'
        && isObjectSchema(schema.additionalProperties)
    )) return false
    return !schema.properties || Object.values(schema.properties).every(prop => !isObjectSchema(prop))
  }
  return false
})

const placeholder = $computed(() => {
  return String(stringify(spec.default))
})

let model = $computed({
  get: () => {
    if (
      modelValue === undefined
      && spec.schema
      && ['boolean', 'array', 'object'].includes(spec.schema.type)
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

const hasNotes = $computed(() => {
  return spec.key === 'terminal.addon.includes'
})

const recommendations = $computed(() => {
  const specRecommendations = spec.recommendations
  if (spec.key === 'terminal.addon.includes') {
    return [
      ...specRecommendations!,
      ...Object.keys(discoveredAddons)
        .filter(name => discoveredAddons[name].type === 'user'),
    ]
  }
  return specRecommendations
})

function getNote(item: EditorEntryItem) {
  if (spec.key === 'terminal.addon.includes') {
    const info = discoveredAddons[item.entry.value]
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return info?.manifest?.description ?? ''
  }
  return undefined
}

function accepts(type: JSONSchema['type']) {
  return spec.schema?.type === type
}

function normalize(value) {
  if (accepts('array') && Array.isArray(value)) {
    return value
  }
  if (accepts('object') && typeof value === 'object') {
    return value
  }
  if (value === undefined) {
    return ''
  }
  return value
}

function stringify(value) {
  if (accepts('array') && Array.isArray(value)) {
    return JSON.stringify(value, null, 2)
  }
  if (accepts('object') && typeof value === 'object') {
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
  if (accepts('object')) {
    const parsed = parseJSON(value)
    if (typeof parsed === 'object') {
      return parsed
    }
  }
  if (accepts('array')) {
    const parsed = parseJSON(value)
    if (Array.isArray(parsed)) {
      return parsed
    }
  }
  if (spec.schema && ['number', 'integer'].includes(spec.schema.type)) {
    const parsed = parseJSON(value)
    if (typeof parsed === 'number') {
      return parsed
    }
  }
  if (!accepts('string') && value === '') {
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
      <span v-i18n class="item-label">{{ spec.label }}#!settings.label.{{ spec.key }}</span>
      <span class="item-key">{{ spec.key }}</span>
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
      <SwitchControl v-if="spec.schema?.type === 'boolean'" v-model="model" />
      <ObjectEditor
        v-else-if="isSimpleObject"
        v-model="model"
        :with-keys="spec.schema?.type === 'object'"
        :pinned="recommendations"
      >
        <template #note="{ item }">
          <template v-if="hasNotes">
            <div v-i18n class="form-tips">{{ getNote(item) }}</div>
          </template>
        </template>
        <template #extra>
          <span class="link reset" @click="reset">
            <span class="feather-icon icon-rotate-ccw"></span>
          </span>
        </template>
      </ObjectEditor>
      <select
        v-else-if="spec.schema?.enum"
        v-model="model"
        class="form-control"
      >
        <option
          v-for="(option, index) in spec.schema.enum"
          :key="option"
          v-i18n
          :value="option"
        >{{ option }}#!settings.options.{{ index }}.{{ spec.key }}</option>
      </select>
      <ValueSelector v-else v-model="model" :pinned="recommendations">
        <input
          v-if="spec.schema && ['number', 'integer'].includes(spec.schema.type)"
          v-model="model"
          :placeholder="placeholder"
          type="number"
          class="form-control"
        >
        <input
          v-else-if="spec.schema?.type === 'string'"
          v-model="model"
          :placeholder="placeholder"
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
