<template>
  <span class="link proxy-link" @click="configure">
    <span v-i18n>Configure proxy rules#!proxy.2</span>
  </span>
</template>

<script>
import { activateOrAddTerminalTab } from '../../hooks/terminal.mjs'

export default {
  name: 'ProxyLink',
  setup() {
    const commas = globalThis.require('../api/renderer')
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
