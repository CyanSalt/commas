<script setup lang="ts">
import { useIsTabListFinding } from '../composables/terminal'
import VisualIcon from './basic/VisualIcon.vue'

let isTabListFinding = $(useIsTabListFinding())

function toggleFind() {
  document.startViewTransition(() => {
    isTabListFinding = !isTabListFinding
  })
}
</script>

<template>
  <button
    type="button"
    data-commas
    :class="['tab-list-find-control', { active: isTabListFinding }]"
    @click="toggleFind"
    @dblclick.stop
  >
    <VisualIcon name="lucide-search" />
  </button>
</template>

<style lang="scss" scoped>
.tab-list-find-control {
  font-size: 14px;
  &.active {
    color: rgb(var(--system-accent));
    opacity: 1;
  }
  // FIXME: make it center visually
  :deep(.visual-icon) {
    transform: translateY(1.5px);
  }
}
</style>
