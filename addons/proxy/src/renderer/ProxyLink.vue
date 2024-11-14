<script lang="ts" setup>
import * as commas from 'commas:api/renderer'

const { vI18n } = commas.ui.vueAssets

function configure() {
  commas.workspace.openPaneTab('proxy')
}
</script>

<template>
  <a tabindex="0" class="link proxy-link" @click="configure">
    <span v-i18n>Configure Proxy#!proxy.2</span>
  </a>
</template>
