<script lang="ts" setup>
import { ipcRenderer } from 'electron'
import { cloneDeep, isEqual } from 'lodash-es'
import { onBeforeUpdate, watchEffect } from 'vue'
import TerminalPane from '../../../renderer/components/basic/terminal-pane.vue'
import { useUserSettings, useSettingsSpecs } from '../../../renderer/hooks/settings'
import type { SettingsLineAPI } from './settings-line.vue'
import SettingsLine from './settings-line.vue'

let settings = $(useUserSettings())
let values = $ref({})
let lines = $ref<SettingsLineAPI[]>([])

const isChanged = $computed(() => {
  return !isEqual(settings, values)
})

const specs = $(useSettingsSpecs())
const rows = $computed(() => {
  return specs.filter((item) => {
    return !Array.isArray(item.configurable)
          || item.configurable.includes(process.platform)
  })
})

let isCollapsed = $computed<boolean>({
  get() {
    return lines.every(line => line.isCollapsed)
  },
  set(value) {
    lines.forEach(line => {
      line.isCollapsed = value
    })
  },
})

function revert() {
  values = cloneDeep(settings)
}

function confirm() {
  settings = values
}

function toggleAll() {
  isCollapsed = !isCollapsed
}

function refreshAddons() {
  ipcRenderer.invoke('refresh-addons')
}

watchEffect(revert)

onBeforeUpdate(() => {
  lines = []
})
</script>

<template>
  <TerminalPane class="settings-pane">
    <h2 v-i18n class="group-title">Settings#!settings.1</h2>
    <div class="group">
      <span v-i18n class="link" @click="refreshAddons">Refresh addons#!settings.3</span>
      <div class="action-line">
        <span :class="['link form-action toggle-all', { collapsed: isCollapsed }]" @click="toggleAll">
          <span class="feather-icon icon-chevrons-down"></span>
        </span>
        <span :class="['link form-action revert', { disabled: !isChanged }]" @click="revert">
          <span class="feather-icon icon-rotate-ccw"></span>
        </span>
        <span :class="['link form-action confirm', { disabled: !isChanged }]" @click="confirm">
          <span class="feather-icon icon-check"></span>
        </span>
      </div>
      <SettingsLine
        v-for="(row, index) in rows"
        :key="row.key"
        :ref="line => lines[index] = line"
        v-model="values[row.key]"
        :spec="row"
        :current-value="settings[row.key]"
      />
    </div>
  </TerminalPane>
</template>

<style lang="scss" scoped>
.form-action {
  margin: 0;
}
.toggle-all.collapsed {
  opacity: 1;
  transform: rotate(-90deg);
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
