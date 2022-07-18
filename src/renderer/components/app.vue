<script lang="ts" setup>
import { ipcRenderer } from 'electron'
import { onMounted } from 'vue'
import * as commas from '../../../api/core-renderer'
import { loadAddons, loadCustomJS } from '../compositions/addon'
import {
  useFullscreen,
  handleFrameMessages,
} from '../compositions/frame'
import {
  useIsTabListEnabled,
  useWillQuit,
  confirmClosing,
  handleShellMessages,
} from '../compositions/shell'
import {
  useCurrentTerminal,
  useTerminalTabs,
  handleTerminalMessages,
  createTerminalTab,
} from '../compositions/terminal'
import { injectTheme } from '../compositions/theme'
import ActionBar from './ActionBar.vue'
import CodeEditorPane from './CodeEditorPane.vue'
import FindBox from './FindBox.vue'
import TabList from './TabList.vue'
import TerminalTeletype from './TerminalTeletype.vue'
import TitleBar from './TitleBar.vue'
import '../assets/fonts/feather.css'
import '../assets/fonts/devicon.css'

const isFullscreen = $(useFullscreen())
const isTabListEnabled = $(useIsTabListEnabled())
const terminal = $(useCurrentTerminal())
const tabs = $(useTerminalTabs())
const willQuit: boolean = $(useWillQuit())

const TerminalComponent = $computed(() => {
  if (!terminal) return undefined
  if (terminal.pane) {
    if (terminal.pane.type === 'editor') {
      return CodeEditorPane
    } else {
      return terminal.pane.component
    }
  } else {
    return TerminalTeletype
  }
})

const slots = commas.proxy.context.getCollection('terminal.ui-slot')

loadAddons()
loadCustomJS()
injectTheme()
handleFrameMessages()
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

commas.proxy.app.events.once('terminal-addons-loaded', () => {
  requestIdleCallback(() => {
    ipcRenderer.send('bootstrap')
  })
})

onMounted(() => {
  commas.proxy.app.events.emit('ready')
})
</script>

<template>
  <div :class="['app', { 'is-opaque': isFullscreen }]">
    <TitleBar />
    <div class="content">
      <TabList v-show="isTabListEnabled" />
      <main class="interface">
        <FindBox />
        <template v-if="terminal">
          <keep-alive>
            <TerminalComponent
              :key="terminal.pid"
              :tab="terminal"
            />
          </keep-alive>
        </template>
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
  --design-card-background: rgb(var(--theme-foreground) / 0.15);
  --design-input-background: rgb(127 127 127 / 0.2);
  --design-separator: rgb(127 127 127 / 0.2);
}
:global(::selection) {
  background: rgb(var(--theme-selection));
}
:global(body) {
  margin: 0;
  font-family: Fira Code, Cascadia Code, Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace;
  font-size: 14px;
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
  transition: background 0.2s;
}
.content {
  z-index: 1;
  display: flex;
  flex: auto;
  width: 100vw;
  overflow: hidden;
}
.interface {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  background: rgb(var(--theme-background) / var(--theme-opacity));
  .app.is-opaque & {
    background: rgb(var(--theme-background));
  }
}
</style>
