<template>
  <div id="main">
    <title-bar></title-bar>
    <div class="content">
      <tab-list></tab-list>
      <keep-alive v-if="current">
        <terminal-teletype :key="current.id"
          :tab="current"></terminal-teletype>
      </keep-alive>
    </div>
  </div>
</template>

<script>
import VueMaye from 'maye/plugins/vue'
import TitleBar from './title-bar'
import TabList from './tab-list'
import TerminalTeletype from './terminal-teletype'

export default {
  el: '#main',
  components: {
    'title-bar': TitleBar,
    'tab-list': TabList,
    'terminal-teletype': TerminalTeletype,
  },
  computed: {
    current: VueMaye.accessor('terminal.current'),
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
    action.dispatch('settings.load').then(() => {
      action.dispatch('theme.load')
      action.dispatch('terminal.spawn')
    })
    window.addEventListener('resize', () => {
      action.dispatch('terminal.resize')
    }, false)
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
  line-height: 1.2;
  color: var(--theme-foreground);
  background: var(--theme-background);
}
#main .content {
  flex: auto;
  display: flex;
}
</style>
