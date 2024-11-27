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

const { TerminalBlock, VisualIcon } = commas.ui.vueAssets

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
  const teletypes = siblings.filter(item => !item.pane)
  if (teletypes.length === 1) return teletypes[0]
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
  <TerminalBlock :tab="tab" class="file-editor-pane">
    <FileExplorer v-model="directory">
      <button v-if="isConnected" type="button" data-commas @click="send">
        <VisualIcon name="lucide-arrow-right" />
      </button>
    </FileExplorer>
  </TerminalBlock>
</template>

<style lang="scss" scoped>
@use '@commas/api/scss/_partials';

.file-editor-pane {
  padding: 0 8px 8px;
  @include partials.scroll-container(8px);
}
.send {
  color: rgb(var(--system-accent));
  opacity: 1;
}
</style>
