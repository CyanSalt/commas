<template>
  <span class="link theme-link" @click="configure">
    <span v-i18n>Configure theme#!theme.2</span>
  </span>
</template>

<script lang="ts">
import * as commas from '../../../api/renderer'
import { activateOrAddTerminalTab } from '../../hooks/terminal'

export default {
  name: 'theme-link',
  setup() {
    function configure() {
      const userSettingsTab = commas.workspace.getPaneTab('theme')
      activateOrAddTerminalTab(userSettingsTab)
    }

    return {
      configure,
    }
  },
}
</script>
