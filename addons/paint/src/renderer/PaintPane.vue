<script lang="ts" setup>
import type { TerminalTab } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'
import { watchEffect } from 'vue'
import ExcalidrawBoard from './ExcalidrawBoard.vue'

const { tab } = defineProps<{
  tab: TerminalTab,
}>()

const { TerminalBlock } = commas.ui.vueAssets

const file = $computed(() => tab.shell)

let source = $(commas.remote.useFile($$(file)))

function openEditingMenu(event: MouseEvent) {
  const { definitionItems, editingItems } = commas.ui.createContextMenu()
  commas.ui.openContextMenu([
    definitionItems,
    editingItems,
  ], event)
}

let board = $ref<InstanceType<typeof ExcalidrawBoard>>()

const isDirty = $computed(() => {
  return Boolean(source === undefined || board?.isDirty)
})

watchEffect(onInvalidate => {
  // eslint-disable-next-line vue/no-mutating-props
  tab.alerting = isDirty
  onInvalidate(() => {
    // eslint-disable-next-line vue/no-mutating-props
    delete tab.alerting
  })
})

async function save() {
  if (!board) return
  await board.save()
}

watchEffect((onInvalidate) => {
  if (tab.pane) {
    // eslint-disable-next-line vue/no-mutating-props
    tab.pane.instance = { save }
    onInvalidate(() => {
      if (tab.pane) {
        // eslint-disable-next-line vue/no-mutating-props
        delete tab.pane.instance
      }
    })
  }
})
</script>

<template>
  <TerminalBlock :tab="tab" class="paint-pane" @contextmenu="openEditingMenu">
    <ExcalidrawBoard ref="board" v-model="source" :file="file" />
  </TerminalBlock>
</template>
