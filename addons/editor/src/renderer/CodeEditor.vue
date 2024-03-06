<script lang="ts" setup>
import * as commas from 'commas:api/renderer'
import { DefaultLinesDiffComputer } from 'monaco-editor/esm/vs/editor/common/diff/defaultLinesDiffComputer/defaultLinesDiffComputer'
import { watchEffect } from 'vue'
import { useEditorTheme } from './compositions'
import * as monaco from './monaco-editor'

const { file } = defineProps<{
  file?: string,
}>()

let modelValue = $(defineModel<string>({ default: '' }))

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

      { token: 'constant', foreground: theme.blue },
      { token: 'comment', foreground: theme.comment },
      { token: 'number', foreground: theme.blue },
      { token: 'regexp', foreground: theme.blue },
      { token: 'annotation', foreground: theme.comment },
      { token: 'type', foreground: theme.yellow },
      { token: 'type.yaml', foreground: theme.green },
      { token: 'delimiter', foreground: theme.blue },
      { token: 'delimiter.bracket', foreground: theme.foreground },
      { token: 'delimiter.parenthesis', foreground: theme.foreground },
      { token: 'delimiter.html', foreground: theme.foreground },
      { token: 'delimiter.xml', foreground: theme.foreground },
      { token: 'tag', foreground: theme.green },
      { token: 'tag.id.pug', foreground: theme.magenta },
      { token: 'tag.class.pug', foreground: theme.magenta },
      // { token: 'meta.scss', foreground: '800000' },
      { token: 'metatag', foreground: theme.blue },
      { token: 'key', foreground: theme.blue },
      { token: 'string.value.json', foreground: theme.foreground },
      { token: 'attribute.name', foreground: theme.blue },
      { token: 'attribute.value.number', foreground: theme.blue },
      // { token: 'attribute.value.html', foreground: DARK_BLUE },
      // { token: 'attribute.value.hex', foreground: DARK_BLUE },
      { token: 'string', foreground: theme.green },
      { token: 'string.yaml', foreground: theme.foreground },
      // { token: 'string.html', foreground: '0000FF' },
      // { token: 'string.sql', foreground: 'FF0000' },
      { token: 'keyword', foreground: theme.red },
      { token: 'keyword.json', foreground: theme.blue },
      { token: 'keyword.yaml', foreground: theme.blue },
      // { token: 'keyword.flow', foreground: 'AF00DB' },
      // { token: 'keyword.flow.scss', foreground: '0000FF' },
      // { token: 'operator.scss', foreground: '666666' },
      // { token: 'operator.sql', foreground: '778899' },
      // { token: 'operator.swift', foreground: '666666' },
      // { token: 'predefined.sql', foreground: 'C700C7' },
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
      'editor.lineHighlightBorder': theme.lineHighlight,
      'editorLink.activeForeground': theme.blue,
      'editorWidget.foreground': theme.foreground,
      'editorWidget.background': theme.background,
      'editorWidget.resizeBorder': theme.background,
      'editorSuggestWidget.border': '#00000000',
    },
  })
})

const diffComputer = new DefaultLinesDiffComputer()
const myersDiffingThreshold = 1700

function computeDiffDecorations(model: monaco.editor.ITextModel, defaultModel: monaco.editor.ITextModel) {
  let originalLines = defaultModel.getLinesContent()
  let modifiedLines = model.getLinesContent()
  if (originalLines.length + modifiedLines.length < myersDiffingThreshold) {
    const padding = Array.from({ length: myersDiffingThreshold / 2 }, () => '\u200b')
    originalLines = originalLines.concat(padding)
    modifiedLines = modifiedLines.concat(padding)
  }
  const diff = diffComputer.computeDiff(originalLines, modifiedLines, {})
  let decorations: monaco.editor.IModelDeltaDecoration[] = []
  let lineOffset = 0
  for (const { original, modified } of diff.changes) {
    const currentOffset = modified.endLineNumberExclusive - original.endLineNumberExclusive
    const range: monaco.IRange = {
      startLineNumber: currentOffset < lineOffset
        ? modified.endLineNumberExclusive - 1
        : modified.startLineNumber,
      endLineNumber: modified.endLineNumberExclusive - 1,
      startColumn: 1,
      endColumn: 1,
    }
    let linesDecorationsClasses = ['dirty-diff-glyph']
    if (currentOffset > lineOffset) {
      // Add
      linesDecorationsClasses.push('is-added')
    } else if (currentOffset < lineOffset) {
      // Delete
      linesDecorationsClasses.push('is-deleted')
    } else {
      // Modified
      linesDecorationsClasses.push('is-modified')
    }
    lineOffset = currentOffset
    decorations.push({
      range,
      options: {
        linesDecorationsClassName: linesDecorationsClasses.join(' '),
      },
    })
  }
  return decorations
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
    // @ts-expect-error microsoft/monaco-editor#3829
    'bracketPairColorization.enabled': false,
    bracketPairColorization: {
      enabled: false,
    },
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
    lineHeight: settings['terminal.style.lineHeight'],
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
  modelValue = model.getValue()
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
      border: 5px solid transparent;
      border-right: 0;
      border-left: 4px solid rgb(var(--theme-red));
      transform: translateX(6px);
    }
  }
}
</style>
