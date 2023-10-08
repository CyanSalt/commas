<script lang="ts" setup>
import 'xterm/css/xterm.css'
import fuzzaldrin from 'fuzzaldrin-plus'
import { quote } from 'shell-quote'
import { watchEffect } from 'vue'
import type { CommandCompletion, TerminalTab } from '../../typings/terminal'
import { isMatchLinkModifier, writeTerminalTab } from '../compositions/terminal'
import { openContextMenu } from '../utils/frame'
import { escapeHTML } from '../utils/helper'
import TerminalBlock from './TerminalBlock.vue'
import VisualIcon from './basic/VisualIcon.vue'

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
  if (xterm.element) return
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

function highlightLabel(label: string, query: string) {
  return query ? fuzzaldrin.wrap(escapeHTML(label), escapeHTML(query)) : label
}

function getCompletionIcon(item: CommandCompletion) {
  if (item.value === item.query) return 'lucide-corner-down-left'
  switch (item.type) {
    case 'history':
      return 'lucide-clock'
    case 'file':
      return 'lucide-file'
    case 'directory':
      return 'lucide-folder-open'
    case 'recommendation':
      return 'lucide-lightbulb'
    case 'command':
      return 'lucide-terminal'
    default:
      return 'lucide-more-horizontal'
  }
}

function selectCompletion(event: MouseEvent) {
  const item = tab.addons.shellIntegration!.getCompletionElement(event.target)
  if (item) {
    event.stopPropagation()
    event.preventDefault()
    if (isMatchLinkModifier(event)) {
      tab.addons.shellIntegration!.selectCompletionElement(item)
    } else {
      tab.addons.shellIntegration!.applyCompletionElement(item)
    }
    tab.xterm.focus()
  }
}
</script>

<template>
  <TerminalBlock
    :tab="tab"
    class="terminal-teletype"
    data-shell-integration="container"
    @contextmenu="openEditingMenu"
    @dragover.prevent="dragFileOver"
    @drop.prevent="dropFile"
    @click="selectCompletion"
  >
    <div ref="element" class="terminal-content"></div>
    <div v-if="tab.completions" data-shell-integration="completion-source">
      <div class="terminal-completion-wrapper">
        <ul class="terminal-completion-list">
          <li
            v-for="(item, index) in tab.completions"
            :key="index"
            :class="[
              'terminal-completion-item',
              item.type ?? 'default',
              { 'is-passthrough': item.value === item.query },
              { 'is-active': !index },
            ]"
            :data-value="item.value"
            :data-desc="item.description ?? ''"
            :data-back="item.query.length"
          >
            <VisualIcon :name="getCompletionIcon(item)" class="completion-item-icon" />
            <span class="completion-item-label" v-html="highlightLabel(item.value, item.query)"></span>
          </li>
        </ul>
        <div class="terminal-completion-desc">{{ tab.completions[0]?.description ?? '' }}</div>
      </div>
    </div>
  </TerminalBlock>
</template>

<style lang="scss" scoped>
@use '../assets/_partials';

.terminal-teletype {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
}
.terminal-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  :deep(.xterm) {
    padding: 8px 12px;
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
[data-shell-integration='completion-source'] {
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
  background: rgb(var(--theme-magenta) / 50%);
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
}
:deep(.terminal-highlight-block) {
  z-index: 0 !important;
  margin-left: calc(0px - var(--cell-width));
  border-left: calc(var(--cell-width) / 2) solid rgb(var(--color));
  background: rgb(var(--color) / 20%);
}
:deep(.terminal-completion) {
  max-height: calc(var(--cell-height) * var(--row-span));
  margin-left: calc(var(--column) * var(--cell-width));
  border: 1px solid rgb(127 127 127 / 50%);
  overflow: hidden;
  background: rgb(var(--theme-background) / var(--theme-opacity));
  border-radius: 4px;
  box-shadow: 0 0 1em 0 rgb(0 0 0 / 25%);
  backdrop-filter: var(--vibrancy-filter);
  // TODO: This may slightly slow down, but is friendlier visually
  transition: transform 50ms, margin-left 50ms;
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
  .app.is-opaque & {
    background: rgb(var(--theme-background));
  }
}
.terminal-completion-wrapper {
  @include partials.scroll-container(8px);
  display: flex;
  height: 100%;
}
.terminal-completion-list {
  flex: 1;
  min-width: 0;
  margin: 0;
  padding: 0;
}
.terminal-completion-item {
  display: flex;
  align-items: center;
  padding: 0 0.25ch;
  cursor: pointer;
  &:hover, &.is-active {
    background: var(--design-highlight-background);
  }
  :deep(strong) {
    color: rgb(var(--theme-blue));
  }
}
.completion-item-icon {
  flex: none;
  margin-right: 0.25ch;
  font-size: 12px;
  opacity: 0.75;
  .terminal-completion-item.history & {
    color: rgb(var(--theme-yellow));
  }
  .terminal-completion-item.file &,
  .terminal-completion-item.directory & {
    color: rgb(var(--theme-cyan));
  }
  .terminal-completion-item.recommendation & {
    color: rgb(var(--theme-green));
  }
  .terminal-completion-item.command & {
    color: rgb(var(--theme-magenta));
  }
  .terminal-completion-item.is-passthrough & {
    color: rgb(var(--theme-red));
  }
}
.completion-item-label {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.terminal-completion-desc {
  position: sticky;
  top: 0;
  flex: 1;
  padding: 0 0.25ch;
  color: rgb(var(--theme-foreground) / 50%);
  font-style: italic;
  font-size: 12px;
  white-space: pre-wrap;
  overflow: hidden;
  word-wrap: break-word;
  &:empty {
    display: none;
  }
}
</style>
