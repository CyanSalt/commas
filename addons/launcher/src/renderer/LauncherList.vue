<script lang="ts" setup>
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import * as commas from 'commas:api/renderer'
import { ipcRenderer } from 'electron'
import { reactive } from 'vue'
import type { DraggableElementDataLike } from '../../../../src/renderer/utils/draggable'
import type { DraggableElementEventPayload } from '../../../../src/typings/draggable'
import type { TerminalTab, TerminalTabCharacter } from '../../../../src/typings/terminal'
import type { Launcher } from '../../typings/launcher'
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
let isEditing: boolean = $ref(false)

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
  index?: number,
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
      : [{ key: launcher.id, character, launcher }]
  })
})

function toggleCollapsing() {
  isCollapsed = !isCollapsed
}

function toggleEditing() {
  isEditing = !isEditing
}

function createLauncher() {
  ipcRenderer.invoke('create-launcher')
}

function closeLauncher(launcher: Launcher, tab?: TerminalTab) {
  if (isEditing) {
    const index = launchers.findIndex(item => item.id === launcher.id)
    removeLauncher(index)
    const launcherTabs = getTerminalTabsByLauncher(launcher)
    for (const launcherTab of launcherTabs) {
      delete launcherTab.character
    }
  } else if (tab) {
    commas.workspace.closeTerminalTab(tab)
  }
}

function customizeLauncher(launcher: Launcher, title: string) {
  const index = launchers.findIndex(item => item.id === launcher.id)
  updateLauncher(index, {
    ...launcher,
    name: title,
  })
}

function showLauncherScripts(launcher: Launcher, event: MouseEvent) {
  const scripts = launcher.scripts ?? []
  commas.ui.openContextMenu([
    {
      label: 'Launch#!launcher.1',
      command: 'start-launcher',
      args: [launcher],
    },
    {
      type: 'separator',
    },
    ...scripts.map((script, index) => ({
      label: script.name || script.command,
      command: 'run-script',
      args: [launcher, index],
    })),
  ], event)
}

function showLauncherMenu(event: MouseEvent) {
  commas.workspace.showTabOptions(event, 'launcher')
}

interface LauncherDraggableElementData extends DraggableElementDataLike {
  launcher?: Launcher,
}

interface DropTargetData extends Record<string | symbol, unknown> {
  launcher: Launcher,
}

const draggingEdges = reactive(new Map<string, Edge | null>())

function handleDragStart(args: DraggableElementEventPayload<LauncherDraggableElementData>) {
  if (args.source.data.type === 'tab') {
    const tab = tabs[args.source.data.index!]
    isGroupSeparating = Boolean(tab.group)
  }
}

function handleDragStop() {
  isGroupSeparating = false
}

function handleDrag(args: DraggableElementEventPayload<LauncherDraggableElementData, DropTargetData>) {
  let launcher: Launcher | undefined
  if (args.source.data.type === 'tab') {
    const tab = tabs[args.source.data.index!]
    if (tab.character) {
      launcher = getLauncherByTerminalTabCharacter(tab.character)
    }
  } else if (args.source.data.type === 'launcher') {
    launcher = args.source.data.launcher
  }
  if (launcher) {
    draggingEdges.set(args.self.data.launcher.id, commas.ui.extractClosestEdge(args.self.data))
  }
}

function handleDragLeave(args: DraggableElementEventPayload<LauncherDraggableElementData, DropTargetData>) {
  let launcher: Launcher | undefined
  if (args.source.data.type === 'tab') {
    const tab = tabs[args.source.data.index!]
    if (tab.character) {
      launcher = getLauncherByTerminalTabCharacter(tab.character)
    }
  } else if (args.source.data.type === 'launcher') {
    launcher = args.source.data.launcher
  }
  if (launcher) {
    draggingEdges.set(args.self.data.launcher.id, null)
  }
}

function handleDrop(args: DraggableElementEventPayload<LauncherDraggableElementData, DropTargetData>) {
  let launcher: Launcher | undefined
  if (args.source.data.type === 'tab') {
    const tab = tabs[args.source.data.index!]
    if (tab.character) {
      launcher = getLauncherByTerminalTabCharacter(tab.character)
    }
  } else if (args.source.data.type === 'launcher') {
    launcher = args.source.data.launcher
  }
  if (launcher) {
    const edge = commas.ui.extractClosestEdge(args.self.data)
    const toEdge = edge === 'top' || edge === 'left'
      ? 'start'
      : (edge === 'bottom' || edge === 'right' ? 'end' : undefined)
    moveLauncher(launcher, launchers.indexOf(args.self.data.launcher), toEdge)
    draggingEdges.set(args.self.data.launcher.id, null)
  }
}
</script>

<template>
  <div :class="['launcher-list', isHorizontal ? 'horizontal' : 'vertical']">
    <template v-if="isHorizontal">
      <div class="launcher-folder">
        <span class="button menu" @click="showLauncherMenu">
          <VisualIcon name="lucide-list-video" />
        </span>
      </div>
    </template>
    <template v-else>
      <div class="launcher-folder" @click="toggleCollapsing">
        <div :class="['group-name', { collapsed: isCollapsed }]">
          <span class="folder-icon">
            <VisualIcon :name="isCollapsed ? 'lucide-list-filter' : 'lucide-list-video'" />
          </span>
        </div>
        <div class="buttons" @click.stop>
          <div
            :class="['button', 'edit', { active: isEditing }]"
            @click="toggleEditing"
          >
            <VisualIcon name="lucide-tags" />
          </div>
        </div>
      </div>
      <DraggableElement
        v-for="{ key, tab, index, character, launcher } in launcherItems"
        :key="key"
        v-slot="{ mount: draggable }"
        :data="{ type: tab ? 'tab' : 'launcher', index, launcher }"
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
              :closable="isEditing"
              customizable
              @click="openLauncher(launcher, { tab })"
              @close="closeLauncher(launcher, tab)"
              @customize="customizeLauncher(launcher, $event)"
            >
              <template v-if="!isEditing" #operations>
                <div
                  class="button launch"
                  @click.stop="startLauncher(launcher)"
                  @contextmenu="showLauncherScripts(launcher, $event)"
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
      <div v-if="isEditing" class="new-launcher" @click="createLauncher">
        <VisualIcon name="lucide-plus" />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.launcher-list {
  display: flex;
  gap: 8px;
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
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0 8px;
  line-height: 16px;
  cursor: pointer;
  .button {
    opacity: 0.5;
    &:hover {
      opacity: 1;
    }
  }
  .tab-list.horizontal & {
    height: var(--min-tab-height);
    line-height: var(--min-tab-height);
  }
}
.buttons {
  display: flex;
  flex: none;
}
.button {
  width: 18px;
  text-align: center;
  transition: opacity 0.2s, color 0.2s;
  cursor: pointer;
}
.edit.active {
  color: rgb(var(--system-yellow));
  opacity: 1;
}
.group-name {
  flex: auto;
  opacity: 0.5;
  transition: opacity 0.2s, color 0.2s;
  &.collapsed {
    color: rgb(var(--system-yellow));
    opacity: 1;
  }
  &:not(.collapsed):hover {
    opacity: 1;
  }
}
.menu {
  font-size: var(--primary-icon-size);
}
.launch:hover {
  color: rgb(var(--system-green));
}
.launch-externally:hover {
  color: rgb(var(--system-blue));
}
.new-launcher {
  height: var(--tab-height);
  padding: 8px 16px;
  font-size: var(--primary-icon-size);
  line-height: var(--tab-height);
  text-align: center;
  opacity: 0.5;
  transition: opacity 0.2s;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
}
</style>
