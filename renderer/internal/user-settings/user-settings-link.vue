<template>
  <span class="link theme-link" @click="configure">
    <span v-i18n>Configure User Settings#!user-settings.2</span>
  </span>
</template>

<script lang="ts">
import * as commas from '../../../api/renderer'
import { activateOrAddTerminalTab } from '../../hooks/terminal'

export default {
  name: 'user-settings-link',
  setup() {
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
