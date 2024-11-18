<script lang="ts" setup>
import { ipcRenderer } from '@commas/electron-ipc'
import type { TerminalTab } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'
import { clipboard } from 'electron'
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

const latestVersion = $(commas.helper.useAsyncComputed(
  () => ipcRenderer.invoke('get-latest-proxy-server-version'),
  undefined,
))

const isOutdated = $computed(() => {
  return Boolean(version && latestVersion && version !== latestVersion)
})

const port = $computed(() => {
  return settings['proxy.server.port']!
})

const ip = $(commas.helper.useAsyncComputed(
  () => ipcRenderer.invoke('get-ip'),
  'localhost',
))

const address = $computed(() => {
  return `http://${ip}:${port}`
})

function openEditor(event: MouseEvent) {
  commas.ui.openLink(`http://localhost:${port}`, event)
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

function install(event: MouseEvent) {
  commas.ui.openLink('https://github.com/avwo/whistle/', event)
}

function update(event: MouseEvent) {
  commas.ui.openLink('https://github.com/avwo/whistle/blob/master/CHANGELOG.md', event)
}
</script>

<template>
  <TerminalPane :tab="tab" class="proxy-pane">
    <h2 v-i18n data-commas>Proxy#!proxy.1</h2>
    <div class="group">
      <div class="form-line">
        <label v-i18n data-commas>Proxy Server Address#!proxy.4</label>
        <span v-if="status" class="proxy-address">
          <a href="" data-commas @click.prevent="openEditor">{{ address }}</a>
          <button type="button" data-commas @click="copyAddress">
            <VisualIcon name="lucide-clipboard-copy" />
          </button>
        </span>
        <a v-else-if="installed" href="" data-commas class="shortcut" @click.prevent="toggleProxyServer">
          <VisualIcon name="lucide-router" class="shortcut-icon" />
          <span v-i18n>Click this icon to start#!proxy.10</span>
        </a>
        <a v-else href="" data-commas class="shortcut" @click.prevent="install">
          <VisualIcon name="lucide-hard-drive-download" class="shortcut-icon" />
          <span v-i18n>Install whistle#!proxy.11</span>
        </a>
      </div>
      <div v-if="supportsSystemProxy" class="form-line">
        <label v-i18n data-commas>Enable system proxy#!proxy.3</label>
        <SwitchControl v-model="isSystemProxyEnabled" />
      </div>
      <div class="form-line">
        <label v-i18n data-commas>Current version#!preference.9</label>
        <span>{{ version ?? '--' }}</span>
        <a v-if="isOutdated" href="" data-commas class="update-link" @click.prevent="update">
          <VisualIcon name="lucide-chevrons-up" class="update-icon" />
          <span class="latest-version">{{ latestVersion }}</span>
        </a>
      </div>
    </div>
    <template v-if="supportsKeyChain">
      <h2 v-i18n data-commas>HTTPS Proxy#!proxy.5</h2>
      <div class="group">
        <span v-if="isCertInstalled" class="cert-status">
          <VisualIcon name="lucide-award" class="cert-icon" />
          <span v-i18n>Certification installed#!proxy.8</span>
        </span>
        <a
          v-if="isCertInstalled"
          v-i18n
          href=""
          data-commas
          @click.prevent="uninstallRootCA"
        >Uninstall Root Certification#!proxy.7</a>
        <a
          v-else
          v-i18n
          href=""
          data-commas
          @click.prevent="installRootCA"
        >Install Root Certification#!proxy.6</a>
        <a
          v-i18n
          href=""
          data-commas
          @click.prevent="openKeychainAccess"
        >Open Keychain Access#!proxy.9</a>
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
  gap: 4px;
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
