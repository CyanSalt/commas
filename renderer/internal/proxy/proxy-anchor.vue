<template>
  <div
    :class="['proxy-anchor', { active: status, disabled: status === undefined, system: systemStatus }]"
    @click="toggle"
  >
    <span v-if="status === undefined" class="feather-icon icon-more-horizontal"></span>
    <span v-else class="feather-icon icon-navigation"></span>
    <span v-if="status" class="server-port">{{ port }}</span>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs, computed, unref } from 'vue'
import { useSettings } from '../../hooks/settings'
import { useProxyServerStatus, useSystemProxyStatus } from './hooks'

export default {
  name: 'proxy-anchor',
  setup() {
    const state = reactive({
      status: useProxyServerStatus(),
      systemStatus: useSystemProxyStatus(),
    })

    const settingsRef = useSettings()
    const portRef = computed<number>(() => {
      const settings = unref(settingsRef)
      return settings['proxy.server.port']
    })

    function toggle() {
      if (state.status !== undefined) {
        state.status = !state.status
      }
    }

    return {
      ...toRefs(state),
      port: portRef,
      toggle,
    }
  },
}
</script>

<style lang="scss" scoped>
.proxy-anchor {
  &.active {
    color: var(--design-cyan);
    &.system {
      color: var(--design-magenta);
    }
  }
}
.server-port {
  margin-left: 2px;
  vertical-align: 1px;
}
</style>
