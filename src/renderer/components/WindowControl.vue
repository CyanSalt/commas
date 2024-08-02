<script lang="ts" setup>
import { useMaximized, useMinimized } from '../compositions/frame'
import VisualIcon from './basic/VisualIcon.vue'

let isMaximized = $(useMaximized())
let isMinimized = $(useMinimized())

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
  <div :class="['window-control', platform, { 'is-custom': isCustomControlEnabled }]">
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
</template>

<style lang="scss" scoped>
.window-control {
  display: flex;
  gap: 8px;
  // TODO: get the min size on win32
  &.darwin:not(.is-custom) {
    width: #{12px * 2 + 56px};
  }
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
    background: var(--design-active-background);
  }
  &.close:hover {
    color: rgb(var(--system-red));
  }
}
</style>
