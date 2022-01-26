<script lang="ts" setup>
import { isEqual } from 'lodash-es'
import { watch } from 'vue'
import type { PropType } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Object, undefined] as PropType<object | undefined>,
    required: true,
  },
  withKeys: {
    type: Boolean,
    default: false,
  },
  pinned: {
    type: [Object, undefined] as PropType<object | undefined>,
    default: undefined,
  },
})

const emit = defineEmits({
  'update:modelValue': (value: object | undefined) => {
    return !value || typeof value === 'object'
  },
})

let entries = $ref<EditorEntry[]>([])

function transform(object: object | undefined): EditorEntry[] {
  if (!object) return []
  return Object.entries(object).map(([key, value]) => ({ key, value }))
}

function isMatchedWithPinned(entry: EditorEntry, pinned: EditorEntry) {
  if (props.withKeys && entry.key !== pinned.key) return false
  return entry.value === pinned.value
}

const entryItems = $computed(() => {
  const pinnedEntries = transform(props.pinned)
  const pinnedItems = pinnedEntries.map<EditorEntryItem>(entry => ({
    entry,
    pinned: true,
    index: entries.findIndex(item => isMatchedWithPinned(item, entry)),
    id: `pinned:${props.withKeys ? entry.key : entry.value}`,
  }))
  const extraItems = entries
    .map<EditorEntryItem>((entry, index) => (
    {
      entry,
      index,
      id: index,
    }))
    .filter(item => !pinnedItems.some(pinned => isMatchedWithPinned(item.entry, pinned.entry)))
  return [
    ...pinnedItems,
    ...extraItems,
  ]
})

const result = $computed<object>(() => {
  if (props.withKeys) {
    return Object.fromEntries(entries.map(({ key, value }) => [key, value]))
  } else {
    return entries.map(({ key, value }) => value)
  }
})

watch(() => props.modelValue, modelValue => {
  if (!isEqual(modelValue, result)) {
    entries = transform(props.modelValue)
  }
}, { immediate: true })

watch($$(result), result => {
  emit('update:modelValue', result)
})

function add() {
  entries.push({ key: '', value: '' })
}

function remove(item: EditorEntryItem) {
  entries.splice(item.index, 1)
}

function togglePinned(item: EditorEntryItem) {
  if (item.index === -1) {
    entries.push({ ...item.entry })
  } else {
    remove(item)
  }
}
</script>

<script lang="ts">
interface EditorEntry {
  key: string | number | symbol,
  value: any,
}

export interface EditorEntryItem {
  entry: EditorEntry,
  index: number,
  id: string | number,
  pinned?: boolean,
}
</script>


<template>
  <div class="object-editor">
    <template v-for="item in entryItems" :key="item.id">
      <div class="property-line">
        <label v-if="item.pinned" class="pinned-checker">
          <input :checked="item.index !== -1" type="checkbox" class="pinned-control" @change="togglePinned(item)">
        </label>
        <span v-else class="link remove" @click="remove(item)">
          <span class="feather-icon icon-minus"></span>
        </span>
        <template v-if="withKeys">
          <input v-model="item.entry.key" :readonly="item.pinned" type="text" class="form-control">
          <span class="property-arrow">
            <span class="feather-icon icon-arrow-right"></span>
          </span>
        </template>
        <input v-model="item.entry.value" :readonly="item.pinned" type="text" class="form-control">
      </div>
      <slot name="note" :item="item"></slot>
    </template>
    <div class="property-line extra-line">
      <span class="link add" @click="add">
        <span class="feather-icon icon-plus"></span>
      </span>
      <slot name="extra"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.property-line {
  display: flex;
  align-items: center;
  & + .form-tips {
    padding-left: 28px;
  }
}
.link {
  width: 24px;
  text-align: center;
  &:first-child {
    margin-right: 4px;
  }
  &.remove:hover {
    color: rgb(var(--design-red));
  }
}
.property-arrow {
  width: 36px;
  text-align: center;
}
.pinned-checker {
  width: 24px;
  margin-right: 4px;
  text-align: center;
}
.pinned-control {
  vertical-align: middle;
}
</style>
