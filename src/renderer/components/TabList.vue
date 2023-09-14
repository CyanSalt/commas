<script lang="ts" setup>
import * as path from 'node:path'
import { watchEffect } from 'vue'
import * as commas from '../../../api/core-renderer'
import { useAsyncComputed } from '../../shared/compositions'
import type { MenuItem } from '../../typings/menu'
import { useSettings } from '../compositions/settings'
import {
  activateTerminalTab,
  cancelTerminalTabGrouping,
  createTerminalTab,
  getTerminalTabIndex,
  moveTerminalTab,
  splitTerminalTab,
  useCurrentTerminal,
  useMovingTerminalIndex,
  useTerminalTabs,
} from '../compositions/terminal'
import { openContextMenu } from '../utils/frame'
import { handleMousePressing } from '../utils/helper'
import { getShells } from '../utils/terminal'
import TabItem from './TabItem.vue'
import SortableList from './basic/SortableList.vue'
import VisualIcon from './basic/VisualIcon.vue'

const lists = commas.proxy.context.getCollection('terminal.ui-side-list')
const shells = $(useAsyncComputed(() => getShells(), []))

const tabs = $(useTerminalTabs())
const terminal = $(useCurrentTerminal())
let movingIndex = $(useMovingTerminalIndex())

let width = $ref(176)

const settings = useSettings()

const position = $computed(() => settings['terminal.view.tabListPosition'])

const isHorizontal: boolean = $computed(() => {
  return position === 'top' || position === 'bottom'
})

const profiles = $computed(() => {
  return settings['terminal.shell.extraProfiles']
})

const standaloneTabs = $computed(() => {
  if (isHorizontal) return tabs
  return tabs.filter(tab => !tab.character)
})

function startMoving(from: number) {
  const movingTab = standaloneTabs[from]
  if (!movingTab) return
  movingIndex = getTerminalTabIndex(movingTab)
}

function stopMoving() {
  movingIndex = -1
}

function sortTabs(from: number, to: number) {
  stopMoving()
  const toIndex = getTerminalTabIndex(standaloneTabs[to])
  moveTerminalTab(standaloneTabs[from], toIndex)
}

function selectShell(event: MouseEvent) {
  const profileOptions = profiles.map((profile, index) => ({
    label: profile.label ?? JSON.stringify(profile),
    command: 'open-tab',
    args: [profile],
  }))
  const shellOptions: MenuItem[] = shells.map(shell => ({
    label: path.basename(shell),
    command: 'open-tab',
    args: [{ shell }],
  }))
  if (!profileOptions.length && !shellOptions.length) return
  openContextMenu([
    ...profileOptions,
    ...(profiles.length && shellOptions.length ? [{ type: 'separator' as const }] : []),
    ...shellOptions,
  ], event)
}

function selectDefaultShell(event: MouseEvent) {
  if (process.platform === 'darwin' ? event.metaKey : event.ctrlKey) {
    if (terminal) {
      splitTerminalTab(terminal)
    }
  } else {
    createTerminalTab()
  }
}

function resize(startingEvent: DragEvent) {
  const original = width
  const start = startingEvent.clientX
  const max = document.body.clientWidth / 2
  handleMousePressing({
    onMove(event) {
      const diff = event.clientX - start
      const target = original + (position === 'right' ? -diff : diff)
      width = Math.min(Math.max(target, 120), max)
    },
  })
}

const movingGroupTab = $computed(() => {
  if (movingIndex === -1) return false
  const tab = tabs[movingIndex]
  return tab.group ? tab : undefined
})

let newTabElement = $ref<HTMLElement | undefined>()
let isCancelingGroup = $ref(false)

watchEffect(onInvalidate => {
  if (newTabElement && movingGroupTab) {
    const cancel = handleMousePressing({
      element: newTabElement,
      onMove(event) {
        event.preventDefault()
        isCancelingGroup = true
      },
      onEnd(event) {
        event.preventDefault()
        isCancelingGroup = false
        cancelTerminalTabGrouping(movingGroupTab)
      },
      onLeave() {
        isCancelingGroup = false
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
  <nav :class="['tab-list', position, isHorizontal ? 'horizontal' : 'vertical']">
    <div class="list-content" :style="{ width: isHorizontal ? '' : width + 'px' }">
      <div class="default-list">
        <SortableList
          v-slot="{ value }"
          :value="standaloneTabs"
          value-key="pid"
          :direction="isHorizontal ? 'horizontal' : 'vertical'"
          class="processes"
          @move="startMoving"
          @stop="stopMoving"
          @change="sortTabs"
        >
          <TabItem
            :tab="value"
            @click="activateTerminalTab(value)"
          />
        </SortableList>
        <div ref="newTabElement" :class="['new-tab', { 'is-canceling-group': isCancelingGroup }]">
          <div v-if="shells.length" class="select-shell anchor" @click="selectShell">
            <VisualIcon name="lucide-list-plus" />
          </div>
          <div
            class="default-shell anchor"
            @click="selectDefaultShell"
            @contextmenu="selectShell"
          >
            <VisualIcon v-if="movingGroupTab" name="lucide-ungroup" />
            <VisualIcon v-else name="feather-plus" />
          </div>
        </div>
      </div>
      <component
        :is="list"
        v-for="(list, index) in lists"
        :key="index"
      />
    </div>
    <div v-if="!isHorizontal" draggable="true" class="sash" @dragstart.prevent="resize"></div>
  </nav>
</template>

<style lang="scss" scoped>
@use '../assets/_partials';

.tab-list {
  --min-tab-height: 36px;
  --primary-icon-size: 21px;
  display: flex;
  flex: none;
  font-size: 14px;
  &.right {
    order: 1;
  }
  &.horizontal {
    --primary-icon-size: 18px;
    flex: 1;
    min-width: 0;
    :deep(.sortable-list) {
      flex: 0 1 auto;
      flex-direction: row;
      min-width: 0;
    }
    :deep(.sortable-item) {
      flex: 1;
      width: 176px;
      min-width: 0;
    }
  }
}
.list-content {
  @include partials.scroll-container(8px);
  display: flex;
  flex: auto;
  .tab-list.vertical & {
    flex-direction: column;
    width: 176px;
    background: rgb(var(--theme-background) / var(--design-card-secondary-opacity));
    border-radius: var(--design-card-border-radius);
    box-shadow: var(--design-card-shadow);
  }
  .app.is-opaque .tab-list.vertical & {
    background: rgb(var(--theme-background));
  }
}
.default-list {
  display: flex;
  .tab-list.vertical & {
    flex-direction: column;
  }
}
.sash {
  flex: none;
  width: var(--design-card-gap);
  cursor: col-resize;
  .tab-list.right & {
    order: -1;
  }
}
.new-tab {
  display: flex;
  height: var(--min-tab-height);
  padding: 8px 16px;
  line-height: var(--min-tab-height);
  text-align: center;
  .tab-list.horizontal & {
    padding: 8px 12px;
  }
}
.select-shell {
  flex: none;
  width: 18px;
  .tab-list.vertical & {
    visibility: hidden;
  }
  .tab-list.vertical .new-tab:hover:not(.is-canceling-group) & {
    visibility: visible;
  }
  .tab-list.horizontal & {
    margin-left: 12px;
  }
}
.default-shell {
  flex: auto;
  font-size: var(--primary-icon-size);
  .new-tab.is-canceling-group & {
    color: rgb(var(--system-red));
  }
}
.select-shell + .default-shell {
  order: -1;
  .tab-list.vertical & {
    padding-left: 18px;
  }
}
.anchor {
  opacity: 0.5;
  transition: opacity 0.2s, color 0.2s;
  cursor: pointer;
  &:hover:not(.disabled),
  &.active {
    opacity: 1;
  }
}
</style>
