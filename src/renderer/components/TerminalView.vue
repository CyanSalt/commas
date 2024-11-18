<script lang="ts" setup>
import type { TerminalTab } from '@commas/types/terminal'
import { activateTerminalTab, getTerminalTabIndex, useCurrentTerminal, useTerminalTabs } from '../compositions/terminal'
import { getTerminalTabID } from '../utils/terminal'
import TerminalTeletype from './TerminalTeletype.vue'

const tabs = $(useTerminalTabs())
const terminal = $(useCurrentTerminal())

const activeIndex = $computed(() => {
  return terminal ? getTerminalTabIndex(terminal) : -1
})

const currentGroup = $computed(() => {
  if (!terminal) return []
  const group = terminal.group
  if (!group) return [activeIndex]
  return tabs.flatMap((item, index) => {
    return item.group && item.group === group
      ? [index] : []
  })
})

const gridStyle = $computed(() => {
  const matrix: string[][] = []
  for (const index of currentGroup) {
    const tab = tabs[index]
    const position = tab.position ?? { row: 0, col: 0 }
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

function activate(item: TerminalTab, index: number) {
  if (currentGroup.includes(index)) {
    activateTerminalTab(item)
  }
}
</script>

<template>
  <article class="terminal-view" :style="gridStyle">
    <template v-for="(tab, index) in tabs" :key="getTerminalTabID(tab)">
      <component
        :is="tab.pane ? tab.pane.component : TerminalTeletype"
        v-show="currentGroup.includes(index)"
        :tab="tab"
        :class="{ active: index === activeIndex, standalone: currentGroup.length <= 1 }"
        :style="{ 'grid-area': `a${index}` }"
        @click="activate(tab, index)"
      />
    </template>
  </article>
</template>

<style lang="scss" scoped>
@use '../assets/_partials';

.terminal-view {
  position: relative;
  display: grid;
  flex: 1;
  gap: var(--design-card-gap);
  min-height: 0;
  :deep(.terminal-block.active:not(.standalone)) {
    outline: 2px solid rgb(var(--system-accent));
    outline-offset: -2px;
  }
  :deep(.terminal-block:has(.xterm-viewport:focus-visible)) {
    outline: 2px dashed rgb(var(--system-accent));
    outline-offset: -2px;
  }
}
</style>
