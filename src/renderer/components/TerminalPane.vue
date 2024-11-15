<script lang="ts" setup>
import type { TerminalTab } from '@commas/types/terminal'
import { createContextMenu, openContextMenu, withContextMenuSeparator } from '../utils/frame'
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
    ...withContextMenuSeparator(definitionItems, []),
    ...editingItems,
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
:deep(.group-title) {
  margin: 8px 0;
  font-size: 18px;
  line-height: 24px;
}
:deep(.group) {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 24px;
  line-height: 32px;
}
:deep(.form-line),
:deep(.action-line) {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}
:deep(.form-line.block) {
  display: block;
  align-self: stretch;
  .form-label {
    display: block;
    width: auto;
  }
}
:deep(.form-line + .form-line) {
  margin-top: 10px;
}
:deep(.form-label) {
  align-self: flex-start;
  width: 14em;
}
</style>
