<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { cloneDeep, isEqual } from 'lodash-es'
import { watchEffect } from 'vue'
import SettingsLine from './settings-line.vue'

const { vI18n, TerminalPane } = commas.ui.vueAssets

let settings = $(commas.remote.useUserSettings())
let values = $ref({})
let open = $ref<boolean[]>([])

const isChanged = $computed(() => {
  return !isEqual(settings, values)
})

const specs = $(commas.remote.useSettingsSpecs())
const rows = $computed(() => {
  return specs.filter((item) => {
    return !Array.isArray(item.configurable)
          || item.configurable.includes(process.platform)
  })
})

watchEffect(() => {
  open = rows.map(() => true)
})

let isCollapsed = $computed<boolean>({
  get() {
    return open.every(item => !item)
  },
  set(value) {
    open = open.map(() => !value)
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

watchEffect(revert)
</script>

<template>
  <TerminalPane class="settings-pane">
    <h2 v-i18n class="group-title">Settings#!settings.1</h2>
    <form class="group">
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
        v-model="values[row.key]"
        v-model:open="open[index]"
        :spec="row"
        :current-value="settings[row.key]"
      />
    </form>
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
