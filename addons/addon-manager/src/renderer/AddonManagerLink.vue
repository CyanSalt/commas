<script lang="ts" setup>
import * as commas from 'commas:api/renderer'

const { vI18n } = commas.ui.vueAssets

function configure() {
  commas.workspace.openPaneTab('addon-manager')
}
</script>

<template>
  <a href="" data-commas class="addon-manager-link" @click.prevent="configure">
    <span v-i18n>Manage Addons#!addon-manager.2</span>
  </a>
</template>
