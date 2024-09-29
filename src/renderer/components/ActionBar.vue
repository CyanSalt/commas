<script lang="ts" setup>
import { ipcRenderer } from '@commas/electron-ipc'
import * as commas from '../../api/core-renderer'
import { useSettings } from '../compositions/settings'
import TabList from './TabList.vue'
import TerminalTitle from './TerminalTitle.vue'
import VisualIcon from './basic/VisualIcon.vue'

const settings = useSettings()

const leftAnchors = commas.proxy.context.getCollection('terminal.ui-left-action-anchor')
const rightAnchors = commas.proxy.context.getCollection('terminal.ui-right-action-anchor')

function configure() {
  ipcRenderer.invoke('open-settings')
}
</script>

<template>
  <footer class="action-bar">
    <div class="left-side">
      <div class="anchor" @click="configure">
        <VisualIcon name="lucide-settings" />
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
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.action-bar {
  display: grid;
  flex: none;
  grid-template-columns: 1fr auto 1fr;
  height: 32px;
  &:has(.tab-list) {
    display: flex;
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
}
.left-side,
.right-side {
  display: flex;
  gap: 8px;
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
  flex: auto;
  &:has(.terminal-title) {
    justify-content: center;
  }
}
</style>
