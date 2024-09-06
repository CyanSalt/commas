<script lang="ts" setup>
import { ipcRenderer } from '@commas/electron-ipc'
import { onMounted } from 'vue'
import * as commas from '../../api/core-renderer'
import { loadAddons, loadCustomJS } from '../compositions/addon'
import {
  handleFrameMessages,
  useFullscreen,
} from '../compositions/frame'
import { handleI18nMessages } from '../compositions/i18n'
import { injectSettingsStyle, useSettings } from '../compositions/settings'
import {
  confirmClosing,
  handleShellMessages,
  useIsTabListEnabled,
  useWillQuit,
} from '../compositions/shell'
import {
  createTerminalTab,
  handleTerminalMessages,
  useTerminalTabs,
} from '../compositions/terminal'
import { injectThemeStyle, useTheme } from '../compositions/theme'
import ActionBar from './ActionBar.vue'
import FindBox from './FindBox.vue'
import TabList from './TabList.vue'
import TerminalView from './TerminalView.vue'
import TitleBar from './TitleBar.vue'

declare module '@commas/api/modules/app' {
  export interface Events {
    ready: never[],
    unload: never[],
  }
}

const settings = useSettings()
const theme = useTheme()
const isFullscreen = $(useFullscreen())
const isTabListEnabled = $(useIsTabListEnabled())
const tabs = $(useTerminalTabs())
const willQuit = $(useWillQuit())

const hasHorizontalTabList = $computed(() => {
  const position = settings['terminal.view.tabListPosition']
  return position === 'top' || position === 'bottom'
})

const slots = commas.proxy.context.getCollection('terminal.ui-slot')

loadAddons()
loadCustomJS()
injectSettingsStyle()
injectThemeStyle()
handleFrameMessages()
handleI18nMessages()
handleShellMessages()
handleTerminalMessages()

const argIndex = process.argv.indexOf('--') + 1
const args = argIndex ? process.argv.slice(argIndex) : []
const initialPath = args[0]
createTerminalTab({ cwd: initialPath })

window.addEventListener('beforeunload', async event => {
  if (!willQuit && tabs.length > 1) {
    event.returnValue = false
    const confirmed = await confirmClosing()
    if (confirmed) {
      commas.addon.unloadAddons()
      commas.proxy.app.events.emit('unload')
      ipcRenderer.invoke('destroy')
    }
  } else {
    commas.addon.unloadAddons()
    commas.proxy.app.events.emit('unload')
  }
})

onMounted(() => {
  commas.proxy.app.events.emit('ready')
})
</script>

<template>
  <div :class="['app', { 'is-opaque': isFullscreen, 'is-vibrant': theme.vibrancy }]">
    <TitleBar />
    <div class="content">
      <TabList v-if="!hasHorizontalTabList" v-show="isTabListEnabled" />
      <main class="interface">
        <FindBox />
        <TerminalView />
      </main>
    </div>
    <ActionBar />
    <component
      :is="slot"
      v-for="(slot, index) in slots"
      :key="index"
      class="slot"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '../assets/_partials';

@property --scrollbar-opacity {
  syntax: '<number>';
  inherits: true;
  initial-value: 0;
}

// https://developer.apple.com/design/human-interface-guidelines/color#macOS-system-colors
:global(:root) {
  --system-red: 255 49 38;
  --system-yellow: 245 139 0;
  --system-green: 30 195 55;
  --system-cyan: 0 189 180;
  --system-blue: 0 122 245;
  --system-magenta: 245 35 75;
  --system-accent: var(--system-blue);
  --design-active-background: rgb(var(--theme-background) / var(--theme-opacity));
  --design-alert-color: rgb(var(--system-blue));
  --design-card-border-radius: var(--design-card-gap);
  --design-card-gap: 8px;
  --design-card-shadow: 0 2px 4px 0px rgb(0 0 0 / 10%);
  --design-element-shadow: 0 1px 2px 0px rgb(0 0 0 / 10%);
  --design-highlight-color: rgb(var(--system-blue));
  --design-highlight-background: color-mix(in hsl, rgb(var(--theme-foreground) / 5%), rgb(var(--acrylic-background) / 5%));
  --design-input-background: color-mix(in hsl, rgb(var(--theme-foreground) / 10%) 75%, rgb(var(--acrylic-background) / 10%));
  --design-separator: rgb(var(--theme-foreground) / 10%);
  @media (prefers-color-scheme: dark) {
    --system-cyan: 108 224 219;
    --design-active-background: rgb(255 255 255 / 16.667%);
    --design-alert-color: rgb(var(--system-yellow));
    --design-highlight-color: rgb(var(--system-cyan));
    --design-highlight-background: rgb(255 255 255 / 5%);
  }
}
:global(::selection) {
  background: rgb(var(--theme-selectionbackground));
}
:global(body) {
  margin: 0;
  cursor: default;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.app {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  color: rgb(var(--theme-foreground));
  /* Default line height of xterm.js */
  line-height: 1.2;
  overflow: hidden;
  background-image: linear-gradient(to right bottom, color-mix(in sRGB, rgb(var(--acrylic-background) / var(--theme-opacity)) 6%, rgb(var(--theme-background) / var(--theme-opacity))), color-mix(in sRGB, rgb(var(--acrylic-background) / var(--theme-opacity)) 12%, rgb(var(--theme-background) / var(--theme-opacity))));
  transition: color 0.2s;
  &.is-vibrant {
    background-image: linear-gradient(to right bottom, rgb(var(--acrylic-background) / 6%), rgb(var(--acrylic-background) / 12%));
  }
}
.content {
  z-index: 1;
  display: flex;
  flex: auto;
  box-sizing: border-box;
  width: 100vw;
  min-height: 0;
  padding: 0 var(--design-card-gap);
}
.interface {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--design-card-gap);
  min-width: 0;
}
</style>
