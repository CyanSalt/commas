<template>
  <span class="link theme-link" @click="configure">
    <span v-i18n>Configure User Settings#!user-settings.2</span>
  </span>
</template>

<script>
import { activateOrAddTerminalTab } from '../../hooks/terminal.mjs'

export default {
  name: 'UserSettingsLink',
  setup() {
    const commas = globalThis.require('../api/renderer')
    function configure() {
      const userSettingsTab = commas.workspace.getPaneTab('user-settings')
      activateOrAddTerminalTab(userSettingsTab)
    }

    return {
      configure,
    }
  },
}
</script>
