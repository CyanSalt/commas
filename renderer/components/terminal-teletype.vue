<template>
  <article
    class="terminal-teletype"
    @dragover.prevent="dragFileOver"
    @drop.prevent="dropFile"
  >
    <div ref="terminal" class="terminal-content"></div>
    <scroll-bar v-if="viewport" :parent="viewport"></scroll-bar>
  </article>
</template>

<script>
import 'xterm/css/xterm.css'
import { reactive, toRefs, onMounted, onActivated } from 'vue'
import { mountTerminalTab, writeTerminalTab } from '../hooks/terminal.mjs'
import ScrollBar from './basic/scroll-bar.vue'

export default {
  name: 'terminal-teletype',
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
      event.dataTransfer.dropEffect = 'link'
    }

    function dropFile(event) {
      const files = event.dataTransfer.files
      if (!files || !files.length) return
      const paths = Array.from(files).map(({ path }) => {
        if (path.includes(' ')) return `"${path}"`
        return path
      })
      writeTerminalTab(props.tab, paths.join(' '))
    }

    onMounted(() => {
      mountTerminalTab(props.tab, state.terminal)
      const xterm = props.tab.xterm
      state.viewport = xterm._core._viewportElement
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
</style>
