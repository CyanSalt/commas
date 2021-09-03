<template>
  <div v-show="isVisible" ref="root" class="find-box">
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

<script lang="ts">
import { computed, onMounted, reactive, ref, unref } from 'vue'
import { useIsFinding } from '../hooks/shell'
import { useCurrentTerminal } from '../hooks/terminal'

export default {
  setup() {
    const rootRef = ref<HTMLElement | null>(null)
    const finderRef = ref<HTMLInputElement | null>(null)
    const keywordRef = ref('')
    const options = reactive({
      caseSensitive: false,
      wholeWord: false,
      regex: false,
    })

    const terminalRef = useCurrentTerminal()

    const isFindingRef = useIsFinding()
    const isVisibleRef = computed(() => {
      const isFinding = unref(isFindingRef)
      if (!isFinding) return false
      const terminal = unref(terminalRef)
      return Boolean(terminal && !terminal.pane)
    })

    onMounted(() => {
      const root = unref(rootRef)!
      new IntersectionObserver(([{ isIntersecting }]) => {
        if (isIntersecting) {
          const finder = unref(finderRef)
          finder?.focus()
        } else {
          const terminal = unref(terminalRef)
          if (terminal?.xterm) {
            terminal.xterm.focus()
          }
        }
      }).observe(root)
    })

    function findPrevious() {
      const terminal = unref(terminalRef)
      if (!terminal) return
      const keyword = unref(keywordRef)
      return terminal.addons.search.findPrevious(keyword, options)
    }

    function findNext() {
      const terminal = unref(terminalRef)
      if (!terminal) return
      const keyword = unref(keywordRef)
      return terminal.addons.search.findNext(keyword, options)
    }

    function find(event: KeyboardEvent) {
      return event.shiftKey ? findPrevious() : findNext()
    }

    function cancel() {
      isFindingRef.value = false
    }

    function toggle(key: keyof typeof options) {
      options[key] = !options[key]
    }

    return {
      root: rootRef,
      finder: finderRef,
      keyword: keywordRef,
      options,
      isVisible: isVisibleRef,
      find,
      cancel,
      toggle,
      findPrevious,
      findNext,
    }
  },
}
</script>

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
