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

const element = $ref<HTMLElement | undefined>()

function dragFileOver(event: DragEvent) {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'link'
  }
}

function dropFile(event: DragEvent) {
  const dataTransfer = event.dataTransfer
  if (!dataTransfer) return
  const files = dataTransfer.files
  if (files.length) {
    const paths = Array.from(files).map(({ path }) => path)
    writeTerminalTab(tab, quote(paths))
  } else {
    const data = dataTransfer.getData('text')
    writeTerminalTab(tab, data)
  }
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
  const el = element
  if (!el) return
  const xterm = tab.xterm
  xterm.open(el)
  // Add cell size properties
  const cell = xterm['_core']._renderService.dimensions.css.cell
  el.style.setProperty('--cell-width', `${cell.width}px`)
  el.style.setProperty('--cell-height', `${cell.height}px`)
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
    xterm['_core'].viewport.syncScrollArea(true)
  }
})

function applyCompletionItem(item: HTMLElement) {
  if (item.dataset.value) {
    writeTerminalTab(tab, item.dataset.value)
    tab.xterm.focus()
  }
}

function selectCompletion(event: MouseEvent) {
  const item = event.target instanceof HTMLElement
    ? event.target.closest<HTMLElement>('.terminal-completion-item')
    : undefined
  if (item) {
    event.stopPropagation()
    event.preventDefault()
    applyCompletionItem(item)
  }
}

function startCompletion(event: KeyboardEvent) {
  const item = event.target instanceof HTMLElement
    && event.target.matches('.terminal-completion-item')
    ? event.target
    : undefined
  if (item) {
    event.stopPropagation()
    event.preventDefault()
    switch (event.key) {
      case 'Enter':
      case 'Tab':
        applyCompletionItem(item)
        break
      case 'Escape':
        item.blur()
        break
      case 'ArrowUp': {
        const previousSibling = item.previousElementSibling
        if (previousSibling) {
          (previousSibling as HTMLElement).focus()
        } else {
          const parent = item.parentElement!;
          (parent.children[parent.childElementCount - 1] as HTMLElement).focus()
        }
        break
      }
      case 'ArrowDown': {
        const nextSibling = item.nextElementSibling
        if (nextSibling) {
          (nextSibling as HTMLElement).focus()
        } else {
          const parent = item.parentElement!;
          (parent.children[0] as HTMLElement).focus()
        }
        break
      }
    }
  }
}
</script>

<template>
  <div
    class="terminal-teletype"
    @contextmenu="openEditingMenu"
    @dragover.prevent="dragFileOver"
    @drop.prevent="dropFile"
    @click="selectCompletion"
    @keydown="startCompletion"
  >
    <div ref="element" class="terminal-content"></div>
    <div v-if="tab.completions" id="terminal-completion-source">
      <div
        v-for="(item, index) in tab.completions"
        :key="index"
        class="terminal-completion-item"
        tabindex="0"
        :data-value="item.value"
      >
        <div class="terminal-completion-item-label" v-html="item.label"></div>
        <div v-if="item.description" class="terminal-completion-item-desc">{{ item.description }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../assets/_partials';

.terminal-teletype {
  position: relative;
  display: flex;
  flex: 1;
  min-width: 0;
}
.terminal-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  :deep(.xterm) {
    padding: 4px 12px;
  }
  :deep(.xterm-viewport) {
    @include partials.scroll-container;
    z-index: 1;
    background-color: transparent !important;
    /* Make decoration interactive */
    pointer-events: none;
  }
  /* issue@xterm: pointer behavior */
  :deep(.xterm-screen) {
    z-index: 0;
  }
}
#terminal-completion-source {
  display: none;
}
@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
:deep(.terminal-marker-highlight-line) {
  background: rgb(var(--theme-magenta) / 0.5);
  animation: fade-out 1s;
}
:deep(.terminal-command-mark) {
  margin-left: calc(0px - var(--cell-width));
  &::before {
    content: '';
    display: block;
    width: 6px !important;
    height: 6px !important;
    margin-top: calc(var(--cell-height) / 2 - 3px);
    background: rgb(var(--color) / var(--opacity));
    border-radius: 50%;
  }
  &.is-interactive {
    cursor: pointer;
  }
}
:deep(.terminal-highlight-block) {
  box-sizing: border-box;
  border: 1px solid rgb(var(--color));
  background: rgb(var(--color) / 0.1);
  border-radius: 4px;
}
:deep(.terminal-completion) {
  margin-left: calc(var(--column) * var(--cell-width));
  border: 1px solid rgb(var(--theme-foreground) / 0.5);
  overflow: auto;
  background: rgb(var(--theme-background));
  border-radius: 2px;
  &.is-right {
    transform: translateX(-100%);
  }
  &.is-top {
    transform: translateY(-100%);
    &.is-right {
      transform: translateX(-100%) translateY(-100%);
    }
  }
  &.is-bottom {
    margin-top: var(--cell-height);
  }
}
:deep(.terminal-completion-item) {
  display: flex;
  gap: var(--cell-width);
  padding: 0 0.25ch;
  white-space: nowrap;
  cursor: pointer;
  &:hover, &:focus {
    background: var(--design-card-background);
  }
  &:focus {
    outline: none;
  }
}
:deep(.terminal-completion-item-label) {
  flex: none;
  flex: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  strong {
    color: rgb(var(--theme-blue));
  }
}
:deep(.terminal-completion-item-desc) {
  flex: 1;
  color: rgb(var(--theme-foreground) / 0.5);
  font-style: italic;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
