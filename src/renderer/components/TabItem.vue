<script lang="ts" setup>
import * as path from 'path'
import type { TerminalTab, TerminalTabGroup } from '../../../typings/terminal'
import { getTerminalTabTitle, useCurrentTerminal, closeTerminalTab } from '../compositions/terminal'
import { getIconEntryByProcess } from '../utils/terminal'

const { tab, group } = defineProps<{
  tab?: TerminalTab | undefined,
  group?: TerminalTabGroup | undefined,
}>()

const terminal = $(useCurrentTerminal())
const isFocused = $computed(() => {
  return Boolean(tab) && terminal === tab
})

const pane = $computed(() => {
  if (!tab) return null
  return tab.pane
})

const iconEntry = $computed(() => {
  if (group) return group.icon
  if (!tab) return null
  if (pane && !tab.shell) return pane.icon
  return getIconEntryByProcess(tab.process)
})

const title = $computed(() => {
  if (group) return group.title
  return tab ? getTerminalTabTitle(tab) : ''
})

const idleState = $computed(() => {
  if (!tab) return ''
  if (tab.alerting) return 'alerting'
  if (pane) return ''
  if (tab.process === path.basename(tab.shell)) return 'idle'
  return 'busy'
})

function close() {
  if (!tab) return
  closeTerminalTab(tab)
}
</script>

<template>
  <div :class="['tab-item', { active: isFocused }]">
    <div class="tab-overview">
      <div class="tab-title">
        <span
          v-if="iconEntry"
          :style="{ color: isFocused ? iconEntry.color : undefined }"
          :class="['tab-icon', iconEntry.name]"
        ></span>
        <span v-else-if="pane && tab!.shell" class="tab-icon feather-icon icon-file"></span>
        <span v-else class="tab-icon feather-icon icon-terminal"></span>
        <span class="tab-name">{{ title }}</span>
      </div>
      <div class="right-side">
        <div v-if="idleState" :class="['idle-light', idleState]"></div>
        <div class="operations">
          <slot name="operations"></slot>
          <div v-if="tab" class="button close" @click.stop="close">
            <div class="feather-icon icon-x"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tab-item {
  padding: 8px 8px 0;
}
.tab-title {
  display: flex;
  flex: auto;
  align-items: center;
  width: 0;
  opacity: 0.5;
  transition: opacity 0.2s;
  // .tab-item:hover &,
  .tab-item.active &,
  .sortable-item.dragging & {
    opacity: 1;
  }
}
.tab-icon {
  display: inline-block;
  flex: none;
  margin-right: 6px;
  &.feather-icon {
    margin-top: -2px;
  }
}
.tab-name {
  flex: auto;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  transition: color 0.2s;
  .sortable-item.dragging & {
    color: rgb(var(--design-yellow));
  }
}
.tab-overview {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--tab-height);
  padding: 0 8px;
  border-radius: 8px;
  .tab-item.active & {
    background: rgb(var(--theme-foreground) / 0.15);
  }
}
.right-side {
  flex: none;
}
.idle-light {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin: 0 6px;
  vertical-align: 1px;
  background: currentColor;
  border-radius: 50%;
  transition: color 0.2s;
  &.busy {
    color: rgb(var(--design-green));
  }
  &.alerting {
    color: rgb(var(--design-yellow));
  }
  .tab-item:hover & {
    display: none;
  }
}
.operations {
  display: none;
  font-size: 14px;
  text-align: center;
  .tab-item:hover & {
    display: flex;
  }
}
.button {
  width: 18px;
  transition: color 0.2s;
  cursor: pointer;
}
.close:hover {
  color: rgb(var(--design-red));
}
</style>
