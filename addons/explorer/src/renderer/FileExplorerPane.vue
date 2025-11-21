<script lang="ts" setup>
import type { TerminalTab } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'
import { watch } from 'vue'
import FileExplorer from './FileExplorer.vue'
import { getDirectoryProcess } from './composables'

const { tab } = defineProps<{
  tab: TerminalTab,
}>()

const { TerminalBlock } = commas.ui.vueAssets

let directory = $computed({
  get: () => tab.cwd,
  set: value => {
    const target = getDirectoryProcess(value)
    // eslint-disable-next-line vue/no-mutating-props
    Object.assign(tab, {
      process: target,
      cwd: target,
    })
  },
})
const terminal = $(commas.workspace.useCurrentTerminal())

const isFocused = $computed(() => {
  return terminal === tab
})

const target = $computed(() => {
  if (!tab.group) return undefined
  const siblings = commas.workspace.getTerminalTabsByGroup(tab.group)
    .filter(item => item !== tab)
  const teletypes = siblings.filter(item => !item.pane)
  if (teletypes.length === 1) return teletypes[0] as TerminalTab & { pane: undefined }
})

const targetDirectory = $computed(() => {
  return target ? target.cwd : undefined
})

watch($$(targetDirectory), value => {
  if (value && directory !== getDirectoryProcess(value)) {
    directory = value as string
  }
})

watch($$(directory), value => {
  if (!target || !target.idle) return
  const command = commas.workspace.getTerminalExecutorCommand({
    directory: value,
    shell: target.shell,
  })
  commas.workspace.executeTerminalTab(target, command, { restart: true })
})

function back(event: KeyboardEvent) {
  if (target) {
    event.preventDefault()
    commas.workspace.activateTerminalTab(target)
  }
}
</script>

<template>
  <TerminalBlock :tab="tab" class="file-editor-pane">
    <FileExplorer
      v-model="directory"
      :focused="isFocused"
      @keyup.esc="back"
    />
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
