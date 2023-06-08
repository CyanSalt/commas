<script lang="ts" setup>
import { watchEffect } from 'vue'
import type { TerminalTab } from '../../typings/terminal'
import type { TerminalTabDirection } from '../compositions/terminal'
import { appendTerminalTab, getTerminalTabIndex, useMovingTerminalIndex } from '../compositions/terminal'
import { handleMousePressing } from '../utils/helper'

const { tab } = defineProps<{
  tab: TerminalTab,
}>()

const movingIndex = $(useMovingTerminalIndex())
const currentIndex = $computed(() => getTerminalTabIndex(tab))

let root = $ref<HTMLElement | undefined>()
let movingTarget = $ref<HTMLElement | undefined>()
let movingDirection = $ref<TerminalTabDirection | undefined>()

function getMovingDirection(element: HTMLElement, event: MouseEvent): TerminalTabDirection {
  const bounds = element.getBoundingClientRect()
  if (event.clientX > bounds.left + bounds.width * 3 / 4) return 'right'
  if (event.clientX < bounds.left + bounds.width / 4) return 'left'
  if (event.clientY > bounds.top + bounds.height * 3 / 4) return 'bottom'
  if (event.clientY < bounds.top + bounds.height / 4) return 'top'
  return 'right'
}

watchEffect(onInvalidate => {
  if (root && movingTarget) {
    movingDirection = undefined
    const cancel = handleMousePressing({
      element: root,
      onMove(event) {
        event.preventDefault()
        movingDirection = getMovingDirection(root!, event)
      },
      onEnd(event) {
        event.preventDefault()
        appendTerminalTab(tab, movingIndex, movingDirection)
      },
      onLeave() {
        movingDirection = undefined
      },
      active: true,
    })
    onInvalidate(() => {
      cancel()
    })
  }
})
</script>

<template>
  <section ref="root" class="terminal-block">
    <slot></slot>
    <div
      v-if="movingIndex !== -1 && movingIndex !== currentIndex"
      ref="movingTarget"
      :class="['moving-target', movingDirection]"
    ></div>
  </section>
</template>

<style lang="scss" scoped>
.terminal-block {
  position: relative;
}
.moving-target {
  position: absolute;
  inset: 50%;
  background: var(--design-card-background);
  transition: inset 0.2s;
  &.top {
    inset: 0 0 75% 0;
  }
  &.bottom {
    inset: 75% 0 0 0;
  }
  &.left {
    inset: 0 75% 0 0;
  }
  &.right {
    inset: 0 0 0 75%;
  }
}
</style>
