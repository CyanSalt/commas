<template>
  <terminal-pane class="user-settings-pane">
    <h2 v-i18n class="group-title">User Settings#!user-settings.1</h2>
    <div class="group">
      <div class="action-line">
        <span :class="['link form-action revert', { disabled: !isChanged }]" @click="revert">
          <span class="feather-icon icon-rotate-ccw"></span>
        </span>
        <span :class="['link form-action confirm', { disabled: !isChanged }]" @click="confirm">
          <span class="feather-icon icon-check"></span>
        </span>
      </div>
      <user-settings-line
        v-for="row in rows"
        :key="row.key"
        v-model="values[row.key]"
        :spec="row"
      ></user-settings-line>
    </div>
  </terminal-pane>
</template>

<script>
import { reactive, computed, unref, toRefs, watchEffect } from 'vue'
import { cloneDeep, isEqual } from 'lodash-es'
import TerminalPane from '../../components/basic/terminal-pane.vue'
import UserSettingsLine from './user-settings-line.vue'
import { useUserSettings, useSettingsSpecs } from '../../hooks/settings'

export default {
  name: 'UserSettingsPane',
  components: {
    'terminal-pane': TerminalPane,
    'user-settings-line': UserSettingsLine,
  },
  setup() {
    const state = reactive({
      values: {},
    })

    const userSettingsRef = useUserSettings()
    state.isChanged = computed(() => {
      const userSettings = unref(userSettingsRef)
      return !isEqual(userSettings, state.values)
    })

    const specsRef = useSettingsSpecs()
    state.rows = computed(() => {
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

    watchEffect(revert)

    return {
      ...toRefs(state),
      revert,
      confirm,
    }
  },
}
</script>

<style>
.user-settings-pane .form-action {
  margin: 0;
}
.user-settings-pane .revert {
  color: var(--design-red);
}
.user-settings-pane .confirm {
  color: var(--design-green);
}
.user-settings-pane .revert.disabled,
.user-settings-pane .confirm.disabled {
  color: inherit;
  opacity: 0.5;
}
</style>
