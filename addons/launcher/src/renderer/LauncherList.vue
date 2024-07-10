<script lang="ts" setup>
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import * as commas from 'commas:api/renderer'
import { ipcRenderer } from 'electron'
import { reactive, watch } from 'vue'
import type { DraggableElementData } from '../../../../src/renderer/utils/draggable'
import type { DraggableElementEventPayload } from '../../../../src/typings/draggable'
import type { TerminalTab, TerminalTabCharacter } from '../../../../src/typings/terminal'
import type { Launcher, LauncherInfo } from '../../typings/launcher'
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

const position = $computed(() => settings['terminal.view.tabListPosition'])

const isHorizontal = $computed(() => {
  return position === 'top' || position === 'bottom'
})

const tabs = $(commas.workspace.useTerminalTabs())
const launchers = $(useLaunchers())

let isCollapsed: boolean = $ref(false)

const filteredLaunchers = $computed(() => {
  if (!isCollapsed) return launchers
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
  return filteredLaunchers.flatMap(launcher => {
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
  })
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
  const { updatingItems, deletingItems } = commas.workspace.createTerminalTabContextMenu()
  commas.ui.openContextMenu([
    ...commas.ui.withContextMenuSeparator([
      {
        label: 'Launch#!launcher.2',
        command: 'start-launcher',
        args: [launcher],
      },
      {
        label: 'Open in External#!launcher.3',
        command: 'start-launcher-externally',
        args: [launcher],
      },
    ], []),
    ...commas.ui.withContextMenuSeparator(
      scripts.map((script, index) => ({
        label: script.name,
        command: 'run-script',
        args: [launcher, index],
      })),
      [],
    ),
    ...(tab ? commas.ui.withContextMenuSeparator(updatingItems, []) : []),
    ...(tab ? deletingItems : []),
    {
      label: 'Remove Launcher#!launcher.4',
      command: 'remove-launcher',
      args: [launcher],
    },
  ], event)
}
</script>

<template>
  <div :class="['launcher-list', isHorizontal ? 'horizontal' : 'vertical']">
    <template v-if="isHorizontal">
      <div class="launcher-folder">
        <div class="group-name" @click="showLauncherMenu">
          <VisualIcon name="lucide-list-video" />
        </div>
      </div>
    </template>
    <template v-else>
      <DropTarget
        v-slot="{ mount: dropTarget }"
        :data="{ launcher: FOLDER_DROP_TARGET as typeof FOLDER_DROP_TARGET }"
        :allowed-edges="isHorizontal ? ['right'] : ['bottom']"
        sticky
        @dragenter="handleDrag"
        @drag="handleDrag"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <div :ref="dropTarget" class="launcher-folder" @click="toggleCollapsing">
          <div :class="['group-name', { collapsed: isCollapsed }]">
            <VisualIcon :name="isCollapsed ? 'lucide-list-filter' : 'lucide-list-video'" />
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
              <template #operations>
                <div
                  class="button launch"
                  @click.stop="startLauncher(launcher)"
                >
                  <VisualIcon name="lucide-play" />
                </div>
                <div
                  class="button launch-externally"
                  @click.stop="startLauncherExternally(launcher)"
                >
                  <VisualIcon name="lucide-external-link" />
                </div>
              </template>
            </TabItem>
          </div>
        </DropTarget>
      </DraggableElement>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.launcher-list {
  display: flex;
  gap: var(--design-card-gap);
  &.vertical {
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
.launcher-folder {
  padding: 0 8px;
  line-height: 16px;
  cursor: pointer;
  .tab-list.horizontal & {
    height: var(--min-tab-height);
    line-height: var(--min-tab-height);
  }
}
.button {
  width: 18px;
  text-align: center;
  transition: opacity 0.2s, color 0.2s;
  cursor: pointer;
}
.group-name {
  opacity: 0.5;
  transition: opacity 0.2s, color 0.2s;
  &.collapsed {
    color: var(--design-highlight-color);
    opacity: 1;
  }
  &:not(.collapsed):hover {
    opacity: 1;
  }
}
.launch:hover {
  color: rgb(var(--system-green));
}
.launch-externally:hover {
  color: rgb(var(--system-blue));
}
</style>
