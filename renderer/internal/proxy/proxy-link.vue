<template>
  <span class="link proxy-link" @click="configure">
    <span v-i18n>Configure proxy rules#!proxy.2</span>
  </span>
</template>

<script lang="ts">
import * as commas from '../../../api/renderer'
import { activateOrAddTerminalTab } from '../../hooks/terminal'

export default {
  name: 'proxy-link',
  setup() {
    function configure() {
      const proxyTab = commas.workspace.getPaneTab('proxy')
      activateOrAddTerminalTab(proxyTab)
    }

    return {
      configure,
    }
  },
}
</script>
