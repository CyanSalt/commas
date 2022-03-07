<script lang="ts" setup>
import { ipcRenderer } from 'electron'

function openLaunchers() {
  ipcRenderer.invoke('open-user-file', 'launchers.yaml')
}
</script>

<template>
  <span class="link launcher-link" @click="openLaunchers">
    <span v-i18n="{ F: 'launchers.yaml' }">Edit %F#!preference.8</span>
  </span>
</template>
