<template>
  <div :class="['proxy-anchor', { active: isActive }]" @click="toggleProxyServer">
    <span class="feather-icon icon-navigation"></span>
    <span v-if="isActive" class="server-port">{{ port }}</span>
  </div>
</template>

<script>
import { reactive, toRefs, computed, unref } from 'vue'
import { useSettings } from '../../hooks/settings.mjs'
import { useProxyServerStatus } from './hooks.mjs'

export default {
  name: 'proxy-anchor',
  setup() {
    const state = reactive({
      isActive: useProxyServerStatus(),
    })

    const settingsRef = useSettings()
    state.port = computed(() => {
      const settings = unref(settingsRef)
      return settings['proxy.server.port']
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
