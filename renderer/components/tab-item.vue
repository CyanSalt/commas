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
    <div class="divider"></div>
  </div>
</template>

<script lang="ts">
import * as path from 'path'
import type { PropType } from 'vue'
import { reactive, toRefs, computed, unref } from 'vue'
import type { TerminalTab } from '../../typings/terminal'
import { getTerminalTabTitle, useCurrentTerminal, closeTerminalTab } from '../hooks/terminal'
import { getIconEntryByProcess } from '../utils/terminal'

export default {
  name: 'tab-item',
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
    const state = reactive({})

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
      if (props.tab.process === path.basename(props.tab.shell)) return 'idle'
      return 'busy'
    })

    function close() {
      if (!props.tab) return
      closeTerminalTab(props.tab)
    }

    return {
      ...toRefs(state),
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
  flex: auto;
  width: 0;
  display: flex;
  align-items: center;
  opacity: 0.5;
  .tab-item.active &,
  .sortable-item.dragging & {
    opacity: 1;
  }
}
.tab-icon {
  flex: none;
  display: inline-block;
  margin-right: 6px;
  &.feather-icon {
    margin-top: -2px;
  }
}
.tab-name {
  flex: auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tab-overview {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--tab-height);
  &::before {
    content: '';
    position: absolute;
    top: 11px;
    bottom: 11px;
    transform: scale(0);
    left: -16px;
    border-left: 5px solid var(--design-blue);
    transition: transform 0.15s, border-color 0.2s;
    .tab-item.active & {
      transform: scale(1);
    }
    .sortable-item.dragging & {
      transform: scale(1);
      border-left-color: var(--design-yellow);
    }
  }
}
.right-side {
  flex: none;
}
.idle-light {
  display: inline-block;
  margin: 0 6px;
  width: 6px;
  height: 6px;
  vertical-align: 1px;
  border-radius: 50%;
  background: currentColor;
  transition: color 0.2s;
  &.busy {
    color: var(--design-green);
  }
  .tab-item:hover & {
    display: none;
  }
}
.operations {
  display: none;
  text-align: center;
  font-size: 14px;
  .tab-item:hover & {
    display: flex;
  }
}
.button {
  width: 18px;
  cursor: pointer;
  transition: color 0.2s;
}
.close:hover {
  color: var(--design-red);
}
.divider {
  border-bottom: 1px solid var(--theme-foreground);
  opacity: 0.05;
}
</style>
