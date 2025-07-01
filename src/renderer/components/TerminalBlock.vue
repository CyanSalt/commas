<script lang="ts" setup>
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import type { DraggableElementEventPayload } from '@commas/types/draggable'
import type { TerminalTab } from '@commas/types/terminal'
import { appendTerminalTab, getTerminalTabIndex, splitTerminalTab } from '../compositions/terminal'
import type { DraggableElementData } from '../utils/draggable'
import DropTarget from './basic/DropTarget.vue'

const { tab } = defineProps<{
  tab: TerminalTab,
}>()

const currentIndex = $computed(() => getTerminalTabIndex(tab))

let dropEdge = $ref<Edge | null>(null)

function handleDrag(args: DraggableElementEventPayload<DraggableElementData>) {
  if (
    args.source.data.type === 'tab'
    && args.source.data.index !== -1
    && !(tab.pane && args.source.data.index === currentIndex)
  ) {
    dropEdge = extractClosestEdge(args.self.data)
  }
}

function handleDragLeave(args: DraggableElementEventPayload<DraggableElementData>) {
  if (
    args.source.data.type === 'tab'
    && args.source.data.index !== -1
    && !(tab.pane && args.source.data.index === currentIndex)
  ) {
    dropEdge = null
  }
}

async function handleDrop(args: DraggableElementEventPayload<DraggableElementData>) {
  if (
    args.source.data.type === 'tab'
    && args.source.data.index !== -1
  ) {
    const edge = extractClosestEdge(args.self.data)
    if (args.source.data.index === currentIndex) {
      splitTerminalTab(tab)
    } else {
      appendTerminalTab(tab, args.source.data.index!, edge)
    }
    dropEdge = null
  }
}
</script>

<template>
  <section class="terminal-block">
    <DropTarget
      v-slot="{ mount }"
      :allowed-edges="['top', 'bottom', 'left', 'right']"
      @dragenter="handleDrag"
      @drag="handleDrag"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div :ref="mount" class="terminal-container">
        <slot></slot>
      </div>
      <div v-if="dropEdge" :class="['moving-target', dropEdge]"></div>
    </DropTarget>
  </section>
</template>

<style lang="scss" scoped>
@use '../assets/_partials';

.terminal-block {
  position: relative;
  overflow: hidden;
  background: rgb(var(--theme-background) / var(--theme-opacity));
  border-radius: var(--design-card-border-radius);
  box-shadow: var(--design-card-shadow);
  // Both for TerminalTeletype and other teletypes
  :deep(.xterm) {
    padding: 8px;
  }
  :deep(.xterm-viewport) {
    background-color: transparent !important;
    @include partials.scroll-container(8px);
    &:focus-visible {
      outline: none;
    }
  }
  /* issue@xterm: pointer behavior */
  :deep(.xterm-screen) {
    z-index: 0;
  }
  /* issue@xterm: selection text */
  :deep(.xterm-selection-layer) {
    mix-blend-mode: darken;
    @media (prefers-color-scheme: dark) {
      mix-blend-mode: lighten;
    }
  }
}
.terminal-container {
  height: 100%;
}
.moving-target {
  position: absolute;
  inset: 50%;
  background: var(--design-highlight-background);
  transition: inset 0.2s;
  pointer-events: none;
  &.top {
    inset: 0 0 75%;
  }
  &.bottom {
    inset: 75% 0 0;
  }
  &.left {
    inset: 0 75% 0 0;
  }
  &.right {
    inset: 0 0 0 75%;
  }
}
</style>
