<script lang="ts" setup>
import { useFullscreen, useMaximized } from '../composables/frame'
import { useSettings } from '../composables/settings'
import { useIsTabListEnabled } from '../composables/shell'
import { useIsTabListFindingAvailable } from '../composables/terminal'
import TabList from './TabList.vue'
import TabListControl from './TabListControl.vue'
import TabListFindControl from './TabListFindControl.vue'
import TerminalTitle from './TerminalTitle.vue'
import WindowControl from './WindowControl.vue'

const settings = useSettings()

let isMaximized = $(useMaximized())

function maximize() {
  isMaximized = !isMaximized
}

const isEnabled = $computed(() => {
  return settings['terminal.view.frameType'] === 'immersive'
})

const hasRightTabList = $computed(() => {
  const position = settings['terminal.view.tabListPosition']
  return position === 'right'
})

const isFullscreen = $(useFullscreen())

const isUsingCompactControl = process.platform === 'darwin'
const isUsingLeftControl = $computed(() => {
  return process.platform === 'darwin' && !isFullscreen
})

const isTabListFindingAvailable = $(useIsTabListFindingAvailable())
const isTabListEnabled = $(useIsTabListEnabled())
</script>

<template>
  <header
    v-if="isEnabled"
    class="title-bar"
    @dblclick="maximize"
  >
    <div class="left-side">
      <WindowControl v-if="isUsingLeftControl" :class="{ 'is-compact': isUsingCompactControl }" />
      <div v-if="!hasRightTabList" class="action-list">
        <TabListControl />
        <TabListFindControl v-if="isTabListFindingAvailable && isTabListEnabled" />
      </div>
    </div>
    <div class="title-wrapper">
      <TabList v-if="settings['terminal.view.tabListPosition'] === 'top'" />
      <TerminalTitle v-else />
    </div>
    <div class="right-side">
      <div v-if="hasRightTabList" class="action-list">
        <TabListControl />
        <TabListFindControl v-if="isTabListFindingAvailable && isTabListEnabled" />
      </div>
      <WindowControl v-if="!isUsingLeftControl" :class="{ 'is-compact': isUsingCompactControl }" />
    </div>
  </header>
</template>

<style lang="scss" scoped>
.title-bar {
  z-index: 1;
  display: grid;
  flex: none;
  grid-template-columns: 1fr minmax(0, auto) 1fr;
  gap: 8px;
  height: env(titlebar-area-height, 36px);
  padding: 0 16px;
  line-height: env(titlebar-area-height, 36px);
  -webkit-app-region: drag;
  &:has(.tab-list) {
    display: flex;
    height: #{36px + 2 * 8px}; // var(--min-tab-height) + 2 * 8px
    line-height: 1;
  }
  :deep(.tab-list) {
    -webkit-app-region: no-drag;
  }
}
.left-side,
.right-side {
  display: flex;
  gap: 8px;
  align-items: center;
  & > * {
    -webkit-app-region: no-drag;
  }
}
.action-list {
  display: flex;
  gap: 4px;
  align-items: center;
}
.left-side {
  justify-content: flex-start;
  :deep(.window-control) {
    margin-right: 0;
    margin-left: -16px;
    &.is-custom {
      margin-left: -8px;
    }
    &.is-compact:not(.is-custom) {
      margin-right: -8px;
    }
  }
}
.right-side {
  justify-content: flex-end;
  :deep(.window-control) {
    margin-right: -16px;
    margin-left: 0;
    &.is-custom {
      margin-right: -8px;
    }
    &.is-compact:not(.is-custom) {
      margin-left: -8px;
    }
  }
}
.title-wrapper {
  display: flex;
  flex: auto;
  &:has(.terminal-title) {
    justify-content: center;
  }
}
</style>
