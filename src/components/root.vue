<template>
  <div id="main" @dragover.prevent="dragging" @drop.prevent="drop">
    <title-bar></title-bar>
    <terminal-teletype></terminal-teletype>
  </div>
</template>

<script>
import TitleBar from './title-bar'
import Terminalteletype from './terminal-teletype'

export default {
  el: '#main',
  components: {
    'title-bar': TitleBar,
    'terminal-teletype': Terminalteletype,
  },
  methods: {
    dragging(e) {
      e.dataTransfer.dropEffect = 'copy'
    },
    drop(e) {
      const files = e.dataTransfer.files
      if (!files || !files.length) return
      const {action} = this.$maye
      const paths = Array.from(e.dataTransfer.files).map(({path}) => path)
      action.dispatch('terminal.input', paths.join(' '))
    }
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
      action.dispatch('terminal.load')
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
  background: var(--theme-background);
}
</style>
