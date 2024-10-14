<script lang="ts" setup>
import { useSettings } from '../compositions/settings'
import { toggleTabList, useIsTabListEnabled } from '../compositions/shell'
import { showTabOptions } from '../compositions/terminal'
import VisualIcon from './basic/VisualIcon.vue'

const settings = useSettings()

const hasHorizontalTabList = $computed(() => {
  const position = settings['terminal.view.tabListPosition']
  return position === 'top' || position === 'bottom'
})

let isTabListEnabled = $(useIsTabListEnabled())

async function toggleOrShowOptions(event: MouseEvent) {
  if (!hasHorizontalTabList) {
    toggleTabList()
  } else {
    showTabOptions(event)
  }
}
</script>

<template>
  <div
    class="tab-list-control"
    @click="toggleOrShowOptions"
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
  padding: 4px;
  border-radius: 4px;
  opacity: 0.5;
  transition: opacity 0.2s, transform 0.2s;
  cursor: pointer;
  &:hover {
    background: var(--design-highlight-background);
    opacity: 1;
  }
  &:active {
    transform: scale(0.96);
  }
  // FIXME: make it center visually
  :deep(.visual-icon) {
    transform: translateY(1.5px);
  }
}
</style>
