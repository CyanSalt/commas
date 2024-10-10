<script lang="ts" setup>
import type { TerminalTab } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'
import { watchEffect } from 'vue'

const { tab } = defineProps<{
  tab: TerminalTab,
}>()

const { TerminalBlock, WebContents } = commas.ui.vueAssets

let url = $computed({
  get: () => tab.command,
  set: value => {
    Object.assign(tab, {
      command: value,
    })
  },
})

let title = $ref<string>()
let icon = $ref<string>()

watchEffect(onInvalidate => {
  // eslint-disable-next-line vue/no-mutating-props
  tab.title = title
  onInvalidate(() => {
    // eslint-disable-next-line vue/no-mutating-props
    delete tab.title
  })
})
</script>

<template>
  <TerminalBlock :tab="tab" class="browser-pane">
    <WebContents
      v-model="url"
      v-model:title="title"
      v-model:icon="icon"
      class="web-page"
    />
  </TerminalBlock>
</template>

<style lang="scss" scoped>
.web-page {
  height: 100%;
}
</style>
