<script lang="ts" setup>
import * as commas from 'commas:api/renderer'

const { vI18n } = commas.ui.vueAssets

function configure() {
  commas.workspace.openPaneTab('addon-manager')
}
</script>

<template>
  <span class="link addon-manager-link" @click="configure">
    <span v-i18n>Manage Addons#!addon-manager.2</span>
  </span>
</template>
