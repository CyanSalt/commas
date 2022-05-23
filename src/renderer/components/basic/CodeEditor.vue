<script lang="ts" setup>
import { watchEffect } from 'vue'
import * as monaco from '../../assets/monaco-editor'
import { useSettings } from '../../compositions/settings'
import { useEditorTheme } from '../../compositions/theme'

const { modelValue = '', file } = defineProps<{
  modelValue?: string,
  lang?: string,
  file?: string,
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', code: string): void,
}>()

const theme = useEditorTheme()
const settings = useSettings()

let root = $ref<HTMLDivElement | undefined>()

watchEffect(() => {
  monaco.editor.defineTheme('commas', {
    base: theme.type === 'light' ? 'vs' : 'vs-dark',
    inherit: false,
    rules: [
      { token: 'invalid', foreground: '#FFFFFF', background: theme.red },
      { token: 'emphasis', fontStyle: 'italic' },
      { token: 'strong', fontStyle: 'bold' },
      { token: 'variable', foreground: theme.blue },
      { token: 'variable.predefined', foreground: theme.brightBlue },
      { token: 'constant', foreground: theme.brightYellow },
      { token: 'comment', foreground: theme.comment },
      { token: 'number', foreground: theme.brightYellow },
      { token: 'regexp', foreground: theme.brightBlue },
      { token: 'annotation', foreground: theme.comment },
      { token: 'type', foreground: theme.magenta },
      { token: 'delimiter', foreground: theme.brightBlue },
      { token: 'tag', foreground: theme.red },
      { token: 'metatag', foreground: theme.red, fontStyle: 'bold' },
      { token: 'key', foreground: theme.yellow },
      { token: 'string.key.json', foreground: theme.yellow },
      { token: 'attribute.name', foreground: theme.magenta },
      { token: 'attribute.value', foreground: theme.brightGreen },
      { token: 'string', foreground: theme.brightGreen },
      { token: 'keyword', foreground: theme.magenta },
      { token: 'operator', foreground: theme.brightBlue },
    ],
    colors: {
      'input.background': '#7F7F7F33',
      'scrollbarSlider.activeBackground': `${theme.foreground}1A`,
      'scrollbarSlider.background': `${theme.foreground}33`,
      'scrollbarSlider.hoverBackground': `${theme.foreground}66`,
      'scrollbar.shadow': '#00000000',
      'editor.background': '#00000000',
      'editor.foreground': theme.foreground,
      'editorLineNumber.foreground': theme.lineNumber,
      'editorLineNumber.activeForeground': theme.foreground,
      'editorCursor.foreground': theme.foreground,
      'editor.selectionBackground': theme.selection,
      'editor.lineHighlightBackground': theme.lineHighlight,
      'editorLink.activeForeground': theme.blue,
      'editorWidget.foreground': theme.foreground,
      'editorWidget.background': theme.background,
      'editorWidget.resizeBorder': theme.background,
      'editorSuggestWidget.border': '#00000000',
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
  if (!root) return
  const created = monaco.editor.create(root, {
    model,
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
    tabSize: 2,
    theme: 'commas',
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

const observer = new ResizeObserver(() => {
  if (editor) {
    editor.layout()
  }
})

watchEffect((onInvalidate) => {
  const el = root
  if (!el) return
  observer.observe(el)
  onInvalidate(() => {
    observer.unobserve(el)
  })
})
</script>

<template>
  <div v-once ref="root" class="code-editor"></div>
</template>

<style lang="scss" scoped>
.code-editor {
  height: 100%;
  :deep(.monaco-editor) {
    font-family: inherit;
  }
}
</style>
