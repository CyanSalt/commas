<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { ipcRenderer } from 'electron'
import { nextTick } from 'vue'
import type { TerminalTab, TerminalTabGroup } from '../../../../src/typings/terminal'
import type { Launcher } from '../../typings/launcher'
import {
  getTerminalTabGroupByLauncher,
  getTerminalTabsByLauncher,
  moveLauncher,
  openLauncher,
  removeLauncher,
  startLauncher,
  startLauncherExternally,
  useLaunchers,
} from './launcher'

const { vI18n, SortableList, TabItem } = commas.ui.vueAssets

const settings = commas.remote.useSettings()

const position = $computed(() => settings['terminal.view.tabListPosition'])

const isHorizontal = $computed(() => {
  return position === 'top' || position === 'bottom'
})

const launchers = $(useLaunchers())

let searcher = $ref<HTMLInputElement>()
let isCollapsed: boolean = $ref(false)
let isActionsVisible: boolean = $ref(false)
let isEditing: boolean = $ref(false)
let keyword = $ref('')

const keywords = $computed(() => {
  return commas.helper.getWords(keyword)
})

const filteredLaunchers = $computed(() => {
  return launchers.filter(launcher => {
    if (isCollapsed) {
      const launcherTabs = getTerminalTabsByLauncher(launcher)
      if (!launcherTabs.length) return false
    }
    const matched = commas.helper.matches(Object.values(launcher), keywords)
    if (!matched) return false
    return true
  })
})

interface LauncherItem {
  key: string,
  tab?: TerminalTab,
  group: TerminalTabGroup,
  launcher: Launcher,
}

const launcherItems = $computed(() => {
  return filteredLaunchers.flatMap(launcher => {
    const tabs = getTerminalTabsByLauncher(launcher)
    const group = getTerminalTabGroupByLauncher(launcher)
    return tabs.length
      ? tabs.map<LauncherItem>(tab => ({ key: [launcher.id, tab.pid].join(':'), tab, group, launcher }))
      : [{ key: launcher.id, group, launcher }]
  })
})

const isLauncherSortingDisabled = $computed(() => {
  return filteredLaunchers.length !== launchers.length
})

const isAnyActionEnabled = $computed(() => {
  if (isActionsVisible) return true
  return Boolean(keywords.length) || isEditing
})

function toggleCollapsing() {
  isCollapsed = !isCollapsed
}

async function toggleActions() {
  isActionsVisible = !isActionsVisible
  if (isActionsVisible) {
    await nextTick()
    searcher!.focus()
  } else {
    searcher!.blur()
  }
}

function sortLaunchers(from: number, to: number) {
  moveLauncher(from, to)
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
      delete launcherTab.group
    }
  } else if (tab) {
    commas.workspace.closeTerminalTab(tab)
  }
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
</script>

<template>
  <div class="launcher-list">
    <template v-if="isHorizontal">
      <div class="launcher-folder">
        <span class="button menu" @click="showLauncherMenu">
          <span class="feather-icon icon-chevrons-down"></span>
        </span>
      </div>
    </template>
    <template v-else>
      <div class="launcher-folder" @click="toggleCollapsing">
        <div :class="['group-name', { collapsed: isCollapsed }]">
          <span class="folder-icon">
            <span class="feather-icon icon-chevrons-down"></span>
          </span>
        </div>
        <div class="buttons" @click.stop>
          <div
            :class="['button', 'more', { active: isAnyActionEnabled }]"
            @click="toggleActions"
          >
            <span class="feather-icon icon-more-vertical"></span>
          </div>
        </div>
        <div v-show="isActionsVisible" class="launcher-actions" @click.stop>
          <input
            ref="searcher"
            v-model="keyword"
            v-i18n:placeholder
            type="search"
            class="keyword"
            placeholder="Find#!terminal.5"
            autofocus
            @keyup.esc="toggleActions"
          >
          <span :class="['button', 'edit', { active: isEditing }]" @click="toggleEditing">
            <span class="feather-icon icon-edit-3"></span>
          </span>
        </div>
      </div>
      <SortableList
        v-slot="{ value: { tab, group, launcher } }"
        :value="launcherItems"
        value-key="key"
        class="launchers"
        :disabled="isLauncherSortingDisabled"
        @change="sortLaunchers"
      >
        <TabItem
          :tab="tab"
          :group="group"
          :closable="isEditing"
          @click="openLauncher(launcher, { tab })"
          @close="closeLauncher(launcher, tab)"
        >
          <template v-if="!isEditing" #operations>
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
      <div v-if="isEditing" class="new-launcher" @click="createLauncher">
        <span class="feather-icon icon-plus"></span>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.launcher-folder {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 8px 16px;
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
    padding-left: 0;
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
.more.active,
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
.folder-icon {
  display: inline-block;
  transition: transform 0.2s;
  .group-name.collapsed & {
    transform: rotate(-90deg);
  }
}
.menu {
  font-size: var(--primary-icon-size);
}
.launcher-actions {
  display: flex;
  flex-basis: 100%;
  align-items: center;
  margin-top: 8px;
}
.keyword {
  flex: 1;
  width: 0;
  margin-right: 6px;
  padding: 2px 6px;
  border: none;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  line-height: 20px;
  background: var(--design-input-background);
  outline: none;
  &::placeholder {
    color: rgb(var(--theme-foreground));
    opacity: 0.25;
  }
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
