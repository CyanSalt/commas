<script lang="ts" setup>
import { ipcRenderer } from 'electron'
import { onMounted, reactive, watch } from 'vue'
import { useIsFinding } from '../compositions/shell'
import { useCurrentTerminal } from '../compositions/terminal'
import { vI18n } from '../utils/i18n'

const terminal = $(useCurrentTerminal())

const root = $ref<HTMLElement>()
const finder = $ref<HTMLInputElement>()
const keyword = $ref('')
const options = reactive({
  caseSensitive: false,
  wholeWord: false,
  regex: false,
})
let currentNumber = $ref(0)
let totalNumber = $ref(0)

let isFinding = $(useIsFinding())

watch([options, $$(keyword)], () => {
  totalNumber = 0
})

watch($$(totalNumber), () => {
  currentNumber = 0
})

onMounted(() => {
  new IntersectionObserver(([{ isIntersecting }]) => {
    if (isIntersecting) {
      finder.focus()
    } else {
      if (terminal?.xterm) {
        terminal.xterm.focus()
      }
    }
  }).observe(root)
})

async function findPrevious() {
  if (!terminal) return
  if (terminal.pane) {
    const result = await ipcRenderer.invoke('find', keyword, {
      forward: false,
      matchCase: options.caseSensitive,
    })
    totalNumber = result.matches
    currentNumber = result.activeMatchOrdinal
  } else {
    terminal.addons.search.findPrevious(keyword, options)
  }
}

async function findNext() {
  if (!terminal) return
  if (terminal.pane) {
    const result = await ipcRenderer.invoke('find', keyword, {
      forward: true,
      matchCase: options.caseSensitive,
    })
    totalNumber = result.matches
    currentNumber = result.activeMatchOrdinal
  } else {
    terminal.addons.search.findNext(keyword, options)
  }
}

async function find(event: KeyboardEvent & { target: HTMLInputElement }) {
  if (event.shiftKey) {
    await findPrevious()
  } else {
    await findNext()
  }
  event.target.focus()
}

function cancel() {
  isFinding = false
}

function toggle(key: keyof typeof options) {
  options[key] = !options[key]
}

watch($$(isFinding), (value: boolean) => {
  if (!value && terminal?.pane) {
    ipcRenderer.invoke('stop-finding', 'clearSelection')
  }
})
</script>

<template>
  <div v-show="isFinding" ref="root" class="find-box">
    <input
      ref="finder"
      v-model="keyword"
      v-i18n:placeholder
      type="search"
      class="keyword"
      placeholder="Find#!terminal.5"
      autofocus
      @keyup.enter="find"
      @keyup.esc="cancel"
    >
    <div class="options">
      <div
        class="option case-sensitive"
        :class="{ selected: options.caseSensitive }"
        @click="toggle('caseSensitive')"
      >Aa</div>
      <template v-if="!terminal?.pane">
        <div
          class="option whole-word"
          :class="{ selected: options.wholeWord }"
          @click="toggle('wholeWord')"
        >|Ab|</div>
        <div
          class="option use-regexp"
          :class="{ selected: options.regex }"
          @click="toggle('regex')"
        >.*</div>
      </template>
    </div>
    <div v-if="currentNumber && totalNumber" class="indicator">{{ currentNumber }} / {{ totalNumber }}</div>
    <div class="buttons">
      <div class="button previous">
        <span class="feather-icon icon-arrow-left" @click="findPrevious"></span>
      </div>
      <div class="button next">
        <span class="feather-icon icon-arrow-right" @click="findNext"></span>
      </div>
      <div class="button close">
        <span class="feather-icon icon-x" @click="cancel"></span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.find-box {
  display: flex;
  flex: none;
  height: 26px;
  padding: 4px 8px;
  line-height: 26px;
}
.keyword {
  flex: auto;
  padding: 2px 6px;
  border: none;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  line-height: 20px;
  background: rgb(127 127 127 / 0.2);
  outline: none;
  &::placeholder {
    color: rgb(var(--theme-foreground));
    opacity: 0.25;
  }
}
.options {
  display: flex;
  flex: none;
}
.option {
  display: inline-block;
  width: 28px;
  font-size: 12px;
  text-align: center;
  opacity: 0.5;
  transition: opacity 0.2s;
  cursor: pointer;
  &.selected {
    opacity: 1;
  }
}
.indicator {
  margin: 0 0.5em;
  font-size: 12px;
}
.buttons {
  display: flex;
  flex: none;
}
.button {
  display: inline-block;
  width: 28px;
  text-align: center;
  cursor: pointer;
}
</style>
