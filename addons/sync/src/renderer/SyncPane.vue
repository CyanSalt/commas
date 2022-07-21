<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { ipcRenderer, shell } from 'electron'
import type { TerminalTab } from '../../../../src/typings/terminal'
import { useSyncData } from './compositions'

defineProps<{
  tab: TerminalTab,
}>()

const { vI18n, TerminalPane } = commas.ui.vueAssets

let syncData = useSyncData()

let isAddingToken = $ref(false)
let stagingToken: string = $ref('')

function addToken() {
  isAddingToken = true
}

function openGitHubTokenSettings() {
  const url = new URL('https://github.com/settings/tokens/new')
  url.searchParams.set('description', 'Commas Sync')
  url.searchParams.set('scopes', 'gist')
  shell.openExternal(url.href)
}

function confirmToken() {
  syncData.token = stagingToken || null
  isAddingToken = false
}

function removeToken() {
  syncData.token = null
}

function uploadSettings() {
  ipcRenderer.invoke('upload-sync-files')
}

function downloadSettings() {
  ipcRenderer.invoke('download-sync-files')
}

function openGitHubGist() {
  shell.openExternal(syncData.gistURL!)
}

function formatTime(time: string | null) {
  return time ? new Date(time).toLocaleString() : '--'
}
</script>

<template>
  <TerminalPane class="sync-pane">
    <h2 v-i18n class="group-title">Sync#!sync.1</h2>
    <div class="group">
      <span
        v-if="syncData.token"
        v-i18n
        class="link"
        @click="removeToken"
      >Remove GitHub Token#!sync.4</span>
      <div v-else-if="isAddingToken" class="form-line">
        <input
          v-model="stagingToken"
          v-i18n:placeholder
          class="form-control"
        >
        <span class="link simple-link" @click="openGitHubTokenSettings">
          <span class="feather-icon icon-github"></span>
        </span>
        <span class="link simple-link confirm" @click="confirmToken">
          <span class="feather-icon icon-check"></span>
        </span>
      </div>
      <span v-else v-i18n class="link" @click="addToken">Add GitHub Token#!sync.3</span>
      <div v-if="syncData.token" class="form-line">
        <span class="link simple-link" @click="uploadSettings">
          <span class="feather-icon icon-upload-cloud"></span>
        </span>
        <span class="link simple-link" @click="downloadSettings">
          <span class="feather-icon icon-download-cloud"></span>
        </span>
        <span v-if="syncData.gistURL" class="link simple-link" @click="openGitHubGist">
          <span class="feather-icon icon-github"></span>
        </span>
      </div>
      <div
        v-i18n="{ T: formatTime(syncData.uploadedAt) }"
        class="uploaded-at"
      >Last uploaded At: %T#!sync.5</div>
      <div
        v-i18n="{ T: formatTime(syncData.downloadedAt) }"
        class="downloaded-at"
      >Last downloaded At: %T#!sync.6</div>
    </div>
  </TerminalPane>
</template>

<style lang="scss" scoped>
.simple-link {
  width: 24px;
  text-align: center;
  &:not(:first-child) {
    margin-left: 4px;
  }
}
.confirm:hover {
  color: rgb(var(--system-green));
}
</style>
