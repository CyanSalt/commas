<script lang="ts" setup>
import * as path from 'path'
import { nextTick } from 'vue'
import * as commas from '../../api/renderer'
import type { Launcher } from '../../typings/launcher'
import {
  useLaunchers,
  getTerminalTabByLauncher,
  openLauncher,
  startLauncher,
  startLauncherExternally,
  moveLauncher,
} from '../compositions/launcher'
import {
  useTerminalTabs,
  createTerminalTab,
  moveTerminalTab,
  activateTerminalTab,
  getTerminalTabIndex,
} from '../compositions/terminal'
import { useAsyncComputed } from '../utils/compositions'
import { openContextMenu } from '../utils/frame'
import { handleMousePressing } from '../utils/helper'
import { getShells } from '../utils/terminal'
import SortableList from './basic/sortable-list.vue'
import TabItem from './tab-item.vue'

const anchors = commas.context.getCollection('@anchor')
const shells = $(useAsyncComputed(() => getShells(), []))

const tabs = $(useTerminalTabs())
const launchers = $(useLaunchers())

let searcher = $ref<HTMLInputElement>()
let width = $ref(176)
let isCollapsed = $ref(false)
let isFinding = $ref(false)
let keyword = $ref('')

const filteredLaunchers = $computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!isFinding) return launchers
  const keywords = keyword.toLowerCase().split(/\s+/)
  return launchers.filter(
    launcher => keywords.every(
      item => Object.values(launcher).join(' ').toLowerCase().includes(item),
    ),
  )
})

const isLauncherSortingDisabled = $computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return isCollapsed || isFinding
})

const standaloneTabs = $computed(() => {
  return tabs.filter(tab => !tab.launcher)
})

function sortTabs(from: number, to: number) {
  const toIndex = getTerminalTabIndex(standaloneTabs[to])
  moveTerminalTab(standaloneTabs[from], toIndex)
}

function selectShell(event: MouseEvent) {
  if (!shells.length) return
  openContextMenu(shells.map(shell => ({
    label: path.basename(shell),
    command: 'open-tab',
    args: [{ shell }],
  })), event)
}

function toggleCollapsing() {
  isCollapsed = !isCollapsed
}

async function toggleFinding() {
  isFinding = !isFinding
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (isFinding) {
    await nextTick()
    searcher.focus()
  } else {
    keyword = ''
    searcher.blur()
  }
}

function configure() {
  // FIXME: Cannot move it to top. No idea why.
  const { ipcRenderer } = require('electron')
  ipcRenderer.invoke('open-settings')
}

function resize(startingEvent: DragEvent) {
  const original = width
  const start = startingEvent.clientX
  const max = document.body.clientWidth / 2
  handleMousePressing({
    onMove(event) {
      const target = original + event.clientX - start
      width = Math.min(Math.max(target, 120), max)
    },
  })
}

function sortLaunchers(from: number, to: number) {
  moveLauncher(from, to)
}

function showLauncherScripts(launcher: Launcher, event: MouseEvent) {
  const scripts = launcher.scripts ?? []
  openContextMenu([
    {
      label: 'Launch#!terminal.6',
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
</script>

<template>
  <nav class="tab-list">
    <div class="list-column" :style="{ width: width + 'px' }">
      <div class="list">
        <SortableList
          v-slot="{ value }"
          :value="standaloneTabs"
          value-key="pid"
          class="processes"
          @change="sortTabs"
        >
          <TabItem
            :tab="value"
            @click="activateTerminalTab(value)"
          />
        </SortableList>
        <div class="new-tab">
          <div v-if="shells.length" class="select-shell anchor" @click="selectShell">
            <span class="feather-icon icon-more-horizontal"></span>
          </div>
          <div
            class="default-shell anchor"
            @click="createTerminalTab()"
            @contextmenu="selectShell"
          >
            <span class="feather-icon icon-plus"></span>
          </div>
        </div>
        <div class="launcher-folder" @click="toggleCollapsing">
          <div :class="['group-name', { collapsed: isCollapsed }]">
            <span class="folder-icon">
              <span class="feather-icon icon-chevrons-down"></span>
            </span>
          </div>
          <div class="buttons" @click.stop>
            <div
              :class="['button', 'find', { active: isFinding }]"
              @click="toggleFinding"
            >
              <span class="feather-icon icon-filter"></span>
            </div>
          </div>
          <div v-show="isFinding" class="find-launcher" @click.stop>
            <input
              ref="searcher"
              v-model="keyword"
              v-i18n:placeholder
              type="search"
              class="keyword"
              placeholder="Find...#!terminal.5"
              autofocus
              @keyup.esc="toggleFinding"
            >
          </div>
        </div>
        <SortableList
          v-slot="{ value: launcher }"
          :value="filteredLaunchers"
          value-key="id"
          class="launchers"
          :disabled="isLauncherSortingDisabled"
          @change="sortLaunchers"
        >
          <TabItem
            v-show="!isCollapsed || getTerminalTabByLauncher(launcher)"
            :tab="getTerminalTabByLauncher(launcher)"
            :launcher="launcher"
            @click="openLauncher(launcher)"
          >
            <template #operations>
              <div
                class="button launch"
                @click.stop="startLauncher(launcher)"
                @contextmenu="showLauncherScripts(launcher, $event)"
              >
                <span class="feather-icon icon-play"></span>
              </div>
              <div
                class="button launch-externally"
                @click.stop="startLauncherExternally(launcher)"
              >
                <span class="feather-icon icon-external-link"></span>
              </div>
            </template>
          </TabItem>
        </SortableList>
      </div>
      <div class="bottom-actions">
        <div class="anchor" @click="configure">
          <span class="feather-icon icon-settings"></span>
        </div>
        <component
          :is="anchor"
          v-for="(anchor, index) in anchors"
          :key="index"
          class="anchor"
        />
      </div>
    </div>
    <div draggable="true" class="sash" @dragstart.prevent="resize"></div>
  </nav>
</template>

<style lang="scss" scoped>
@use '../assets/_partials';

.tab-list {
  --tab-height: 36px;
  display: flex;
  flex: none;
  font-size: 14px;
}
.list-column {
  display: flex;
  flex: auto;
  flex-direction: column;
  width: 176px;
}
.list {
  @include partials.scroll-container(8px);
  position: relative;
  flex: auto;
  height: 0;
}
.sash {
  flex: none;
  width: 2px;
  margin: 4px 0;
  border-right: 2px solid rgb(var(--theme-foreground) / 0.05);
  cursor: col-resize;
}
.new-tab {
  display: flex;
  height: var(--tab-height);
  padding: 4px 16px;
  line-height: var(--tab-height);
  text-align: center;
}
.select-shell {
  flex: none;
  width: 18px;
  visibility: hidden;
  .new-tab:hover & {
    visibility: visible;
  }
}
.default-shell {
  flex: auto;
  font-size: 21px;
}
.select-shell + .default-shell {
  order: -1;
  padding-left: 18px;
}
.launcher-folder {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 8px 16px;
  line-height: 16px;
  cursor: pointer;
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
.find {
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
  &.active {
    color: rgb(var(--design-yellow));
    opacity: 1;
  }
}
.group-name {
  flex: auto;
  opacity: 0.5;
  transition: opacity 0.2s, color 0.2s;
  &.collapsed {
    color: rgb(var(--design-yellow));
    opacity: 1;
  }
  &:not(.collapsed):hover {
    opacity: 1;
  }
}
.folder-icon {
  display: inline-block;
  transition: transform 0.2s;
  .group-name.collapsed & {
    transform: rotate(-90deg);
  }
}
.find-launcher {
  flex-basis: 100%;
  margin-top: 8px;
}
.keyword {
  width: 100%;
  padding: 0;
  border: none;
  color: inherit;
  font: inherit;
  background: transparent;
  outline: none;
  &::placeholder {
    color: inherit;
    opacity: 0.5;
  }
}
.bottom-actions {
  display: flex;
  flex: none;
  height: 16px;
  padding: 8px 16px;
  line-height: 16px;
  .anchor {
    margin-right: 8px;
  }
}
.anchor {
  opacity: 0.5;
  transition: opacity 0.2s;
  cursor: pointer;
  &:hover:not(.disabled),
  &.active {
    opacity: 1;
  }
}
.launch:hover {
  color: rgb(var(--design-green));
}
.launch-externally:hover {
  color: rgb(var(--design-blue));
}
</style>
