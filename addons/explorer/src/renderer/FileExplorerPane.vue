<script lang="ts" setup>
import type { TerminalTab } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'
import { watch } from 'vue'
import FileExplorer from './FileExplorer.vue'
import { getDirectoryProcess } from './compositions'

const { tab } = defineProps<{
  tab: TerminalTab,
}>()

const { TerminalBlock } = commas.ui.vueAssets

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

watch($$(directory), () => {
  if (!target || target.pane || !target.idle) return
  const command = commas.workspace.getTerminalExecutorCommand({
    directory,
    shell: target.shell,
  })
  commas.workspace.executeTerminalTab(target, command, true)
})
</script>

<template>
  <TerminalBlock :tab="tab" class="file-editor-pane">
    <FileExplorer v-model="directory" />
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
