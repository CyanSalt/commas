<template>
  <span class="link theme-link" @click="configure">
    <span v-i18n>Configure theme#!theme.2</span>
  </span>
</template>

<script lang="ts">
import * as commas from '../../../api/renderer'

export default {
  name: 'theme-link',
  setup() {
    function configure() {
      commas.workspace.openPaneTab('theme')
    }

    return {
      configure,
    }
  },
}
</script>
