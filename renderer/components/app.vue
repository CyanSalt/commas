<template>
  <div :class="['app', { opaque: isFullscreen }]">
    <title-bar></title-bar>
    <div class="content">
      <tab-list v-show="isTabListEnabled"></tab-list>
      <main class="interface">
        <find-box></find-box>
        <template v-if="terminal">
          <keep-alive>
            <template v-if="terminal.pane">
              <component
                :is="terminal.pane.component"
                :key="terminal.pid"
              ></component>
            </template>
            <template v-else>
              <terminal-teletype
                :key="terminal.pid"
                :tab="terminal"
              ></terminal-teletype>
            </template>
          </keep-alive>
        </template>
      </main>
    </div>
    <component
      :is="slot"
      v-for="(slot, index) in slots"
      :key="index"
      class="slot"
    ></component>
  </div>
</template>

<script lang="ts">
import { ipcRenderer } from 'electron'
import { reactive, toRefs, unref, onMounted } from 'vue'
import * as commas from '../../api/renderer'
import { loadAddons, loadCustomJS } from '../hooks/addon'
import {
  useFullscreen,
  handleFrameMessages,
} from '../hooks/frame'
import { handleLauncherMessages } from '../hooks/launcher'
import {
  useIsTabListEnabled,
  useWillQuit,
  confirmClosing,
  handleShellMessages,
} from '../hooks/shell'
import {
  useCurrentTerminal,
  useTerminalTabs,
  handleTerminalMessages,
  createTerminalTab,
} from '../hooks/terminal'
import { injectTheme } from '../hooks/theme'
import FindBox from './find-box.vue'
import TabList from './tab-list.vue'
import TerminalTeletype from './terminal-teletype.vue'
import TitleBar from './title-bar.vue'

export default {
  name: 'app',
  components: {
    'title-bar': TitleBar,
    'tab-list': TabList,
    'terminal-teletype': TerminalTeletype,
    'find-box': FindBox,
  },
  setup() {
    const state = reactive({
      isFullscreen: useFullscreen(),
      isTabListEnabled: useIsTabListEnabled(),
      terminal: useCurrentTerminal(),
      slots: commas.context.getCollection('@slot'),
    })

    loadAddons()
    loadCustomJS()
    injectTheme()
    handleFrameMessages()
    handleShellMessages()
    handleTerminalMessages()
    handleLauncherMessages()

    const index = process.argv.indexOf('--') + 1
    const args = index ? process.argv.slice(index) : []
    const initialPath = args[0]
    createTerminalTab({ cwd: initialPath })

    ipcRenderer.on('uncaught-error', (event, error: Error) => {
      console.error(`Uncaught error in main process: ${String(error)}`)
    })

    const tabsRef = useTerminalTabs()
    const willQuitRef = useWillQuit()
    window.addEventListener('beforeunload', async event => {
      const willQuit = unref(willQuitRef)
      const tabs = unref(tabsRef)
      if (!willQuit && tabs.length > 1) {
        event.returnValue = false
        const confirmed = await confirmClosing()
        if (confirmed) {
          commas.app.unloadAddons()
          commas.app.events.emit('unload')
          ipcRenderer.invoke('destroy')
        }
      } else {
        commas.app.unloadAddons()
        commas.app.events.emit('unload')
      }
    })

    onMounted(() => {
      commas.app.events.emit('ready')
    })

    return {
      ...toRefs(state),
    }
  },
}
</script>

<style lang="scss" scoped>
:global(:root) {
  --design-green: 40 201 65;
  --design-yellow: 255 189 46;
  --design-red: 255 97 89;
  --design-blue: 47 136 255;
  --design-magenta: 207 150 253;
  --design-cyan: 0 200 210;
  --system-accent: var(--design-blue);
}
:global(::selection) {
  background: var(--theme-selection);
}
:global(body) {
  margin: 0;
  font-family: Fira Code, Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace;
  font-size: 14px;
  user-select: none;
  cursor: default;
  -webkit-tap-highlight-color: transparent;
}
.app {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  /* Default line height of xterm.js */
  line-height: 1.2;
  color: rgb(var(--theme-foreground));
  background: rgb(var(--theme-background) / var(--theme-opacity));
  transition: background 0.2s;
  &.opaque {
    background: rgb(var(--theme-background));
  }
}
.content {
  flex: auto;
  width: 100vw;
  display: flex;
  overflow: hidden;
  z-index: 1;
}
.interface {
  flex: auto;
  width: 0;
  display: flex;
  flex-direction: column;
}
</style>
