<script lang="ts" setup>
import { ipcRenderer } from '@commas/electron-ipc'
import type { TerminalTab } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'
import { watchEffect } from 'vue'
import CodeEditor from './CodeEditor.vue'
import { setCodeEditorTabFile } from './compositions'

const { tab } = defineProps<{
  tab: TerminalTab,
}>()

const { TerminalBlock } = commas.ui.vueAssets

let editor = $ref<InstanceType<typeof CodeEditor>>()

const file = $computed(() => tab.shell)

let source = $(commas.remote.useFile($$(file)))

const isDirty = $computed(() => {
  return Boolean(source === undefined || editor?.isDirty)
})

watchEffect((onInvalidate) => {
  // eslint-disable-next-line vue/no-mutating-props
  tab.alerting = isDirty
  onInvalidate(() => {
    // eslint-disable-next-line vue/no-mutating-props
    delete tab.alerting
  })
})

function save() {
  editor!.save()
}

async function rename(name: string) {
  const newPath = await ipcRenderer.invoke('rename-file', file, name)
  setCodeEditorTabFile(tab, newPath)
}

watchEffect((onInvalidate) => {
  if (tab.pane) {
    // eslint-disable-next-line vue/no-mutating-props
    tab.pane.instance = {
      save,
      rename,
    }
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
    definitionItems,
    [
      {
        label: 'Cut#!menu.cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut',
      },
      ...editingItems,
    ],
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
      v-model="source"
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
