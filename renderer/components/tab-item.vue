<template>
  <div :class="['tab-item', { active: isFocused }]">
    <div class="tab-overview">
      <div class="tab-title">
        <span
          v-if="iconEntry"
          :style="{ color: isFocused ? iconEntry.color : undefined }"
          :class="['tab-icon', iconEntry.name]"
        ></span>
        <span v-if="pane" v-i18n class="tab-name">{{ pane.title }}</span>
        <span v-else class="tab-name">{{ title }}</span>
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

<script lang="ts">
import * as path from 'path'
import { computed, unref } from 'vue'
import type { PropType } from 'vue'
import type { TerminalTab } from '../../typings/terminal'
import { getTerminalTabTitle, useCurrentTerminal, closeTerminalTab } from '../hooks/terminal'
import { getIconEntryByProcess } from '../utils/terminal'

export default {
  props: {
    name: {
      type: String,
      default: '',
    },
    tab: {
      type: Object as PropType<TerminalTab | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    const terminalRef = useCurrentTerminal()
    const isFocusedRef = computed(() => {
      return Boolean(props.tab) && unref(terminalRef) === props.tab
    })

    const paneRef = computed(() => {
      if (!props.tab) return null
      return props.tab.pane
    })

    const iconEntryRef = computed(() => {
      if (props.name || !props.tab) return null
      const pane = unref(paneRef)
      if (pane) return pane.icon
      return getIconEntryByProcess(props.tab.process)
    })

    const titleRef = computed(() => {
      if (props.name) return props.name
      return props.tab ? getTerminalTabTitle(props.tab) : ''
    })

    const idleStateRef = computed(() => {
      if (!props.tab || unref(paneRef)) return ''
      if (props.tab.alerting) return 'alerting'
      if (props.tab.process === path.basename(props.tab.shell)) return 'idle'
      return 'busy'
    })

    function close() {
      if (!props.tab) return
      closeTerminalTab(props.tab)
    }

    return {
      isFocused: isFocusedRef,
      pane: paneRef,
      iconEntry: iconEntryRef,
      title: titleRef,
      idleState: idleStateRef,
      close,
    }
  },
}
</script>

<style lang="scss" scoped>
.tab-item {
  padding: 0 16px;
}
.tab-title {
  display: flex;
  flex: auto;
  align-items: center;
  width: 0;
  opacity: 0.5;
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
}
.tab-overview {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--tab-height);
  border-bottom: 1px solid rgb(var(--theme-foreground) / 0.05);
  &::before {
    content: '';
    position: absolute;
    top: 11px;
    bottom: 11px;
    left: -16px;
    border-left: 5px solid rgb(var(--design-blue));
    transform: scale(0);
    transition: transform 0.15s, border-color 0.2s;
    .tab-item.active & {
      transform: scale(1);
    }
    .sortable-item.dragging & {
      border-left-color: rgb(var(--design-yellow));
      transform: scale(1);
    }
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
