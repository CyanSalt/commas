<script lang="ts" setup>
import { useSettings } from '../compositions/settings'
import { useIsTabListEnabled } from '../compositions/shell'
import { showTabOptions } from '../compositions/terminal'
import VisualIcon from './basic/VisualIcon.vue'

const settings = useSettings()

const hasHorizontalTabList = $computed(() => {
  const position = settings['terminal.view.tabListPosition']
  return position === 'top' || position === 'bottom'
})

let isTabListEnabled = $(useIsTabListEnabled())

function toggleTabList(event: MouseEvent) {
  if (!hasHorizontalTabList) {
    isTabListEnabled = !isTabListEnabled
  } else {
    showTabOptions(event)
  }
}
</script>

<template>
  <div
    class="tab-list-control"
    @click="toggleTabList"
    @contextmenu="showTabOptions"
    @dblclick.stop
  >
    <VisualIcon v-if="hasHorizontalTabList" name="lucide-panel-left" />
    <VisualIcon v-else :name="isTabListEnabled ? 'lucide-panel-left-close' : 'lucide-panel-left-open'" />
  </div>
</template>

<style lang="scss" scoped>
.tab-list-control {
  display: inline-flex;
  opacity: 0.5;
  transition: opacity 0.2s;
  cursor: pointer;
  &:hover:not(.disabled),
  &.active {
    opacity: 1;
  }
  // FIXME: make it center visually
  :deep(.visual-icon) {
    transform: translateY(1.5px);
  }
}
</style>
