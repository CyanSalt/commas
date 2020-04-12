<template>
  <div
    class="terminal-teletype"
    @dragover.prevent="dragging"
    @drop.prevent="drop"
  >
    <div ref="terminal" class="terminal-content"></div>
    <scroll-bar v-if="viewport" :parent="viewport"></scroll-bar>
  </div>
</template>

<script>
import ScrollBar from './scroll-bar'
import 'xterm/css/xterm.css'

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
  mounted() {
    this.$store.dispatch('terminal/mount', {
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
    const xterm = this.tab.xterm
    if (xterm._core.viewport) xterm._core.viewport.syncScrollArea()
    xterm.scrollToBottom()
  },
  methods: {
    bound() {
      const xterm = this.tab.xterm
      this.viewport = xterm._core._viewportElement
    },
    dragging(e) {
      e.dataTransfer.dropEffect = 'copy'
    },
    drop(e) {
      const files = e.dataTransfer.files
      if (!files || !files.length) return
      this.$store.dispatch('shell/drop', {
        tab: this.tab,
        files,
      })
    },
  },
}
</script>

<style>
.terminal-teletype {
  flex: auto;
  height: 0;
  display: flex;
  position: relative;
}
.terminal-content {
  flex: auto;
  padding: 4px 8px;
  /* issue@xterm: fix bug of `xterm.fit()` */
  box-sizing: border-box;
}
.terminal-content .xterm-viewport {
  overflow-y: hidden;
  background-color: transparent !important;
}
/* issue@xterm: fix z-index of selection */
.terminal-content .xterm-text-layer {
  z-index: 2 !important;
}
</style>