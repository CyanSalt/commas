<script lang="ts" setup>
import 'xterm/css/xterm.css'
import type { TerminalTab } from '../../typings/terminal'
import { activateTerminalTab, useTerminalTabs } from '../compositions/terminal'
import { getTerminalTabID } from '../utils/terminal'
import TerminalTeletype from './TerminalTeletype.vue'

const { tab } = defineProps<{
  tab: TerminalTab,
}>()

const tabs = $(useTerminalTabs())

const groupTabs = $computed(() => {
  const group = tab.group
  if (!group) return [tab]
  return tabs.filter(item => {
    if (!item.group) return false
    return item.group.type === group.type
      && item.group.id === group.id
  })
})

function activate(item: TerminalTab) {
  activateTerminalTab(item)
}
</script>

<template>
  <article class="terminal-group">
    <TerminalTeletype
      v-for="item in groupTabs"
      :key="getTerminalTabID(item)"
      :tab="item"
      @click="activate(item)"
    />
  </article>
</template>

<style lang="scss" scoped>
@use '../assets/_partials';

.terminal-group {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
}
</style>
