<template>
  <div v-if="supportsSystemProxy" class="form-line">
    <label v-i18n class="form-label">Enable system proxy#!proxy.2</label>
    <switch-control v-model="isSystemProxyEnabled"></switch-control>
  </div>
  <span v-i18n class="link" @click="openEditor">Edit proxy rules#!proxy.1</span>
</template>

<script lang="ts">
import { shell } from 'electron'
import { computed, reactive, toRefs, unref } from 'vue'
import SwitchControl from '../../components/basic/switch-control.vue'
import { useSettings } from '../../hooks/settings'
import { useSystemProxyStatus } from './hooks'

export default {
  name: 'proxy-link',
  components: {
    'switch-control': SwitchControl,
  },
  setup() {
    const state = reactive({
      supportsSystemProxy: process.platform === 'darwin',
      isSystemProxyEnabled: useSystemProxyStatus(),
    })

    const settingsRef = useSettings()
    const portRef = computed(() => {
      const settings = unref(settingsRef)
      return settings['proxy.server.port']
    })

    function openEditor() {
      const port = unref(portRef)
      shell.openExternal(`http://localhost:${port}`)
    }

    return {
      ...toRefs(state),
      openEditor,
    }
  },
}
</script>
