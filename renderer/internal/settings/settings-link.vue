<template>
  <span class="link theme-link" @click="configure">
    <span v-i18n>Configure Settings#!settings.2</span>
  </span>
</template>

<script lang="ts">
import * as commas from '../../../api/renderer'

export default {
  name: 'settings-link',
  setup() {
    function configure() {
      commas.workspace.openPaneTab('settings')
    }

    return {
      configure,
    }
  },
}
</script>
