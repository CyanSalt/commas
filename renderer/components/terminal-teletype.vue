<template>
  <article
    class="terminal-teletype"
    @dragover.prevent="dragFileOver"
    @drop.prevent="dropFile"
  >
    <div ref="terminal" class="terminal-content"></div>
    <ScrollBar v-if="viewport" :parent="viewport" />
  </article>
</template>

<script lang="ts">
import 'xterm/css/xterm.css'
import { quote } from 'shell-quote'
import { onActivated, onMounted, ref, unref } from 'vue'
import type { PropType } from 'vue'
import type { TerminalTab } from '../../typings/terminal'
import { mountTerminalTab, writeTerminalTab } from '../hooks/terminal'
import ScrollBar from './basic/scroll-bar.vue'

export default {
  components: {
    ScrollBar,
  },
  props: {
    tab: {
      type: Object as PropType<TerminalTab>,
      required: true,
    },
  },
  setup(props) {
    const terminalRef = ref<HTMLElement | null>(null)
    const viewportRef = ref<HTMLElement | null>(null)

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
      const terminal = unref(terminalRef)!
      mountTerminalTab(props.tab, terminal!)
      const xterm = props.tab.xterm
      viewportRef.value = xterm['_core']._viewportElement
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
      terminal: terminalRef,
      dragFileOver,
      dropFile,
    }
  },
}
</script>

<style lang="scss" scoped>
.terminal-teletype {
  position: relative;
  display: flex;
  flex: auto;
  height: 0;
}
.terminal-content {
  flex: auto;
  /* issue@xterm: fix bug of `xterm.fit()` */
  box-sizing: border-box;
  width: 0;
  padding: 4px 8px;
  :deep(.xterm-viewport) {
    overflow-y: hidden;
    background-color: transparent !important;
  }
}
</style>
