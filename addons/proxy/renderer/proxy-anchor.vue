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
import { computed, unref } from 'vue'
import { useSettings } from '../../../renderer/hooks/settings'
import { useProxyServerStatus, useSystemProxyStatus } from './hooks'

export default {
  name: 'proxy-anchor',
  setup() {
    const statusRef = useProxyServerStatus()
    const systemStatusRef = useSystemProxyStatus()

    const settingsRef = useSettings()
    const portRef = computed<number>(() => {
      const settings = unref(settingsRef)
      return settings['proxy.server.port']
    })

    function toggle() {
      const status = unref(statusRef)
      if (status !== undefined) {
        statusRef.value = !statusRef.value
      }
    }

    return {
      status: statusRef,
      systemStatus: systemStatusRef,
      port: portRef,
      toggle,
    }
  },
}
</script>

<style lang="scss" scoped>
.proxy-anchor {
  &.active {
    color: rgb(var(--design-cyan));
    &.system {
      color: rgb(var(--design-magenta));
    }
  }
}
.server-port {
  margin-left: 2px;
  vertical-align: 1px;
}
</style>
