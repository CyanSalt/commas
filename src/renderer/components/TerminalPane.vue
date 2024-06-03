<script lang="ts" setup>
import type { TerminalTab } from '../../typings/terminal'
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
  @include partials.scroll-container(8px);
  position: relative;
  z-index: 0;
  box-sizing: border-box;
  height: 100%;
  padding: 8px 16px;
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
:deep(.link) {
  opacity: 0.5;
  transition: opacity 0.2s, color 0.2s, transform 0.2s;
  cursor: pointer;
  &.disabled {
    pointer-events: none;
  }
  &:hover {
    opacity: 1;
  }
}
:deep(.text) {
  line-height: 32px;
}
:deep(.form-line),
:deep(.action-line) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
:deep(.form-line.block) {
  display: block;
  align-self: stretch;
  .form-label {
    display: block;
    width: auto;
  }
  input.form-control,
  textarea.form-control {
    box-sizing: border-box;
    width: 480px;
  }
  .object-editor input.form-control {
    width: 208px;
    &:only-of-type {
      width: 452px;
    }
  }
}
:deep(.form-line + .form-line) {
  margin-top: 10px;
}
:deep(.form-label) {
  align-self: flex-start;
  width: 14em;
}
:deep(.form-line-tip) {
  flex-basis: 100%;
  margin-bottom: 8px;
  font-style: italic;
  font-size: 12px;
  line-height: 24px;
  &::before {
    content: '*';
    margin-right: 1em;
  }
}
:deep(input.form-control),
:deep(textarea.form-control) {
  width: 165px;
  padding: 4px 8px;
  border: none;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  line-height: 20px;
  background: var(--design-input-background);
  border-radius: 4px;
  outline: none;
  &::placeholder {
    color: rgb(var(--theme-foreground));
    opacity: 0.25;
  }
  &:read-only {
    opacity: 0.5;
  }
}
:deep(textarea.form-control) {
  height: 60px;
  resize: none;
}
:deep(input.immersive-control) {
  appearance: none;
  padding: 0;
  border: none;
  color: inherit;
  font: inherit;
  line-height: inherit;
  background: transparent;
  outline: none;
}
:deep(select.form-control) {
  padding: 4px 8px;
  border: none;
  color: var(--theme-foreground);
  font: inherit;
  line-height: 20px;
  background: var(--design-input-background);
  border-radius: 4px;
  outline: none;
  // Fix windows native control style
  option {
    color: initial;
  }
}
:deep(.form-tips) {
  margin: 4px 0;
  font-size: 12px;
  line-height: 24px;
  opacity: 0.5;
  cursor: text;
  user-select: text;
}
:deep(.form-action) {
  width: 24px;
  margin-left: 8px;
  font-size: 16px;
  text-align: center;
}
</style>
