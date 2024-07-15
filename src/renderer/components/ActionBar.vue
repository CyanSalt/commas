<script lang="ts" setup>
import { ipcRenderer } from 'electron'
import * as commas from '../../api/core-renderer'
import { useSettings } from '../compositions/settings'
import { useIsTabListEnabled } from '../compositions/shell'
import { showTabOptions } from '../compositions/terminal'
import TabList from './TabList.vue'
import TerminalTitle from './TerminalTitle.vue'
import VisualIcon from './basic/VisualIcon.vue'

const settings = useSettings()

const leftAnchors = commas.proxy.context.getCollection('terminal.ui-left-action-anchor')
const rightAnchors = commas.proxy.context.getCollection('terminal.ui-right-action-anchor')

function configure() {
  ipcRenderer.invoke('open-settings')
}

const hasHorizontalTabList = $computed(() => {
  const position = settings['terminal.view.tabListPosition']
  return position === 'top' || position === 'bottom'
})

const hasRightTabList = $computed(() => {
  const position = settings['terminal.view.tabListPosition']
  return position === 'right'
})

let isTabListEnabled = $(useIsTabListEnabled())

function toggleTabList(event: MouseEvent) {
  if (!hasHorizontalTabList) {
    isTabListEnabled = !isTabListEnabled
  } else {
    showTabOptions(event)
  }
}
</script>

<template>
  <footer class="action-bar">
    <div class="left-side">
      <div class="anchor" @click="configure">
        <VisualIcon name="lucide-settings" />
      </div>
      <div
        v-if="!hasRightTabList"
        class="anchor"
        @click="toggleTabList"
        @contextmenu="showTabOptions"
      >
        <VisualIcon v-if="hasHorizontalTabList" name="lucide-panel-left" />
        <VisualIcon v-else :name="isTabListEnabled ? 'lucide-panel-left-close' : 'lucide-panel-left-open'" />
      </div>
      <component
        :is="anchor"
        v-for="(anchor, index) in leftAnchors"
        :key="index"
        class="anchor"
      />
    </div>
    <div class="title-wrapper">
      <TabList v-if="settings['terminal.view.tabListPosition'] === 'bottom'" />
      <TerminalTitle v-else-if="settings['terminal.view.tabListPosition'] === 'top'" />
    </div>
    <div class="right-side">
      <component
        :is="anchor"
        v-for="(anchor, index) in rightAnchors"
        :key="index"
        class="anchor"
      />
      <div
        v-if="hasRightTabList"
        class="anchor"
        @click="toggleTabList"
        @contextmenu="showTabOptions"
      >
        <VisualIcon :name="isTabListEnabled ? 'lucide-panel-right-close' : 'lucide-panel-right-open'" />
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.action-bar {
  display: flex;
  flex: none;
  justify-content: space-between;
  height: 32px;
  &:has(.tab-list) {
    height: 52px; // 36 + 2 * 8
  }
}
:deep(.anchor) {
  display: inline-flex;
  opacity: 0.5;
  transition: opacity 0.2s;
  cursor: pointer;
  &:hover:not(.disabled),
  &.active {
    opacity: 1;
  }
  .left-side & {
    margin-right: 8px;
  }
  .right-side & {
    margin-left: 8px;
  }
}
.left-side,
.right-side {
  display: flex;
  flex: none;
  align-items: center;
  padding: 8px 16px;
  .action-bar:has(.terminal-title) & {
    width: 120px;
  }
}
.left-side {
  justify-content: flex-start;
}
.right-side {
  justify-content: flex-end;
}
.title-wrapper {
  display: flex;
  flex: 1;
  min-width: 0;
  &:has(.terminal-title) {
    justify-content: center;
  }
}
</style>
