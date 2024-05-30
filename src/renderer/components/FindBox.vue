<script lang="ts" setup>
import type { ISearchOptions } from '@xterm/addon-search'
import { ipcRenderer } from 'electron'
import { reactive, watch, watchEffect } from 'vue'
import { toCSSHEX, toRGBA } from '../../shared/color'
import { useIsFinding } from '../compositions/shell'
import { useCurrentTerminal } from '../compositions/terminal'
import { useTheme } from '../compositions/theme'
import { vI18n } from '../utils/i18n'
import VisualIcon from './basic/VisualIcon.vue'

const terminal = $(useCurrentTerminal())
const theme = useTheme()

const root = $ref<HTMLElement | undefined>()
const finder = $ref<HTMLInputElement | undefined>()
const keyword = $ref('')
const options = reactive({
  caseSensitive: false,
  wholeWord: false,
  regex: false,
})

const searchOptions = $computed<ISearchOptions>(() => {
  const rgba = toRGBA(theme.yellow)
  return {
    ...options,
    decorations: {
      matchOverviewRuler: toCSSHEX({ ...rgba, a: 0.5 }),
      activeMatchColorOverviewRuler: theme.foreground,
    },
  }
})

let currentNumber = $ref(0)
let totalNumber = $ref(0)

let isFinding = $(useIsFinding())

watchEffect((onInvalidate) => {
  if (!root) return
  const observer = new IntersectionObserver(([{ isIntersecting }]) => {
    if (isIntersecting) {
      finder?.focus()
    } else {
      if (terminal?.xterm) {
        terminal.xterm.focus()
      }
    }
  })
  let el = root
  observer.observe(el)
  onInvalidate(() => {
    observer.unobserve(el)
  })
})

watchEffect((onInvalidate) => {
  if (!terminal || terminal.pane) return
  const disposable = terminal.addons.search.onDidChangeResults(result => {
    if (!result) return
    currentNumber = result.resultIndex + 1
    totalNumber = result.resultCount
  })
  onInvalidate(() => {
    disposable.dispose()
  })
})

async function findPrevious() {
  if (!terminal) return
  if (terminal.pane) {
    const result = await ipcRenderer.invoke('find', keyword, {
      forward: false,
      matchCase: searchOptions.caseSensitive,
    })
    totalNumber = result.matches
    currentNumber = result.activeMatchOrdinal
  } else {
    terminal.addons.search.findPrevious(keyword, searchOptions)
  }
}

async function findNext() {
  if (!terminal) return
  if (terminal.pane) {
    const result = await ipcRenderer.invoke('find', keyword, {
      forward: true,
      matchCase: searchOptions.caseSensitive,
    })
    totalNumber = result.matches
    currentNumber = result.activeMatchOrdinal
  } else {
    terminal.addons.search.findNext(keyword, searchOptions)
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
  if (!terminal || value) return
  if (terminal.pane) {
    ipcRenderer.invoke('stop-finding', 'clearSelection')
  } else {
    terminal.addons.search.clearDecorations()
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
        >|ab|</div>
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
        <VisualIcon name="lucide-arrow-up" @click="findPrevious" />
      </div>
      <div class="button next">
        <VisualIcon name="lucide-arrow-down" @click="findNext" />
      </div>
      <div class="button close">
        <VisualIcon name="lucide-x" @click="cancel" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.find-box {
  display: flex;
  flex: none;
  height: #{36px - 2 * 8px}; // var(--min-tab-height) - 2 * 8px
  padding: 8px;
  line-height: #{36px - 2 * 8px};
  background: rgb(var(--theme-background) / var(--theme-opacity));
  border-radius: var(--design-card-border-radius);
  box-shadow: var(--design-card-shadow);
}
.keyword {
  flex: auto;
  padding: 2px 6px;
  border: none;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  line-height: #{36px - 2 * 8px - 2 * 2px};
  background: transparent;
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
