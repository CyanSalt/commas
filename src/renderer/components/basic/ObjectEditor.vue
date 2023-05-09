<script lang="ts" setup>
import { isEqual } from 'lodash'
import { watch } from 'vue'
import OrderedCheckbox from './OrderedCheckbox.vue'

const { modelValue, withKeys, pinned, lazy } = defineProps<{
  modelValue: object | undefined,
  withKeys?: boolean,
  pinned?: object | undefined,
  lazy?: boolean,
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: object | undefined): void,
}>()

interface EditorEntry {
  key: string | number | symbol,
  value: any,
}

interface EditorEntryItem {
  entry: EditorEntry,
  index: number,
  id: string | number,
  pinned?: boolean,
}

let entries = $ref<EditorEntry[]>([])

function transform(object: object | undefined): EditorEntry[] {
  if (!object) return []
  return Object.entries(object).map(([key, value]) => ({ key, value }))
}

function isMatchedWithPinned(entry: EditorEntry, pinnedEntry: EditorEntry) {
  if (withKeys && entry.key !== pinnedEntry.key) return false
  return entry.value === pinnedEntry.value
}

const entryItems = $computed(() => {
  const pinnedEntries = transform(pinned)
  const pinnedItems = pinnedEntries.map<EditorEntryItem>(entry => ({
    entry,
    pinned: true,
    index: entries.findIndex(item => isMatchedWithPinned(item, entry)),
    id: `pinned:${withKeys ? entry.key : entry.value}`,
  }))
  const extraItems = entries
    .map<EditorEntryItem>((entry, index) => (
      {
        entry,
        index,
        id: index,
      }))
    .filter(item => !pinnedItems.some(pinnedItem => isMatchedWithPinned(item.entry, pinnedItem.entry)))
  return [
    ...pinnedItems,
    ...extraItems,
  ]
})

const result = $computed<object>(() => {
  if (withKeys) {
    return Object.fromEntries(entries.map(({ key, value }) => [key, value]))
  } else {
    return entries.map(({ key, value }) => value)
  }
})

watch($$(modelValue), value => {
  if (!isEqual(value, result)) {
    entries = transform(value)
  }
}, { immediate: true })

watch($$(result), value => {
  emit('update:modelValue', value)
})

function add() {
  entries.push({ key: '', value: '' })
}

function togglePinned(item: EditorEntryItem) {
  if (item.index === -1) {
    entries.push({ ...item.entry })
  } else {
    entries.splice(item.index, 1)
  }
}
</script>


<template>
  <div class="object-editor">
    <template v-for="item in entryItems" :key="item.id">
      <div class="property-line">
        <label class="pinned-checker">
          <OrderedCheckbox :index="item.index" class="pinned-control" @change="togglePinned(item)" />
        </label>
        <template v-if="withKeys">
          <template v-if="lazy">
            <input v-model.lazy="item.entry.key" :readonly="item.pinned" type="text" class="form-control">
          </template>
          <template v-else>
            <input v-model="item.entry.key" :readonly="item.pinned" type="text" class="form-control">
          </template>
          <span class="property-arrow">
            <span class="ph-bold ph-arrow-right"></span>
          </span>
        </template>
        <template v-if="lazy">
          <input v-model.lazy="item.entry.value" :readonly="item.pinned" type="text" class="form-control">
        </template>
        <template v-else>
          <input v-model="item.entry.value" :readonly="item.pinned" type="text" class="form-control">
        </template>
      </div>
      <slot name="note" :item="item"></slot>
    </template>
    <div class="property-line extra-line">
      <span class="link add" @click="add">
        <span class="ph-bold ph-plus"></span>
      </span>
      <slot name="extra"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.property-line {
  display: flex;
  align-items: center;
  & + :deep(.form-tips) {
    padding-left: 28px;
  }
}
.link {
  width: 24px;
  text-align: center;
  &:first-child {
    margin-right: 4px;
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
