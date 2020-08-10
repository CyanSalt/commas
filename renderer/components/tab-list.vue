<template>
  <div class="tab-list">
    <div class="list-column" :style="{ width: width + 'px' }">
      <div class="list">
        <div class="scroll-area">
          <sortable-list
            v-slot="{ value }"
            :value="standaloneTabs"
            class="processes"
            @change="sortTabs"
          >
            <tab-item
              :key="value.pid"
              :tab="value"
              @click.native="activateTerminalTab(value)"
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
          <div class="launcher-folder">
            <div :class="['group-name', { collapsed: isCollapsed }]" @click="toggleCollapsing">
              <span class="feather-icon icon-grid"></span>
            </div>
            <div class="buttons">
              <div
                :class="['button', 'find', { active: isFinding }]"
                @click="toggleFinding"
              >
                <span class="feather-icon icon-filter"></span>
              </div>
            </div>
            <div v-show="isFinding" class="find-launcher">
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
          <div class="launchers">
            <tab-item
              v-for="launcher in filteredLaunchers"
              v-show="!isCollapsed || getTerminalTabByLauncher(launcher)"
              :key="launcher.id"
              :tab="getTerminalTabByLauncher(launcher)"
              :name="launcher.name"
              @click.native="openLauncher(launcher)"
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
          </div>
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
  </div>
</template>

<script>
import { reactive, toRefs, computed, unref } from 'vue'
import * as path from 'path'
import TabItem from './tab-item.vue'
import ScrollBar from './basic/scroll-bar.vue'
import SortableList from './basic/sortable-list.vue'
import {
  useTerminalTabs,
  useTerminalShells,
  createTerminalTab,
  moveTerminalTab,
  activateTerminalTab,
  getTerminalTabIndex,
} from '../hooks/terminal'
import {
  useLaunchers,
  getTerminalTabByLauncher,
  openLauncher,
  startLauncher,
  startLauncherExternally,
} from '../hooks/launcher'
import { handleMousePressing } from '../utils/helper'
import { openContextMenu } from '../utils/frame'
import { ipcRenderer } from 'electron'

export default {
  name: 'TabList',
  components: {
    'tab-item': TabItem,
    'scroll-bar': ScrollBar,
    'sortable-list': SortableList,
  },
  setup() {
    const commas = globalThis.require('../api/renderer')
    const state = reactive({
      shells: useTerminalShells(),
      launchers: useLaunchers(),
      anchors: commas.workspace.useAnchors(),
      searcher: null,
      width: 176,
      isCollapsed: true,
      isFinding: false,
      keyword: '',
    })

    state.filteredLaunchers = computed(() => {
      if (!state.keyword) {
        return state.launchers
      }
      const keywords = state.keyword.toLowerCase().split(/\s+/)
      return state.launchers.filter(
        launcher => keywords.every(
          keyword => Object.values(launcher).join(' ').toLowerCase().includes(keyword)
        )
      )
    })

    const tabsRef = useTerminalTabs()
    state.standaloneTabs = computed(() => {
      const tabs = unref(tabsRef)
      return tabs.filter(tab => !tab.launcher)
    })

    function sortTabs(from, to) {
      const toIndex = getTerminalTabIndex(state.standaloneTabs[to])
      moveTerminalTab(state.standaloneTabs[from], toIndex)
    }

    function selectShell(event) {
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
        state.searcher.blur()
      }
      state.isFinding = !state.isFinding
    }

    function configure() {
      ipcRenderer.invoke('open-settings')
    }

    function resize(startingEvent) {
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

    return {
      ...toRefs(state),
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
    }
  },
}
</script>

<style>
.tab-list {
  flex: none;
  display: flex;
  font-size: 14px;
  --tab-height: 46px;
}
.tab-list .list-column {
  flex: auto;
  width: 176px;
  display: flex;
  flex-direction: column;
}
.tab-list .list {
  flex: auto;
  height: 0;
  position: relative;
}
.tab-list .scroll-area {
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}
.tab-list .scroll-area::-webkit-scrollbar {
  width: 0px;
}
.tab-list .scroll-bar {
  width: 8px;
  right: 2px;
}
.tab-list .sash {
  flex: none;
  width: 2px;
  margin: 4px 0;
  border-right: 2px solid rgba(127, 127, 127, 0.1);
  cursor: col-resize;
}
.tab-list .invisible {
  visibility: hidden;
}
.tab-list .new-tab {
  padding: 0 16px;
  display: flex;
  height: var(--tab-height);
  line-height: var(--tab-height);
  text-align: center;
}
.tab-list .new-tab .select-shell {
  flex: none;
  width: 18px;
}
.tab-list .new-tab .default-shell {
  flex: auto;
  font-size: 21px;
}
.tab-list .new-tab .select-shell + .default-shell {
  order: -1;
  padding-left: 18px;
}
.tab-list .launcher-folder {
  display: flex;
  flex-wrap: wrap;
  padding: 8px 16px;
  line-height: 16px;
  cursor: pointer;
}
.tab-list .group-name {
  flex: auto;
  opacity: 1;
  transition: opacity 0.2s, color 0.2s;
}
.tab-list .group-name.collapsed {
  opacity: 0.5;
}
.tab-list .group-name:not(.collapsed) {
  color: var(--design-magenta);
}
.tab-list .group-name.collapsed:hover {
  opacity: 1;
}
.tab-list .launcher-folder .buttons {
  flex: none;
  display: flex;
}
.tab-list .launcher-folder .button {
  width: 18px;
  text-align: center;
  opacity: 0.5;
  transition: opacity 0.2s, color 0.2s;
}
.tab-list .launcher-folder .button + .button {
  margin-left: 3px;
}
.tab-list .launcher-folder .find:hover {
  opacity: 1;
}
.tab-list .find.active {
  opacity: 1;
  color: var(--design-blue);
}
.tab-list .find-launcher {
  flex-basis: 100%;
  margin-top: 8px;
}
.tab-list .find-launcher .keyword {
  padding: 0;
  border: none;
  outline: none;
  font: inherit;
  color: inherit;
  background: transparent;
}
.tab-list .find-launcher .keyword::placeholder {
  color: inherit;
  opacity: 0.5;
}
.tab-list .edit-launcher {
  text-align: center;
  font-size: 18px;
  line-height: 26px;
  margin-bottom: 8px;
}
.tab-list .bottom-actions {
  flex: none;
  display: flex;
  padding: 8px 16px;
  line-height: 16px;
  height: 16px;
}
.tab-list .bottom-actions .anchor {
  margin-right: 8px;
}
.tab-list .server-port {
  vertical-align: 1px;
}
.tab-list .anchor {
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}
.tab-list .anchor:hover,
.tab-list .anchor.active {
  opacity: 1;
}
.tab-list .launch:hover {
  color: var(--design-green);
}
.tab-list .launch-externally:hover {
  color: var(--design-blue);
}
</style>
