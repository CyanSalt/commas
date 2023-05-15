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

const gridStyle = $computed(() => {
  const matrix: string[][] = []
  for (const [index, item] of groupTabs.entries()) {
    const position = item.position ?? { row: 0, col: 0 }
    for (let row = position.row; row < position.row + (position.rowspan ?? 1); row += 1) {
      if (!matrix[row]) {
        matrix[row] = []
      }
      for (let col = position.col; col < position.col + (position.colspan ?? 1); col += 1) {
        matrix[row][col] = `a${index}`
      }
    }
  }
  return {
    'grid-template-areas': matrix.map(line => `"${line.join(' ')}"`).join(' '),
    'grid-template-rows': Array.from({ length: matrix.length }).map(() => '1fr').join(' '),
    'grid-template-columns': Array.from({ length: Math.max(...matrix.map(line => line.length)) }).map(() => '1fr').join(' '),
  }
})

function activate(item: TerminalTab) {
  activateTerminalTab(item)
}
</script>

<template>
  <article class="terminal-group" :style="gridStyle">
    <TerminalTeletype
      v-for="item, index in groupTabs"
      :key="getTerminalTabID(item)"
      :tab="item"
      :style="{ 'grid-area': `a${index}` }"
      @click="activate(item)"
    />
  </article>
</template>

<style lang="scss" scoped>
@use '../assets/_partials';

.terminal-group {
  position: relative;
  display: grid;
  flex: 1;
  min-height: 0;
}
</style>
