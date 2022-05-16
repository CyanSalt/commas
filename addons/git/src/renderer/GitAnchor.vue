<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { ipcRenderer } from 'electron'
import { watchEffect } from 'vue'

const terminal = $(commas.workspace.useCurrentTerminal())

let branch = $ref('')

const directory = $computed(() => {
  if (!terminal || terminal.pane) return ''
  return terminal.cwd
})

async function updateBranch() {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
</script>

<template>
  <div v-if="directory" class="git-anchor" @click="updateBranch">
    <span class="feather-icon icon-git-branch"></span>
    <span v-if="branch" class="branch-name">{{ branch }}</span>
  </div>
</template>

<style lang="scss" scoped>
.git-anchor {
  display: flex;
  order: 1;
  box-sizing: border-box;
  margin-right: 0;
  margin-left: 8px;
}
.branch-name {
  margin-left: 4px;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
