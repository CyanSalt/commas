<template>
  <div id="main">
    <title-bar></title-bar>
    <div class="content">
      <tab-list v-show="multitabs"></tab-list>
      <div class="interface">
        <find-box></find-box>
        <keep-alive v-if="current">
          <terminal-teletype :key="current.id"
            :tab="current"></terminal-teletype>
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script>
import VueMaye from 'maye/plugins/vue'
import TitleBar from './title-bar'
import TabList from './tab-list'
import FindBox from './find-box'
import TerminalTeletype from './terminal-teletype'
import {ipcRenderer, remote} from 'electron'

export default {
  el: '#main',
  components: {
    'title-bar': TitleBar,
    'tab-list': TabList,
    'terminal-teletype': TerminalTeletype,
    'find-box': FindBox,
  },
  computed: {
    current: VueMaye.accessor('terminal.current'),
    multitabs: VueMaye.state('shell.multitabs'),
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
    const {action} = this.$maye
    const frame = remote.getCurrentWindow()
    const initialPath = frame.additionalArguments &&
      frame.additionalArguments.path
    action.dispatch('settings.load').then(() => {
      action.dispatch('theme.load')
      action.dispatch('terminal.spawn', initialPath)
    })
    action.dispatch('launcher.load')
    window.addEventListener('beforeunload', event => {
      action.dispatch('shell.closing', {event, i18n: this.i18n})
    })
    ipcRenderer.on('open-path', (event, path) => {
      action.dispatch('terminal.spawn', path)
    })
    ipcRenderer.on('command', (event, command) => {
      action.dispatch('command.exec', command)
    })
    // custom script
    const initScript = this.$storage.require('custom.js')
    initScript && initScript(this.$maye, this)
  },
}
</script>

<style>
#main {
  display: flex;
  flex-direction: column;
  height: 100vh;
  /* Default line height of xterm.js */
  line-height: 1.2;
  color: var(--theme-foreground);
  background: var(--theme-background);
}
#main .content {
  flex: auto;
  display: flex;
}
#main .interface {
  flex: auto;
  width: 0;
  display: flex;
  flex-direction: column;
}
</style>
