<script lang="ts" setup>
import type { SettingsSpec } from '@commas/types/settings'
import * as commas from 'commas:api/renderer'
import { isEqual, uniq } from 'lodash'
import { watchEffect } from 'vue'
import { accepts, isObjectSchema } from './json-schema'

const { vI18n, VisualIcon, ObjectEditor, SwitchControl, ValueSelector } = commas.ui.vueAssets

const { spec } = defineProps<{
  spec: SettingsSpec,
}>()

let open = $(defineModel<boolean>('open'))
let modelValue = $(defineModel<any>({ required: true }))

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
  return Boolean(schema?.enum?.every(item => typeof item !== 'object'))
})

const isNullableString = $computed(() => {
  const schema = spec.schema
  return schema?.['minLength'] === 0 && spec.default?.length !== 0
})

const placeholder = $computed(() => {
  if (isNullableString) return ''
  return String(toPrimitive(spec.default) ?? '')
})

const isCustomized = $computed(() => {
  if (modelValue === undefined) return false
  return !isEqual(modelValue, spec.default)
})

let model = $computed({
  get: () => {
    const value = isCustomized ? modelValue : spec.default
    if (accepts(spec.schema, ['boolean'])) {
      return Boolean(value)
    }
    if (isSimpleObject) {
      if (accepts(spec.schema, 'array')) {
        return Array.isArray(value) ? value : []
      }
      if (accepts(spec.schema, 'object')) {
        return typeof value === 'object' ? value : {}
      }
      // will never fallthrough
    }
    if (isScalarEnum) {
      return value
    }
    return isCustomized ? toPrimitive(modelValue) : undefined
  },
  set: (value) => {
    modelValue = fromPrimitive(value)
  },
})

function toPrimitive(value) {
  if (accepts(spec.schema, 'array') && Array.isArray(value)) {
    return JSON.stringify(value, null, 2)
  }
  if (accepts(spec.schema, 'object') && typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return value as string | number | boolean | undefined
}

function parseJSON(value) {
  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

function fromPrimitive(value) {
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

function toggle(event: Event) {
  open = (event.target as HTMLDetailsElement).open
}

let staged = $ref<any>()

function reset() {
  if (isCustomized) {
    staged = model
    model = spec.default
  }
}

const isRecoverable = $computed(() => {
  return staged !== undefined
})

watchEffect(onInvalidate => {
  if (isRecoverable) {
    const timer = setTimeout(() => {
      staged = undefined
    }, 10_000)
    onInvalidate(() => {
      clearTimeout(timer)
    })
  }
})

function recover() {
  model = staged
  staged = undefined
}

const localFonts = commas.helper.useAsyncComputed<string[]>(async () => {
  const fonts = await window['queryLocalFonts']()
  return uniq(fonts.map(font => font.family))
}, [])

function pickFont(event: InputEvent) {
  model = (event.target as HTMLSelectElement).value;
  (event.target as HTMLSelectElement).value = ''
}
</script>

<template>
  <details
    :open="open"
    class="settings-line"
    @toggle="toggle"
  >
    <summary :class="['line-summary', { customized: isCustomized }]">
      <a data-commas class="tree-node">
        <VisualIcon name="lucide-chevron-down" />
      </a>
      <span class="line-description">
        <span v-i18n class="item-label" @click.prevent>{{ spec.label }}#!settings.label.{{ spec.key }}</span>
        <span class="item-key" @click.prevent>{{ spec.key }}</span>
        <a v-if="isRecoverable" data-commas class="recover" @click.prevent="recover">
          <VisualIcon name="lucide-rotate-cw" />
        </a>
        <a v-else-if="isCustomized" data-commas class="reset" @click.prevent="reset">
          <VisualIcon name="lucide-rotate-ccw" />
        </a>
      </span>
    </summary>
    <div class="setting-detail">
      <div class="setting-comment">
        <div
          v-for="(comment, index) in spec.comments"
          :key="index"
          v-i18n
          class="form-tip-line"
        >{{ comment }}#!settings.comments.{{ index }}.{{ spec.key }}</div>
      </div>
      <slot>
        <SwitchControl v-if="accepts(spec.schema, 'boolean')" v-model="model" />
        <ObjectEditor
          v-else-if="isSimpleObject"
          v-model="model"
          :with-keys="accepts(spec.schema, 'object')"
          :pinned="spec.recommendations"
          lazy
        />
        <select
          v-else-if="isScalarEnum"
          v-model="model"
          data-commas
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
            v-model.lazy="model"
            :placeholder="placeholder"
            type="number"
            :min="spec.schema.minimum"
            :max="spec.schema.maximum"
            :step="spec.schema.multipleOf"
            data-commas
          >
          <input
            v-else-if="accepts(spec.schema, 'string')"
            v-model.lazy="model"
            :placeholder="placeholder"
            :pattern="spec.schema.pattern"
            :type="spec.schema.format === 'color' ? 'color' : 'text'"
            data-commas
          >
          <textarea
            v-else
            v-model.lazy="model"
            :placeholder="placeholder"
            data-commas
          ></textarea>
          <select
            v-if="accepts(spec.schema, 'string') && spec.schema.format === 'font'"
            data-commas
            class="extra-control"
            @change="pickFont"
          >
            <option v-i18n value="" disabled selected>Select local font#!settings.3</option>
            <option v-for="font in localFonts" :key="font" :value="font">{{ font }}</option>
          </select>
        </ValueSelector>
      </slot>
    </div>
  </details>
</template>

<style lang="scss" scoped>
.settings-line {
  margin: 12px 0;
  :deep(input[data-commas]:not([type='color'])),
  :deep(textarea[data-commas]) {
    box-sizing: border-box;
    width: 480px;
  }
  :deep(.object-editor input[data-commas]) {
    width: 208px;
    &:only-of-type {
      width: 452px;
    }
  }
}
.line-summary {
  display: flex;
  gap: 4px;
  &:focus-visible {
    outline: none;
  }
}
.line-description {
  display: flex;
  gap: 8px;
  .line-summary:focus-visible & {
    text-decoration: underline;
  }
}
.item-label {
  flex: none;
  cursor: text;
  user-select: text;
  .line-summary.customized & {
    font-style: italic;
  }
}
.item-key {
  flex: none;
  margin-left: 8px;
  font-size: 12px;
  opacity: 0.5;
  cursor: text;
  user-select: text;
  .line-summary.customized & {
    font-style: italic;
  }
}
.tree-node {
  flex: none;
  width: 24px;
  text-align: center;
  transition: transform var(--design-out-back-timing-function) 0.2s;
  .settings-line:not([open]) & {
    opacity: 1;
    transform: rotate(-90deg) translateX(2px);
  }
  .line-summary:focus-visible & {
    color: rgb(var(--system-accent));
  }
}
.setting-detail {
  padding-left: #{24px + 4px};
  .settings-line:not([open]) & {
    display: none;
  }
}
.setting-comment {
  margin: 4px 0;
  font-size: 12px;
  line-height: 24px;
  opacity: 0.5;
  cursor: text;
  user-select: text;
}
.recover {
  color: rgb(var(--system-red));
}
.extra-control {
  margin-top: 8px;
}
</style>
