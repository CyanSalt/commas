<script lang="ts" setup>
import type { TerminalTab } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'
import { computed, watchEffect } from 'vue'
import CodeEditor from './CodeEditor.vue'

const { tab } = defineProps<{
  tab: TerminalTab,
}>()

const { TerminalBlock } = commas.ui.vueAssets

let editor = $ref<InstanceType<typeof CodeEditor>>()

const file = $computed(() => tab.shell)

const source = $computed(() => commas.remote.useFile(file))

let code = $computed({
  get: () => source.value,
  set: (value: string) => {
    source.value = value
  },
})

watchEffect((onInvalidate) => {
  // eslint-disable-next-line vue/no-mutating-props
  tab.alerting = computed(() => Boolean(editor?.isDirty)) as unknown as boolean
  onInvalidate(() => {
    // eslint-disable-next-line vue/no-mutating-props
    delete tab.alerting
  })
})

function save() {
  editor!.save()
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

function openEditingMenu(event: MouseEvent) {
  const { definitionItems, editingItems } = commas.ui.createContextMenu()
  commas.ui.openContextMenu([
    ...commas.ui.withContextMenuSeparator(definitionItems, []),
    {
      label: 'Cut#!menu.cut',
      accelerator: 'CmdOrCtrl+X',
      role: 'cut',
    },
    ...editingItems,
  ], event)
}

defineExpose({
  save,
})
</script>

<template>
  <TerminalBlock :tab="tab" class="code-editor-pane" @contextmenu="openEditingMenu">
    <CodeEditor
      ref="editor"
      v-model="code"
      :file="file"
    />
  </TerminalBlock>
</template>

<style lang="scss" scoped>
.code-editor-pane {
  box-sizing: border-box;
  min-width: 0;
  height: 100%;
  padding: 8px 0;
}
</style>
