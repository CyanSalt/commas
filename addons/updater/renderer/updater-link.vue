<script lang="ts" setup>
import { ipcRenderer } from 'electron'

function check() {
  ipcRenderer.invoke('check-for-updates')
}
</script>

<template>
  <span class="link updater-link" @click="check">
    <span v-i18n>Check for updates#!updater.4</span>
  </span>
</template>
