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

<script lang="ts">
import { ipcRenderer } from 'electron'
import { cloneDeep, isEqual } from 'lodash-es'
import { computed, onBeforeUpdate, ref, unref, watchEffect } from 'vue'
import TerminalPane from '../../../renderer/components/basic/terminal-pane.vue'
import { useUserSettings, useSettingsSpecs } from '../../../renderer/hooks/settings'
import type { SettingsLineAPI } from './settings-line.vue'
import SettingsLine from './settings-line.vue'

export default {
  name: 'settings-pane',
  components: {
    TerminalPane,
    SettingsLine,
  },
  setup() {
    const settingsRef = useUserSettings()
    const valuesRef = ref({})
    const linesRef = ref<SettingsLineAPI[]>([])

    const isChangedRef = computed(() => {
      const settings = unref(settingsRef)
      const values = unref(valuesRef)
      return !isEqual(settings, values)
    })

    const specsRef = useSettingsSpecs()
    const rowsRef = computed(() => {
      const specs = unref(specsRef)
      return specs.filter((item) => {
        return !Array.isArray(item.configurable)
          || item.configurable.includes(process.platform)
      })
    })

    function revert() {
      const settings = unref(settingsRef)
      valuesRef.value = cloneDeep(settings)
    }

    function confirm() {
      settingsRef.value = unref(valuesRef)
    }

    const isCollapsedRef = computed<boolean>({
      get() {
        const lines = unref(linesRef)
        return lines.every(line => line.isCollapsed)
      },
      set(value) {
        const lines = unref(linesRef)
        lines.forEach(line => {
          line.isCollapsed = value
        })
      },
    })

    function toggleAll() {
      const isCollapsed = unref(isCollapsedRef)
      isCollapsedRef.value = !isCollapsed
    }

    function refreshAddons() {
      ipcRenderer.invoke('refresh-addons')
    }

    watchEffect(revert)

    onBeforeUpdate(() => {
      linesRef.value = []
    })

    return {
      settings: settingsRef,
      values: valuesRef,
      lines: linesRef,
      isChanged: isChangedRef,
      rows: rowsRef,
      isCollapsed: isCollapsedRef,
      revert,
      confirm,
      toggleAll,
      refreshAddons,
    }
  },
}
</script>

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
