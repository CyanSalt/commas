<script lang="ts" setup>
import { computed, defineProps, watchEffect } from 'vue'
import type { TerminalTab } from '../../typings/terminal'
import { useFile } from '../compositions/frame'
import CodeEditor from './basic/CodeEditor.vue'

const { tab } = defineProps<{
  tab: TerminalTab,
}>()

let code = $ref('')

const file = $computed(() => tab.shell)

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
  <article class="code-editor-pane">
    <CodeEditor v-model="code" :file="file" />
  </article>
</template>

<style lang="scss" scoped>
.code-editor-pane {
  box-sizing: border-box;
  height: 100%;
  padding: 4px 8px;
}
</style>
