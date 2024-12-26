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
    <svg class="svg-reference" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient
          id="ai-anchor-gradient"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="20"
          y2="20"
        >
          <stop offset="22%" stop-color="rgb(var(--system-cyan))" />
          <stop offset="44%" stop-color="rgb(var(--system-blue))" />
          <stop offset="66%" stop-color="rgb(var(--system-purple))" />
          <stop offset="88%" stop-color="rgb(var(--theme-foreground))" />
        </linearGradient>
      </defs>
    </svg>
    <VisualIcon name="lucide-sparkles" />
  </button>
</template>

<style lang="scss" scoped>
.ai-anchor.active {
  opacity: 1;
  :deep(.visual-icon) {
    fill: url('#ai-anchor-gradient');
    stroke: url('#ai-anchor-gradient');
  }
}
.svg-reference {
  position: absolute;
  width: 0;
  height: 0;
}
</style>
