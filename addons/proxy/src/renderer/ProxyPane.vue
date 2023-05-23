<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { clipboard, ipcRenderer, shell } from 'electron'
import type { TerminalTab } from '../../../../src/typings/terminal'
import { useProxyRootCAStatus, useProxyServerStatus, useProxyServerVersionInfo, useSystemProxyStatus } from './compositions'

defineProps<{
  tab: TerminalTab,
}>()

const { vI18n, SwitchControl, TerminalPane } = commas.ui.vueAssets

const settings = commas.remote.useSettings()
const isSystemProxyEnabled = $(useSystemProxyStatus())
const isCertInstalled = $(useProxyRootCAStatus())
const versionInfo = $(useProxyServerVersionInfo())
let status = $(useProxyServerStatus())

const supportsSystemProxy = process.platform === 'darwin'
const supportsKeyChain = process.platform === 'darwin'

const latestVersion = $(commas.helper.useAsyncComputed<string | undefined>(
  () => ipcRenderer.invoke('get-latest-proxy-server-version'),
  undefined,
))

const isOutdated = $computed(() => {
  if (versionInfo.type === 'builtin') return false
  return Boolean(versionInfo.version && latestVersion && versionInfo.version !== latestVersion)
})

const port = $computed(() => {
  return settings['proxy.server.port']!
})

const ip = $(commas.helper.useAsyncComputed<string>(
  () => ipcRenderer.invoke('get-ip'),
  'localhost',
))

const address = $computed(() => {
  return `http://${ip}:${port}`
})

function openEditor() {
  shell.openExternal(`http://localhost:${port}`)
}

function copyAddress() {
  clipboard.writeText(`${ip}:${port}`)
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

function update() {
  shell.openExternal('https://github.com/avwo/whistle/blob/master/CHANGELOG.md')
}
</script>

<template>
  <TerminalPane class="proxy-pane">
    <h2 v-i18n class="group-title">Proxy#!proxy.1</h2>
    <div class="group">
      <div class="form-line">
        <label v-i18n class="form-label">Proxy Server Address#!proxy.4</label>
        <span v-if="status" class="proxy-address">
          <span class="link" @click="openEditor">{{ address }}</span>
          <span class="link" @click="copyAddress">
            <span class="ph-bold ph-copy"></span>
          </span>
        </span>
        <span v-else class="link shortcut" @click="toggleProxyServer">
          <span class="shortcut-icon ph-bold ph-navigation-arrow"></span>
          <span v-i18n>Click this icon to start#!proxy.10</span>
        </span>
      </div>
      <div v-if="supportsSystemProxy" class="form-line">
        <label v-i18n class="form-label">Enable system proxy#!proxy.3</label>
        <SwitchControl v-model="isSystemProxyEnabled" />
      </div>
      <div class="form-line">
        <span class="form-label">
          <span v-i18n="{ version: versionInfo.version ?? '--' }">Current version: ${version}#!preference.9</span>
          <span v-if="versionInfo.type !== 'builtin'" class="version-type ph-bold ph-arrow-square-out"></span>
        </span>
        <span v-if="isOutdated" class="update-link link form-action" @click="update">
          <span class="update-icon ph-bold ph-caret-double-up"></span>
          <span class="latest-version">{{ latestVersion }}</span>
        </span>
      </div>
    </div>
    <template v-if="supportsKeyChain">
      <h2 v-i18n class="group-title">HTTPS Proxy#!proxy.5</h2>
      <div class="group">
        <span v-if="isCertInstalled" class="cert-status">
          <span class="cert-icon ph-bold ph-seal-check"></span>
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
.cert-icon {
  margin-right: 8px;
  color: rgb(var(--system-green));
}
.shortcut {
  display: flex;
}
.shortcut-icon {
  margin-right: 8px;
}
.proxy-pane .form-line {
  margin-top: 0;
}
.proxy-address {
  display: flex;
  gap: 1em;
  align-items: center;
}
.update-link {
  display: flex;
}
.latest-version {
  margin-left: 0.5em;
  font-size: 14px;
}
.version-type {
  margin-left: 0.5em;
}
</style>
