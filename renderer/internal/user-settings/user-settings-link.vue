<template>
  <span class="link theme-link" @click="configure">
    <span v-i18n>Configure User Settings#!user-settings.2</span>
  </span>
</template>

<script lang="ts">
import * as commas from '../../../api/renderer'

export default {
  name: 'user-settings-link',
  setup() {
    function configure() {
      commas.workspace.openPaneTab('user-settings')
    }

    return {
      configure,
    }
  },
}
</script>
