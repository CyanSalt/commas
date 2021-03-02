<template>
  <nav class="tab-list">
    <div class="list-column" :style="{ width: width + 'px' }">
      <div class="list">
        <div class="scroll-area">
          <sortable-list
            v-slot="{ value }"
            :value="standaloneTabs"
            value-key="pid"
            class="processes"
            @change="sortTabs"
          >
            <tab-item
              :tab="value"
              @click="activateTerminalTab(value)"
            ></tab-item>
          </sortable-list>
          <div class="new-tab">
            <div v-if="shells.length" class="select-shell anchor" @click="selectShell">
              <span class="feather-icon icon-chevron-down"></span>
            </div>
            <div class="default-shell anchor" @click="createTerminalTab()">
              <span class="feather-icon icon-plus"></span>
            </div>
          </div>
          <div class="launcher-folder" @click="toggleCollapsing">
            <div :class="['group-name', { collapsed: isCollapsed }]">
              <span class="feather-icon icon-chevrons-down"></span>
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
                class="keyword"
                placeholder="Find...#!5"
                autofocus
                @keyup.esc="toggleFinding"
              >
            </div>
          </div>
          <sortable-list
            v-slot="{ value: launcher }"
            :value="filteredLaunchers"
            value-key="id"
            class="launchers"
            :disabled="isLauncherSortingDisabled"
            @change="sortLaunchers"
          >
            <tab-item
              v-show="!isCollapsed || getTerminalTabByLauncher(launcher)"
              :tab="getTerminalTabByLauncher(launcher)"
              :name="launcher.name"
              @click="openLauncher(launcher)"
            >
              <template #operations>
                <div class="button launch" @click.stop="startLauncher(launcher)">
                  <span class="feather-icon icon-play"></span>
                </div>
                <div class="button launch-externally" @click.stop="startLauncherExternally(launcher)">
                  <span class="feather-icon icon-external-link"></span>
                </div>
              </template>
            </tab-item>
          </sortable-list>
        </div>
        <scroll-bar></scroll-bar>
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
        ></component>
      </div>
    </div>
    <div class="sash" @mousedown.left="resize"></div>
  </nav>
</template>

<script lang="ts">
import * as path from 'path'
import { ipcRenderer } from 'electron'
import { reactive, toRefs, computed, unref } from 'vue'
import * as commas from '../../api/renderer'
import {
  useLaunchers,
  getTerminalTabByLauncher,
  openLauncher,
  startLauncher,
  startLauncherExternally,
  moveLauncher,
} from '../hooks/launcher'
import {
  useTerminalTabs,
  useTerminalShells,
  createTerminalTab,
  moveTerminalTab,
  activateTerminalTab,
  getTerminalTabIndex,
} from '../hooks/terminal'
import { openContextMenu } from '../utils/frame'
import { handleMousePressing } from '../utils/helper'
import ScrollBar from './basic/scroll-bar.vue'
import SortableList from './basic/sortable-list.vue'
import TabItem from './tab-item.vue'

export default {
  name: 'tab-list',
  components: {
    'tab-item': TabItem,
    'scroll-bar': ScrollBar,
    'sortable-list': SortableList,
  },
  setup() {
    const state = reactive({
      shells: useTerminalShells(),
      launchers: useLaunchers(),
      anchors: commas.workspace.useAnchors(),
      searcher: null as HTMLInputElement | null,
      width: 176,
      isCollapsed: false,
      isFinding: false,
      keyword: '',
    })

    const filteredLaunchersRef = computed(() => {
      if (!state.isFinding) return state.launchers
      const keywords = state.keyword.toLowerCase().split(/\s+/)
      return state.launchers.filter(
        launcher => keywords.every(
          keyword => Object.values(launcher).join(' ').toLowerCase().includes(keyword)
        )
      )
    })

    const isLauncherSortingDisabledRef = computed(() => {
      return state.isCollapsed || state.isFinding
    })

    const tabsRef = useTerminalTabs()
    const standaloneTabsRef = computed(() => {
      const tabs = unref(tabsRef)
      return tabs.filter(tab => !tab.launcher)
    })

    function sortTabs(from: number, to: number) {
      const standaloneTabs = unref(standaloneTabsRef)
      const toIndex = getTerminalTabIndex(standaloneTabs[to])
      moveTerminalTab(standaloneTabs[from], toIndex)
    }

    function selectShell(event: MouseEvent) {
      openContextMenu(state.shells.map(shell => ({
        label: path.basename(shell),
        command: 'open-tab',
        args: {
          shell,
        },
      })), event)
    }

    function toggleCollapsing() {
      state.isCollapsed = !state.isCollapsed
    }

    function toggleFinding() {
      if (state.isFinding) {
        state.keyword = ''
        state.searcher?.blur()
      }
      state.isFinding = !state.isFinding
    }

    function configure() {
      ipcRenderer.invoke('open-settings')
    }

    function resize(startingEvent: MouseEvent) {
      const original = state.width
      const start = startingEvent.clientX
      const max = document.body.clientWidth / 2
      handleMousePressing({
        onMove(event) {
          const width = original + event.clientX - start
          state.width = Math.min(Math.max(width, 120), max)
        },
      })
    }

    function sortLaunchers(from: number, to: number) {
      moveLauncher(from, to)
    }

    return {
      ...toRefs(state),
      filteredLaunchers: filteredLaunchersRef,
      isLauncherSortingDisabled: isLauncherSortingDisabledRef,
      standaloneTabs: standaloneTabsRef,
      sortTabs,
      activateTerminalTab,
      selectShell,
      createTerminalTab,
      toggleCollapsing,
      toggleFinding,
      getTerminalTabByLauncher,
      openLauncher,
      startLauncher,
      startLauncherExternally,
      configure,
      resize,
      sortLaunchers,
    }
  },
}
</script>

<style lang="scss" scoped>
.tab-list {
  flex: none;
  display: flex;
  font-size: 14px;
  --tab-height: 46px;
}
.list-column {
  flex: auto;
  width: 176px;
  display: flex;
  flex-direction: column;
}
.list {
  flex: auto;
  height: 0;
  position: relative;
}
.scroll-area {
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  &::-webkit-scrollbar {
    width: 0px;
  }
}
:deep(.scroll-bar) {
  width: 8px;
  right: 2px;
}
.sash {
  flex: none;
  width: 2px;
  margin: 4px 0;
  border-right: 2px solid var(--theme-foreground);
  opacity: 0.05;
  cursor: col-resize;
}
.new-tab {
  padding: 0 16px;
  display: flex;
  height: var(--tab-height);
  line-height: var(--tab-height);
  text-align: center;
}
.select-shell {
  flex: none;
  width: 18px;
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
  flex: none;
  display: flex;
}
.button {
  width: 18px;
  text-align: center;
  opacity: 0.5;
  transition: opacity 0.2s, color 0.2s;
  & + & {
    margin-left: 3px;
  }
}
.find {
  &:hover {
    opacity: 1;
  }
  &.active {
    opacity: 1;
    color: var(--design-yellow);
  }
}
.group-name {
  opacity: 0.5;
  transition: opacity 0.2s, color 0.2s, transform 0.2s;
  &.collapsed {
    color: var(--design-yellow);
    transform: rotate(-90deg);
    opacity: 1;
  }
  &:not(.collapsed):hover {
    opacity: 1;
  }
}
.find-launcher {
  flex-basis: 100%;
  margin-top: 8px;
}
.keyword {
  padding: 0;
  border: none;
  outline: none;
  font: inherit;
  color: inherit;
  background: transparent;
  &::placeholder {
    color: inherit;
    opacity: 0.5;
  }
}
.bottom-actions {
  flex: none;
  display: flex;
  padding: 8px 16px;
  line-height: 16px;
  height: 16px;
  .anchor {
    margin-right: 8px;
  }
}
// eslint-disable-next-line vue-scoped-css/no-unused-selector
.anchor {
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
  &:hover,
  &.active {
    opacity: 1;
  }
}
.launch:hover {
  color: var(--design-green);
}
.launch-externally:hover {
  color: var(--design-blue);
}
</style>
