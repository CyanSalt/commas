<template>
  <div :class="['proxy-anchor', { active: isActive }]" @click="toggleProxyServer">
    <span class="feather-icon icon-navigation"></span>
    <span v-if="isActive" class="server-port">{{ port }}</span>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs, computed, unref } from 'vue'
import { useSettings } from '../../hooks/settings'
import { useProxyServerStatus } from './hooks'

export default {
  name: 'proxy-anchor',
  setup() {
    const state = reactive({
      isActive: useProxyServerStatus(),
    })

    const settingsRef = useSettings()
    const portRef = computed<number>(() => {
      const settings = unref(settingsRef)
      return settings['proxy.server.port']
    })

    function toggleProxyServer() {
      state.isActive = !state.isActive
    }

    return {
      ...toRefs(state),
      port: portRef,
      toggleProxyServer,
    }
  },
}
</script>

<style lang="scss" scoped>
.proxy-anchor {
  &.active {
    color: var(--design-cyan);
  }
}
.server-port {
  vertical-align: 1px;
}
</style>
