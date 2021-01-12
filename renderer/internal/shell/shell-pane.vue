<template>
  <terminal-teletype :tab="tab"></terminal-teletype>
</template>

<script lang="ts">
import * as commas from '../../../api/renderer'
import TerminalTeletype from '../../components/terminal-teletype.vue'

export default {
  name: 'shell-pane',
  components: {
    'terminal-teletype': TerminalTeletype,
  },
  setup() {
    const tab = commas.workspace.getPaneTab('shell')

    return {
      tab,
    }
  },
}
</script>
