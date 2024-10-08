<script lang="ts" setup>
import * as path from 'node:path'
import type { TerminalTab } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'
import { quote } from 'shell-quote'
import FileExplorer from './FileExplorer.vue'
import { getDirectoryProcess } from './compositions'

const { tab } = defineProps<{
  tab: TerminalTab,
}>()

const { TerminalPane, VisualIcon } = commas.ui.vueAssets

let directory = $computed({
  get: () => tab.cwd,
  set: value => {
    const target = getDirectoryProcess(value)
    Object.assign(tab, {
      process: target,
      cwd: target,
    })
  },
})

const target = $computed(() => {
  if (!tab.group) return undefined
  const siblings = commas.workspace.getTerminalTabsByGroup(tab.group)
    .filter(item => item !== tab)
  if (siblings.length === 1) return siblings[0]
})

const isConnected = $computed(() => {
  if (!target) return false
  return !target.pane && target.idle
})

function send() {
  if (!target) return
  const isPowerShell = process.platform === 'win32'
    && (!target.shell || path.basename(target.shell) === 'powershell.exe')
  const command = isPowerShell
    ? `Set-Location -Path ${quote([directory])}`
    : `cd ${quote([directory])}`
  commas.workspace.executeTerminalTab(target, command)
  setTimeout(() => {
    commas.workspace.activateTerminalTab(target)
  })
}
</script>

<template>
  <TerminalPane :tab="tab" class="file-editor-pane">
    <FileExplorer v-model="directory">
      <span v-if="isConnected" class="link form-action send" @click="send">
        <VisualIcon name="lucide-arrow-right" />
      </span>
    </FileExplorer>
  </TerminalPane>
</template>

<style lang="scss" scoped>
.file-editor-pane {
  padding: 8px;
}
.send {
  color: rgb(var(--system-accent));
  opacity: 1;
}
</style>
