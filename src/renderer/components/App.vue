<script lang="ts" setup>
import { webUtils } from 'electron'
import { onMounted } from 'vue'
import { ipcRenderer } from '@commas/electron-ipc'
import { TerminalContext } from '@commas/types/terminal'
import * as commas from '../../api/core-renderer'
import { loadAddons, loadCustomJS } from '../compositions/addon'
import {
  handleFrameMessages,
  useFullscreen,
} from '../compositions/frame'
import { handleI18nMessages } from '../compositions/i18n'
import { injectSettingsStyle, useSettings } from '../compositions/settings'
import {
  addFile,
  confirmClosing,
  handleShellMessages,
  useIsTabListEnabled,
  useIsTabListToggling,
  useWillQuit,
} from '../compositions/shell'
import {
  createTerminalTab,
  handleTerminalMessages,
  useTerminalTabs,
} from '../compositions/terminal'
import { injectThemeStyle, useTheme } from '../compositions/theme'
import { handleWebContentsMessages } from '../compositions/web-contents'
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
const isTabListToggling = $(useIsTabListToggling())
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
handleWebContentsMessages()

const argIndex = process.argv.indexOf('--') + 1
const args = argIndex ? process.argv.slice(argIndex) : []
let context: Partial<TerminalContext> | undefined
try {
  context = JSON.parse(args[0])
} catch {
  // ignore error
}
createTerminalTab(context)

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

function dragFileOver(event: DragEvent) {
  const dataTransfer = event.dataTransfer
  if (!dataTransfer) return
  const files = dataTransfer.files
  if (files.length) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

function dropFile(event: DragEvent) {
  const dataTransfer = event.dataTransfer
  if (!dataTransfer) return
  const files = dataTransfer.files
  if (files.length) {
    event.preventDefault()
    const paths = Array.from(files).map(file => webUtils.getPathForFile(file))
    for (const file of paths) {
      addFile(file)
    }
  }
}
</script>

<template>
  <div
    :class="['app', { 'is-opaque': isFullscreen, 'is-vibrant': theme.vibrancy }]"
    @dragover.prevent="dragFileOver"
    @drop="dropFile"
  >
    <TitleBar />
    <div class="page">
      <TabList v-if="!hasHorizontalTabList" v-show="isTabListEnabled" />
      <main :class="['content', { 'is-tab-list-toggling': isTabListToggling }]">
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

<style lang="scss">
@use '../assets/_partials';
@use '../assets/layers';

@property --scrollbar-opacity {
  syntax: '<number>';
  inherits: true;
  initial-value: 0;
}

::view-transition-group(*) {
  animation-duration: 0.1s;
}
::view-transition-group(root) {
  animation-duration: 0s !important;
}

// https://developer.apple.com/design/human-interface-guidelines/color#macOS-system-colors
:root {
  --system-red: 255 59 48;
  --system-orange: 255 149 0;
  --system-yellow: 255 204 0;
  --system-green: 40 205 65;
  --system-mint: 0 199 190;
  --system-teal: 89 173 196;
  --system-cyan: 85 190 240;
  --system-blue: 0 122 255;
  --system-indigo: 88 86 214;
  --system-purple: 175 82 222;
  --system-pink: 255 45 85;
  --system-brown: 162 132 94;
  --system-gray: 142 142 147;
  --system-accent: var(--system-blue);
  --design-active-background: rgb(var(--theme-background) / var(--theme-opacity));
  --design-card-border-radius: var(--design-card-gap);
  --design-card-gap: 8px;
  --design-card-shadow: 0 2px 4px 0px rgb(0 0 0 / 10%);
  --design-element-shadow: 0 1px 2px 0px rgb(0 0 0 / 10%);
  --design-highlight-color: rgb(var(--system-blue));
  --design-highlight-background: color-mix(in oklab, rgb(var(--theme-foreground) / 5%), rgb(var(--system-accent) / 5%));
  --design-input-background: color-mix(in oklab, rgb(var(--theme-foreground) / 10%) 75%, rgb(var(--system-accent) / 10%));
  --design-out-back-timing-function: cubic-bezier(0.18, 0.89, 0.32, 1.28);
  @media (prefers-color-scheme: dark) {
    --system-red: 255 69 58;
    --system-orange: 255 159 10;
    --system-yellow: 255 214 10;
    --system-green: 50 215 75;
    --system-mint: 102 212 207;
    --system-teal: 106 196 220;
    --system-cyan: 90 200 245;
    --system-blue: 10 132 255;
    --system-indigo: 94 92 230;
    --system-purple: 191 90 242;
    --system-pink: 255 55 95;
    --system-brown: 172 142 104;
    --system-gray: 152 152 157;
    --design-active-background: rgb(255 255 255 / 16.667%);
    --design-highlight-color: rgb(var(--system-mint));
    --design-highlight-background: rgb(255 255 255 / 5%);
  }
}
::selection {
  background: rgb(var(--theme-selectionbackground));
}
body {
  margin: 0;
  cursor: default;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
::view-transition-old(tab-list-toggling-content),
::view-transition-new(tab-list-toggling-content) {
  height: 100%;
}
</style>

<style lang="scss" scoped>
.app {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  color: rgb(var(--theme-foreground));
  /* Default line height of xterm.js */
  line-height: 1.2;
  overflow: hidden;
  background-image: linear-gradient(to right bottom, color-mix(in oklab, rgb(var(--system-accent) / var(--theme-opacity)) 4%, rgb(var(--theme-background) / var(--theme-opacity))), color-mix(in oklab, rgb(var(--system-accent) / var(--theme-opacity)) 8%, rgb(var(--theme-background) / var(--theme-opacity))));
  transition: color 0.2s;
  &.is-vibrant {
    background-image: linear-gradient(to right bottom, rgb(var(--system-accent) / 4%), rgb(var(--system-accent) / 8%));
    background-color: rgb(var(--theme-background) / 50%);
  }
}
.page {
  z-index: 1;
  display: flex;
  flex: auto;
  box-sizing: border-box;
  width: 100vw;
  min-height: 0;
  padding: 0 var(--design-card-gap);
}
.content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--design-card-gap);
  min-width: 0;
  &.is-tab-list-toggling {
    view-transition-name: tab-list-toggling-content;
  }
}
</style>
