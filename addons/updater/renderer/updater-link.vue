<template>
  <span class="link updater-link" @click="check">
    <span v-i18n>Check for updates#!updater.4</span>
  </span>
</template>

<script lang="ts">
import { ipcRenderer } from 'electron'

export default {
  name: 'updater-link',
  setup() {
    function check() {
      ipcRenderer.invoke('check-for-updates')
    }

    return {
      check,
    }
  },
}
</script>
