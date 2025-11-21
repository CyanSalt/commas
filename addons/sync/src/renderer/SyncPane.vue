<script lang="ts" setup>
import { ipcRenderer } from '@commas/electron-ipc'
import type { TerminalTab } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'
import { toRaw, toRef } from 'vue'
import type { SyncPlan } from '../types/sync'
import { useSyncData } from './composables'

defineProps<{
  tab: TerminalTab,
}>()

const { vI18n, VisualIcon, ObjectEditor, TerminalPane } = commas.ui.vueAssets

const settings = commas.remote.useSettings()
let syncData = $(useSyncData())
const omitHome = commas.helper.omitHome

const defaultPlanGist = $computed(() => {
  return settings['sync.plan.gist']
})

let extraPlans = $(commas.helper.deepRef(toRef(settings, 'sync.plan.extraPlans')))

let isAddingToken = $ref(false)
let stagingToken = $ref('')

function addToken() {
  isAddingToken = true
}

function openGitHubTokenSettings() {
  const url = new URL('https://github.com/settings/tokens/new')
  url.searchParams.set('description', 'Commas Sync')
  url.searchParams.set('scopes', 'gist')
  commas.remote.openURLExternally(url.href)
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
  commas.remote.openURLExternally(`https://gist.github.com/${gist}`)
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

function openSyncPlanDirectory(event: MouseEvent, plan: SyncPlan) {
  commas.ui.openFolder(plan.directory, event)
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
    <h2 v-i18n data-commas>Sync#!sync.1</h2>
    <form data-commas>
      <a
        v-if="syncData.encryption"
        v-i18n
        href=""
        data-commas
        @click.prevent="removeToken"
      >Remove GitHub Token#!sync.4</a>
      <div v-else-if="isAddingToken" data-commas>
        <input
          v-model="stagingToken"
          v-i18n:placeholder
          data-commas
        >
        <button type="button" data-commas @click="openGitHubTokenSettings">
          <VisualIcon name="lucide-github" />
        </button>
        <button type="button" data-commas class="confirm" @click="confirmToken">
          <VisualIcon name="lucide-check" />
        </button>
      </div>
      <a v-else v-i18n href="" data-commas @click.prevent="addToken">Add GitHub Token#!sync.3</a>
      <div v-if="syncData.encryption" data-commas>
        <button type="button" data-commas @click="uploadDefaultSyncPlan">
          <VisualIcon name="lucide-cloud-upload" />
        </button>
        <button v-if="defaultPlanGist" type="button" data-commas @click="downloadDefaultSyncPlan">
          <VisualIcon name="lucide-cloud-download" />
        </button>
        <button
          v-if="defaultPlanGist.includes('/')"
          type="button"
          data-commas
          @click="openSyncPlanGist(defaultPlanGist)"
        >
          <VisualIcon name="lucide-github" />
        </button>
      </div>
      <div class="history">
        <label v-i18n>Recently synced at:#!sync.5</label>
        <span>{{ formatTime(syncData.updatedAt) }}</span>
      </div>
    </form>
    <h2 v-i18n data-commas>Plans#!sync.8</h2>
    <form data-commas>
      <div v-for="(plan, index) in extraPlans" :key="index" class="extra-plan">
        <nav data-commas>
          <button type="button" data-commas class="remove-plan" @click="removeSyncPlan(index)">
            <VisualIcon name="lucide-package-minus" />
          </button>
          <input v-model.lazy="plan.name" data-commas-alt class="plan-name">
          <span class="plan-directory" @click="openSyncPlanDirectory($event, plan)">
            <VisualIcon name="lucide-folder-output" class="directory-icon" />
            <span class="directory-path">{{ omitHome(plan.directory) }}</span>
          </span>
        </nav>
        <ObjectEditor v-model="plan.files" lazy>
          <template #extra>
            <button type="button" data-commas @click="uploadSyncPlan(plan)">
              <VisualIcon name="lucide-cloud-upload" />
            </button>
            <button v-if="plan.gist" type="button" data-commas @click="downloadSyncPlan(plan)">
              <VisualIcon name="lucide-cloud-download" />
            </button>
            <button
              v-if="plan.gist.includes('/')"
              type="button"
              data-commas
              @click="openSyncPlanGist(plan.gist)"
            >
              <VisualIcon name="lucide-github" />
            </button>
          </template>
        </ObjectEditor>
      </div>
      <div data-commas class="action-line">
        <button type="button" data-commas @click="addSyncPlan">
          <VisualIcon name="lucide-package-plus" />
        </button>
      </div>
    </form>
  </TerminalPane>
</template>

<style lang="scss" scoped>
.confirm:hover {
  color: rgb(var(--system-green));
}
.history label {
  padding-right: 1em;
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
  &:hover {
    color: rgb(var(--system-red));
  }
}
</style>
