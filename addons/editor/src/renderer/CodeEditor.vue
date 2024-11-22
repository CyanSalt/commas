<script lang="ts" setup>
import { useResizeObserver } from '@vueuse/core'
import * as commas from 'commas:api/renderer'
import { watchEffect } from 'vue'
import { useEditorTheme } from './compositions'
import * as monaco from './monaco-editor'

const { file } = defineProps<{
  file?: string,
}>()

let modelValue = $(defineModel<string>())

const theme = useEditorTheme()
const settings = commas.remote.useSettings()

let root = $ref<HTMLDivElement>()

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
      focusBorder: '#00000000',
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
      'editorStickyScroll.background': theme.background,
    },
  })
  monaco.editor.addKeybindingRules([
    {
      // eslint-disable-next-line no-bitwise
      keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF,
      command: null,
    },
  ])
})

const options = $computed<monaco.editor.IStandaloneEditorConstructionOptions>(() => {
  return {
    /** @see microsoft/monaco-editor#3829 */
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
  }
})

let changes = $ref<monaco.editor.ILineChange[] | null>(null)

let diffEditor = $shallowRef<monaco.editor.IDiffEditor>()
watchEffect((onInvalidate) => {
  const element = document.createElement('div')
  const created = monaco.editor.createDiffEditor(element)
  created.onDidUpdateDiff(() => {
    changes = created.getLineChanges()
  })
  diffEditor = created
  onInvalidate(() => {
    created.dispose()
    diffEditor = undefined
  })
})

let defaultModel = $shallowRef<monaco.editor.ITextModel>()
watchEffect((onInvalidate) => {
  const created = monaco.editor.createModel(modelValue ?? '', undefined, undefined)
  defaultModel = created
  onInvalidate(() => {
    if (diffEditor) {
      diffEditor.setModel(null)
    }
    created.dispose()
    defaultModel = undefined
  })
})

let model = $shallowRef<monaco.editor.ITextModel>()
watchEffect((onInvalidate) => {
  const created = monaco.editor.createModel('', undefined, file ? monaco.Uri.file(file) : undefined)
  model = created
  onInvalidate(() => {
    if (diffEditor) {
      diffEditor.setModel(null)
    }
    created.dispose()
    model = undefined
  })
})

watchEffect(() => {
  if (!diffEditor || !model || !defaultModel) return
  diffEditor.setModel({
    original: defaultModel,
    modified: model,
  })
})

const decorations = $computed(() => {
  if (!changes) return []
  let lineOffset = 0
  return changes.map<monaco.editor.IModelDeltaDecoration>(changed => {
    const currentOffset = changed.modifiedEndLineNumber - changed.originalEndLineNumber
    const range: monaco.IRange = {
      startLineNumber: changed.modifiedStartLineNumber,
      endLineNumber: changed.modifiedEndLineNumber,
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
    return {
      range,
      options: {
        linesDecorationsClassName: linesDecorationsClasses.join(' '),
      },
    }
  })
})

const isDirty = $computed(() => Boolean(decorations.length))

let editor = $shallowRef<monaco.editor.IStandaloneCodeEditor>()
let decorationCollections = $shallowRef<monaco.editor.IEditorDecorationsCollection>()

watchEffect((onInvalidate) => {
  if (!root) return
  const created = monaco.editor.create(root)
  decorationCollections = created.createDecorationsCollection([])
  editor = created
  onInvalidate(() => {
    created.dispose()
    editor = undefined
  })
})

watchEffect(() => {
  if (!decorationCollections) return
  decorationCollections.set(decorations)
})

watchEffect(() => {
  if (!editor || !model) return
  editor.setModel(model)
})

watchEffect(() => {
  if (!editor) return
  editor.updateOptions(options)
})

watchEffect(() => {
  if (!model) return
  const code = model.getValue()
  const defaultValue = modelValue ?? ''
  if (code !== defaultValue) {
    model.setValue(defaultValue)
  }
})

useResizeObserver($$(root), () => {
  if (!editor) return
  editor.layout()
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
