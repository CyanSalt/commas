<template>
  <div :class="['proxy-anchor', { active: isActive }]" @click="toggleProxyServer">
    <span class="feather-icon icon-navigation"></span>
    <span v-if="isActive" class="server-port">{{ port }}</span>
  </div>
</template>

<script>
import { reactive, toRefs, computed, unref } from 'vue'
import { useProxyServerStatus } from './hooks'
import { useSettings } from '../../hooks/settings'

export default {
  name: 'ProxyAnchor',
  setup() {
    const state = reactive({
      isActive: useProxyServerStatus(),
    })

    state.port = computed(() => {
      const settings = unref(useSettings())
      return settings['terminal.proxyServer.port']
    })

    function toggleProxyServer() {
      state.isActive = !state.isActive
    }

    return {
      ...toRefs(state),
      toggleProxyServer,
    }
  },
}
</script>

<style>
.proxy-anchor.active {
  color: var(--design-cyan);
}
</style>
