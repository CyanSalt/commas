<template>
  <div :class="['tab', {active: focused, thin: !tab}]">
    <div class="tab-overview">
      <div class="tab-title">{{ title }}</div>
      <div class="operations">
        <slot name="operations"></slot>
        <div class="button close" @click.stop="close" v-if="tab">
          <span class="feather-icon icon-x"></span>
        </div>
      </div>
    </div>
    <div class="tab-subtitle" v-if="tab">{{ subtitle }}</div>
    <div class="divider"></div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import {getPrompt} from '@/utils/terminal'

export default {
  name: 'TabItem',
  props: {
    name: {
      type: String,
      default: '',
    },
    tab: {
      type: Object,
      default: null,
    },
  },
  computed: {
    ...mapState('settings', ['settings']),
    ...mapState('terminal', ['tabs', 'active']),
    focused() {
      return this.tabs[this.active] === this.tab
    },
    title() {
      if (!this.tab) return this.name
      const expr = this.settings['terminal.tab.titleFormat']
      return getPrompt(expr, this.tab) || this.tab.process
    },
    subtitle() {
      if (this.name) return this.name
      if (this.tab.title) return this.tab.title
      const expr = this.settings['terminal.tab.subtitleFormat']
      return getPrompt(expr, this.tab)
    },
  },
  methods: {
    close() {
      if (!this.tab) return
      this.$store.dispatch('terminal/close', this.tab)
    },
  },
}
</script>

<style>
.tab .tab-title,
.tab .tab-subtitle {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.5;
}
.tab.active .tab-title,
.tab.active .tab-subtitle {
  opacity: 1;
}
.tab .tab-overview {
  display: flex;
  justify-content: space-between;
  height: 32px;
  line-height: 32px;
}
.tab:not(.thin) .tab-title {
  font-size: 18px;
}
.tab .operations {
  flex: none;
  display: none;
  text-align: center;
  font-size: 14px;
}
.tab:hover .operations {
  display: flex;
}
.tab .operations .button {
  width: 18px;
  cursor: pointer;
  transition: color 0.2s;
}
.tab .close:hover {
  color: var(--theme-brightred);
}
.tab .divider {
  height: 1px;
  margin: 7px 0;
  border-bottom: 2px solid;
  opacity: 0.05;
}
.tab.active .divider {
  color: var(--theme-brightcyan);
  opacity: 1;
}
</style>
