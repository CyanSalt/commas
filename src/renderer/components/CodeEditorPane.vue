<script lang="ts" setup>
import * as path from 'path'
import { computed, defineProps, watchEffect } from 'vue'
import type { TerminalTab } from '../../../typings/terminal'
import { useFile } from '../compositions/frame'
import CodeEditor from './basic/CodeEditor.vue'
import TerminalPane from './basic/TerminalPane.vue'

const { tab } = defineProps<{
  tab: TerminalTab,
}>()

let code = $ref('')

const file = $computed(() => tab.shell)

const lang = $computed(() => {
  return path.extname(file).slice(1)
})

const rawSource = $computed(() => useFile(file))
let source = $computed({
  get: () => rawSource.value,
  set: (value: string) => {
    rawSource.value = value
  },
})

watchEffect((onInvalidate) => {
  // eslint-disable-next-line vue/no-mutating-props
  tab.alerting = computed(() => code !== source) as unknown as boolean
  onInvalidate(() => {
    delete tab.alerting
  })
})

watchEffect(() => {
  code = source as string
})

function save() {
  source = code as string
}

watchEffect((onInvalidate) => {
  if (tab.pane) {
    // eslint-disable-next-line vue/no-mutating-props
    tab.pane.instance = { save }
    onInvalidate(() => {
      if (tab.pane) {
        delete tab.pane.instance
      }
    })
  }
})

defineExpose({
  save,
})
</script>

<template>
  <TerminalPane class="code-editor-pane">
    <CodeEditor v-model="code" :lang="lang" />
  </TerminalPane>
</template>
