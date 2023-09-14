<script lang="ts" setup>
import { useMaximized, useMinimized } from '../compositions/frame'
import { useSettings } from '../compositions/settings'
import TabList from './TabList.vue'
import TerminalTitle from './TerminalTitle.vue'
import VisualIcon from './basic/VisualIcon.vue'

const settings = useSettings()

let isMaximized = $(useMaximized())
let isMinimized = $(useMinimized())

const isEnabled: boolean = $computed(() => {
  return settings['terminal.view.frameType'] === 'immersive'
})

const isCustomControlEnabled = !['darwin', 'win32'].includes(process.platform)

function minimize() {
  isMinimized = !isMinimized
}

function maximize() {
  isMaximized = !isMaximized
}

function close() {
  window.close()
}
</script>

<template>
  <header
    v-if="isEnabled"
    :class="['title-bar', { 'no-controls': !isCustomControlEnabled }]"
    @dblclick="maximize"
  >
    <div class="symmetrical-space"></div>
    <div class="title-wrapper">
      <TabList v-if="settings['terminal.view.tabListPosition'] === 'top'" />
      <TerminalTitle v-else />
    </div>
    <div class="controls">
      <template v-if="isCustomControlEnabled">
        <div class="minimize button" @click="minimize">
          <VisualIcon name="ph-minus" />
        </div>
        <div class="maximize button" @click="maximize">
          <VisualIcon :name="isMaximized ? 'ph-arrows-in-simple' : 'ph-arrows-out-simple'" />
        </div>
        <div class="close button" @click="close">
          <VisualIcon name="ph-x" />
        </div>
      </template>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.title-bar {
  z-index: 1;
  display: flex;
  flex: none;
  justify-content: space-between;
  height: env(titlebar-area-height, 36px);
  line-height: env(titlebar-area-height, 36px);
  -webkit-app-region: drag;
  &:has(.tab-list) {
    height: 52px; // 36 + 2 * 8
    line-height: 52px;
  }
  :deep(.tab-list) {
    -webkit-app-region: no-drag;
  }
}
.controls,
.symmetrical-space {
  display: flex;
  flex: none;
}
.title-wrapper {
  display: flex;
  flex: 1;
  min-width: 0;
  &:has(.terminal-title) {
    justify-content: center;
  }
}
.title-bar.no-controls .symmetrical-space {
  order: 1;
}
.controls {
  justify-content: flex-end;
  // TODO: get the min size
  width: 120px;
  .title-bar.no-controls & {
    order: -1;
  }
}
.title-bar:has(.terminal-title) .symmetrical-space {
  width: 120px;
  padding-right: 16px;
}
.button {
  width: 36px;
  height: 36px;
  transition: color 0.2s;
  cursor: pointer;
  -webkit-app-region: no-drag;
  &.minimize:hover {
    color: rgb(var(--system-green));
  }
  &.maximize:hover {
    color: rgb(var(--system-yellow));
  }
  &.close:hover {
    color: rgb(var(--system-red));
  }
}
</style>
