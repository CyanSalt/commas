<template>
  <TerminalPane class="proxy-pane">
    <h2 v-i18n class="group-title">Proxy#!proxy.1</h2>
    <div class="group">
      <div v-if="supportsSystemProxy" class="form-line">
        <label v-i18n class="form-label">Enable system proxy#!proxy.3</label>
        <SwitchControl v-model="isSystemProxyEnabled" />
      </div>
      <span v-i18n class="link" @click="openEditor">Edit proxy rules#!proxy.4</span>
      <div class="form-line">
        <span v-i18n="{ V: version ?? '--' }" class="text">Current version: %V#!preference.9</span>
        <span v-if="isInstalling" class="form-action" @click="install">
          <LoadingSpinner />
        </span>
        <span v-else-if="isOutdated" class="link form-action" @click="install">
          <span :class="['feather-icon', version ? 'icon-arrow-up' : 'icon-download-cloud']"></span>
        </span>
      </div>
    </div>
    <template v-if="supportsKeyChain">
      <h2 v-i18n class="group-title">HTTPS Proxy#!proxy.5</h2>
      <div class="group">
        <span v-if="isCertInstalled" class="cert-status">
          <span class="feather-icon icon-check"></span>
          <span v-i18n>Certification installed#!proxy.8</span>
        </span>
        <span
          v-if="isCertInstalled"
          v-i18n
          class="link"
          @click="uninstallRootCA"
        >Uninstall Root Certification#!proxy.7</span>
        <span v-else v-i18n class="link" @click="installRootCA">Install Root Certification#!proxy.6</span>
        <span v-i18n class="link" @click="openKeychainAccess">Open Keychain Access#!proxy.9</span>
      </div>
    </template>
  </TerminalPane>
</template>

<script lang="ts">
import { ipcRenderer, shell } from 'electron'
import { computed, ref, unref } from 'vue'
import LoadingSpinner from '../../../renderer/components/basic/loading-spinner.vue'
import SwitchControl from '../../../renderer/components/basic/switch-control.vue'
import TerminalPane from '../../../renderer/components/basic/terminal-pane.vue'
import { useSettings } from '../../../renderer/hooks/settings'
import { useAsyncComputed } from '../../../renderer/utils/hooks'
import { useProxyRootCAStatus, useProxyServerVersion, useSystemProxyStatus } from './hooks'

export default {
  name: 'proxy-pane',
  components: {
    TerminalPane,
    SwitchControl,
    LoadingSpinner,
  },
  setup() {
    const isSystemProxyEnabledRef = useSystemProxyStatus()
    const isCertInstalledRef = useProxyRootCAStatus()
    const versionRef = useProxyServerVersion()

    const isInstallingRef = ref(false)

    const latestVersionRef = useAsyncComputed<string | undefined>(
      () => ipcRenderer.invoke('get-latest-proxy-server-version'),
      undefined,
    )

    const isOutdatedRef = computed(() => {
      const version = unref(versionRef)
      const latestVersion = unref(latestVersionRef)
      return Boolean(latestVersion) && (version === null || version !== latestVersion)
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

    async function install() {
      isInstallingRef.value = true
      try {
        await ipcRenderer.invoke('install-proxy-server')
      } catch {
        // ignore error
      }
      isInstallingRef.value = false
    }

    return {
      supportsSystemProxy: process.platform === 'darwin',
      supportsKeyChain: process.platform === 'darwin',
      version: versionRef,
      isSystemProxyEnabled: isSystemProxyEnabledRef,
      isCertInstalled: isCertInstalledRef,
      isInstalling: isInstallingRef,
      isOutdated: isOutdatedRef,
      openEditor,
      installRootCA,
      uninstallRootCA,
      openKeychainAccess,
      install,
    }
  },
}
</script>

<style lang="scss" scoped>
.cert-status .feather-icon {
  margin-right: 8px;
  color: rgb(var(--design-green));
}
</style>
