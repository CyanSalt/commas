<script lang="ts" setup>
import * as path from 'node:path'
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { reactive, watchEffect } from 'vue'
import type { DraggableElementEventPayload } from '@commas/types/draggable'
import type { MenuItem } from '@commas/types/menu'
import type { TerminalTab } from '@commas/types/terminal'
import * as commas from '../../api/core-renderer'
import { useAsyncComputed } from '../../shared/compositions'
import { useSettings } from '../compositions/settings'
import {
  activateTerminalTab,
  createTerminalTab,
  moveTerminalTab,
  separateTerminalTabGroup,
  splitTerminalTab,
  useCurrentTerminal,
  useTerminalTabGroupSeparating,
  useTerminalTabs,
} from '../compositions/terminal'
import type { DraggableElementData, DraggableTabData } from '../utils/draggable'
import { openContextMenu, withContextMenuSeparator } from '../utils/frame'
import { handleMousePressing } from '../utils/helper'
import { createTerminalTabContextMenu, getShells } from '../utils/terminal'
import TabItem from './TabItem.vue'
import AutoScroll from './basic/AutoScroll.vue'
import DraggableElement from './basic/DraggableElement.vue'
import DropIndicator from './basic/DropIndicator.vue'
import DropTarget from './basic/DropTarget.vue'
import VisualIcon from './basic/VisualIcon.vue'

const lists = commas.proxy.context.getCollection('terminal.ui-side-list')
const shells = $(useAsyncComputed(() => getShells(), []))

const tabs = $(useTerminalTabs())
const terminal = $(useCurrentTerminal())

let width = $ref(176) // 160 + 2 * var(--design-card-gap)

const settings = useSettings()

const position = $computed(() => settings['terminal.view.tabListPosition'])

const isHorizontal = $computed(() => {
  return position === 'top' || position === 'bottom'
})

const profiles = $computed(() => {
  return settings['terminal.shell.extraProfiles']
})

const standaloneTabs = $computed(() => {
  const entries = tabs.map((tab, index) => ({ tab, index }))
  if (isHorizontal) return entries
  return entries.filter(({ tab }) => !tab.character)
})

function selectShell(event: MouseEvent) {
  const profileOptions = profiles.map<MenuItem>(profile => ({
    label: profile.label ?? JSON.stringify(profile),
    command: 'open-tab',
    args: [profile],
  }))
  const shellOptions = shells.map<MenuItem>(shell => ({
    label: path.basename(shell),
    command: 'open-tab',
    args: [{ shell }],
  }))
  if (!profileOptions.length && !shellOptions.length) return
  openContextMenu([
    ...profileOptions,
    ...(profiles.length && shellOptions.length ? [{ type: 'separator' as const }] : []),
    ...shellOptions,
  ], event)
}

function selectDefaultShell(event: MouseEvent) {
  if (process.platform === 'darwin' ? event.metaKey : event.ctrlKey) {
    if (terminal) {
      splitTerminalTab(terminal)
    }
  } else {
    createTerminalTab()
  }
}

function resize(startingEvent: DragEvent) {
  const original = width
  const start = startingEvent.clientX
  const max = document.body.clientWidth / 2
  handleMousePressing({
    onMove(event) {
      const diff = event.clientX - start
      const target = original + (position === 'right' ? -diff : diff)
      width = Math.min(Math.max(target, 120), max)
    },
  })
}

interface DropTargetData extends Record<string | symbol, unknown> {
  index: number,
}

const draggingEdges = reactive(new Map<number, Edge | null>())

let groupSeparatingEnabled = $(useTerminalTabGroupSeparating())
let groupSeparatingActive = $ref(false)

watchEffect(() => {
  if (!groupSeparatingEnabled) {
    groupSeparatingActive = false
  }
})

function handleDragStart(args: DraggableElementEventPayload<DraggableTabData>) {
  const tab = tabs[args.source.data.index]
  groupSeparatingEnabled = Boolean(tab.group)
}

function handleDragStop() {
  groupSeparatingEnabled = false
}

function handleDrag(args: DraggableElementEventPayload<DraggableElementData, DropTargetData>) {
  if (args.source.data.type === 'tab') {
    draggingEdges.set(args.self.data.index, extractClosestEdge(args.self.data))
  }
}

function handleDragLeave(args: DraggableElementEventPayload<DraggableElementData, DropTargetData>) {
  if (args.source.data.type === 'tab') {
    draggingEdges.set(args.self.data.index, null)
  }
}

async function handleDrop(args: DraggableElementEventPayload<DraggableElementData, DropTargetData>) {
  if (args.source.data.type === 'tab') {
    let tab: TerminalTab | undefined
    if (args.source.data.index === -1) {
      if (args.source.data.create) {
        tab = await args.source.data.create()
      }
    } else {
      tab = tabs[args.source.data.index!]
    }
    if (tab) {
      const edge = extractClosestEdge(args.self.data)
      const toEdge = edge === 'top' || edge === 'left'
        ? 'start'
        : (edge === 'bottom' || edge === 'right' ? 'end' : undefined)
      moveTerminalTab(tab, args.self.data.index, toEdge)
    }
    if (args.source.data.dispose) {
      args.source.data.dispose()
    }
    draggingEdges.set(args.self.data.index, null)
  }
}

function handleGroupSeparating(args: DraggableElementEventPayload<DraggableElementData>) {
  if (args.source.data.type === 'tab' && args.source.data.index !== -1) {
    const tab = tabs[args.source.data.index!]
    separateTerminalTabGroup(tab)
    groupSeparatingEnabled = false
  }
}

function openTabItemMenu(event: MouseEvent, tab: TerminalTab) {
  const { updatingItems, deletingItems } = createTerminalTabContextMenu(tab)
  openContextMenu([
    ...withContextMenuSeparator(updatingItems, []),
    ...deletingItems,
  ], event)
}
</script>

<template>
  <nav :class="['tab-list', position, isHorizontal ? 'horizontal' : 'vertical']">
    <AutoScroll v-slot="{ mount: autoScroll }">
      <div :ref="autoScroll" class="list-container" :style="{ width: isHorizontal ? '' : width + 'px' }">
        <div class="list-content">
          <div class="default-list">
            <DraggableElement
              v-for="({ tab, index }) in standaloneTabs"
              :key="tab.pid"
              v-slot="{ mount: draggable }"
              :data="{ type: 'tab', index }"
              @dragstart="handleDragStart"
              @drop="handleDragStop"
            >
              <DropTarget
                v-slot="{ mount: dropTarget }"
                :data="{ index }"
                :allowed-edges="isHorizontal ? ['left', 'right'] : ['top', 'bottom']"
                sticky
                @dragenter="handleDrag"
                @drag="handleDrag"
                @dragleave="handleDragLeave"
                @drop="handleDrop"
              >
                <div
                  :ref="dropTarget"
                  :class="['list-item', { 'drop-to-end': draggingEdges.get(index) === 'right' || draggingEdges.get(index) === 'bottom' }]"
                >
                  <DropIndicator
                    v-if="draggingEdges.get(index)"
                    :vertical="isHorizontal"
                  />
                  <TabItem
                    :ref="draggable"
                    :tab="tab"
                    :character="tab.character"
                    @click="activateTerminalTab(tab)"
                    @contextmenu="openTabItemMenu($event, tab)"
                  />
                </div>
              </DropTarget>
            </DraggableElement>
            <DropTarget
              v-slot="{ mount }"
              :disabled="!groupSeparatingEnabled"
              @dragenter="groupSeparatingActive = true"
              @dragleave="groupSeparatingActive = false"
              @drop="handleGroupSeparating"
            >
              <div
                :ref="mount"
                :class="['new-tab', { 'is-group-separating-active': groupSeparatingActive }]"
              >
                <div v-if="!isHorizontal && shells.length" class="select-shell anchor" @click="selectShell">
                  <VisualIcon name="lucide-list-plus" />
                </div>
                <div
                  class="default-shell anchor"
                  @click="selectDefaultShell"
                  @contextmenu="selectShell"
                >
                  <VisualIcon v-if="groupSeparatingEnabled" name="lucide-ungroup" />
                  <VisualIcon v-else name="lucide-plus" />
                </div>
              </div>
            </DropTarget>
          </div>
          <component
            :is="list"
            v-for="(list, index) in lists"
            :key="index"
          />
        </div>
      </div>
    </AutoScroll>
    <div v-if="!isHorizontal" draggable="true" class="sash" @dragstart.prevent="resize"></div>
  </nav>
</template>

<style lang="scss" scoped>
@use '../assets/_partials';

.tab-list {
  --min-tab-height: 36px;
  --primary-icon-size: 21px;
  position: relative;
  display: flex;
  flex: none;
  font-size: 14px;
  &.right {
    order: 1;
  }
  &.horizontal {
    --primary-icon-size: 18px;
    flex: 1;
    min-width: 0;
    :deep(.tab-item) {
      flex: 1;
      width: 160px;
      min-width: 0;
    }
  }
}
.list-container {
  flex: 1;
  @include partials.scroll-container(var(--design-card-gap));
  .tab-list.vertical & {
    width: 176px;
    padding-left: var(--design-card-gap);
    overflow: visible scroll;
  }
  .tab-list.left & {
    margin-left: calc(0px - var(--design-card-gap));
  }
  .tab-list.right & {
    margin-right: calc(0px - var(--design-card-gap));
  }
  .tab-list.horizontal & {
    width: 176px;
    overflow: scroll visible;
  }
}
.list-content {
  display: flex;
  flex: auto;
  gap: var(--design-card-gap);
  .tab-list.vertical & {
    flex-direction: column;
    padding: 0;
    border-radius: var(--design-card-border-radius);
    & > * {
      margin-right: calc(0px - var(--scrollbar-size));
    }
  }
  .tab-list.horizontal & {
    padding: var(--design-card-gap) var(--design-card-gap) 0;
  }
  .app.is-opaque .tab-list.vertical & {
    background: rgb(var(--theme-background));
  }
}
.default-list {
  display: flex;
  gap: var(--design-card-gap);
  .tab-list.vertical & {
    flex-direction: column;
    width: 100%;
  }
}
.list-item {
  display: flex;
  :deep(.drop-indicator) {
    transform: translateX(-4px);
  }
  &.drop-to-end {
    flex-direction: row-reverse;
    :deep(.drop-indicator) {
      transform: translateX(4px);
    }
  }
  .tab-list.vertical & {
    flex-direction: column;
    :deep(.drop-indicator) {
      transform: translateY(-4px);
    }
    &.drop-to-end {
      flex-direction: column-reverse;
      :deep(.drop-indicator) {
        transform: translateY(4px);
      }
    }
  }
}
.sash {
  position: absolute;
  inset-block: 0;
  right: 0;
  flex: none;
  width: calc(var(--design-card-gap) / 2);
  border-left: 2px solid transparent;
  transition: border-color 0.2s;
  cursor: col-resize;
  &:hover {
    border-color: rgb(var(--system-accent));
    transition-delay: 0.5s;
  }
  .tab-list.right & {
    right: unset;
    left: 0;
    order: -1;
    border-right: 2px solid transparent;
    border-left: none;
  }
}
.new-tab {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  height: var(--min-tab-height);
  padding: 0 8px;
  line-height: var(--min-tab-height);
  text-align: center;
  border-radius: 8px;
  transition: transform 0.2s;
  view-transition-name: new-tab;
  .tab-list.horizontal & {
    width: var(--min-tab-height);
  }
  &:hover {
    background: var(--design-highlight-background);
  }
  &:active {
    transform: scale(0.98);
  }
  &.is-group-separating-active {
    outline: 2px solid rgb(var(--system-accent));
  }
}
.select-shell {
  flex: none;
  width: 18px;
  .tab-list.vertical & {
    visibility: hidden;
  }
  .tab-list.vertical .new-tab:hover:not(.is-group-separating-active) & {
    visibility: visible;
  }
  .tab-list.horizontal & {
    margin-left: 12px;
  }
}
.default-shell {
  flex: auto;
  font-size: var(--primary-icon-size);
}
.select-shell + .default-shell {
  order: -1;
  .tab-list.vertical & {
    padding-left: 18px;
  }
}
.anchor {
  opacity: 0.5;
  transition: opacity 0.2s, color 0.2s;
  cursor: pointer;
  &:hover:not(.disabled),
  &.active {
    opacity: 1;
  }
}
</style>
