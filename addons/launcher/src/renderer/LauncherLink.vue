<script lang="ts" setup>
import * as path from 'path'
import * as commas from 'commas:api/renderer'

const { vI18n } = commas.ui.vueAssets

function openLaunchers() {
  const examplePath = path.join(__dirname, '../../examples/launchers.yaml')
  commas.remote.openUserFile('launchers.yaml', examplePath)
}
</script>

<template>
  <span class="link launcher-link" @click="openLaunchers">
    <span v-i18n="{ F: 'launchers.yaml' }">Edit %F#!preference.8</span>
  </span>
</template>
