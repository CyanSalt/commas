<template>
  <div class="terminal-teletype" ref="term" @resize="resize"></div>
</template>

<script>
import VueMaye from 'maye/plugins/vue'
import 'xterm/lib/xterm.css'

export default {
  name: 'terminal-teletype',
  methods: {
    specify: VueMaye.action('terminal.specify'),
    resize: VueMaye.action('terminal.resize'),
  },
  mounted() {
    this.specify(this.$refs.term)
  },
}
</script>

<style>
.terminal-teletype {
  flex: auto;
  display: flex;
  padding: 4px 8px;
  position: relative;
}
.terminal-teletype .xterm {
  position: static;
}
</style>
