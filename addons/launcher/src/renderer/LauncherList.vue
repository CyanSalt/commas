<script lang="ts" setup>
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { ipcRenderer } from '@commas/electron-ipc'
import type { DraggableElementEventPayload } from '@commas/types/draggable'
import type { TerminalTab, TerminalTabCharacter } from '@commas/types/terminal'
import { useKeyModifier } from '@vueuse/core'
import * as commas from 'commas:api/renderer'
import { reactive, watch } from 'vue'
import type { DraggableElementData } from '../../../../src/renderer/utils/draggable'
import type { Launcher, LauncherInfo } from '../types/launcher'
import {
  getLauncherByTerminalTabCharacter,
  getTerminalTabCharacterByLauncher,
  getTerminalTabsByLauncher,
  moveLauncher,
  openLauncher,
  removeLauncher,
  startLauncher,
  startLauncherExternally,
  updateLauncher,
  useLaunchers,
} from './launcher'

const { VisualIcon, DraggableElement, DropTarget, DropIndicator, TabItem } = commas.ui.vueAssets

const settings = commas.remote.useSettings()
let isGroupSeparating = $(commas.workspace.useTerminalTabGroupSeparating())

const shiftKey = $(useKeyModifier('Shift', { initial: false }))

const position = $computed(() => settings['terminal.view.tabListPosition'])

const isHorizontal = $computed(() => {
  return position === 'top' || position === 'bottom'
})

const tabs = $(commas.workspace.useTerminalTabs())
const launchers = $(useLaunchers())

let isCollapsed = $ref(false)

const isLauncherCollapsed = $(commas.ui.useViewTransition($$(isCollapsed)))

const filteredLaunchers = $computed(() => {
  if (!isLauncherCollapsed) return launchers
  return launchers.filter(launcher => {
    const launcherTabs = getTerminalTabsByLauncher(launcher)
    return launcherTabs.length > 0
  })
})

interface LauncherItem {
  key: string,
  tab?: TerminalTab,
  index: number,
  character: TerminalTabCharacter,
  launcher: Launcher,
}

const launcherItems = $computed(() => {
  return commas.workspace.filterTerminalTabsByKeyword(
    filteredLaunchers.flatMap(launcher => {
      const launcherTabs = getTerminalTabsByLauncher(launcher)
      const character = getTerminalTabCharacterByLauncher(launcher)
      return launcherTabs.length
        ? launcherTabs.map<LauncherItem>(tab => ({
          key: [launcher.id, tab.pid].join(':'),
          tab,
          index: commas.workspace.getTerminalTabIndex(tab),
          character,
          launcher,
        }))
        : [{ key: launcher.id, index: -1, character, launcher }]
    }),
    ({ tab, character }) => {
      return tab ? commas.workspace.getTerminalTabTitle(tab) : character.title ?? ''
    },
  )
})

function toggleCollapsing() {
  isCollapsed = !isCollapsed
}

function createLauncher(data: LauncherInfo, index: number) {
  ipcRenderer.invoke('create-launcher', data, index)
}

function closeTab(tab: TerminalTab) {
  commas.workspace.closeTerminalTab(tab)
}

function customizeLauncher(launcher: Launcher, title: string) {
  const index = launchers.findIndex(item => item.id === launcher.id)
  updateLauncher(index, {
    ...launcher,
    name: title,
  })
}

function showLauncherMenu(event: MouseEvent) {
  commas.workspace.showTabOptions(event, 'launcher')
}

const FOLDER_ID = 'launcher@folder'
const FOLDER_DROP_TARGET = Symbol(FOLDER_ID)

interface LauncherDraggableElementData extends DraggableElementData {
  launcher?: Launcher,
}

interface DropTargetData extends Record<string | symbol, unknown> {
  launcher: Launcher | typeof FOLDER_DROP_TARGET,
}

const draggingEdges = reactive(new Map<string, Edge | null>())

function handleDragStart(args: DraggableElementEventPayload<LauncherDraggableElementData>) {
  if (args.source.data.type === 'tab' && args.source.data.index !== -1) {
    const tab = tabs[args.source.data.index!]
    isGroupSeparating = Boolean(tab.group)
  }
}

function handleDragStop() {
  isGroupSeparating = false
}

function handleDrag(args: DraggableElementEventPayload<LauncherDraggableElementData, DropTargetData>) {
  if (args.source.data.type === 'tab') {
    draggingEdges.set(
      args.self.data.launcher === FOLDER_DROP_TARGET ? FOLDER_ID : args.self.data.launcher.id,
      commas.ui.extractClosestEdge(args.self.data),
    )
  }
}

function handleDragLeave(args: DraggableElementEventPayload<LauncherDraggableElementData, DropTargetData>) {
  if (args.source.data.type === 'tab') {
    draggingEdges.set(
      args.self.data.launcher === FOLDER_DROP_TARGET ? FOLDER_ID : args.self.data.launcher.id,
      null,
    )
  }
}

const pool = new Set<{ tab: TerminalTab, index: number }>()

watch(() => launchers, values => {
  for (const { tab, index } of pool) {
    tab.character = index !== -1
      ? getTerminalTabCharacterByLauncher(values[index])
      : undefined
  }
  pool.clear()
})

function handleDrop(args: DraggableElementEventPayload<LauncherDraggableElementData, DropTargetData>) {
  if (args.source.data.type === 'tab') {
    let launcher: Launcher | undefined
    if (args.source.data.index === -1) {
      launcher = args.source.data.launcher
    } else {
      const tab = tabs[args.source.data.index!]
      if (tab.character) {
        launcher = getLauncherByTerminalTabCharacter(tab.character)
      }
    }
    const edge = commas.ui.extractClosestEdge(args.self.data)
    const toEdge = edge === 'top' || edge === 'left'
      ? 'start'
      : (edge === 'bottom' || edge === 'right' ? 'end' : undefined)
    if (launcher) {
      moveLauncher(
        launcher,
        args.self.data.launcher === FOLDER_DROP_TARGET ? -1 : launchers.indexOf(args.self.data.launcher),
        toEdge,
      )
    } else {
      const tab = tabs[args.source.data.index!]
      const toIndex = args.self.data.launcher === FOLDER_DROP_TARGET ? -1 : launchers.indexOf(args.self.data.launcher)
      const index = toEdge === 'start' ? toIndex : toIndex + 1
      createLauncher({
        name: commas.workspace.getTerminalTabTitle(tab),
        command: tab.command,
        directory: tab.cwd,
        profile: tab.shell ? {
          shell: tab.shell,
        } : undefined,
        pane: tab.pane?.name,
      }, index)
      pool.add({ tab, index })
    }
    draggingEdges.set(
      args.self.data.launcher === FOLDER_DROP_TARGET ? FOLDER_ID : args.self.data.launcher.id,
      null,
    )
  }
}

function openLauncherMenu(launcher: Launcher, tab: TerminalTab | undefined, event: MouseEvent) {
  const scripts = launcher.scripts ?? []
  const { updatingItems, deletingItems } = commas.workspace.createTerminalTabContextMenu(tab)
  commas.ui.openContextMenu([
    {
      label: 'Launch#!launcher.2',
      command: 'start-launcher',
      args: [launcher, '$event'],
    },
    {
      label: 'Open in External#!launcher.3',
      command: 'start-launcher-externally',
      args: [launcher],
    },
    scripts.map((script, index) => ({
      label: script.name,
      command: 'run-launcher-script',
      args: [launcher, index, '$event'],
    })),
    tab ? updatingItems : [],
    [
      ...(tab ? deletingItems : []),
      {
        label: 'Remove Launcher#!launcher.4',
        command: 'remove-launcher',
        args: [launcher],
      },
    ],
  ], event)
}
</script>

<template>
  <div :class="['launcher-list', isHorizontal ? 'horizontal' : 'vertical']">
    <template v-if="isHorizontal">
      <DropTarget
        v-slot="{ mount }"
        :data="{ launcher: FOLDER_DROP_TARGET as typeof FOLDER_DROP_TARGET }"
        :allowed-edges="isHorizontal ? ['right'] : ['bottom']"
        sticky
        @dragenter="handleDrag"
        @drag="handleDrag"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <div
          :ref="mount"
          :class="['launcher-folder', { 'is-dropping-active': draggingEdges.get(FOLDER_ID) }]"
          @click="showLauncherMenu"
        >
          <div class="group-name">
            <VisualIcon name="lucide-list-video" />
          </div>
        </div>
      </DropTarget>
    </template>
    <template v-else>
      <DropTarget
        v-slot="{ mount }"
        :data="{ launcher: FOLDER_DROP_TARGET as typeof FOLDER_DROP_TARGET }"
        :allowed-edges="isHorizontal ? ['right'] : ['bottom']"
        sticky
        @dragenter="handleDrag"
        @drag="handleDrag"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <div
          :ref="mount"
          :class="['launcher-folder', { collapsed: isLauncherCollapsed }]"
          @click="toggleCollapsing"
        >
          <div class="group-name">
            <VisualIcon :name="isLauncherCollapsed ? 'lucide-list-filter' : 'lucide-list-video'" />
          </div>
          <DropIndicator
            v-if="draggingEdges.get(FOLDER_ID)"
            :vertical="isHorizontal"
          />
        </div>
      </DropTarget>
      <DraggableElement
        v-for="{ key, tab, index, character, launcher } in launcherItems"
        :key="key"
        v-slot="{ mount: draggable }"
        :data="{
          type: 'tab',
          index,
          launcher,
          create: () => openLauncher(launcher),
          dispose: () => removeLauncher(launcher),
        }"
        @dragstart="handleDragStart"
        @drop="handleDragStop"
      >
        <DropTarget
          v-slot="{ mount: dropTarget }"
          :data="{ launcher }"
          :allowed-edges="isHorizontal ? ['left', 'right'] : ['top', 'bottom']"
          sticky
          @dragenter="handleDrag"
          @drag="handleDrag"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
        >
          <div
            :ref="dropTarget"
            :class="['list-item', { 'drop-to-end': draggingEdges.get(launcher.id) === 'right' || draggingEdges.get(launcher.id) === 'bottom' }]"
          >
            <DropIndicator
              v-if="draggingEdges.get(launcher.id)"
              :vertical="isHorizontal"
            />
            <TabItem
              :ref="draggable"
              :tab="tab"
              :character="character"
              :closable="Boolean(tab)"
              customizable
              @click="openLauncher(launcher, { tab })"
              @close="closeTab(tab!)"
              @customize="customizeLauncher(launcher, $event)"
              @contextmenu="openLauncherMenu(launcher, tab, $event)"
            >
              <template v-if="!launcher.pane" #operations>
                <button
                  type="button"
                  data-commas
                  class="launch"
                  @click.stop="startLauncher(launcher, shiftKey)"
                >
                  <VisualIcon :name="shiftKey ? 'lucide-copy-plus' : 'lucide-play'" />
                </button>
                <button
                  type="button"
                  data-commas
                  class="launch-externally"
                  @click.stop="startLauncherExternally(launcher)"
                >
                  <VisualIcon name="lucide-square-arrow-out-up-right" />
                </button>
              </template>
            </TabItem>
          </div>
        </DropTarget>
      </DraggableElement>
    </template>
  </div>
</template>

<style lang="scss" scoped>
@use '@commas/api/scss/_partials';

.launcher-list {
  display: flex;
  &.vertical {
    flex-direction: column;
    gap: var(--design-card-gap);
    width: 100%;
  }
  &.horizontal {
    align-items: center;
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
.launcher-folder {
  box-sizing: border-box;
  padding: 4px 8px;
  line-height: 16px;
  border-radius: 4px;
  opacity: 0.5;
  transition: opacity 0.2s, color 0.2s, transform 0.2s;
  cursor: pointer;
  -electron-corner-smoothing: 60%;
  view-transition-name: launcher-folder;
  &:hover {
    background: var(--design-highlight-background);
    opacity: 1;
  }
  &:active {
    transform: scale(partials.nano-scale(156));
  }
  &.collapsed {
    color: var(--design-highlight-color);
    opacity: 1;
  }
  .tab-list.horizontal & {
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--min-tab-height);
    height: var(--min-tab-height);
    line-height: var(--min-tab-height);
    border-radius: 8px;
    -electron-corner-smoothing: 60%;
    &.is-dropping-active {
      outline: 2px solid rgb(var(--system-accent));
    }
  }
}
</style>
