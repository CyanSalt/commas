<script lang="ts" setup>
import * as commas from '../../../api/renderer'
import { useSettings } from '../../../renderer/hooks/settings'
import { useProxyServerStatus, useSystemProxyStatus } from './hooks'

const settings = $(useSettings())
const systemStatus = $(useSystemProxyStatus())

let status = $(useProxyServerStatus())

const port = $computed<number>(() => {
  return settings['proxy.server.port']
})

function toggle() {
  if (status !== undefined) {
    status = !status
  }
}

function configure() {
  commas.workspace.openPaneTab('proxy')
}
</script>

<template>
  <div
    :class="['proxy-anchor', { active: status, disabled: status === undefined, system: systemStatus }]"
    @click="toggle"
    @contextmenu="configure"
  >
    <span v-if="status === undefined" class="feather-icon icon-more-horizontal"></span>
    <span v-else class="feather-icon icon-navigation"></span>
    <span v-if="status" class="server-port">{{ port }}</span>
  </div>
</template>

<style lang="scss" scoped>
.proxy-anchor {
  &.active {
    color: rgb(var(--design-cyan));
    &.system {
      color: rgb(var(--design-magenta));
    }
  }
}
.server-port {
  margin-left: 2px;
  vertical-align: 1px;
}
</style>
