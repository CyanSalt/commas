<script lang="ts" setup>
import * as commas from '../../../api/renderer'

function configure() {
  commas.workspace.openPaneTab('proxy')
}
</script>

<template>
  <span class="link proxy-link" @click="configure">
    <span v-i18n>Configure Proxy#!proxy.2</span>
  </span>
</template>
