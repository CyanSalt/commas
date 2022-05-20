<script lang="ts" setup>
import { ipcRenderer } from 'electron'
import * as commas from '../../../api/core-renderer'

const anchors = commas.proxy.context.getCollection('@ui-action-anchor')

function configure() {
  ipcRenderer.invoke('open-settings')
}
</script>

<template>
  <footer class="action-bar">
    <div class="anchor" @click="configure">
      <span class="feather-icon icon-settings"></span>
    </div>
    <component
      :is="anchor"
      v-for="(anchor, index) in anchors"
      :key="index"
      class="anchor"
    />
    <div class="message"></div>
  </footer>
</template>

<style lang="scss" scoped>
.action-bar {
  display: flex;
  flex: none;
  justify-content: space-between;
  height: 16px;
  padding: 8px 16px;
  line-height: 16px;
  background: rgb(var(--material-background) / var(--theme-opacity));
}
.anchor {
  margin-right: 8px;
  opacity: 0.5;
  transition: opacity 0.2s;
  cursor: pointer;
  &:hover:not(.disabled),
  &.active {
    opacity: 1;
  }
}
.message {
  flex: 1;
}
</style>
