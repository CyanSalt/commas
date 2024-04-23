<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { clipboard, ipcRenderer, shell } from 'electron'
import type { TerminalTab } from '../../../../src/typings/terminal'
import { useProxyRootCAStatus, useProxyServerInstalled, useProxyServerStatus, useProxyServerVersion, useSystemProxyStatus } from './compositions'

defineProps<{
  tab: TerminalTab,
}>()

const { vI18n, VisualIcon, SwitchControl, TerminalPane } = commas.ui.vueAssets

const settings = commas.remote.useSettings()
const isSystemProxyEnabled = $(useSystemProxyStatus())
const isCertInstalled = $(useProxyRootCAStatus())
const version = $(useProxyServerVersion())
const installed = $(useProxyServerInstalled())
let status = $(useProxyServerStatus())

const supportsSystemProxy = process.platform === 'darwin'
const supportsKeyChain = process.platform === 'darwin'

const latestVersion = $(commas.helper.useAsyncComputed<string | undefined>(
  () => ipcRenderer.invoke('get-latest-proxy-server-version'),
  undefined,
))

const isOutdated = $computed(() => {
  return Boolean(version && latestVersion && version !== latestVersion)
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

function install() {
  shell.openExternal('https://github.com/avwo/whistle/')
}

function update() {
  shell.openExternal('https://github.com/avwo/whistle/blob/master/CHANGELOG.md')
}
</script>

<template>
  <TerminalPane :tab="tab" class="proxy-pane">
    <h2 v-i18n class="group-title">Proxy#!proxy.1</h2>
    <div class="group">
      <div class="form-line">
        <label v-i18n class="form-label">Proxy Server Address#!proxy.4</label>
        <span v-if="status" class="proxy-address">
          <span class="link" @click="openEditor">{{ address }}</span>
          <span class="link" @click="copyAddress">
            <VisualIcon name="lucide-clipboard-copy" />
          </span>
        </span>
        <span v-else-if="installed" class="link shortcut" @click="toggleProxyServer">
          <VisualIcon name="lucide-router" class="shortcut-icon" />
          <span v-i18n>Click this icon to start#!proxy.10</span>
        </span>
        <span v-else class="link shortcut" @click="install">
          <VisualIcon name="lucide-hard-drive-download" class="shortcut-icon" />
          <span v-i18n>Install whistle#!proxy.11</span>
        </span>
      </div>
      <div v-if="supportsSystemProxy" class="form-line">
        <label v-i18n class="form-label">Enable system proxy#!proxy.3</label>
        <SwitchControl v-model="isSystemProxyEnabled" />
      </div>
      <div class="form-line">
        <span v-i18n="{ version: version ?? '--' }">Current version: ${version}#!preference.9</span>
        <span v-if="isOutdated" class="update-link link form-action" @click="update">
          <VisualIcon name="lucide-chevrons-up" class="update-icon" />
          <span class="latest-version">{{ latestVersion }}</span>
        </span>
      </div>
    </div>
    <template v-if="supportsKeyChain">
      <h2 v-i18n class="group-title">HTTPS Proxy#!proxy.5</h2>
      <div class="group">
        <span v-if="isCertInstalled" class="cert-status">
          <VisualIcon name="lucide-award" class="cert-icon" />
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
  align-items: center;
  width: auto;
}
.latest-version {
  margin-left: 0.5em;
  font-size: 14px;
}
.version-type {
  margin-left: 0.5em;
}
</style>
