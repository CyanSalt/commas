<script lang="ts" setup>
import { watchEffect } from 'vue'
import * as monaco from '../../assets/monaco-editor'
import { useSettings } from '../../compositions/settings'
import { useTheme } from '../../compositions/theme'

const { modelValue = '', file } = defineProps<{
  modelValue?: string,
  lang?: string,
  file?: string,
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', code: string): void,
}>()

const theme = $(useTheme())
const settings = useSettings()

let el = $ref<HTMLDivElement | undefined>()

watchEffect(() => {
  const colors = theme.editor
  monaco.editor.defineTheme('commas', {
    base: theme.type === 'light' ? 'vs' : 'vs-dark',
    inherit: false,
    rules: [
      { token: 'invalid', foreground: '#FFFFFF', background: colors.red },
      { token: 'emphasis', fontStyle: 'italic' },
      { token: 'strong', fontStyle: 'bold' },
      { token: 'variable', foreground: colors.blue },
      { token: 'variable.predefined', foreground: colors.brightBlue },
      { token: 'constant', foreground: colors.brightYellow },
      { token: 'comment', foreground: colors.comment },
      { token: 'number', foreground: colors.brightYellow },
      { token: 'regexp', foreground: colors.brightBlue },
      { token: 'annotation', foreground: colors.comment },
      { token: 'type', foreground: colors.magenta },
      { token: 'delimiter', foreground: colors.brightBlue },
      { token: 'tag', foreground: colors.red },
      { token: 'metatag', foreground: colors.red, fontStyle: 'bold' },
      { token: 'key', foreground: colors.yellow },
      { token: 'string.key.json', foreground: colors.yellow },
      { token: 'attribute.name', foreground: colors.magenta },
      { token: 'attribute.value', foreground: colors.brightGreen },
      { token: 'string', foreground: colors.brightGreen },
      { token: 'keyword', foreground: colors.magenta },
      { token: 'operator', foreground: colors.brightBlue },
    ],
    colors: {
      'editor.background': '#00000000',
      'editor.foreground': colors.foreground,
      'editorLineNumber.foreground': colors.lineNumber,
      'editorLineNumber.activeForeground': colors.foreground,
      'editorCursor.foreground': colors.foreground,
      'editor.selectionBackground': colors.selection,
      'editor.lineHighlightBackground': colors.lineHighlight,
      'editorLink.activeForeground': colors.blue,
      'editorWidget.foreground': colors.foreground,
      'editorWidget.background': colors.background,
      'scrollbarSlider.activeBackground': `${colors.foreground}1A`,
      'scrollbarSlider.background': `${colors.foreground}33`,
      'scrollbarSlider.hoverBackground': `${colors.foreground}66`,
      'scrollbar.shadow': '#00000000',
    },
  })
})

let model = $shallowRef<monaco.editor.ITextModel | undefined>()
watchEffect((onInvalidate) => {
  const created = monaco.editor.createModel('', undefined, file ? monaco.Uri.file(file) : undefined)
  created.onDidChangeContent(() => {
    emit('update:modelValue', created.getValue())
  })
  model = created
  onInvalidate(() => {
    created.dispose()
  })
})

let editor = $shallowRef<monaco.editor.IStandaloneCodeEditor | undefined>()
watchEffect((onInvalidate) => {
  if (!el) return
  const created = monaco.editor.create(el, {
    model,
    theme: 'commas',
    fontFamily: settings['terminal.style.fontFamily'],
    fontSize: settings['terminal.style.fontSize'],
    fontLigatures: settings['terminal.style.fontLigatures'],
    // cursorStyle: settings['terminal.style.cursorStyle'],
    // find: {},
    guides: {
      indentation: false,
    },
    // lineDecorationsWidth: 0,
    lineHeight: 18,
    multiCursorModifier: 'ctrlCmd',
    minimap: {
      enabled: false,
    },
    wordWrap: 'on',
  })
  editor = created
  onInvalidate(() => {
    created.dispose()
  })
})

watchEffect(() => {
  if (!editor || !model) return
  const code = model.getValue()
  if (code !== modelValue) {
    model.setValue(modelValue)
  }
})
</script>

<template>
  <div v-once ref="el" class="code-editor"></div>
</template>

<style lang="scss" scoped>
.code-editor {
  height: 100%;
  :deep(.monaco-editor) {
    font-family: inherit;
  }
}
</style>
