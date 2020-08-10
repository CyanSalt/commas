<template>
  <div v-show="visible" ref="root" class="find-box">
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

<script>
import { reactive, computed, unref, onMounted, toRefs } from 'vue'
import { useCurrentTerminal } from '../hooks/terminal'
import { useIsFinding } from '../hooks/shell'

export default {
  name: 'FindBox',
  setup() {
    const state = reactive({
      root: null,
      finder: null,
      keyword: '',
      options: {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      },
    })

    const terminalRef = useCurrentTerminal()

    const isFindingRef = useIsFinding()
    state.visible = computed(() => {
      const isFinding = unref(isFindingRef)
      if (!isFinding) return false
      const terminal = unref(terminalRef)
      return Boolean(terminal) && !terminal.pane
    })

    onMounted(() => {
      new IntersectionObserver(([{ isIntersecting }]) => {
        if (isIntersecting) {
          state.finder.focus()
        } else {
          const terminal = unref(terminalRef)
          if (terminal && terminal.xterm) {
            terminal.xterm.focus()
          }
        }
      }).observe(state.root)
    })

    function findPrevious() {
      const terminal = unref(terminalRef)
      terminal.addons.search.findPrevious(state.keyword, state.options)
    }

    function findNext() {
      const terminal = unref(terminalRef)
      terminal.addons.search.findNext(state.keyword, state.options)
    }

    function find(event) {
      return event.shiftKey ? findPrevious() : findNext()
    }

    function cancel() {
      isFindingRef.value = false
    }

    function toggle(key) {
      state.options[key] = !state.options[key]
    }

    return {
      ...toRefs(state),
      find,
      cancel,
      toggle,
      findPrevious,
      findNext,
    }
  },
}
</script>

<style>
.find-box {
  flex: none;
  display: flex;
  padding: 4px 8px;
  height: 26px;
  line-height: 26px;
}
.find-box .keyword {
  flex: auto;
  border: none;
  outline: none;
  font: inherit;
  color: inherit;
  background: transparent;
}
.find-box .keyword::placeholder {
  color: inherit;
  opacity: 0.5;
}
.find-box .options {
  flex: none;
  display: flex;
}
.find-box .option {
  display: inline-block;
  width: 28px;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}
.find-box .option.selected {
  opacity: 1;
}
.find-box .buttons {
  flex: none;
  display: flex;
}
.find-box .button {
  display: inline-block;
  width: 28px;
  text-align: center;
  cursor: pointer;
}
</style>
