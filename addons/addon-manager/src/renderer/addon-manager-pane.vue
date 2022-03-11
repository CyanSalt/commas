<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { ipcRenderer } from 'electron'
import { isEqual } from 'lodash-es'
import { onMounted, watchEffect } from 'vue'
import type { EditorEntryItem } from '../../../../renderer/components/basic/object-editor.vue'
import { useDiscoveredAddons } from './compositions'

const { vI18n, ObjectEditor, TerminalPane } = commas.ui.vueAssets

let settings = $(commas.remote.useUserSettings())
const specs = $(commas.remote.useSettingsSpecs())

const spec = $computed(() => {
  return specs.find(item => item.key === 'terminal.addon.includes')
})

const discoveredAddons = $(useDiscoveredAddons())

const recommendations = $computed(() => {
  if (!spec) return []
  return [
    ...spec.recommendations!,
    ...discoveredAddons.filter(addon => addon.type === 'user')
      .map(addon => addon.name),
  ]
})

let currentValue = $computed<string[]>({
  get() {
    return settings['terminal.addon.includes'] ?? spec?.default ?? []
  },
  set(value) {
    ipcRenderer.invoke('set-addons', value)
  },
})

let model = $ref<string[]>([])

const isChanged = $computed(() => {
  return !isEqual(model, currentValue)
})

function getNote(item: EditorEntryItem) {
  const info = discoveredAddons.find(addon => addon.name === item.entry.value)
  return info?.manifest?.description ?? ''
}

function refreshAddons() {
  ipcRenderer.invoke('discover-addons')
}

function revert() {
  model = currentValue as string[]
}

function confirm() {
  currentValue = model as string[]
}

watchEffect(revert)

onMounted(() => {
  refreshAddons()
})
</script>

<template>
  <TerminalPane class="addon-manager-pane">
    <h2 v-i18n class="group-title">Addons#!addon-manager.1</h2>
    <form class="group">
      <span v-i18n class="link" @click="refreshAddons">Refresh addons#!addon-manager.3</span>
      <div class="action-line">
        <span :class="['link form-action revert', { disabled: !isChanged }]" @click="revert">
          <span class="feather-icon icon-rotate-ccw"></span>
        </span>
        <span :class="['link form-action confirm', { disabled: !isChanged }]" @click="confirm">
          <span class="feather-icon icon-check"></span>
        </span>
      </div>
      <ObjectEditor v-model="model" :pinned="recommendations">
        <template #note="{ item }">
          <div v-i18n class="form-tips">{{ getNote(item) }}</div>
        </template>
      </ObjectEditor>
    </form>
  </TerminalPane>
</template>

<style lang="scss" scoped>
.form-action {
  margin: 0;
}
.revert {
  color: rgb(var(--design-red));
}
.confirm {
  color: rgb(var(--design-green));
}
.revert.disabled,
.confirm.disabled {
  color: inherit;
  opacity: 0.5;
}
</style>
