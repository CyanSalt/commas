<template>
  <terminal-pane class="user-settings-pane">
    <h2 v-i18n class="group-title">User Settings#!user-settings.1</h2>
    <div class="group">
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
      <user-settings-line
        v-for="(row, index) in rows"
        :key="row.key"
        :ref="line => lines[index] = line"
        v-model="values[row.key]"
        :spec="row"
      ></user-settings-line>
    </div>
  </terminal-pane>
</template>

<script lang="ts">
import { cloneDeep, isEqual } from 'lodash-es'
import { reactive, computed, unref, toRefs, watchEffect, onBeforeUpdate } from 'vue'
import TerminalPane from '../../components/basic/terminal-pane.vue'
import { useUserSettings, useSettingsSpecs } from '../../hooks/settings'
import UserSettingsLine from './user-settings-line.vue'

export default {
  name: 'user-settings-pane',
  components: {
    'terminal-pane': TerminalPane,
    'user-settings-line': UserSettingsLine,
  },
  setup() {
    const state = reactive({
      values: {},
      lines: [] as { collapsed: boolean }[],
    })

    const userSettingsRef = useUserSettings()
    const isChangedRef = computed(() => {
      const userSettings = unref(userSettingsRef)
      return !isEqual(userSettings, state.values)
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
      const userSettings = unref(userSettingsRef)
      state.values = cloneDeep(userSettings)
    }

    function confirm() {
      userSettingsRef.value = state.values
    }

    const isCollapsedRef = computed<boolean>({
      get() {
        return state.lines.every(line => line.collapsed)
      },
      set(value) {
        state.lines.forEach(line => {
          line.collapsed = value
        })
      },
    })

    function toggleAll() {
      const isCollapsed = unref(isCollapsedRef)
      isCollapsedRef.value = !isCollapsed
    }

    watchEffect(revert)

    onBeforeUpdate(() => {
      state.lines = []
    })

    return {
      ...toRefs(state),
      isChanged: isChangedRef,
      rows: rowsRef,
      isCollapsed: isCollapsedRef,
      revert,
      confirm,
      toggleAll,
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
  color: var(--design-red);
}
.confirm {
  color: var(--design-green);
}
.revert.disabled,
.confirm.disabled {
  color: inherit;
  opacity: 0.5;
}
</style>
