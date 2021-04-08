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

<script lang="ts">
import 'xterm/css/xterm.css'
import { quote } from 'shell-quote'
import type { PropType } from 'vue'
import { reactive, toRefs, onMounted, onActivated } from 'vue'
import type { TerminalTab } from '../../typings/terminal'
import { mountTerminalTab, writeTerminalTab } from '../hooks/terminal'
import ScrollBar from './basic/scroll-bar.vue'

export default {
  name: 'terminal-teletype',
  components: {
    'scroll-bar': ScrollBar,
  },
  props: {
    tab: {
      type: Object as PropType<TerminalTab>,
      required: true,
    },
  },
  setup(props) {
    const state = reactive({
      terminal: null as HTMLElement | null,
      viewport: null as HTMLElement | null,
    })

    function dragFileOver(event: DragEvent) {
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'link'
      }
    }

    function dropFile(event: DragEvent) {
      const files = event.dataTransfer?.files
      if (!files || !files.length) return
      const paths = Array.from(files).map(({ path }) => path)
      writeTerminalTab(props.tab, quote(paths))
    }

    onMounted(() => {
      mountTerminalTab(props.tab, state.terminal!)
      const xterm = props.tab.xterm
      state.viewport = xterm['_core']._viewportElement
    })

    onActivated(() => {
      const xterm = props.tab.xterm
      if (xterm['_core'].viewport) {
        xterm['_core'].viewport.syncScrollArea()
      }
      xterm.scrollToBottom()
      xterm.focus()
    })

    return {
      ...toRefs(state),
      dragFileOver,
      dropFile,
    }
  },
}
</script>

<style lang="scss" scoped>
.terminal-teletype {
  flex: auto;
  height: 0;
  display: flex;
  position: relative;
}
.terminal-content {
  width: 0;
  flex: auto;
  padding: 4px 8px;
  /* issue@xterm: fix bug of `xterm.fit()` */
  box-sizing: border-box;
  :deep(.xterm-viewport) {
    overflow-y: hidden;
    background-color: transparent !important;
  }
}
</style>
