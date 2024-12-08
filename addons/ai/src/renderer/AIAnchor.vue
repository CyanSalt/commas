<script lang="ts" setup>
import { ipcRenderer } from '@commas/electron-ipc'
import * as commas from 'commas:api/renderer'
import { useAIStatus } from './compositions'

const { VisualIcon } = commas.ui.vueAssets

let status = $(useAIStatus())

function toggle() {
  ipcRenderer.invoke('toggle-ai', !status)
}
</script>

<template>
  <button
    type="button"
    data-commas
    :class="['ai-anchor', { active: status }]"
    @click="toggle"
  >
    <VisualIcon name="lucide-sparkles" />
  </button>
</template>

<style lang="scss" scoped>
.ai-anchor.active {
  color: rgb(var(--system-purple));
  opacity: 1;
  :deep(.visual-icon) {
    fill: currentColor;
  }
}
</style>
