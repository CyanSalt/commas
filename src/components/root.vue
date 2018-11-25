<template>
  <div id="main">
    <terminal-teletype></terminal-teletype>
  </div>
</template>

<script>
import Maye from 'maye'
import Terminalteletype from './terminal-teletype'

export default {
  el: '#main',
  components: {
    'terminal-teletype': Terminalteletype,
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
      action.dispatch('theme.inject', this.$el)
      action.dispatch('terminal.load')
    })
    // custom script
    const initScript = this.$storage.require('custom.js')
    initScript && initScript(Maye, this)
  },
}
</script>

<style>
#main {
  display: flex;
  height: 100vh;
}
</style>
