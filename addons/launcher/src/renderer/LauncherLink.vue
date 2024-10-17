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
  <span class="link launcher-link" @click="openLaunchers">
    <span v-i18n="{ file: 'launchers.yaml' }">Edit ${file}#!preference.8</span>
  </span>
</template>
