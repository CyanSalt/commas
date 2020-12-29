<template>
  <div id="root" :class="['app', { opaque: isFullscreen }]">
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

<script>
import { ipcRenderer } from 'electron'
import { reactive, toRefs, unref, onMounted } from 'vue'
import { loadAddons, loadCustomJS } from '../hooks/addon.mjs'
import {
  useFullscreen,
  handleFrameMessages,
} from '../hooks/frame.mjs'
import { runLauncherScript } from '../hooks/launcher.mjs'
import {
  useIsTabListEnabled,
  useWillQuit,
  confirmClosing,
  handleShellMessages,
} from '../hooks/shell.mjs'
import {
  useCurrentTerminal,
  useTerminalTabs,
  handleTerminalMessages,
  createTerminalTab,
} from '../hooks/terminal.mjs'
import { injectTheme } from '../hooks/theme.mjs'
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
    const commas = globalThis.require('../api/renderer')
    const state = reactive({
      isFullscreen: useFullscreen(),
      isTabListEnabled: useIsTabListEnabled(),
      terminal: useCurrentTerminal(),
      slots: commas.workspace.useSlots(),
    })

    loadAddons()
    loadCustomJS()
    injectTheme()
    handleFrameMessages()
    handleShellMessages()
    handleTerminalMessages()

    const index = process.argv.indexOf('--') + 1
    const args = index ? process.argv.slice(index) : []
    const initialPath = args[0]
    createTerminalTab({ cwd: initialPath })

    ipcRenderer.on('uncaught-error', (event, error) => {
      console.error(`Uncaught error in main process: ${error}`)
    })

    ipcRenderer.on('invoke', (event, command) => {
      ipcRenderer.invoke(command)
    })

    ipcRenderer.on('open-tab', (event, options) => {
      createTerminalTab(options)
    })

    ipcRenderer.on('run-script', (event, { launcher, index: scriptIndex }) => {
      runLauncherScript(launcher, scriptIndex)
    })

    const willQuitRef = useWillQuit()
    ipcRenderer.on('before-quit', () => {
      willQuitRef.value = true
    })

    const tabsRef = useTerminalTabs()
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

<style>
body {
  margin: 0;
  font-family: Fira Code, Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace;
  font-size: 14px;
  user-select: none;
  cursor: default;
  -webkit-tap-highlight-color: transparent;
}
#root {
  --design-green: #28c941;
  --design-yellow: #ffbd2e;
  --design-red: #ff6159;
  --design-blue: #2f88ff;
  --design-magenta: #cf96fd;
  --design-cyan: #00c8d2;
}
.app {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  /* Default line height of xterm.js */
  line-height: 1.2;
  color: var(--theme-foreground, transparent);
  background: var(--theme-backdrop);
  transition: background 0.2s;
  --system-accent: var(--design-blue);
}
.app.opaque {
  background: var(--theme-background);
}
.app .content {
  flex: auto;
  width: 100vw;
  display: flex;
  overflow: hidden;
  z-index: 1;
}
.app .interface {
  flex: auto;
  width: 0;
  display: flex;
  flex-direction: column;
}
</style>
