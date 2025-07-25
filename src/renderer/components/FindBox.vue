<script lang="ts" setup>
import { useIntersectionObserver } from '@vueuse/core'
import type { ISearchOptions } from '@xterm/addon-search'
import { reactive, watch, watchEffect } from 'vue'
import { ipcRenderer } from '@commas/electron-ipc'
import { toCSSHEX, toRGBA } from '../../shared/color'
import { useIsFinding } from '../compositions/shell'
import { useCurrentTerminal } from '../compositions/terminal'
import { useTheme } from '../compositions/theme'
import { vI18n } from '../utils/i18n'
import VisualIcon from './basic/VisualIcon.vue'

const terminal = $(useCurrentTerminal())
const theme = useTheme()

const root = $ref<HTMLElement>()
const finder = $ref<HTMLInputElement>()
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

useIntersectionObserver($$(root), ([{ isIntersecting }]) => {
  if (isIntersecting) {
    finder?.focus()
  } else {
    if (terminal?.xterm) {
      terminal.xterm.focus()
    }
  }
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
    }, terminal.pane.instance?.viewId)
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
    }, terminal.pane.instance?.viewId)
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
    ipcRenderer.invoke('stop-finding', 'clearSelection', terminal.pane.instance?.viewId)
  } else {
    terminal.addons.search.clearDecorations()
  }
})
</script>

<template>
  <div v-show="isFinding" ref="root" class="find-box" @submit.prevent="find">
    <form class="finder">
      <VisualIcon name="lucide-search" class="icon"></VisualIcon>
      <input
        ref="finder"
        v-model="keyword"
        v-i18n:placeholder
        type="search"
        class="keyword"
        placeholder="Find#!terminal.5"
        autofocus
        data-commas-alt
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
        <button type="button" data-commas class="previous" @click.prevent="findPrevious">
          <VisualIcon name="lucide-arrow-up" />
        </button>
        <button data-commas class="next">
          <VisualIcon name="lucide-arrow-down" />
        </button>
        <button type="button" data-commas class="close" @click.prevent="cancel">
          <VisualIcon name="lucide-x" />
        </button>
      </div>
    </form>
  </div>
</template>

<style lang="scss" scoped>
@use '../assets/_partials';

.find-box {
  flex: none;
  padding: 8px;
  background: rgb(var(--theme-background) / var(--theme-opacity));
  border-radius: var(--design-card-border-radius);
  box-shadow: var(--design-card-shadow);
  -electron-corner-smoothing: 60%;
}
.finder {
  display: flex;
  gap: 4px;
  align-items: center;
  height: #{36px - 2 * 8px}; // var(--min-tab-height) - 2 * 8px
  line-height: #{36px - 2 * 8px};
}
.icon {
  font-size: 16px;
  opacity: 0.5;
}
.keyword {
  flex: auto;
  padding: 2px 6px;
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
  gap: 4px;
  :deep(button[data-commas]) {
    padding: 2px;
  }
}
</style>
