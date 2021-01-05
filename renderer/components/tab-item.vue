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
import { useSettings } from '../hooks/settings'
import { useCurrentTerminal, closeTerminalTab } from '../hooks/terminal'
import { getPrompt, getIconEntryByProcess } from '../utils/terminal'

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

    const settingsRef = useSettings()
    const titleRef = computed(() => {
      if (props.name) return props.name
      if (!props.tab) return ''
      if (process.platform !== 'win32' && props.tab.title) {
        return props.tab.title
      }
      const settings = unref(settingsRef)
      const expr = settings['terminal.tab.titleFormat']
      return getPrompt(expr, props.tab) || props.tab.process
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

<style lang="scss">
.tab-item {
  padding: 0 16px;
  &.active {
    .tab-title {
      opacity: 1;
    }
    .tab-overview::before {
      transform: scale(1);
    }
  }
  &:hover {
    .idle-light {
      display: none;
    }
    .operations {
      display: flex;
    }
  }
  .sortable-item.dragging & {
    .tab-overview::before {
      transform: scale(1);
      border-left-color: var(--design-yellow);
    }
    .tab-item .tab-title {
      opacity: 1;
    }
  }
  .tab-title {
    flex: auto;
    width: 0;
    display: flex;
    align-items: center;
    opacity: 0.5;
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
  }
  .operations {
    display: none;
    text-align: center;
    font-size: 14px;
  }
  .operations .button {
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
}
</style>
