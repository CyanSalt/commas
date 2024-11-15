<script lang="ts" setup>
import * as commas from 'commas:api/renderer'

const { vI18n } = commas.ui.vueAssets

function configure() {
  commas.workspace.openPaneTab('theme')
}
</script>

<template>
  <a href="" data-commas class="theme-link" @click.prevent="configure">
    <span v-i18n>Configure Theme#!theme.2</span>
  </a>
</template>
