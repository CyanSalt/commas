<template>
  <div id="main" class="app">
    <title-bar></title-bar>
    <div class="content">
      <tab-list v-show="multitabs"></tab-list>
      <div class="interface">
        <find-box></find-box>
        <keep-alive v-if="current">
          <settings-panel v-if="current === internal.settings"
            :key="current.id"></settings-panel>
          <terminal-teletype v-else :tab="current"
            :key="current.id"></terminal-teletype>
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script>
import TitleBar from './title-bar'
import TabList from './tab-list'
import FindBox from './find-box'
import TerminalTeletype from './terminal-teletype'
import SettingsPanel from './settings-panel'
import {ipcRenderer, remote} from 'electron'
import {mapState, mapGetters} from 'vuex'
import {InternalTerminals} from '@/utils/terminal'

export default {
  name: 'App',
  components: {
    'title-bar': TitleBar,
    'tab-list': TabList,
    'terminal-teletype': TerminalTeletype,
    'find-box': FindBox,
    'settings-panel': SettingsPanel,
  },
  data() {
    return {
      internal: InternalTerminals,
    }
  },
  computed: {
    ...mapGetters('terminal', ['current']),
    ...mapState('shell', ['multitabs']),
  },
  beforeCreate() {
    // custom stylesheet
    const stylesheet = this.$storage.readSync('custom.css')
    if (stylesheet) {
      const element = document.createElement('style')
      element.appendChild(document.createTextNode(stylesheet))
      document.head.appendChild(element)
    }
  },
  created() {
    const frame = remote.getCurrentWindow()
    const initialPath = frame.additionalArguments &&
      frame.additionalArguments.path
    ;(async () => {
      await this.$store.dispatch('settings/load')
      await this.$store.dispatch('theme/load')
      this.$store.dispatch('terminal/spawn', {cwd: initialPath})
    })()
    this.$store.dispatch('settings/watch', async () => {
      await this.$store.dispatch('theme/load')
      this.$store.dispatch('terminal/refresh')
      this.$store.dispatch('proxy/refresh')
    })
    this.$store.dispatch('launcher/load')
    this.$store.dispatch('launcher/watch')
    this.$store.dispatch('proxy/load')
    this.$store.dispatch('proxy/watch')
    ipcRenderer.on('before-quit', (event, path) => {
      this.$store.commit('shell/setQuiting', true)
    })
    window.addEventListener('beforeunload', event => {
      const state = this.$store.state
      if (!state.shell.quiting && state.terminal.tabs.length > 1) {
        event.returnValue = false
        this.$store.dispatch('shell/closing')
      }
    })
    ipcRenderer.on('open-path', (event, path) => {
      this.$store.dispatch('terminal/spawn', {cwd: path})
    })
    ipcRenderer.on('command', (event, command) => {
      this.$store.dispatch('command/exec', command)
    })
    // custom script
    const initScript = this.$storage.require('custom.js')
    initScript && initScript(this)
  },
}
</script>

<style>
.app {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  /* Default line height of xterm.js */
  line-height: 1.2;
  color: var(--theme-foreground, transparent);
  background: var(--theme-background);
}
.app .content {
  flex: auto;
  width: 100vw;
  display: flex;
  overflow: hidden;
}
.app .interface {
  flex: auto;
  width: 0;
  display: flex;
  flex-direction: column;
}
</style>
