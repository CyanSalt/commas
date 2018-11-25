<template>
  <div class="terminal-teletype" ref="term" @resize="resize"></div>
</template>

<script>
import VueMaye from 'maye/plugins/vue'
import 'xterm/lib/xterm.css'

export default {
  name: 'terminal-teletype',
  methods: {
    mount: VueMaye.action('terminal.mount'),
    resize: VueMaye.action('terminal.resize'),
  },
  mounted() {
    this.mount(this.$refs.term)
  },
}
</script>

<style>
.terminal-teletype {
  flex: auto;
  display: flex;
  padding: 4px 8px;
}
</style>
