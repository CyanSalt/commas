<script lang="ts" setup>
import * as commas from 'commas:api/renderer'

const { vI18n } = commas.ui.vueAssets

function configure() {
  commas.workspace.openPaneTab('sync')
}
</script>

<template>
  <a href="" data-commas class="sync-link" @click.prevent="configure">
    <span v-i18n>Configure Sync Settings#!sync.2</span>
  </a>
</template>
