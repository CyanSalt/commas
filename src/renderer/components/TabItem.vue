<script lang="ts" setup>
import { nextTick, useId, watchEffect } from 'vue'
import type { TerminalTab, TerminalTabCharacter } from '@commas/types/terminal'
import { isDarkColor, toRGBA } from '../../shared/color'
import { useSettings } from '../compositions/settings'
import { closeTerminalTab, getTerminalTabTitle, useCurrentTerminal } from '../compositions/terminal'
import { getIconEntry, isShellProcess } from '../utils/terminal'
import VisualIcon from './basic/VisualIcon.vue'

const { tab, character, closable = false, customizable = false } = defineProps<{
  tab?: TerminalTab | undefined,
  character?: TerminalTabCharacter | undefined,
  closable?: boolean,
  customizable?: boolean,
}>()

const emit = defineEmits<{
  (event: 'close', tab: TerminalTab | undefined): void,
  (event: 'customize', title: string): void,
}>()

defineSlots<{
  operations?: (props: {}) => any,
}>()

const id = useId()

const settings = useSettings()
const terminal = $(useCurrentTerminal())

const isFocused = $computed(() => {
  return Boolean(tab) && terminal === tab
})

const isStandalone = $computed(() => {
  if (!isFocused) return false
  return !tab?.group
})

const isActive = $computed(() => {
  if (isFocused) return true
  return terminal?.group && tab?.group
    && terminal.group === tab.group
})

const pane = $computed(() => {
  if (!tab) return null
  return tab.pane
})

const defaultIconEntry = $computed(() => {
  if (character) {
    if (character.defaultIcon) {
      return character.defaultIcon
    }
  }
  if (pane) {
    if (pane.icon) {
      return pane.icon
    }
  }
  return undefined
})

const iconEntry = $computed(() => {
  if (character) {
    if (character.icon) {
      return character.icon
    }
  }
  if (tab) {
    if (!pane) {
      if (!isShellProcess(tab)) {
        return getIconEntry(tab)
      }
    } else {
      if (tab.shell) {
        return getIconEntry(tab)
      }
    }
  }
  return defaultIconEntry
})

const iconClass = $computed(() => {
  if (!iconEntry) return undefined
  return {
    'is-filled': iconEntry.filled,
  }
})

const iconStyle = $computed(() => {
  if (!iconEntry) return undefined
  return {
    '--icon-color': iconEntry.color,
    '--icon-alt-color': iconEntry.color ? (
      isDarkColor(toRGBA(iconEntry.color)) ? 'white' : 'black'
    ) : undefined,
  }
})

const title = $computed(() => {
  if (character?.title) return character.title
  return tab ? getTerminalTabTitle(tab) : ''
})

let isCustomizing = $ref(false)
let customTitle: string = $ref('')
let customTitleElement = $ref<HTMLInputElement>()

watchEffect(() => {
  customTitle = title
})

const isCustomizable = $computed(() => {
  return customizable || Boolean(pane?.instance?.rename)
})

async function startCustomization() {
  if (isCustomizable && isActive) {
    isCustomizing = true
    await nextTick()
    if (customTitleElement) {
      customTitleElement.select()
    }
  }
}

function customize() {
  if (!isCustomizing) return
  if (customTitle !== title) {
    if (pane?.instance?.rename) {
      pane.instance.rename(customTitle)
    } else {
      emit('customize', customTitle)
    }
  }
  isCustomizing = false
}

function resetTitle() {
  customTitle = title
  isCustomizing = false
}

function autoselect(event: FocusEvent) {
  (event.target as HTMLInputElement).select()
}

const idleState = $computed(() => {
  if (!tab) return ''
  if (tab.alerting) return 'alerting'
  if (typeof tab.idle === 'boolean') return tab.idle ? 'idle' : 'busy'
  if (tab.command === '') return 'idle'
  if (pane) return ''
  if (isShellProcess(tab)) return 'idle'
  return 'busy'
})

const thumbnail = $computed(() => {
  if (!tab) return ''
  if (pane) return ''
  if (!settings['terminal.tab.livePreview']) return ''
  const tabListPosition = settings['terminal.view.tabListPosition']
  if (tabListPosition === 'top' || tabListPosition === 'bottom') return ''
  if (idleState === 'idle') return ''
  if (tab.thumbnail) return tab.thumbnail
  return ''
})

function close() {
  if (!closable && tab) {
    closeTerminalTab(tab)
  }
  emit('close', tab)
}
</script>

<template>
  <div
    :class="['tab-item', {
      active: isActive,
      focused: isFocused,
      standalone: isStandalone,
      virtual: !tab,
    }]"
    :style="{ 'view-transition-name': `view-transition-${id}` }"
  >
    <div class="tab-overview">
      <div class="tab-title">
        <span :class="['tab-icon', iconClass]" :style="iconStyle">
          <VisualIcon v-if="iconEntry" :name="iconEntry.name" />
          <template v-else-if="pane && tab!.shell">
            <VisualIcon v-if="tab!.process === tab!.cwd" name="lucide-folder-open" />
            <VisualIcon v-else name="lucide-file" />
          </template>
          <VisualIcon v-else name="lucide-terminal" />
        </span>
        <form v-if="isCustomizing" class="tab-name-form" @submit.prevent="customize">
          <input
            ref="customTitleElement"
            v-model="customTitle"
            autofocus
            class="custom-tab-name"
            @focus="autoselect"
            @blur="customize"
            @keydown.esc="resetTitle"
          >
        </form>
        <span v-else class="tab-name" @click="startCustomization">{{ customTitle }}</span>
      </div>
      <div class="right-side">
        <div v-if="idleState" :class="['idle-light', idleState]"></div>
        <div class="operations">
          <slot name="operations"></slot>
          <button v-if="closable || tab" type="button" data-commas class="close" @click.stop="close">
            <VisualIcon name="lucide-x" />
          </button>
        </div>
      </div>
    </div>
    <div v-if="thumbnail" class="tab-thumbnail">{{ thumbnail }}</div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:math';
@use '../assets/_partials';

.tab-item {
  padding: 0 #{8px - (math.div(18px - 14px, 2) + 2px)} 0 8px;
  border-radius: 8px;
  // https://github.com/react-dnd/react-dnd/issues/788
  transform: translate(0, 0);
  transition: transform 0.2s;
  &:hover {
    background: var(--design-highlight-background);
  }
  &:active {
    transform: scale(partials.nano-scale(156));
    transition-delay: 100ms;
  }
  &.active {
    background: var(--design-active-background);
    box-shadow: var(--design-element-shadow);
    .app:not(.is-window-focused) & {
      background: rgb(from var(--design-active-background) r g b / 50%);
    }
  }
  &.focused:not(.standalone) {
    outline: 2px solid rgb(var(--system-accent));
    outline-offset: -2px;
  }
}
.tab-title {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
}
.tab-icon {
  --icon-color: rgb(var(--system-accent));
  --icon-alt-color: white;
  display: flex;
  flex: none;
  justify-content: center;
  align-items: center;
  height: 1em;
  margin-right: 6px;
  padding: 3px;
  color: var(--icon-alt-color);
  font-size: 12px;
  background: var(--icon-color);
  border-radius: 4px;
  :deep(.visual-icon) {
    filter: drop-shadow(2px 2px 2px rgb(0 0 0 / 25%));
  }
  &.is-filled {
    padding: 0;
    color: var(--icon-color);
    font-size: #{12px + 3px * 2};
    overflow: hidden;
    background: var(--icon-alt-color);
    :deep(.visual-icon) {
      filter: none;
    }
  }
  .tab-item.virtual & {
    color: var(--icon-color);
    background: rgb(from var(--icon-color) r g b / 16.6667%);
    :deep(.visual-icon) {
      filter: none;
    }
    &.is-filled {
      color: color-mix(in oklab, var(--icon-color) 16.6667%, rgb(var(--theme-background)));
      background: var(--icon-color);
    }
  }
}
.tab-name {
  flex: auto;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  transition: color 0.2s;
}
.tab-name-form {
  display: flex;
  flex: 1;
  min-width: 0;
}
.custom-tab-name {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: none;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  background: transparent;
  outline: none;
}
.tab-overview {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--min-tab-height);
}
.right-side {
  flex: none;
}
.idle-light {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin: 0 #{math.div(18px + 2 * 2px - 6px, 2)};
  color: rgb(var(--theme-foreground) / 25%);
  vertical-align: 1px;
  background: currentColor;
  border-radius: 50%;
  transition: color 0.2s, opacity 0.2s;
  &.busy {
    color: rgb(var(--system-green));
  }
  &.alerting {
    color: rgb(var(--system-yellow));
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
  :deep(button[data-commas]) {
    font-size: 14px;
    &:active {
      transform: scale(partials.nano-scale(18));
    }
  }
}
.close:hover {
  color: rgb(var(--system-red));
}
.tab-thumbnail {
  padding-bottom: calc((var(--min-tab-height) - 16px) / 2);
  color: rgb(var(--theme-foreground) / 50%);
  font-style: italic;
  font-size: 12px;
  line-height: 12px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
