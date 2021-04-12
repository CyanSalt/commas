<template>
  <terminal-pane class="proxy-pane">
    <h2 v-i18n class="group-title">Proxy Configurations#!proxy.1</h2>
    <div class="group">
      <div v-if="supportsSystemProxy" class="form-line">
        <label v-i18n class="form-label">Enable system proxy#!proxy.2</label>
        <switch-control v-model="isSystemProxyEnabled"></switch-control>
      </div>
      <span v-i18n class="link" @click="openEditor">Edit proxy rules#!proxy.1</span>
    </div>
    <template v-if="supportsKeyChain">
      <h2 v-i18n class="group-title">HTTPS Proxy#!proxy.6</h2>
      <div class="group">
        <span v-if="isCertInstalled" class="cert-status">
          <span class="feather-icon icon-check"></span>
          <span v-i18n>Certification installed#!proxy.8</span>
        </span>
        <span v-if="isCertInstalled" v-i18n class="link" @click="uninstallRootCA">Uninstall Root Certification#!proxy.9</span>
        <span v-else v-i18n class="link" @click="installRootCA">Install Root Certification#!proxy.4</span>
        <span v-i18n class="link" @click="openKeychainAccess">Open Keychain Access#!proxy.5</span>
      </div>
    </template>
    <h2 v-i18n class="group-title">Whistle#!proxy.7</h2>
    <div class="group">
      <span v-i18n="{ V: version }" class="text">Current version: %V#!preference.9</span>
    </div>
  </terminal-pane>
</template>

<script lang="ts">
import { ipcRenderer, shell } from 'electron'
import { computed, reactive, toRefs, unref, watchEffect } from 'vue'
import SwitchControl from '../../components/basic/switch-control.vue'
import TerminalPane from '../../components/basic/terminal-pane.vue'
import { useSettings } from '../../hooks/settings'
import { useProxyRootCAStatus, useSystemProxyStatus } from './hooks'

export default {
  name: 'proxy-pane',
  components: {
    'terminal-pane': TerminalPane,
    'switch-control': SwitchControl,
  },
  setup() {
    const state = reactive({
      supportsSystemProxy: process.platform === 'darwin',
      supportsKeyChain: process.platform === 'darwin',
      isSystemProxyEnabled: useSystemProxyStatus(),
      isCertInstalled: useProxyRootCAStatus(),
      version: 'N/A',
    })

    watchEffect(async () => {
      state.version = await ipcRenderer.invoke('get-proxy-server-version')
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

    function installRootCA() {
      return ipcRenderer.invoke('install-proxy-root-ca')
    }

    function uninstallRootCA() {
      return ipcRenderer.invoke('uninstall-proxy-root-ca')
    }

    function openKeychainAccess() {
      return ipcRenderer.invoke('execute', `open -a 'Keychain Access'`)
    }

    return {
      ...toRefs(state),
      openEditor,
      installRootCA,
      uninstallRootCA,
      openKeychainAccess,
    }
  },
}
</script>

<style lang="scss" scoped>
.cert-status .feather-icon {
  margin-right: 8px;
  color: var(--design-green);
}
</style>
