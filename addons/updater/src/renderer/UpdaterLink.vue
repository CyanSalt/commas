<script lang="ts" setup>
import { ipcRenderer } from '@commas/electron-ipc'
import * as commas from 'commas:api/renderer'

const { vI18n } = commas.ui.vueAssets

function check() {
  ipcRenderer.invoke('check-for-updates')
}
</script>

<template>
  <a href="" data-commas class="updater-link" @click.prevent="check">
    <span v-i18n>Check for updates#!updater.4</span>
  </a>
</template>
