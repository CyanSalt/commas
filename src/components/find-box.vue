<template>
  <div class="find-box" v-show="finding">
    <input class="keyword" v-model="keyword" :placeholder="i18n('Find#!6')"
      @keyup.enter="find" @keyup.esc="close" ref="keyword" autofocus>
    <div class="options">
      <div :class="['option', 'case-sensitive', {selected: options.caseSensitive}]"
        @click="toggle('caseSensitive')">Aa</div>
      <div :class="['option', 'whole-word', {selected: options.wholeWord}]"
        @click="toggle('wholeWord')">|Ab|</div>
      <div :class="['option', 'use-regexp', {selected: options.regex}]"
        @click="toggle('regex')">.*</div>
    </div>
    <div class="buttons">
      <div class="button previous">
        <span class="feather-icon icon-arrow-left" @click="previous"></span>
      </div>
      <div class="button next">
        <span class="feather-icon icon-arrow-right" @click="next"></span>
      </div>
      <div class="button close">
        <span class="feather-icon icon-x" @click="close"></span>
      </div>
    </div>
  </div>
</template>

<script>
import VueMaye from 'maye/plugins/vue'

export default {
  name: 'find-box',
  data() {
    return {
      keyword: '',
      options: {
        caseSensitive: false,
        wholeWord: false,
        regex: false,
      },
    }
  },
  computed: {
    finding: VueMaye.state('shell.finding'),
  },
  methods: {
    toggle(option) {
      this.options[option] = !this.options[option]
    },
    find(e) {
      return e.shiftKey ? this.previous() : this.next()
    },
    next() {
      const {action} = this.$maye
      action.dispatch('terminal.find', {
        keyword: this.keyword,
        options: this.options,
      })
    },
    previous() {
      const {action} = this.$maye
      action.dispatch('terminal.find', {
        keyword: this.keyword,
        options: this.options,
        back: true,
      })
    },
    close() {
      const {state, accessor} = this.$maye
      state.set('shell.finding', false)
      this.$nextTick(() => {
        const current = accessor.get('terminal.current')
        current.xterm.focus()
      })
    },
  },
  watch: {
    finding(value, old) {
      if (value && !old) {
        this.$nextTick(() => {
          this.$refs.keyword.focus()
        })
      }
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
