<template>
  <div id="main" :class="['app', {opaque}]">
    <title-bar></title-bar>
    <div class="content">
      <tab-list v-show="multitabs"></tab-list>
      <div class="interface">
        <find-box></find-box>
        <keep-alive v-if="current">
          <component v-if="current.internal" :is="current.internal.component"
            :key="current.id"></component>
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
import {remote, ipcRenderer} from 'electron'
import {mapState, mapGetters} from 'vuex'
import {currentState} from '@/utils/frame'
import {userStorage} from '@/utils/storage'
import {loadTranslation} from '@/utils/i18n'
import hooks from '@/hooks'

export default {
  name: 'App',
  components: {
    'title-bar': TitleBar,
    'tab-list': TabList,
    'terminal-teletype': TerminalTeletype,
    'find-box': FindBox,
  },
  computed: {
    ...mapState('shell', ['multitabs']),
    ...mapGetters('settings', ['settings']),
    ...mapGetters('terminal', ['current']),
    opaque() {
      return currentState.fullscreen
    },
  },
  beforeCreate() {
    loadTranslation(remote.app.getLocale())
    // custom stylesheet
    const stylesheet = userStorage.readSync('custom.css')
    if (stylesheet) {
      const element = document.createElement('style')
      element.appendChild(document.createTextNode(stylesheet))
      document.head.appendChild(element)
    }
  },
  created() {
    // prepare for hooks
    hooks.core.dangerouslySetViewModel(this)
    const index = process.argv.indexOf('--') + 1
    const args = index ? process.argv.slice(index) : []
    const initialPath = args[0]
    ;(async () => {
      await this.$store.dispatch('settings/load')
      hooks.events.emit('settings:loaded')
      await this.$store.dispatch('theme/load')
      this.$store.dispatch('terminal/spawn', {cwd: initialPath})
      // Load addons
      const addons = this.settings['terminal.addon.enabled']
      for (const name of addons) {
        const addon = require(`@/addons/${name}`).default
        hooks.addon.load(addon)
      }
    })()
    this.$store.dispatch('settings/watch', async () => {
      hooks.events.emit('settings:reloaded')
      await this.$store.dispatch('theme/load')
      this.$store.dispatch('terminal/refresh')
    })
    this.$store.dispatch('terminal/load')
    this.$store.dispatch('launcher/load')
    this.$store.dispatch('launcher/watch')
    ipcRenderer.on('uncaught-error', (event, error) => {
      console.error(`Uncaught error in main process: ${error}`)
    })
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
    ipcRenderer.on('command', (event, {command, args}) => {
      hooks.command.exec(command, args)
    })
    // custom script
    const initScript = userStorage.require('custom.js')
    initScript && initScript(hooks)
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
  background: var(--theme-backdrop);
  transition: background 0.2s;
}
.app.opaque {
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
