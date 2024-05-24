<script lang="ts" setup>
import '@xterm/xterm/css/xterm.css'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import fuzzaldrin from 'fuzzaldrin-plus'
import { quote } from 'shell-quote'
import { onBeforeUpdate } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import type { CommandCompletion, TerminalTab } from '../../typings/terminal'
import { isMatchLinkModifier, useTerminalElement } from '../compositions/terminal'
import { createContextMenu, openContextMenu } from '../utils/frame'
import { escapeHTML } from '../utils/helper'
import TerminalBlock from './TerminalBlock.vue'
import VisualIcon from './basic/VisualIcon.vue'

const { tab } = defineProps<{
  tab: TerminalTab,
}>()

const element = $ref<HTMLElement | undefined>()
const stickyElement = $ref<HTMLElement | undefined>()

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
    tab.xterm.paste(quote(paths))
  } else {
    const data = dataTransfer.getData('text')
    tab.xterm.paste(data)
  }
}

function openEditingMenu(event: MouseEvent) {
  const { withSeparator, definitionItems, editingItems } = createContextMenu()
  openContextMenu([
    ...withSeparator(definitionItems, []),
    ...withSeparator(editingItems, []),
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
    tab.deferred.open.resolve()
    xterm.focus()
  },
)

useTerminalElement(
  $$(stickyElement),
  () => tab.stickyXterm!,
  () => tab.stickyAddons!,
)

function highlightLabel(label: string, query: string) {
  return query ? fuzzaldrin.wrap(escapeHTML(label), escapeHTML(query)) : label
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

function selectCompletion(event: MouseEvent, item: CommandCompletion) {
  const index = renderableCompletion!.items
    .findIndex(completion => completion.value === item.value)
  if (index === -1) return
  if (isMatchLinkModifier(event)) {
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
    :class="['terminal-teletype', { 'has-shell-integration': tab.addons.shellIntegration }]"
    :style="variables"
    @contextmenu="openEditingMenu"
    @dragover.prevent="dragFileOver"
    @drop.prevent="dropFile"
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
        key-field="value"
        class="terminal-completion-wrapper"
        list-tag="ul"
        list-class="terminal-completion-list"
        item-tag="li"
        item-class="terminal-completion-item-wrapper"
      >
        <template #default="{ item }">
          <span
            :ref="(el: HTMLDivElement) => mountCompletion(el, item)"
            :class="[
              'terminal-completion-item',
              item.type ?? 'default',
              { 'is-passthrough': item.value === item.query },
              { 'is-active': item.value === selectedCompletion?.value },
            ]"
            @click.stop.prevent="selectCompletion($event, item)"
          >
            <VisualIcon :name="getCompletionIcon(item)" class="completion-item-icon" />
            <span class="completion-item-label" v-html="highlightLabel(item.value, item.query)"></span>
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
    padding: 8px var(--overview-width) 8px 8px;
  }
  .terminal-teletype.has-shell-integration & :deep(.xterm) {
    padding-left: var(--integration-width);
  }
  :deep(.xterm-viewport) {
    @include partials.scroll-container;
    background-color: transparent !important;
  }
  /* issue@xterm: pointer behavior */
  :deep(.xterm-screen) {
    z-index: 0;
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
:deep(.terminal-highlight-block) {
  z-index: 0 !important;
  margin-left: calc(#{0px - math.div(4px, 2)} - var(--integration-width) / 2);
  padding-left: calc(#{0px - math.div(4px, 2)} + var(--integration-width) / 2);
  border-left: 4px solid rgb(var(--color));
  background: rgb(var(--color) / 20%);
  cursor: default;
}
:deep(.terminal-completion) {
  max-height: calc(var(--cell-height) * var(--row-span) + 8px); // --scrollbar-size
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
  align-items: center;
  height: var(--cell-height);
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
  padding: 0 0.25ch;
  color: rgb(var(--theme-foreground) / 50%);
  font-style: italic;
  font-size: 12px;
  white-space: pre-wrap;
  overflow: hidden;
  word-wrap: break-word;
}
</style>
