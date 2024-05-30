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

const platform = process.platform
const isCustomControlEnabled = !['darwin', 'win32'].includes(platform)

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
    :class="['title-bar', platform, { 'no-controls': !isCustomControlEnabled }]"
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
          <VisualIcon name="lucide-minus" />
        </div>
        <div class="maximize button" @click="maximize">
          <VisualIcon :name="isMaximized ? 'lucide-minimize-2' : 'lucide-maximize-2'" />
        </div>
        <div class="close button" @click="close">
          <VisualIcon name="lucide-x" />
        </div>
      </template>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.title-bar {
  // TODO: get the min size on win32
  --control-area-size: #{28px * 3 + 8px * 5};
  z-index: 1;
  display: flex;
  flex: none;
  justify-content: space-between;
  height: env(titlebar-area-height, 36px);
  line-height: env(titlebar-area-height, 36px);
  -webkit-app-region: drag;
  &.darwin {
    --control-area-size: #{12px * 2 + 56px};
  }
  &:has(.tab-list) {
    height: #{36px + 2 * 8px}; // var(--min-tab-height) + 2 * 8px
    line-height: 1;
  }
  :deep(.tab-list) {
    -webkit-app-region: no-drag;
  }
}
.controls,
.symmetrical-space {
  display: flex;
  flex: none;
  box-sizing: border-box;
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
  gap: 8px;
  justify-content: flex-end;
  width: var(--control-area-size);
  padding: 4px 8px;
  .title-bar.no-controls & {
    order: -1;
    padding: 0;
  }
}
.title-bar:has(.terminal-title) .symmetrical-space {
  width: var(--control-area-size);
}
.button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  text-align: center;
  border-radius: 8px;
  transition: background 0.2s, color 0.2s;
  cursor: pointer;
  -webkit-app-region: no-drag;
  &:hover {
    background: rgb(var(--theme-background) / var(--theme-opacity));
  }
  &.close:hover {
    color: rgb(var(--system-red));
  }
}
</style>
