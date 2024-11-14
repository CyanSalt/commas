<script lang="ts" setup>
import * as commas from 'commas:api/renderer'

const { vI18n } = commas.ui.vueAssets

function configure() {
  commas.workspace.openPaneTab('settings')
}
</script>

<template>
  <a tabindex="0" class="link settings-link" @click="configure">
    <span v-i18n>Configure Settings#!settings.2</span>
  </a>
</template>
