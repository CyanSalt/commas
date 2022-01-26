<script lang="ts" setup>
import 'xterm/css/xterm.css'
import { quote } from 'shell-quote'
import { onActivated, onMounted } from 'vue'
import type { PropType } from 'vue'
import type { TerminalTab } from '../../typings/terminal'
import { mountTerminalTab, writeTerminalTab } from '../hooks/terminal'
import { openContextMenu } from '../utils/frame'

const props = defineProps({
  tab: {
    type: Object as PropType<TerminalTab>,
    required: true,
  },
})

const terminal = $ref<HTMLElement>()

function dragFileOver(event: DragEvent) {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'link'
  }
}

function dropFile(event: DragEvent) {
  const files = event.dataTransfer?.files
  if (!files || !files.length) return
  const paths = Array.from(files).map(({ path }) => path)
  writeTerminalTab(props.tab, quote(paths))
}

function openEditingMenu(event: MouseEvent) {
  openContextMenu([
    {
      label: 'Copy#!menu.copy',
      accelerator: 'CmdOrCtrl+C',
      role: 'copy',
    },
    {
      label: 'Paste#!menu.paste',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste',
    },
    {
      type: 'separator',
    },
    {
      label: 'Clear#!menu.clear',
      accelerator: 'CmdOrCtrl+K',
      command: 'clear-terminal',
    },
  ], event)
}

onMounted(() => {
  mountTerminalTab(props.tab, terminal)
})

onActivated(() => {
  const xterm = props.tab.xterm
  if (xterm['_core'].viewport) {
    xterm['_core'].viewport.syncScrollArea()
  }
  xterm.scrollToBottom()
  xterm.focus()
})
</script>

<template>
  <article
    class="terminal-teletype"
    @contextmenu="openEditingMenu"
    @dragover.prevent="dragFileOver"
    @drop.prevent="dropFile"
  >
    <div ref="terminal" class="terminal-content"></div>
  </article>
</template>

<style lang="scss" scoped>
@use '../assets/_partials';

.terminal-teletype {
  position: relative;
  display: flex;
  flex: auto;
  height: 0;
}
.terminal-content {
  flex: auto;
  /* issue@xterm: fix bug of `xterm.fit()` */
  box-sizing: border-box;
  width: 0;
  padding: 4px 8px;
  :deep(.xterm-viewport) {
    @include partials.scroll-container;
    background-color: transparent !important;
  }
}
</style>
