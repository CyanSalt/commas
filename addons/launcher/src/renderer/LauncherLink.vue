<script lang="ts" setup>
import * as path from 'node:path'
import * as commas from 'commas:api/renderer'

const { vI18n } = commas.ui.vueAssets

function openLaunchers(event: MouseEvent) {
  const examplePath = path.join(__dirname, '../../examples/launchers.yaml')
  commas.remote.openUserFile('launchers.yaml', examplePath, event)
}
</script>

<template>
  <a href="" data-commas class="launcher-link" @click.prevent="openLaunchers">
    <span v-i18n="{ file: 'launchers.yaml' }">Edit ${file}#!preference.8</span>
  </a>
</template>
