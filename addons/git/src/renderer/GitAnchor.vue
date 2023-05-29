<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { ipcRenderer, shell } from 'electron'
import { watchEffect } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const terminal = $(commas.workspace.useCurrentTerminal())

const directory: string = $computed(() => {
  if (!terminal) return ''
  return terminal.cwd
})

let branch: string = $ref('')
let remoteURL: string = $ref('')

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

const remoteExternalURL: string = $computed(() => {
  if (!remoteURL) return ''
  let targetURL = remoteURL
  if (targetURL.endsWith('.git')) {
    targetURL = targetURL.slice(0, -4)
  }
  const matches = targetURL.match(/^git@(.+):(.+)$/)
  if (!matches) return targetURL
  return `https://${matches[1]}/${matches[2]}${branch ? `/tree/${branch}` : ''}`
})

const isGithub = $computed(() => {
  if (!remoteExternalURL) return false
  try {
    const url = new URL(remoteExternalURL)
    return url.host === 'github.com' || url.host.endsWith('.github.com')
  } catch {
    return false
  }
})

function openRemoteURL() {
  if (!remoteExternalURL) return
  shell.openExternal(remoteExternalURL)
}
</script>

<template>
  <div v-if="remoteExternalURL" v-bind="$attrs" class="git-remote-anchor" @click="openRemoteURL">
    <span :class="['ph-bold', isGithub ? 'ph-github-logo' : 'ph-gitlab-logo-simple']"></span>
  </div>
  <div v-if="directory" v-bind="$attrs" class="git-branch-anchor" @click="updateBranch">
    <span class="ph-bold ph-git-branch"></span>
    <span v-if="branch" class="branch-name">{{ branch }}</span>
  </div>
</template>

<style lang="scss" scoped>
.git-branch-anchor {
  display: flex;
}
.branch-name {
  margin-left: 4px;
  font-size: 12px;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
