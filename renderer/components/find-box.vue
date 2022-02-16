<script lang="ts" setup>
import { ipcRenderer } from 'electron'
import { onMounted, reactive, watch } from 'vue'
import { useIsFinding } from '../compositions/shell'
import { useCurrentTerminal } from '../compositions/terminal'

const terminal = $(useCurrentTerminal())

const root = $ref<HTMLElement>()
const finder = $ref<HTMLInputElement>()
const keyword = $ref('')
const options = reactive({
  caseSensitive: false,
  wholeWord: false,
  regex: false,
})

let isFinding = $(useIsFinding())

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

function findPrevious() {
  if (!terminal) return
  if (terminal.pane) {
    return ipcRenderer.invoke('find', keyword, {
      forward: false,
      matchCase: options.caseSensitive,
    })
  } else {
    return terminal.addons.search.findPrevious(keyword, options)
  }
}

function findNext() {
  if (!terminal) return
  if (terminal.pane) {
    return ipcRenderer.invoke('find', keyword, {
      forward: true,
      matchCase: options.caseSensitive,
    })
  } else {
    return terminal.addons.search.findNext(keyword, options)
  }
}

function find(event: KeyboardEvent) {
  return event.shiftKey ? findPrevious() : findNext()
}

function cancel() {
  isFinding = false
}

function toggle(key: keyof typeof options) {
  options[key] = !options[key]
}

watch($$(isFinding), value => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
      class="keyword"
      placeholder="Find#!5"
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
    </div>
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
  border: none;
  color: inherit;
  font: inherit;
  background: transparent;
  outline: none;
  &::placeholder {
    color: inherit;
    opacity: 0.5;
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
