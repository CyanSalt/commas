<script lang="ts" setup>
import type { TerminalTab } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'
import DrauuBoard from './DrauuBoard.vue'

const { tab } = defineProps<{
  tab: TerminalTab,
}>()

const { TerminalBlock } = commas.ui.vueAssets
</script>

<template>
  <TerminalBlock :tab="tab" class="paint-pane">
    <DrauuBoard />
  </TerminalBlock>
</template>
