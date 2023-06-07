<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { computed, watchEffect } from 'vue'
import type { TerminalTab } from '../../../../src/typings/terminal'
import CodeEditor from './CodeEditor.vue'

const { tab } = defineProps<{
  tab: TerminalTab,
}>()

let editor = $ref<InstanceType<typeof CodeEditor>>()

const file = $computed(() => tab.shell)

const source = $computed(() => commas.remote.useFile(file))

let code: string = $computed({
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

defineExpose({
  save,
})
</script>

<template>
  <article class="code-editor-pane">
    <CodeEditor
      ref="editor"
      v-model="code"
      :file="file"
    />
  </article>
</template>

<style lang="scss" scoped>
.code-editor-pane {
  box-sizing: border-box;
  height: 100%;
}
</style>
