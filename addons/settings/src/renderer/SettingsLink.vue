<script lang="ts" setup>
import * as commas from 'commas:api/renderer'

const { vI18n } = commas.ui.vueAssets

function configure() {
  commas.workspace.openPaneTab('settings')
}
</script>

<template>
  <a href="" data-commas class="settings-link" @click.prevent="configure">
    <span v-i18n>Configure Settings#!settings.2</span>
  </a>
</template>
