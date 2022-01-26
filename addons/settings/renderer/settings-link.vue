<script lang="ts" setup>
import * as commas from '../../../api/renderer'

function configure() {
  commas.workspace.openPaneTab('settings')
}
</script>

<template>
  <span class="link theme-link" @click="configure">
    <span v-i18n>Configure Settings#!settings.2</span>
  </span>
</template>
