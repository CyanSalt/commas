<script lang="ts" setup>
import { useSettings } from '../composables/settings'
import { toggleTabList, useIsTabListEnabled } from '../composables/shell'
import { showTabOptions } from '../composables/terminal'
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
  <button
    type="button"
    data-commas
    class="tab-list-control"
    @click="toggleOrShowOptions"
    @contextmenu="showTabOptions"
    @dblclick.stop
  >
    <VisualIcon v-if="hasHorizontalTabList" name="lucide-panel-left" />
    <VisualIcon v-else :name="isTabListEnabled ? 'lucide-panel-left-close' : 'lucide-panel-left-open'" />
  </button>
</template>

<style lang="scss" scoped>
@use '../assets/_partials';

.tab-list-control {
  font-size: 14px;
  // FIXME: make it center visually
  :deep(.visual-icon) {
    transform: translateY(1.5px);
  }
}
</style>
