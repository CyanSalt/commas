<script lang="ts" setup>
import { ipcRenderer } from '@commas/electron-ipc'
import * as commas from 'commas:api/renderer'

const { vI18n } = commas.ui.vueAssets

function check() {
  ipcRenderer.invoke('check-for-updates')
}
</script>

<template>
  <span class="link updater-link" @click="check">
    <span v-i18n>Check for updates#!updater.4</span>
  </span>
</template>
