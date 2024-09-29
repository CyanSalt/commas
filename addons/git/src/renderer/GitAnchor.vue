<script lang="ts" setup>
import { ipcRenderer } from '@commas/electron-ipc'
import * as commas from 'commas:api/renderer'
import { watchEffect } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const { VisualIcon } = commas.ui.vueAssets

const terminal = $(commas.workspace.useCurrentTerminal())

const directory = $computed(() => {
  if (!terminal) return ''
  return terminal.cwd
})

let branch = $ref('')
let remoteURL = $ref('')

async function updateBranch() {
  if (directory) {
    branch = await ipcRenderer.invoke('get-git-branch', directory)
  } else {
    branch = ''
  }
}

watchEffect(() => {
  branch = ''
  updateBranch()
})

async function updateRemoteURL() {
  if (directory) {
    remoteURL = await ipcRenderer.invoke('get-git-remote-url', directory)
  } else {
    remoteURL = ''
  }
}

watchEffect(() => {
  remoteURL = ''
  updateRemoteURL()
})

const remoteExternalURL = $computed(() => {
  if (!remoteURL) return ''
  let targetURL = remoteURL
  if (targetURL.endsWith('.git')) {
    targetURL = targetURL.slice(0, -4)
  }
  const matches = targetURL.match(/^git@(.+):(.+)$/)
  if (!matches) return targetURL
  return `https://${matches[1]}/${matches[2]}${branch ? `/tree/${branch}` : ''}`
})

function openGitMenu(event: MouseEvent) {
  if (!remoteExternalURL) return
  commas.ui.openContextMenu([
    {
      label: 'Open Remote URL#!launcher.5',
      command: 'global-main:open-url',
      args: [remoteExternalURL],
    },
  ], event)
}
</script>

<template>
  <div
    v-if="branch"
    v-bind="$attrs"
    class="git-branch-anchor"
    @contextmenu="openGitMenu"
  >
    <VisualIcon name="lucide-git-branch" />
    <span class="branch-name">{{ branch }}</span>
  </div>
</template>

<style lang="scss" scoped>
.git-branch-anchor {
  gap: 4px;
  align-items: center;
}
.branch-name {
  font-size: 12px;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
