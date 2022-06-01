<script lang="ts" setup>
import 'xterm/css/xterm.css'
import { quote } from 'shell-quote'
import { onActivated, watchEffect } from 'vue'
import type { TerminalTab } from '../../typings/terminal'
import { writeTerminalTab } from '../compositions/terminal'
import { openContextMenu } from '../utils/frame'

const { tab } = defineProps<{
  tab: TerminalTab,
}>()

const terminal = $ref<HTMLElement | undefined>()

function dragFileOver(event: DragEvent) {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'link'
  }
}

function dropFile(event: DragEvent) {
  const files = event.dataTransfer?.files
  if (!files || !files.length) return
  const paths = Array.from(files).map(({ path }) => path)
  writeTerminalTab(tab, quote(paths))
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

function fit() {
  if (tab.xterm.element?.clientWidth) {
    tab.addons.fit.fit()
  }
}

const observer = new ResizeObserver(fit)

watchEffect((onInvalidate) => {
  const el = terminal
  if (!el) return
  const xterm = tab.xterm
  xterm.open(el)
  tab.deferred.open.resolve()
  xterm.focus()
  observer.observe(el)
  onInvalidate(() => {
    observer.unobserve(el)
  })
})

onActivated(() => {
  const xterm = tab.xterm
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
  flex: 1;
  min-height: 0;
}
.terminal-content {
  flex: 1;
  /* issue@xterm: fix bug of `xterm.fit()` */
  box-sizing: border-box;
  min-width: 0;
  padding: 4px 8px;
  :deep(.xterm-viewport) {
    @include partials.scroll-container;
    background-color: transparent !important;
  }
}
</style>
