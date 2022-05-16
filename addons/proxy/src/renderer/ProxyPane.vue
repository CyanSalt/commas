<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { ipcRenderer, shell } from 'electron'
import { useProxyRootCAStatus, useProxyServerStatus, useProxyServerVersion, useSystemProxyStatus } from './compositions'

const { vI18n, LoadingSpinner, SwitchControl, TerminalPane } = commas.ui.vueAssets

const settings = commas.remote.useSettings()
const isSystemProxyEnabled = $(useSystemProxyStatus())
const isCertInstalled = $(useProxyRootCAStatus())
const version = $(useProxyServerVersion())
let status = $(useProxyServerStatus())

let isInstalling = $ref(false)

const supportsSystemProxy = process.platform === 'darwin'
const supportsKeyChain = process.platform === 'darwin'

const latestVersion = $(commas.helperRenderer.useAsyncComputed<string | undefined>(
  () => ipcRenderer.invoke('get-latest-proxy-server-version'),
  undefined,
))

const isOutdated = $computed(() => {
  return Boolean(latestVersion) && (version === null || version !== latestVersion)
})

const port = $computed(() => {
  return settings['proxy.server.port']
})

const ip = $(commas.helperRenderer.useAsyncComputed<string>(
  () => ipcRenderer.invoke('get-ip'),
  'localhost',
))

const address = $computed(() => {
  return `http://${ip}:${port}`
})

function openEditor() {
  shell.openExternal(`http://localhost:${port}`)
}

function toggleProxyServer() {
  if (status !== undefined) {
    status = !status
  }
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
  isInstalling = true
  try {
    await ipcRenderer.invoke('install-proxy-server')
  } catch {
    // ignore error
  }
  isInstalling = false
}
</script>

<template>
  <TerminalPane class="proxy-pane">
    <h2 v-i18n class="group-title">Proxy#!proxy.1</h2>
    <div class="group">
      <div class="form-line">
        <label v-i18n class="form-label">Proxy Server Address#!proxy.4</label>
        <span v-if="status" class="link" @click="openEditor">{{ address }}</span>
        <span v-else class="link shortcut" @click="toggleProxyServer">
          <span class="feather-icon icon-navigation"></span>
          <span v-i18n>Click this icon to start#!proxy.10</span>
        </span>
      </div>
      <div v-if="supportsSystemProxy" class="form-line">
        <label v-i18n class="form-label">Enable system proxy#!proxy.3</label>
        <SwitchControl v-model="isSystemProxyEnabled" />
      </div>
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

<style lang="scss" scoped>
.cert-status .feather-icon {
  margin-right: 8px;
  color: rgb(var(--design-green));
}
.shortcut {
  display: flex;
  .feather-icon {
    margin-right: 8px;
  }
}
.proxy-pane .form-line {
  margin-top: 0;
}
</style>
