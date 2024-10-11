<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { useProxyServerStatus, useSystemProxyStatus } from './compositions'

const { VisualIcon } = commas.ui.vueAssets

const settings = commas.remote.useSettings()
const systemStatus = $(useSystemProxyStatus())

let status = $(useProxyServerStatus())

const port = $computed(() => {
  return settings['proxy.server.port']!
})

function toggle() {
  if (status !== undefined) {
    status = !status
  }
}

function configure(event: MouseEvent) {
  commas.ui.openContextMenu([
    {
      label: 'Configure Proxy#!proxy.2',
      command: 'configure-proxy',
    },
  ], event)
}
</script>

<template>
  <div
    :class="['proxy-anchor', { active: status, disabled: status === undefined, system: systemStatus }]"
    @click="toggle"
    @contextmenu="configure"
  >
    <VisualIcon v-if="status === undefined" name="lucide-loader" />
    <VisualIcon v-else name="lucide-router" />
    <span v-if="status" class="server-port">{{ port }}</span>
  </div>
</template>

<style lang="scss" scoped>
.proxy-anchor {
  gap: 4px;
  align-items: center;
  &.active {
    color: var(--design-highlight-color);
    &.system {
      color: rgb(var(--system-purple));
    }
  }
}
.server-port {
  margin-left: 2px;
  vertical-align: 1px;
}
</style>
