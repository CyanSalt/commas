<template>
  <div class="terminal-teletype"
    @dragover.prevent="dragging" @drop.prevent="drop">
    <div class="terminal-content" ref="terminal"></div>
    <scroll-bar :parent="viewport" v-if="viewport"></scroll-bar>
  </div>
</template>

<script>
import ScrollBar from './scroll-bar'
import 'xterm/lib/xterm.css'

export default {
  name: 'TerminalTeletype',
  components: {
    'scroll-bar': ScrollBar,
  },
  props: {
    tab: Object,
  },
  data() {
    return {
      viewport: null,
    }
  },
  methods: {
    bound() {
      // eslint-disable-next-line no-underscore-dangle
      this.viewport = this.tab.xterm._core._viewportElement
    },
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
      element: this.$refs.terminal,
    })
    new MutationObserver((mutations, observer) => {
      this.bound()
      observer.disconnect()
    }).observe(this.$refs.terminal, {childList: true})
  },
  activated() {
    // issue@xterm: fix bug after unmounted element updated
    // eslint-disable-next-line no-underscore-dangle
    const terminal = this.tab.xterm._core
    if (terminal.viewport) terminal.viewport.syncScrollArea()
    this.tab.xterm.scrollToBottom()
  },
}
</script>

<style>
.terminal-teletype {
  flex: auto;
  display: flex;
  position: relative;
}
.terminal-content {
  flex: auto;
  padding: 4px 8px;
  /* issue@xterm: change viewport element position */
  position: relative;
  /* issue@xterm: fix bug of `xterm.fit()` */
  box-sizing: border-box;
}
.terminal-content .xterm {
  position: static;
}
.terminal-content .xterm-viewport {
  overflow-y: hidden;
}
</style>
