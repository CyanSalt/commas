<script lang="ts" setup>
import '@xterm/xterm/css/xterm.css'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { stripVTControlCharacters } from 'node:util'
import { webUtils } from 'electron'
import fuzzaldrin from 'fuzzaldrin-plus'
import { quote } from 'shell-quote'
import { onBeforeUpdate } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import type { CommandCompletion, TerminalTab } from '@commas/types/terminal'
import { useLinkModifiers, useTerminalElement } from '../compositions/terminal'
import { createContextMenu, openContextMenu } from '../utils/frame'
import { escapeHTML } from '../utils/helper'
import TerminalBlock from './TerminalBlock.vue'
import VisualIcon from './basic/VisualIcon.vue'

const { tab } = defineProps<{
  tab: TerminalTab,
}>()

const element = $ref<HTMLElement>()
const stickyElement = $ref<HTMLElement>()

const {
  linkModifier,
} = $(useLinkModifiers())

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
    const paths = Array.from(files).map(file => webUtils.getPathForFile(file))
    tab.xterm.paste(quote(paths))
  } else {
    const data = dataTransfer.getData('text')
    tab.xterm.paste(data)
  }
}

function openEditingMenu(event: MouseEvent) {
  const { definitionItems, editingItems } = createContextMenu()
  openContextMenu([
    definitionItems,
    editingItems,
    {
      label: 'Clear#!menu.clear',
      accelerator: 'CmdOrCtrl+K',
      command: 'clear-terminal',
    },
  ], event)
}

let cell = $ref<{ width: number, height: number }>()

const variables = $computed(() => {
  if (!cell) return {}
  return {
    '--cell-width': `${cell.width}px`,
    '--cell-height': `${cell.height}px`,
  }
})

useTerminalElement(
  $$(element),
  () => tab.xterm,
  () => tab.addons,
  xterm => {
    cell = xterm['_core']._renderService.dimensions.css.cell
    tab.state.open.resolve()
  },
)

useTerminalElement(
  $$(stickyElement),
  () => tab.stickyXterm!,
  () => tab.stickyAddons!,
)

function highlight(value: string, query: string) {
  const text = stripVTControlCharacters(value)
  return query ? fuzzaldrin.wrap(escapeHTML(text), escapeHTML(query)) : text
}

function suffix(value: string, prefix: string) {
  const text = stripVTControlCharacters(value)
  return text.startsWith(prefix) ? text.slice(prefix.length) : '...'
}

const renderableCompletion = $computed(() => {
  return tab.addons.shellIntegration?.renderableCompletion
})

const renderableStickyCommand = $computed(() => {
  return tab.addons.shellIntegration?.renderableStickyCommand
})

const selectedCompletion = $computed(() => {
  if (!renderableCompletion) return undefined
  return renderableCompletion.items[renderableCompletion.index]
})

const stickyVariables = $computed(() => {
  return {
    '--sticky-row-span': renderableStickyCommand?.rows ?? 0,
  }
})

function isPassthrough(item: CommandCompletion) {
  return !item.state && item.value === item.query
}

function getCompletionIcon(item: CommandCompletion) {
  if (isPassthrough(item)) return 'lucide-corner-down-left'
  switch (item.type) {
    case 'history':
      return 'lucide-clock'
    case 'file':
      return 'lucide-file'
    case 'directory':
      return 'lucide-folder-closed'
    case 'recommendation':
      return 'lucide-lightbulb'
    case 'third-party':
      return 'lucide-sparkles'
    case 'command':
      return 'lucide-terminal'
    default:
      return 'lucide-ellipsis'
  }
}

function selectCompletion(event: MouseEvent, item: CommandCompletion) {
  const index = renderableCompletion!.items
    .findIndex(completion => completion.key === item.key)
  if (index === -1) return
  if (linkModifier) {
    tab.addons.shellIntegration!.selectCompletion(index)
  } else {
    tab.addons.shellIntegration!.applyCompletion(index)
  }
  tab.xterm.focus()
}

onBeforeUpdate(() => {
  renderableCompletion?.mounted.clear()
})

function mountCompletion(el: HTMLElement, item: CommandCompletion) {
  if (!renderableCompletion!.mounted.has(item.value)) {
    renderableCompletion!.mounted.set(item.value, el)
  }
}

function scrollToStickyCommand() {
  tab.addons.shellIntegration!.scrollToStickyCommand()
}
</script>

<template>
  <TerminalBlock
    :tab="tab"
    :class="['terminal-teletype', {
      'has-shell-integration': tab.addons.shellIntegration,
      'is-link-active': linkModifier,
    }]"
    :style="variables"
    @contextmenu="openEditingMenu"
    @dragover.stop.prevent="dragFileOver"
    @drop.stop.prevent="dropFile"
  >
    <div ref="element" class="terminal-content"></div>
    <div
      v-if="tab.stickyXterm"
      v-show="renderableStickyCommand?.rows"
      ref="stickyElement"
      class="terminal-content is-sticky"
      :style="stickyVariables"
      @focusin="scrollToStickyCommand"
    ></div>
    <Teleport
      v-if="renderableCompletion?.element"
      :to="renderableCompletion.element"
    >
      <RecycleScroller
        :items="renderableCompletion.items"
        :item-size="cell!.height"
        key-field="key"
        :class="['terminal-completion-wrapper', { 'is-loading': renderableCompletion.loading }]"
        list-tag="ul"
        list-class="terminal-completion-list"
        item-tag="li"
        item-class="terminal-completion-item-wrapper"
      >
        <template #default="{ item }: { item: CommandCompletion }">
          <span
            :ref="(el: HTMLDivElement) => mountCompletion(el, item)"
            :class="[
              'terminal-completion-item',
              item.type ?? 'default',
              { 'is-passthrough': isPassthrough(item) },
              { 'is-active': item.key === selectedCompletion?.key },
            ]"
            @click.stop.prevent="selectCompletion($event, item)"
          >
            <VisualIcon :name="getCompletionIcon(item)" class="completion-item-icon" />
            <span
              v-if="item.state === 'loading'"
              class="completion-item-label"
            >
              <span class="completion-item-loader"></span>
            </span>
            <span
              v-else
              :class="['completion-item-label', { 'is-pending': item.state === 'pending' }]"
            >
              <span
                v-if="item.value"
                class="completion-item-value"
                v-html="highlight(item.value, item.query)"
              ></span>
              <span v-if="item.label" class="completion-item-suffix">{{ suffix(item.label, item.value) }}</span>
            </span>
          </span>
        </template>
        <template #after>
          <div class="terminal-completion-desc">{{ selectedCompletion?.description ?? '' }}</div>
        </template>
      </RecycleScroller>
    </Teleport>
  </TerminalBlock>
</template>

<style lang="scss" scoped>
@use 'sass:math';
@use '../assets/_partials';

.terminal-teletype {
  --integration-width: 16px;
  --overview-width: 16px;
  :deep(.terminal-container) {
    display: flex;
  }
}
.terminal-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  :deep(.xterm) {
    padding-right: var(--overview-width);
  }
  .terminal-teletype.has-shell-integration & :deep(.xterm) {
    padding-left: var(--integration-width);
  }
  &.is-sticky {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: calc(var(--cell-height) * var(--sticky-row-span) + 8px);
    background: rgb(var(--theme-background));
    box-shadow: var(--design-card-shadow);
    transition: opacity 0.2s;
    &:hover {
      opacity: 0.5;
    }
    :deep(.xterm) {
      padding-bottom: 0;
    }
  }
  :deep(.xterm-cursor-pointer) {
    cursor: text;
  }
  .terminal-teletype.is-link-active & :deep(.xterm-cursor-pointer) {
    cursor: pointer;
  }
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
  --command-mark-padding: 2px;
  width: calc(var(--integration-width) - var(--command-mark-padding) * 2) !important;
  margin-left: calc(var(--command-mark-padding) - var(--integration-width));
  border-radius: 4px;
  cursor: default;
  &.is-interactive {
    transition: background 0.2s;
    cursor: pointer;
    &:hover {
      background: var(--design-highlight-background);
    }
  }
  &::before {
    content: '';
    display: block;
    width: 6px !important;
    height: 6px !important;
    margin-top: calc(var(--cell-height) / 2 - 3px);
    margin-left: calc(var(--integration-width) / 2 - var(--command-mark-padding) - 3px);
    background: rgb(var(--color) / var(--opacity));
    border-radius: 50%;
  }
  &.is-stroked::before {
    background: rgb(var(--theme-background) / var(--opacity));
    box-shadow: 0 0 0 1px rgb(var(--color)), 0 0 0 1px rgb(var(--color)) inset;
  }
}
:global(.xterm-screen .xterm-decoration-container .xterm-decoration.terminal-command-mark) {
  z-index: 10;
}
:deep(.terminal-highlight-block) {
  margin-left: calc(#{0px - math.div(4px, 2)} - var(--integration-width) / 2);
  padding-left: calc(#{0px - math.div(4px, 2)} + var(--integration-width) / 2);
  border-left: 4px solid rgb(var(--color));
  background: rgb(var(--color) / 20%);
  cursor: default;
}
:deep(.terminal-completion) {
  max-height: calc(var(--cell-height) * var(--row-span) + 8px); // --scrollbar-size
  margin-left: calc(var(--column) * var(--cell-width));
  overflow: hidden;
  background: color-mix(in oklab, rgb(var(--theme-background)) 95%, white);
  border-radius: 6px;
  box-shadow: 0 0 1em 0 rgb(0 0 0 / 25%);
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
  display: flex;
  height: 100%;
  @include partials.scroll-container(8px, $transition: opacity 0.2s);
  &.is-loading {
    opacity: 0.5;
    pointer-events: none;
  }
  :deep(.vue-recycle-scroller__slot) {
    position: sticky;
    top: 0;
    flex: 1;
    min-width: 0;
    &:has(.terminal-completion-desc:empty) {
      display: none;
    }
  }
}
:deep(.terminal-completion-list) {
  flex: 1;
  min-width: 0;
  margin: 0;
  padding: 0;
}
.terminal-completion-item {
  display: flex;
  gap: 0.375ch;
  align-items: center;
  height: var(--cell-height);
  padding: 0 0.375ch;
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
  font-size: 12px;
  opacity: 0.75;
  .terminal-completion-item.history & {
    color: rgb(var(--theme-yellow));
  }
  .terminal-completion-item.file &,
  .terminal-completion-item.directory & {
    color: rgb(var(--theme-cyan));
  }
  .terminal-completion-item.recommendation &,
  .terminal-completion-item.third-party & {
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
  display: flex;
  flex: 1;
  min-width: 0;
  white-space: pre;
  text-overflow: ellipsis;
  overflow: hidden;
}
.completion-item-suffix {
  flex: 1;
  min-width: 0;
  color: rgb(var(--theme-foreground) / 50%);
  font-style: italic;
  font-size: 12px;
}
@keyframes loader-switch {
  0% {
    background: var(--loader-color);
    box-shadow: 2em 0 var(--loader-color), -2em 0 var(--loader-active-color);
  }
  33% {
    background: var(--loader-active-color);
    box-shadow: 2em 0 var(--loader-color), -2em 0 var(--loader-color);
  }
  66% {
    background: var(--loader-color);
    box-shadow: 2em 0 var(--loader-active-color), -2em 0 var(--loader-color);
  }
  100% {
    background: var(--loader-color);
    box-shadow: 2em 0 var(--loader-color), -2em 0 var(--loader-active-color);
  }
}
.completion-item-loader {
  --loader-color: rgb(var(--theme-foreground) / 25%);
  --loader-active-color: rgb(var(--theme-foreground) / 50%);
  display: block;
  width: 1em;
  height: 1em;
  margin: 0 2em;
  font-size: 4px;
  border-radius: 1em;
  animation: loader-switch 1s infinite linear;
}
.terminal-completion-desc {
  padding: 0 0.375ch;
  color: rgb(var(--theme-foreground) / 50%);
  font-style: italic;
  font-size: 12px;
  white-space: pre-wrap;
  overflow: hidden;
  word-wrap: break-word;
}
</style>
