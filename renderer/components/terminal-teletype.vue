<template>
  <div
    class="terminal-teletype"
    @dragover.prevent="dragFileOver"
    @drop.prevent="dropFile"
  >
    <div ref="terminal" class="terminal-content"></div>
    <scroll-bar v-if="viewport" :parent="viewport"></scroll-bar>
  </div>
</template>

<script>
import 'xterm/css/xterm.css'
import { reactive, toRefs, onMounted, onActivated } from 'vue'
import ScrollBar from './basic/scroll-bar.vue'
import { mountTerminalTab, writeTerminalTab } from '../hooks/terminal'

export default {
  name: 'TerminalTeletype',
  components: {
    'scroll-bar': ScrollBar,
  },
  props: {
    tab: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const state = reactive({
      terminal: null,
      viewport: null,
    })

    function dragFileOver(event) {
      event.dataTransfer.dropEffect = 'copy'
    }

    function dropFile(event) {
      const files = event.dataTransfer.files
      if (!files || !files.length) return
      const paths = Array.from(files).map(({ path }) => {
        if (path.indexOf(' ') !== -1) return `"${path}"`
        return path
      })
      writeTerminalTab(props.tab, paths.join(' '))
    }

    onMounted(() => {
      mountTerminalTab(props.tab, state.terminal)
      new MutationObserver((mutations, observer) => {
        const xterm = props.tab.xterm
        state.viewport = xterm._core._viewportElement
        observer.disconnect()
      }).observe(state.terminal, { childList: true })
    })

    onActivated(() => {
      const xterm = props.tab.xterm
      if (xterm._core.viewport) {
        xterm._core.viewport.syncScrollArea()
      }
      xterm.scrollToBottom()
    })

    return {
      ...toRefs(state),
      dragFileOver,
      dropFile,
    }
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
