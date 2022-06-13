<script lang="ts" setup>
import * as path from 'path'
import * as commas from '../../../api/core-renderer'
import { useAsyncComputed } from '../../shared/compositions'
import {
  useTerminalTabs,
  createTerminalTab,
  moveTerminalTab,
  activateTerminalTab,
  getTerminalTabIndex,
} from '../compositions/terminal'
import { openContextMenu } from '../utils/frame'
import { handleMousePressing } from '../utils/helper'
import { getShells } from '../utils/terminal'
import TabItem from './TabItem.vue'
import SortableList from './basic/SortableList.vue'

const lists = commas.proxy.context.getCollection('@ui-side-list')
const shells = $(useAsyncComputed(() => getShells(), []))

const tabs = $(useTerminalTabs())

let width = $ref(176)

const standaloneTabs = $computed(() => {
  return tabs.filter(tab => !tab.group)
})

function sortTabs(from: number, to: number) {
  const toIndex = getTerminalTabIndex(standaloneTabs[to])
  moveTerminalTab(standaloneTabs[from], toIndex)
}

function selectShell(event: MouseEvent) {
  if (!shells.length) return
  openContextMenu(shells.map(shell => ({
    label: path.basename(shell),
    command: 'open-tab',
    args: [{ shell }],
  })), event)
}

function resize(startingEvent: DragEvent) {
  const original = width
  const start = startingEvent.clientX
  const max = document.body.clientWidth / 2
  handleMousePressing({
    onMove(event) {
      const target = original + event.clientX - start
      width = Math.min(Math.max(target, 120), max)
    },
  })
}
</script>

<template>
  <nav class="tab-list">
    <div class="list" :style="{ width: width + 'px' }">
      <SortableList
        v-slot="{ value }"
        :value="standaloneTabs"
        value-key="pid"
        class="processes"
        @change="sortTabs"
      >
        <TabItem
          :tab="value"
          @click="activateTerminalTab(value)"
        />
      </SortableList>
      <div class="new-tab">
        <div v-if="shells.length" class="select-shell anchor" @click="selectShell">
          <span class="feather-icon icon-more-horizontal"></span>
        </div>
        <div
          class="default-shell anchor"
          @click="createTerminalTab()"
          @contextmenu="selectShell"
        >
          <span class="feather-icon icon-plus"></span>
        </div>
      </div>
      <component
        :is="list"
        v-for="(list, index) in lists"
        :key="index"
      />
    </div>
    <div draggable="true" class="sash" @dragstart.prevent="resize"></div>
  </nav>
</template>

<style lang="scss" scoped>
@use '../assets/_partials';

.tab-list {
  --min-tab-height: 36px;
  display: flex;
  flex: none;
  font-size: 14px;
  background: rgb(var(--secondary-background) / var(--theme-opacity));
}
.list {
  @include partials.scroll-container(8px);
  position: relative;
  display: flex;
  flex: auto;
  flex-direction: column;
  width: 176px;
}
.sash {
  flex: none;
  width: 4px;
  cursor: col-resize;
}
.new-tab {
  display: flex;
  height: var(--min-tab-height);
  padding: 8px 16px 0;
  line-height: var(--min-tab-height);
  text-align: center;
}
.select-shell {
  flex: none;
  width: 18px;
  visibility: hidden;
  .new-tab:hover & {
    visibility: visible;
  }
}
.default-shell {
  flex: auto;
  font-size: 21px;
}
.select-shell + .default-shell {
  order: -1;
  padding-left: 18px;
}
.anchor {
  opacity: 0.5;
  transition: opacity 0.2s;
  cursor: pointer;
  &:hover:not(.disabled),
  &.active {
    opacity: 1;
  }
}
</style>
