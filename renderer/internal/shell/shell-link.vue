<template>
  <span class="link shell-link" @click="configure">
    <span v-i18n>Open shell#!shell.2</span>
  </span>
</template>

<script lang="ts">
import * as commas from '../../../api/renderer'

export default {
  name: 'shell-link',
  setup() {
    function configure() {
      commas.workspace.openPaneTab('shell')
    }

    return {
      configure,
    }
  },
}
</script>
