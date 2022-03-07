<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { nextTick } from 'vue'
import type { Launcher } from '../../typings/launcher'
import {
  createLauncherGroup,
  getTerminalTabByLauncher,
  moveLauncher,
  openLauncher,
  startLauncher,
  startLauncherExternally,
  useLaunchers,
} from './launcher'

const launchers = $(useLaunchers())

let searcher = $ref<HTMLInputElement>()
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

function sortLaunchers(from: number, to: number) {
  moveLauncher(from, to)
}

function showLauncherScripts(launcher: Launcher, event: MouseEvent) {
  const scripts = launcher.scripts ?? []
  commas.workspace.openContextMenu([
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
  <div class="launcher-list">
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
    <!-- TODO: share components between core and addons -->
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
        :group="createLauncherGroup(launcher)"
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
</template>

<style lang="scss" scoped>
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
.launch:hover {
  color: rgb(var(--design-green));
}
.launch-externally:hover {
  color: rgb(var(--design-blue));
}
</style>
