<template>
  <div class="find-box" v-show="visible">
    <input class="keyword" v-model="keyword" :placeholder="i18n('Find#!6')"
      @keyup.enter="find" @keyup.esc="close" ref="keyword" autofocus>
    <div class="options">
      <div class="option case-sensitive"
        :class="{selected: options.caseSensitive}"
        @click="toggle('caseSensitive')">Aa</div>
      <div class="option whole-word" :class="{selected: options.wholeWord}"
        @click="toggle('wholeWord')">|Ab|</div>
      <div class="option use-regexp" :class="{selected: options.regex}"
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
import {mapState, mapGetters} from 'vuex'

export default {
  name: 'FindBox',
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
    ...mapState('shell', ['finding']),
    ...mapGetters('terminal', ['current']),
    visible() {
      return this.finding && this.current && !this.current.internal
    },
  },
  mounted() {
    new IntersectionObserver(([{isIntersecting}]) => {
      if (isIntersecting) {
        this.$refs.keyword.focus()
      } else {
        const current = this.current
        if (current && current.xterm) current.xterm.focus()
      }
    }).observe(this.$el)
  },
  methods: {
    toggle(option) {
      this.options[option] = !this.options[option]
    },
    find(e) {
      return e.shiftKey ? this.previous() : this.next()
    },
    next() {
      this.$store.dispatch('terminal/find', {
        keyword: this.keyword,
        options: this.options,
      })
    },
    previous() {
      this.$store.dispatch('terminal/find', {
        keyword: this.keyword,
        options: this.options,
        back: true,
      })
    },
    close() {
      this.$store.commit('shell/setFinding', false)
    },
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
