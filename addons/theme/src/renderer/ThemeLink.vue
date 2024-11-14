<script lang="ts" setup>
import * as commas from 'commas:api/renderer'

const { vI18n } = commas.ui.vueAssets

function configure() {
  commas.workspace.openPaneTab('theme')
}
</script>

<template>
  <a tabindex="0" class="link theme-link" @click="configure">
    <span v-i18n>Configure Theme#!theme.2</span>
  </a>
</template>
