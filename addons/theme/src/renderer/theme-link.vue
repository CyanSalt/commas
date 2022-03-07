<script lang="ts" setup>
import * as commas from 'commas:api/renderer'

function configure() {
  commas.workspace.openPaneTab('theme')
}
</script>

<template>
  <span class="link theme-link" @click="configure">
    <span v-i18n>Configure theme#!theme.2</span>
  </span>
</template>
