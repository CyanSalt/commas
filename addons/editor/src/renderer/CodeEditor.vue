<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { DiffComputer } from 'monaco-editor/esm/vs/editor/common/diff/smartLinesDiffComputer'
import { watchEffect } from 'vue'
import { useEditorTheme } from './compositions'
import * as monaco from './monaco-editor'

const { modelValue = '', file } = defineProps<{
  modelValue?: string,
  lang?: string,
  file?: string,
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', code: string): void,
}>()

const theme = useEditorTheme()
const settings = commas.remote.useSettings()

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
      'editor.selectionBackground': theme.selectionBackground,
      'editor.lineHighlightBackground': theme.lineHighlight,
      'editorLink.activeForeground': theme.blue,
      'editorWidget.foreground': theme.foreground,
      'editorWidget.background': theme.background,
      'editorWidget.resizeBorder': theme.background,
      'editorSuggestWidget.border': '#00000000',
    },
  })
})

function computeDiffDecorations(model: monaco.editor.ITextModel, defaultModel: monaco.editor.ITextModel) {
  const diffComputer = new DiffComputer(defaultModel.getLinesContent(), model.getLinesContent(), {
    shouldComputeCharChanges: false,
    shouldPostProcessCharChanges: false,
    shouldIgnoreTrimWhitespace: false,
    shouldMakePrettyDiff: true,
  })
  const diff = diffComputer.computeDiff()
  return diff.changes.map(change => {
    const range: monaco.IRange = {
      startLineNumber: change.modifiedStartLineNumber,
      endLineNumber: change.modifiedEndLineNumber || change.modifiedStartLineNumber,
      startColumn: 1,
      endColumn: 1,
    }
    let linesDecorationsClasses = ['dirty-diff-glyph']
    if (!change.originalEndLineNumber) {
      // Add
      linesDecorationsClasses.push('is-added')
    } else if (!change.modifiedEndLineNumber) {
      // Delete
      linesDecorationsClasses.push('is-deleted')
    } else {
      // Modified
      linesDecorationsClasses.push('is-modified')
    }
    return {
      range,
      options: {
        linesDecorationsClassName: linesDecorationsClasses.join(' '),
      },
    }
  }) as monaco.editor.IModelDeltaDecoration[]
}

let defaultModel = $shallowRef<monaco.editor.ITextModel | undefined>()
watchEffect((onInvalidate) => {
  const created = monaco.editor.createModel(modelValue, undefined, undefined)
  defaultModel = created
  onInvalidate(() => {
    created.dispose()
  })
})

let model = $shallowRef<monaco.editor.ITextModel | undefined>()
watchEffect((onInvalidate) => {
  const created = monaco.editor.createModel('', undefined, file ? monaco.Uri.file(file) : undefined)
  model = created
  onInvalidate(() => {
    created.dispose()
  })
})

let editor = $shallowRef<monaco.editor.IStandaloneCodeEditor | undefined>()
let decorationCollections = $shallowRef<monaco.editor.IEditorDecorationsCollection | undefined>()
let isDirty = $ref(false)

function renderDiffDecorations() {
  if (!model || !defaultModel || !decorationCollections) return
  const decorations = computeDiffDecorations(model, defaultModel)
  decorationCollections!.set(decorations)
  isDirty = Boolean(decorationCollections!.length)
}

watchEffect((onInvalidate) => {
  if (!root) return
  const created = monaco.editor.create(root, {
    model,
    contextmenu: false,
    // cursorStyle: settings['terminal.style.cursorStyle'],
    // find: {},
    fontFamily: settings['terminal.style.fontFamily'],
    fontLigatures: settings['terminal.style.fontLigatures'],
    fontSize: settings['terminal.style.fontSize'],
    guides: {
      indentation: false,
    },
    // lineDecorationsWidth: 0,
    lineHeight: 18,
    minimap: {
      enabled: false,
    },
    multiCursorModifier: 'ctrlCmd',
    tabSize: 2,
    theme: 'commas',
    wordWrap: 'on',
  })
  decorationCollections = created.createDecorationsCollection([])
  created.onDidChangeModelContent(() => {
    renderDiffDecorations()
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

watchEffect(renderDiffDecorations)

const observer = new ResizeObserver(() => {
  if (!editor) return
  editor.layout()
})

watchEffect((onInvalidate) => {
  const el = root
  if (!el) return
  observer.observe(el)
  onInvalidate(() => {
    observer.unobserve(el)
  })
})

function save() {
  if (!model) return
  emit('update:modelValue', model.getValue())
}

defineExpose({
  isDirty: $$(isDirty),
  save,
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
    .dirty-diff-glyph.is-added {
      border-left: 3px solid rgb(var(--theme-green));
      transform: translateX(6px);
    }
    .dirty-diff-glyph.is-modified {
      border-left: 3px solid rgb(var(--theme-blue));
      transform: translateX(6px);
    }
    .dirty-diff-glyph.is-deleted {
      bottom: -5px;
      width: 0px !important;
      height: 0px !important;
      border-width: 5px solid transparent;
      border-right: 0;
      border-left: 4px solid rgb(var(--theme-red));
      transform: translateX(6px);
    }
  }
}
</style>
