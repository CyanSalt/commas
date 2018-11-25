<template>
  <div class="terminal-teletype" ref="term"></div>
</template>

<script>
import VueMaye from 'maye/plugins/vue'
import 'xterm/lib/xterm.css'

export default {
  name: 'terminal-teletype',
  methods: {
    mount: VueMaye.action('terminal.mount'),
  },
  mounted() {
    this.mount(this.$refs.term)
  },
}
</script>

<style>
.terminal-teletype {
  flex: none;
  display: flex;
  padding: 2px 4px;
  background: var(--theme-background);
}
</style>
