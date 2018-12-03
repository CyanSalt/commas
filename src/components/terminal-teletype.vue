<template>
  <div class="terminal-teletype" ref="term"
    @dragover.prevent="dragging" @drop.prevent="drop"></div>
</template>

<script>
import 'xterm/lib/xterm.css'

export default {
  name: 'terminal-teletype',
  props: {
    tab: Object,
  },
  methods: {
    dragging(e) {
      e.dataTransfer.dropEffect = 'copy'
    },
    drop(e) {
      const files = e.dataTransfer.files
      if (!files || !files.length) return
      const {action} = this.$maye
      action.dispatch('shell.drop', {
        tab: this.tab,
        files,
      })
    },
  },
  mounted() {
    const {action} = this.$maye
    action.dispatch('terminal.mount', {
      tab: this.tab,
      element: this.$refs.term
    })
  },
}
</script>

<style>
.terminal-teletype {
  flex: auto;
  display: flex;
  padding: 4px 8px;
  position: relative;
  /* Fix bug of `xterm.fit()` */
  box-sizing: border-box;
}
.terminal-teletype .xterm {
  position: static;
}
</style>
