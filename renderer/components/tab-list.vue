<template>
  <nav class="tab-list">
    <div class="list-column" :style="{ width: width + 'px' }">
      <div class="list">
        <div class="scroll-area">
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
            </TabItem>
          </SortableList>
        </div>
        <ScrollBar />
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

<script lang="ts">
import * as path from 'path'
import { ipcRenderer } from 'electron'
import { computed, nextTick, ref, unref } from 'vue'
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
  createTerminalTab,
  moveTerminalTab,
  activateTerminalTab,
  getTerminalTabIndex,
} from '../hooks/terminal'
import { openContextMenu } from '../utils/frame'
import { handleMousePressing } from '../utils/helper'
import { useAsyncComputed } from '../utils/hooks'
import { getShells } from '../utils/terminal'
import ScrollBar from './basic/scroll-bar.vue'
import SortableList from './basic/sortable-list.vue'
import TabItem from './tab-item.vue'

export default {
  components: {
    TabItem,
    ScrollBar,
    SortableList,
  },
  setup() {
    const launchersRef = useLaunchers()

    const searcherRef = ref<HTMLInputElement | null>(null)
    const widthRef = ref(176)
    const isCollapsedRef = ref(false)
    const isFindingRef = ref(false)
    const keywordRef = ref('')

    const anchorsRef = commas.context.getCollection('@anchor')

    const shellsRef = useAsyncComputed(() => getShells(), [])

    const filteredLaunchersRef = computed(() => {
      const launchers = unref(launchersRef)
      const isFinding = unref(isFindingRef)
      if (!isFinding) return launchers
      const keyword = unref(keywordRef)
      const keywords = keyword.toLowerCase().split(/\s+/)
      return launchers.filter(
        launcher => keywords.every(
          item => Object.values(launcher).join(' ').toLowerCase().includes(item),
        ),
      )
    })

    const isLauncherSortingDisabledRef = computed(() => {
      return unref(isCollapsedRef) || unref(isFindingRef)
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
      const shells = unref(shellsRef)
      openContextMenu(shells.map(shell => ({
        label: path.basename(shell),
        command: 'open-tab',
        args: [{ shell }],
      })), event)
    }

    function toggleCollapsing() {
      isCollapsedRef.value = !isCollapsedRef.value
    }

    async function toggleFinding() {
      const isFinding = unref(isFindingRef)
      isFindingRef.value = !isFinding
      if (isFinding) {
        keywordRef.value = ''
        const searcher = unref(searcherRef)
        searcher?.blur()
      } else {
        await nextTick()
        const searcher = unref(searcherRef)
        searcher?.focus()
      }
    }

    function configure() {
      ipcRenderer.invoke('open-settings')
    }

    function resize(startingEvent: DragEvent) {
      const original = unref(widthRef)
      const start = startingEvent.clientX
      const max = document.body.clientWidth / 2
      handleMousePressing({
        onMove(event) {
          const width = original + event.clientX - start
          widthRef.value = Math.min(Math.max(width, 120), max)
        },
      })
    }

    function sortLaunchers(from: number, to: number) {
      moveLauncher(from, to)
    }

    return {
      shells: shellsRef,
      searcher: searcherRef,
      width: widthRef,
      isCollapsed: isCollapsedRef,
      isFinding: isFindingRef,
      keyword: keywordRef,
      anchors: anchorsRef,
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
  --tab-height: 46px;
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
  position: relative;
  flex: auto;
  height: 0;
}
.scroll-area {
  box-sizing: border-box;
  height: 100%;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 0px;
  }
}
:deep(.scroll-bar) {
  right: 2px;
  width: 8px;
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
  padding: 0 16px;
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
  opacity: 0.5;
  transition: opacity 0.2s, color 0.2s, transform 0.2s;
  &.collapsed {
    color: rgb(var(--design-yellow));
    opacity: 1;
    transform: rotate(-90deg);
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
// eslint-disable-next-line vue-scoped-css/no-unused-selector
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
