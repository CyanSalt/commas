<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { ipcRenderer, shell } from 'electron'
import { toRaw, toRef } from 'vue'
import type { TerminalTab } from '../../../../src/typings/terminal'
import type { SyncPlan } from '../../typings/sync'
import { useSyncData } from './compositions'

defineProps<{
  tab: TerminalTab,
}>()

const { vI18n, ObjectEditor, TerminalPane } = commas.ui.vueAssets

const settings = commas.remote.useSettings()
let syncData = $(useSyncData())
const omitHome = commas.helper.omitHome

const defaultPlanGist = $computed(() => {
  return settings['sync.plan.gist']
})

let extraPlans = $(commas.helper.deepRef(toRef(settings, 'sync.plan.extraPlans')))

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
  ipcRenderer.invoke('set-sync-token', stagingToken || null)
  isAddingToken = false
}

function removeToken() {
  ipcRenderer.invoke('set-sync-token', null)
}

function uploadDefaultSyncPlan() {
  ipcRenderer.invoke('upload-sync-files')
}

function downloadDefaultSyncPlan() {
  ipcRenderer.invoke('download-sync-files')
}

function openSyncPlanGist(gist: string) {
  shell.openExternal(`https://gist.github.com/${gist}`)
}

async function uploadSyncPlan(plan: SyncPlan) {
  const patch = await ipcRenderer.invoke('upload-sync-plan', toRaw(plan))
  if (patch) {
    Object.assign(plan, patch)
  }
}

async function downloadSyncPlan(plan: SyncPlan) {
  const patch = await ipcRenderer.invoke('download-sync-plan', toRaw(plan))
  if (patch) {
    Object.assign(plan, patch)
  }
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

function removeSyncPlan(index: number) {
  // extraPlans.splice(index, 1)
  extraPlans = ([] as typeof extraPlans).concat(
    extraPlans.slice(0, index),
    extraPlans.slice(index + 1),
  )
}
</script>

<template>
  <TerminalPane :tab="tab" class="sync-pane">
    <h2 v-i18n class="group-title">Sync#!sync.1</h2>
    <div class="group">
      <span
        v-if="syncData.encryption"
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
          <span class="ph-bold ph-github-logo"></span>
        </span>
        <span class="link form-action confirm" @click="confirmToken">
          <span class="ph-bold ph-check"></span>
        </span>
      </div>
      <span v-else v-i18n class="link" @click="addToken">Add GitHub Token#!sync.3</span>
      <div v-if="syncData.encryption" class="form-line">
        <span class="link form-action" @click="uploadDefaultSyncPlan">
          <span class="ph-bold ph-cloud-arrow-up"></span>
        </span>
        <span v-if="defaultPlanGist" class="link form-action" @click="downloadDefaultSyncPlan">
          <span class="ph-bold ph-cloud-arrow-down"></span>
        </span>
        <span
          v-if="defaultPlanGist.includes('/')"
          class="link form-action"
          @click="openSyncPlanGist(defaultPlanGist)"
        >
          <span class="ph-bold ph-github-logo"></span>
        </span>
      </div>
      <div class="history">
        <label v-i18n>Recently synced at:#!sync.5</label>
        <span>{{ formatTime(syncData.updatedAt) }}</span>
      </div>
    </div>
    <h2 v-i18n class="group-title">Plans#!sync.8</h2>
    <div class="group">
      <div v-for="(plan, index) in extraPlans" :key="index" class="extra-plan">
        <div class="form-line">
          <span class="link form-action remove-plan" @click="removeSyncPlan(index)">
            <span class="ph-bold ph-minus"></span>
          </span>
          <input v-model.lazy="plan.name" class="immersive-control plan-name">
          <span class="plan-directory" @click="openSyncPlanDirectory(plan)">
            <span class="directory-icon ph-bold ph-folder-notch"></span>
            <span class="directory-path">{{ omitHome(plan.directory) }}</span>
          </span>
        </div>
        <ObjectEditor v-model="plan.files" lazy>
          <template #extra>
            <span class="link form-action" @click="uploadSyncPlan(plan)">
              <span class="ph-bold ph-cloud-arrow-up"></span>
            </span>
            <span v-if="plan.gist" class="link form-action" @click="downloadSyncPlan(plan)">
              <span class="ph-bold ph-cloud-arrow-down"></span>
            </span>
            <span
              v-if="plan.gist.includes('/')"
              class="link form-action"
              @click="openSyncPlanGist(plan.gist)"
            >
              <span class="ph-bold ph-github-logo"></span>
            </span>
          </template>
        </ObjectEditor>
      </div>
      <div class="form-line action-line">
        <span class="link form-action" @click="addSyncPlan">
          <span class="ph-bold ph-plus"></span>
        </span>
      </div>
    </div>
  </TerminalPane>
</template>

<style lang="scss" scoped>
.form-action {
  &:first-child,
  :deep(.extra-line .add) + & {
    margin-left: 0;
  }
}
.confirm:hover {
  color: rgb(var(--system-green));
}
.history label {
  padding-right: 1em;
}
.action-line {
  margin: 0;
}
.plan-name {
  padding: 0 6px;
}
.plan-directory {
  opacity: 0.5;
  transition: opacity 0.2s;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
}
.directory-icon {
  margin: 0 0.5em;
}
.remove-plan {
  margin-right: 4px;
  &:hover {
    color: rgb(var(--system-red));
  }
}
</style>
