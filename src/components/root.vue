<template>
  <div id="main">
  </div>
</template>

<script>
import Maye from 'maye'

export default {
  el: '#main',
  components: {
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
    // custom script
    const initScript = this.$storage.require('custom.js')
    initScript && initScript(Maye, this)
  }
}
</script>

<style>
#main {
  display: flex;
  height: 100vh;
  background: white;
}
</style>
