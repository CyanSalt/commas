<script lang="ts" setup>
import type { TerminalTab } from '@commas/types/terminal'
import { createContextMenu, openContextMenu } from '../utils/frame'
import TerminalBlock from './TerminalBlock.vue'

defineProps<{
  tab: TerminalTab,
}>()

defineSlots<{
  default?: (props: {}) => any,
}>()

function openEditingMenu(event: MouseEvent) {
  const { definitionItems, editingItems } = createContextMenu()
  openContextMenu([
    definitionItems,
    editingItems,
  ], event)
}
</script>

<template>
  <TerminalBlock :tab="tab" class="terminal-pane" @contextmenu="openEditingMenu">
    <slot></slot>
  </TerminalBlock>
</template>

<style lang="scss" scoped>
@use '../assets/_partials';

.terminal-pane {
  position: relative;
  z-index: 0;
  box-sizing: border-box;
  height: 100%;
  padding: 8px 16px;
  @include partials.scroll-container(8px);
}
</style>
