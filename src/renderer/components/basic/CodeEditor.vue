<script lang="ts" setup>
import { CodeJar } from 'codejar'
import { withLineNumbers } from 'codejar/linenumbers'
import Prism from 'prismjs'
import loadLanguages from 'prismjs/components/index'
import { onBeforeUnmount, onMounted, watchEffect } from 'vue'

const { modelValue = '', lang, noLineNumbers } = defineProps<{
  modelValue?: string,
  lang?: string,
  noLineNumbers?: boolean,
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', code: string): void,
}>()

let el = $ref<HTMLDivElement>()
let jar = $shallowRef<CodeJar | undefined>()

watchEffect(() => {
  if (lang) {
    loadLanguages([lang])
  }
})

watchEffect(() => {
  if (!jar) return
  const code = jar.toString()
  if (code !== modelValue) {
    jar.updateCode(modelValue)
  }
})

function rawHighlight(element: HTMLElement) {
  if (lang) {
    const code = element.textContent ?? ''
    element.innerHTML = Prism.highlight(code, Prism.languages[lang], lang)
  }
}

const highlight = $computed(() => {
  return noLineNumbers ? rawHighlight : withLineNumbers(rawHighlight, {
    class: 'editor-line',
    wrapClass: 'code-editor-wrapper',
    width: '2.5em',
    backgroundColor: 'transparent',
    color: 'rgb(var(--theme-foreground) / 0.5)',
  })
})

onMounted(() => {
  jar = CodeJar(el, highlight, {
    tab: ' '.repeat(2),
  })
  jar.onUpdate(code => {
    emit('update:modelValue', code)
  })
})

onBeforeUnmount(() => {
  if (jar) {
    jar.destroy()
  }
})
</script>

<template>
  <code v-once ref="el" class="code-editor"></code>
</template>

<style lang="scss" scoped>
.code-editor {
  display: block;
  padding-bottom: 50vh;
  font-family: inherit;
  tab-size: 2;
  cursor: text;
}
:deep(.token) {
  &.comment,
  &.prolog,
  &.doctype,
  &.cdata {
    opacity: 0.5;
  }
  &.namespace {
    opacity: 0.5;
  }
  &.property,
  &.tag,
  &.boolean,
  &.number,
  &.constant,
  &.symbol {
    color: rgb(var(--theme-yellow));
  }
  &.attr-name,
  &.string,
  &.char,
  &.builtin,
  &.inserted {
    color: rgb(var(--theme-green));
  }
  &.operator,
  &.entity,
  &.url,
  &.variable,
  &.punctuation {
    color: rgb(var(--theme-brightblue));
  }
  &.atrule,
  &.attr-value {
    color: rgb(var(--theme-red));
  }
  &.selector,
  &.keyword {
    color: rgb(var(--theme-magenta));
  }
  &.function {
    color: rgb(var(--theme-blue));
  }
  &.parameter {
    color: rgb(var(--theme-yellow));
  }
  &.regex,
  &.important {
    color: rgb(var(--theme-brightyellow));
  }
  &.important,
  &.bold {
    font-weight: bold;
  }
  &.italic {
    font-style: italic;
  }
  &.entity {
    cursor: help;
  }
  &.deleted {
    color: rgb(var(--theme-brightred));
  }
}
</style>
