<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { ipcRenderer, shell } from 'electron'
import type { TerminalTab } from '../../../../src/typings/terminal'
import type { SyncPlan } from '../../typings/sync'
import { useSyncData } from './compositions'

defineProps<{
  tab: TerminalTab,
}>()

const { vI18n, ObjectEditor, TerminalPane } = commas.ui.vueAssets

const settings = commas.remote.useSettings()
let paneTabURL: string = $(commas.workspace.usePaneTabURL())
let syncData = useSyncData()
const omitHome = commas.helper.omitHome

const extraPlans = $computed({
  get() {
    return settings['sync.plan.extraPlans']
  },
  set(value) {
    settings['sync.plan.extraPlans'] = value
  },
})

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

function uploadDefaultSyncPlan() {
  ipcRenderer.invoke('upload-sync-files')
}

function downloadDefaultSyncPlan() {
  ipcRenderer.invoke('download-sync-files')
}

function openDefaultSyncPlanGist() {
  shell.openExternal(syncData.gistURL!)
}

function uploadSyncPlan(plan: SyncPlan) {
  ipcRenderer.invoke('upload-sync-plan', plan)
}

function downloadSyncPlan(plan: SyncPlan) {
  ipcRenderer.invoke('download-sync-plan', plan)
}

function configureSyncPlan() {
  commas.workspace.openPaneTab('settings')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  paneTabURL = 'commas://settings/#sync.plan.extraPlans'
}

function openSyncPlanDirectory(plan: SyncPlan) {
  shell.openPath(plan.directory)
}

function formatTime(time: string | null) {
  return time ? new Date(time).toLocaleString() : '--'
}

function addSyncPlan() {
  ipcRenderer.invoke('add-sync-plan')
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
        <span class="link form-action" @click="openGitHubTokenSettings">
          <span class="feather-icon icon-github"></span>
        </span>
        <span class="link form-action confirm" @click="confirmToken">
          <span class="feather-icon icon-check"></span>
        </span>
      </div>
      <span v-else v-i18n class="link" @click="addToken">Add GitHub Token#!sync.3</span>
      <div v-if="syncData.token" class="form-line">
        <span class="link form-action" @click="uploadDefaultSyncPlan">
          <span class="feather-icon icon-upload-cloud"></span>
        </span>
        <span class="link form-action" @click="downloadDefaultSyncPlan">
          <span class="feather-icon icon-download-cloud"></span>
        </span>
        <span v-if="syncData.gistURL" class="link form-action" @click="openDefaultSyncPlanGist">
          <span class="feather-icon icon-github"></span>
        </span>
      </div>
      <table class="history">
        <tbody>
          <tr>
            <td v-i18n>Recently uploaded at:#!sync.5</td>
            <td>{{ formatTime(syncData.uploadedAt) }}</td>
          </tr>
          <tr>
            <td v-i18n>Recently downloaded at:#!sync.6</td>
            <td>{{ formatTime(syncData.downloadedAt) }}</td>
          </tr>
          <tr>
            <td v-i18n>Recently synced version:#!sync.7</td>
            <td>{{ formatTime(syncData.updatedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <h2 v-i18n class="group-title">Plans#!sync.8</h2>
    <div class="group">
      <div v-for="(plan, index) in extraPlans" :key="index" class="extra-plan">
        <div class="form-line">
          <span class="plan-name">{{ plan.name }}</span>
          <span class="plan-directory" @click="openSyncPlanDirectory(plan)">
            <span class="feather-icon icon-at-sign"></span>
            <span class="directory-path">{{ omitHome(plan.directory) }}</span>
          </span>
        </div>
        <ObjectEditor v-model="plan.files" lazy>
          <template #extra>
            <template v-if="plan.gist">
              <span class="link form-action" @click="uploadSyncPlan(plan)">
                <span class="feather-icon icon-upload-cloud"></span>
              </span>
              <span class="link form-action" @click="downloadSyncPlan(plan)">
                <span class="feather-icon icon-download-cloud"></span>
              </span>
            </template>
            <template v-else>
              <span class="link form-action" @click="configureSyncPlan">
                <span class="feather-icon icon-edit-3"></span>
              </span>
            </template>
          </template>
        </ObjectEditor>
      </div>
      <div class="form-line action-line">
        <span class="link form-action" @click="addSyncPlan">
          <span class="feather-icon icon-plus"></span>
        </span>
      </div>
    </div>
  </TerminalPane>
</template>

<style lang="scss" scoped>
.form-action {
  &:first-child,
  :deep(.extra-line .add) + & {
    margin: 0;
  }
}
.confirm:hover {
  color: rgb(var(--system-green));
}
.history {
  border-spacing: 0;
  td {
    padding: 0;
    &:first-child {
      padding-right: 1em;
    }
  }
}
.action-line {
  margin: 0;
}
.plan-directory {
  opacity: 0.5;
  transition: opacity 0.2s;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
  .feather-icon {
    margin: 0 0.5em;
  }
}
</style>
