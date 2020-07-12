<template>
  <span class="link theme-link" @click="configure">
    <span v-i18n>Configure User Settings#!user-settings.2</span>
  </span>
</template>

<script>
import { activateOrAddTerminalTab } from '../../hooks/terminal'

export default {
  name: 'UserSettingsLink',
  setup() {
    const commas = __non_webpack_require__('../api/renderer')
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
