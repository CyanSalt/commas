<script lang="ts" setup>
import { ipcRenderer } from 'electron'
import { onMounted } from 'vue'
import * as commas from '../../../api/core-renderer'
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
import '@phosphor-icons/web/bold'
import 'devicon'

const settings = useSettings()
const theme = useTheme()
const isFullscreen = $(useFullscreen())
const isTabListEnabled = $(useIsTabListEnabled())
const tabs = $(useTerminalTabs())
const willQuit: boolean = $(useWillQuit())

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

const startIndex = process.argv.indexOf('--') + 1
const args = startIndex ? process.argv.slice(startIndex) : []
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

// https://developer.apple.com/design/human-interface-guidelines/macos/visual-design/color#system-colors
:global(:root) {
  --system-red: 255 69 58;
  --system-yellow: 255 214 10;
  --system-green: 50 215 75;
  --system-cyan: 102 212 207;
  --system-blue: 10 132 255;
  --system-magenta: 255 55 95;
  --system-accent: var(--system-blue);
  --design-highlight-background: rgb(var(--theme-foreground) / 0.15);
  --design-input-background: rgb(var(--theme-foreground) / 0.1);
  --design-separator: rgb(var(--theme-foreground) / 0.1);
  --design-card-gap: 8px;
  --design-card-border-radius: var(--design-card-gap);
  --design-card-shadow: 0 2px 4px 2px rgb(0 0 0 / 10%);
  --design-card-secondary-opacity: calc(var(--theme-opacity) * 3 / 4);
  --acrylic-background: 133 194 255;
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
:global(.ph-bold) {
  line-height: inherit;
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
  background-image: linear-gradient(to right bottom, rgb(var(--acrylic-background) / 5%), rgb(var(--acrylic-background) / 25%));
  background-color: rgb(var(--theme-background) / var(--theme-opacity));
  transition: color 0.2s;
  &.is-vibrant {
    --vibrancy-filter: drop-shadow(0 0 0.5em rgb(var(--theme-background))) blur(2px);
    background-color: transparent;
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
